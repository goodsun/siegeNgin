# siegeNgin アーキテクチャ設計

## 概要

siegeNginは、Hardhatプロジェクトのスマートコントラクトをブラウザベースで管理・デプロイするツールです。各プロジェクトの独立性を保ちながら、統一されたUIで操作できることが特徴です。

## ディレクトリ構造

```
siegeNgin/
├── browser-deploy/        # Web UIアプリケーション
│   ├── server.js         # Express.jsサーバー
│   ├── index.html        # メインUI
│   ├── js/app.js         # クライアントサイドロジック
│   └── package.json      # サーバーの依存関係（最小限）
├── projects/             # Hardhatプロジェクト群
│   ├── project-A/        # 独立したHardhatプロジェクト
│   │   ├── contracts/    # Solidityコントラクト
│   │   ├── node_modules/ # プロジェクト専用の依存関係
│   │   ├── package.json  # プロジェクト専用の設定
│   │   ├── hardhat.config.js
│   │   ├── artifacts/    # コンパイル結果（自動生成）
│   │   └── cache/        # キャッシュ（自動生成）
│   └── project-B/        # 別の独立したプロジェクト
│       └── ...
└── docs/                 # ドキュメント

```

## 設計原則

### 1. プロジェクトの完全な独立性

各Hardhatプロジェクトは完全に独立して動作します：

- **独立した依存関係**: 各プロジェクトが独自の`node_modules`を持つ
- **バージョンの自由度**: プロジェクトごとに異なるHardhatバージョンを使用可能
- **設定の独立性**: 各プロジェクトが独自の`hardhat.config.js`を持つ
- **移植性**: プロジェクトフォルダを他の場所に移動しても動作する

### 2. ローカルインストールの徹底

Hardhatのグローバルインストールは行いません：

```javascript
// ❌ 非推奨
npm install -g hardhat

// ✅ 推奨（各プロジェクトで実行）
cd projects/my-project
npm install
```

理由：
- Hardhat公式の推奨事項（Error HH12を回避）
- バージョン管理の明確化
- CI/CD環境での再現性向上
- チーム開発での環境統一

### 3. 最小限のサーバー依存関係

`browser-deploy`サーバーは最小限の依存関係のみ：
- express
- cors
- 基本的なNode.js組み込みモジュール

HardhatやEthers.jsはサーバーにインストールしません。

## プロジェクト管理フロー

### 新規プロジェクト作成

1. UIで「New Project」ボタンをクリック
2. サーバーが以下を自動生成：
   - `hardhat.config.js`
   - `package.json`
   - `.gitignore`
   - `contracts/HelloWorld.sol`
3. 自動的に`npm install`を実行
4. プロジェクトが利用可能に

### 既存プロジェクトの追加

1. `projects/`ディレクトリに既存のHardhatプロジェクトをコピー
2. 必要に応じて`npm install`を実行
3. UIでプロジェクトを選択して利用開始

### コンパイルプロセス

1. サーバーが各プロジェクトディレクトリで`npx hardhat compile`を実行
2. `node_modules`が存在しない場合は自動的に`npm install`
3. コンパイル結果は各プロジェクトの`artifacts/`に保存
4. キャッシュは各プロジェクトの`cache/`に保存

## セキュリティ考慮事項

1. **パストラバーサル対策**: プロジェクト名の厳格な検証
2. **プロセス分離**: 各コンパイル/デプロイは独立したプロセス
3. **秘密鍵の扱い**: サーバーは秘密鍵を扱わず、すべてMetaMask経由

## 利点

1. **柔軟性**: 各プロジェクトが独自の要件を持てる
2. **互換性**: 既存のHardhatプロジェクトをそのまま利用可能
3. **保守性**: プロジェクトごとに独立したアップデート
4. **スケーラビリティ**: プロジェクト数の制限なし

## 注意事項

- 各プロジェクトの`node_modules`は150-200MB程度
- ディスク容量を考慮した運用が必要
- `.gitignore`で`node_modules`、`artifacts`、`cache`を除外

## まとめ

siegeNginは「統一されたUIで複数の独立したHardhatプロジェクトを管理する」というコンセプトを実現しています。この設計により、既存のHardhatエコシステムとの完全な互換性を保ちながら、ブラウザベースの使いやすいインターフェースを提供します。