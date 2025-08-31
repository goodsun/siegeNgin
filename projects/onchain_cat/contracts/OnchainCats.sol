// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CatMetadata.sol";

// ERC-4906: EIP-721 Metadata Update Extension
interface IERC4906 {
    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
}

contract OnchainCats is ERC721A, ERC2981, Ownable, IERC4906 {
    CatMetadata public immutable catMetadata;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public price = 0.01 ether;
    
    event Purchased(address indexed buyer, uint256 indexed tokenId);
    event PriceChanged(uint256 newPrice);
    event RoyaltyChanged(address receiver, uint96 feeNumerator);
    
    constructor(address _catMetadata) ERC721A("OnchainCats", "OCAT") Ownable(msg.sender) {
        catMetadata = CatMetadata(_catMetadata);
        // Set default royalty to 5% (500 basis points)
        _setDefaultRoyalty(msg.sender, 500);
    }
    
    function isAvailable(uint256 tokenId) public view returns (bool) {
        return tokenId >= 1 && tokenId <= MAX_SUPPLY && ownerOf(tokenId) == owner();
    }
    
    function buy(uint256 tokenId) public payable {
        require(isAvailable(tokenId), "Not for sale");
        require(msg.value >= price, "Insufficient payment");
        
        // Check ownership before transfer
        require(ownerOf(tokenId) == owner(), "Owner mismatch");
        
        // Transfer from owner to buyer using internal transfer
        _transfer(owner(), msg.sender, tokenId);
        
        // Send payment to owner()
        payable(owner()).transfer(price);
        
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
            require(isAvailable(tokenId), "Not for sale");
            
            _transfer(owner(), msg.sender, tokenId);
            
            emit Purchased(msg.sender, tokenId);
        }
        
        // Send payment to owner()
        payable(owner()).transfer(totalPrice);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
    
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return catMetadata.tokenURI(tokenId);
    }
    
    function contractURI() public view returns (string memory) {
        return catMetadata.contractURI();
    }
    
    function setPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        price = _newPrice;
        emit PriceChanged(_newPrice);
    }
    
    
    function setRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        require(receiver != address(0), "Invalid receiver");
        require(feeNumerator <= 1000, "Royalty fee cannot exceed 10%");
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyChanged(receiver, feeNumerator);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Initial mint function - call after deployment
    function initialMint(uint256 quantity) external onlyOwner {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        _mintERC2309(owner(), quantity);
    }
    
    // ERC-4906 Metadata Update Functions
    function notifyCollectionExists() external onlyOwner {
        emit BatchMetadataUpdate(1, MAX_SUPPLY);
    }
    
    function updateMetadata(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        emit MetadataUpdate(tokenId);
    }
    
    function updateMetadataRange(uint256 fromTokenId, uint256 toTokenId) external onlyOwner {
        require(fromTokenId >= 1 && toTokenId <= MAX_SUPPLY, "Invalid range");
        require(fromTokenId <= toTokenId, "Invalid range order");
        emit BatchMetadataUpdate(fromTokenId, toTokenId);
    }
    
    // Override _startTokenId to start at 1 instead of 0
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return interfaceId == bytes4(0x49064906) || // ERC-4906
               super.supportsInterface(interfaceId);
    }
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}