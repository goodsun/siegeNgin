// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "./VirtualOwner.sol";
import "./CatMetadata.sol";

// ERC-4906: EIP-721 Metadata Update Extension
interface IERC4906 {
    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
}

contract OnchainCats is ERC721, ERC721Enumerable, ERC2981, VirtualOwner, IERC4906 {
    CatMetadata public immutable catMetadata;
    
    uint256 public constant TOTAL_SUPPLY = 10000;
    uint256 public price = 0.01 ether;
    
    mapping(uint256 => bool) private _minted;
    mapping(uint256 => address) private _tokenApprovals;
    
    event Purchased(address indexed buyer, uint256 indexed tokenId);
    event PriceChanged(uint256 newPrice);
    event RoyaltyChanged(address receiver, uint96 feeNumerator);
    
    constructor(address _catMetadata) ERC721("OnchainCats", "OCAT") {
        catMetadata = CatMetadata(_catMetadata);
        // Set default royalty to 5% (500 basis points)
        _setDefaultRoyalty(msg.sender, 500);
        // Virtual Ownership: 実際のミントは購入時に行う
    }
    
    function exists(uint256 tokenId) public pure returns (bool) {
        return tokenId >= 1 && tokenId <= TOTAL_SUPPLY;
    }
    
    function isAvailable(uint256 tokenId) public view returns (bool) {
        return exists(tokenId) && !_minted[tokenId];
    }
    
    function ownerOf(uint256 tokenId) public view override(ERC721, IERC721) returns (address) {
        if (!exists(tokenId)) revert("Token does not exist");
        
        if (_minted[tokenId]) {
            // Already minted, return actual owner
            return super.ownerOf(tokenId);
        } else {
            // Not minted yet, return virtual owner
            return virtualOwner();
        }
    }
    
    function buy(uint256 tokenId) public payable {
        require(exists(tokenId), "Token does not exist");
        require(!_minted[tokenId], "Already sold");
        require(msg.value >= price, "Insufficient payment");
        
        // Mint the NFT to the buyer
        _minted[tokenId] = true;
        _mint(msg.sender, tokenId);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit Purchased(msg.sender, tokenId);
    }
    
    function buyMultiple(uint256[] calldata tokenIds) external payable {
        uint256 totalPrice = price * tokenIds.length;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(exists(tokenId), "Token does not exist");
            require(!_minted[tokenId], "Token already sold");
            
            _minted[tokenId] = true;
            _mint(msg.sender, tokenId);
            
            emit Purchased(msg.sender, tokenId);
        }
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        return catMetadata.tokenURI(tokenId);
    }
    
    function contractURI() public view returns (string memory) {
        return catMetadata.contractURI();
    }
    
    function totalSupply() public pure override returns (uint256) {
        return TOTAL_SUPPLY;
    }
    
    function tokenByIndex(uint256 index) public pure override returns (uint256) {
        require(index < TOTAL_SUPPLY, "Index out of bounds");
        return index + 1; // tokenId は 1 から開始
    }
    
    function tokenOfOwnerByIndex(address owner, uint256 index) 
        public view override returns (uint256) {
        if (owner == virtualOwner()) {
            // Virtual ownerの場合、未販売トークンを返す
            uint256 count = 0;
            for (uint256 i = 1; i <= TOTAL_SUPPLY; i++) {
                if (!_minted[i]) {
                    if (count == index) return i;
                    count++;
                }
            }
            revert("Index out of bounds");
        } else {
            // Use ERC721Enumerable's implementation for actual owners
            return super.tokenOfOwnerByIndex(owner, index);
        }
    }
    
    function balanceOf(address owner) public view override(ERC721, IERC721) returns (uint256) {
        if (owner == virtualOwner()) {
            // Virtual ownerの未販売トークン数を返す
            uint256 count = 0;
            for (uint256 i = 1; i <= TOTAL_SUPPLY; i++) {
                if (!_minted[i]) count++;
            }
            return count;
        } else {
            // 実際の所有者のトークン数はERC721の実装を使用
            return super.balanceOf(owner);
        }
    }
    
    function setPrice(uint256 _newPrice) external onlyVirtualOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        price = _newPrice;
        emit PriceChanged(_newPrice);
    }
    
    function setRoyalty(address receiver, uint96 feeNumerator) external onlyVirtualOwner {
        require(receiver != address(0), "Invalid receiver");
        require(feeNumerator <= 1000, "Royalty fee cannot exceed 10%");
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyChanged(receiver, feeNumerator);
    }
    
    function withdraw() external onlyVirtualOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(virtualOwner()).transfer(balance);
    }
    
    // Airdrop functions for virtual owner
    function airdrop(address to, uint256 tokenId) external onlyVirtualOwner {
        require(exists(tokenId), "Token does not exist");
        require(!_minted[tokenId], "Already sold");
        require(to != address(0), "Invalid recipient");
        
        // Mint the NFT to the recipient
        _minted[tokenId] = true;
        _mint(to, tokenId);
        
        emit Purchased(to, tokenId);
    }
    
    function airdropMultiple(address to, uint256[] calldata tokenIds) external onlyVirtualOwner {
        require(to != address(0), "Invalid recipient");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(exists(tokenId), "Token does not exist");
            require(!_minted[tokenId], "Token already sold");
            
            _minted[tokenId] = true;
            _mint(to, tokenId);
            
            emit Purchased(to, tokenId);
        }
    }
    
    // Override approve to allow virtual owner to approve unminted tokens
    function approve(address to, uint256 tokenId) public override(ERC721, IERC721) {
        if (!_minted[tokenId] && msg.sender == virtualOwner()) {
            // Virtual owner can approve unminted tokens
            require(exists(tokenId), "Token does not exist");
            require(to != address(0), "Invalid spender");
            
            // Store approval for later minting
            _tokenApprovals[tokenId] = to;
            emit Approval(virtualOwner(), to, tokenId);
        } else {
            // Normal approve for minted tokens
            super.approve(to, tokenId);
        }
    }
    
    // Allow approved addresses to claim unminted tokens
    function claim(uint256 tokenId) external {
        require(exists(tokenId), "Token does not exist");
        require(!_minted[tokenId], "Already minted");
        require(_tokenApprovals[tokenId] == msg.sender, "Not approved");
        
        // Mint to the approved address
        _minted[tokenId] = true;
        _mint(msg.sender, tokenId);
        delete _tokenApprovals[tokenId];
        
        emit Purchased(msg.sender, tokenId);
    }
    
    // ERC-4906 Metadata Update Functions
    function notifyCollectionExists() external onlyVirtualOwner {
        // Emit event to notify that all tokens in the collection exist
        emit BatchMetadataUpdate(1, TOTAL_SUPPLY);
    }
    
    function updateMetadata(uint256 tokenId) external onlyVirtualOwner {
        require(exists(tokenId), "Token does not exist");
        emit MetadataUpdate(tokenId);
    }
    
    function updateMetadataRange(uint256 fromTokenId, uint256 toTokenId) external onlyVirtualOwner {
        require(fromTokenId >= 1 && toTokenId <= TOTAL_SUPPLY, "Invalid range");
        require(fromTokenId <= toTokenId, "Invalid range order");
        emit BatchMetadataUpdate(fromTokenId, toTokenId);
    }
    
    // Required overrides for ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return interfaceId == bytes4(0x49064906) || // ERC-4906
               super.supportsInterface(interfaceId);
    }
}