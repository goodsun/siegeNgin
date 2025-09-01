# Base721A

究極にシンプルなERC721Aベースのスマートコントラクト。単一責任の原則に基づき、NFTの発行と所有権管理のみに特化。

## 設計思想

このコントラクトは**マイクロサービス的アプローチ**を採用しています：

- **Base721A**: NFTの発行・所有権管理のみ
- **MetadataCA**: メタデータの提供（別コントラクト）
- **販売機能**: OpenSeaや専用販売コントラクトに委譲

各コンポーネントが独立し、明確な責任を持つことで、保守性・再利用性・セキュリティを向上させています。

## 特徴

- 🚀 ERC721Aによる高効率なバッチミント
- 👤 オーナー専用のミント機能
- 🎨 外部メタデータコントラクトによる柔軟な表現
- 📦 販売機能を持たないピュアなNFTコントラクト
- 🔍 メタデータ未設定時の404 JSONフォールバック

## インストール

```bash
npm install
```

## 使い方

### コンパイル
```bash
npm run compile
```

### テスト
```bash
npm test
```

### デプロイ
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## コントラクト機能

### オーナー専用関数

#### `mint(uint256 quantity)`
指定数量のNFTをオーナーアドレスにミント

#### `setMetadataCA(address _metadataCA)`
メタデータを提供する外部コントラクトのアドレスを設定

#### `setContractURI(string calldata uri)`
コレクション全体のメタデータURI（OpenSea対応）を設定

### 読み取り専用関数

#### `tokenURI(uint256 tokenId)`
個別NFTのメタデータURIを返却
- メタデータCA設定時: 外部コントラクトから取得
- 未設定時: 404 JSONを返却

#### `contractURI()`
コレクションメタデータURIを返却

## アーキテクチャ

```
┌─────────────┐     ┌──────────────┐
│  Base721A   │────▶│ IMetadata    │
│   (NFT)     │     │ (Interface)  │
└─────────────┘     └──────────────┘
       │                    ▲
       │                    │
       ▼                    │
┌─────────────┐     ┌──────────────┐
│   OpenSea   │     │ MetadataCA   │
│ (販売/表示) │     │ (実装)       │
└─────────────┘     └──────────────┘
```

## 販売について

このコントラクトは販売機能を持ちません。販売は以下の方法で実現：

1. **OpenSeaでの直接販売**: ミント後、OpenSeaでリスティング
2. **専用販売コントラクト**: 独自の販売ロジックを実装
3. **既存プロトコル**: Seaport等の汎用販売プロトコルを利用

詳細は[OPENSEA_GUIDE.md](./OPENSEA_GUIDE.md)を参照。

## 仕様

詳細な技術仕様は[SPECIFICATION.md](./SPECIFICATION.md)を参照。

## ライセンス

MIT License - [LICENSE](./LICENSE)を参照。

## 作者

siegeNgin - スマートコントラクト自動生成ツール