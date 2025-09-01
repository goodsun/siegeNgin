# Base721A - ERC721A Smart Contract Base

## Overview
A gas-efficient NFT smart contract base built on ERC721A with common features.

## Features
- Gas-efficient batch minting with ERC721A
- Configurable mint price and supply limits
- Per-wallet mint limits
- Owner minting capability
- Metadata URI management
- Contract-level metadata support
- Withdrawal functionality

## Setup
```bash
npm install
```

## Compile
```bash
npm run compile
```

## Test
```bash
npm test
```

## Deploy
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Contract Functions

### Public Functions
- `mint(uint256 quantity)` - Mint NFTs (requires payment)
- `tokenURI(uint256 tokenId)` - Get metadata URI for a token
- `contractURI()` - Get contract-level metadata URI

### Owner Functions
- `ownerMint(address to, uint256 quantity)` - Mint without payment
- `setMintEnabled(bool enabled)` - Enable/disable public minting
- `setMintPrice(uint256 price)` - Update mint price
- `setMaxMintPerWallet(uint256 max)` - Update per-wallet limit
- `setBaseTokenURI(string uri)` - Set base URI for token metadata
- `setContractURI(string uri)` - Set contract metadata URI
- `withdraw()` - Withdraw contract balance