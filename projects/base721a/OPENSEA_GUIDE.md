# OpenSeaでのNFTコレクション公開・販売ガイド

## 前提条件
- 10,000点のジェネラティブアートのメタデータコントラクト（MetadataCA）を保有
- Base721Aコントラクトを使用
- Ethereumメインネットまたはテストネット（Goerli等）にデプロイ

## Step 1: コントラクトのデプロイ

### 1.1 Base721Aのデプロイ
```javascript
const Base721A = await ethers.getContractFactory("Base721A");
const nft = await Base721A.deploy(
    "Generative Collection",     // コレクション名
    "GEN"                        // シンボル
);
await nft.deployed();
console.log("NFT Contract:", nft.address);
```

## Step 2: メタデータの設定

### 2.1 メタデータコントラクトの設定
```javascript
// 既存のジェネラティブメタデータコントラクトを設定
await nft.setMetadataCA("0x...あなたのMetadataCAアドレス");
```

### 2.2 コレクションメタデータの設定
```javascript
const collectionMetadata = {
    name: "Generative Collection",
    description: "10,000 unique generative art pieces",
    image: "https://example.com/collection-icon.png",
    banner_image: "https://example.com/banner.png",
    featured_image: "https://example.com/featured.png",
    external_link: "https://example.com",
    seller_fee_basis_points: 250,  // 2.5%のロイヤリティ
    fee_recipient: "0x...ロイヤリティ受取アドレス"
};

const base64 = Buffer.from(JSON.stringify(collectionMetadata)).toString('base64');
await nft.setContractURI(`data:application/json;base64,${base64}`);
```

## Step 3: NFTのミント

### 3.1 全量ミント（推奨）
```javascript
// 10,000個を一度にミント（ガス代に注意）
await nft.mint(10000);
```

### 3.2 分割ミント（ガス代節約）
```javascript
// 1000個ずつ10回に分けてミント
for (let i = 0; i < 10; i++) {
    await nft.mint(1000);
    console.log(`Minted batch ${i + 1}/10`);
}
```

## Step 4: 販売準備

### 4.1 販売方法の選択

#### オプション1: OpenSeaで直接販売
1. OpenSeaにアクセス（自動的にコレクションが検出される）
2. コレクションページで個別にNFTをリスト
3. 固定価格またはオークション形式で販売

#### オプション2: 専用販売コントラクトの開発
```solidity
// 例: シンプルな販売コントラクト
contract NFTSale {
    Base721A public nftContract;
    uint256 public price = 0.05 ether;
    
    function buy(uint256 tokenId) external payable {
        require(msg.value >= price, "Insufficient payment");
        // NFTをオーナーから購入者に転送
        nftContract.safeTransferFrom(owner, msg.sender, tokenId);
    }
}
```

#### オプション3: 既存のマーケットプレイスツールを使用
- Seaport（OpenSeaのプロトコル）
- 0x Protocol
- Wyvern Protocol

## Step 5: OpenSeaでの公開

### 5.1 コレクションの確認
1. OpenSeaで自分のウォレットアドレスを検索
2. 「Created」タブでコレクションを確認
3. コレクション設定ページで追加情報を編集

### 5.2 コレクション情報の最適化
- バナー画像のアップロード（推奨サイズ: 1400x400px）
- カテゴリーの選択（Art, PFP等）
- SNSリンクの追加
- 説明文の充実

## Step 6: 販売戦略

### 6.1 段階的リリース
```javascript
// Phase 1: レア度の高い100個を高価格で販売
// Phase 2: 通常価格で9,900個を販売
```

### 6.2 ホワイトリスト販売
```javascript
// 専用の販売コントラクトでホワイトリスト機能を実装
mapping(address => bool) public whitelist;
```

### 6.3 バンドル販売
- OpenSeaのバンドル機能を使用して複数NFTをセット販売

## Step 7: 販売後の管理

### 7.1 ロイヤリティの確認
- contractURIで設定したロイヤリティが適用されているか確認
- 二次販売時に自動的にロイヤリティが支払われる

### 7.2 メタデータの更新
```javascript
// 必要に応じてメタデータコントラクトを更新
await nft.setMetadataCA("0x...新しいMetadataCAアドレス");
```

### 7.3 コミュニティ管理
- Discord/Twitterでのコミュニティ構築
- ホルダー特典の提供
- ロードマップの公開

## 注意事項

### ガス代の見積もり
- 10,000個のミント: 約0.5-2 ETH（ネットワーク状況による）
- ERC721Aの利用により大幅に削減済み

### セキュリティ
- オーナー権限の秘密鍵は厳重に管理
- マルチシグウォレットの使用を推奨
- 販売コントラクトは必ず監査を受ける

### 法的考慮事項
- 各国の規制に準拠
- 利用規約の作成
- 知的財産権の明確化

## トラブルシューティング

### OpenSeaに表示されない場合
1. 数分待つ（インデックスに時間がかかる）
2. OpenSeaで「Refresh Metadata」をクリック
3. contractURIが正しく設定されているか確認

### メタデータが404の場合
```javascript
// メタデータコントラクトが正しく設定されているか確認
console.log("MetadataCA:", await nft.metadataCA());
```

### 販売できない場合
- NFTの所有権を確認
- 承認（approve）が必要な場合がある
- OpenSeaのリスティング署名を確認