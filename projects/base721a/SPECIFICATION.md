# Base721A Specification

## 概要
Base721Aは、ERC721Aを基盤とした究極にシンプルなNFTスマートコントラクトです。オーナーのみがミント可能で、メタデータは外部コントラクトから動的に取得する設計となっています。

## 主要機能

### 1. NFTミント
- **関数**: `mint(uint256 quantity)`
- **権限**: オーナーのみ
- **動作**: 指定した数量のNFTをオーナーアドレスにミント
- **トークンID**: 1から開始

### 2. メタデータ管理

#### 2.1 個別NFTメタデータ（tokenURI）
- **関数**: `tokenURI(uint256 tokenId)`
- **動作**:
  - メタデータコントラクトが設定されている場合: 外部コントラクトから取得
  - 未設定の場合: 404エラーJSON（Base64エンコード）を返却
  ```json
  {
    "name": "404",
    "description": "Metadata not found",
    "image": ""
  }
  ```

#### 2.2 メタデータコントラクト設定
- **関数**: `setMetadataCA(address _metadataCA)`
- **権限**: オーナーのみ
- **動作**: NFTメタデータを提供する外部コントラクトのアドレスを設定
- **要件**: 設定するコントラクトは`IMetadata`インターフェースを実装している必要がある

#### 2.3 コレクションメタデータ（contractURI）
- **関数**: `contractURI()`
- **動作**: コレクション全体のメタデータURIを返却（OpenSea対応）
- **設定**: `setContractURI(string calldata uri)`でURIを設定
- **形式**: HTTPSのURLまたはBase64エンコードされたdata URI

### 3. オーナー管理
- Ownableを継承
- `transferOwnership(address newOwner)`でオーナー権限の移譲が可能

## インターフェース仕様

### IMetadata
メタデータコントラクトが実装すべきインターフェース：
```solidity
interface IMetadata {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
```

## 使用例

### 1. デプロイ
```javascript
const Base721A = await ethers.getContractFactory("Base721A");
const nft = await Base721A.deploy("MyNFT", "MNFT");
```

### 2. NFTのミント
```javascript
await nft.mint(100); // 100個のNFTをミント
```

### 3. メタデータコントラクトの設定
```javascript
await nft.setMetadataCA(metadataContractAddress);
```

### 4. コレクションメタデータの設定
```javascript
// URL形式
await nft.setContractURI("https://example.com/collection-metadata.json");

// またはBase64形式
const metadata = {
  name: "My Collection",
  description: "Amazing NFT collection",
  image: "https://example.com/icon.jpg"
};
const base64 = Buffer.from(JSON.stringify(metadata)).toString('base64');
await nft.setContractURI(`data:application/json;base64,${base64}`);
```

## セキュリティ考慮事項
- すべての管理機能はオーナーのみ実行可能
- ミントされたNFTは全てオーナーのアドレスに送られる
- 販売機能は実装されていない（別途販売コントラクトが必要）

## ガス効率
- ERC721Aを採用しているため、大量ミント時のガス効率が高い
- バッチミントに最適化されている

## 拡張性
- メタデータコントラクトを差し替えることで、NFTの表示内容を動的に変更可能
- オンチェーンメタデータ、動的メタデータなど様々な実装が可能