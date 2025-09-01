// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./IMetadata.sol";

contract Base721A is ERC721A, Ownable {
    string private _contractURI;
    string private _404Image;
    address public metadataCA;
    
    // EIP-4906 events
    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

    constructor(string memory name, string memory symbol) ERC721A(name, symbol) {}

    function mint(uint256 quantity) external onlyOwner {
        _mint(msg.sender, quantity);
    }

    function setContractURI(string calldata uri) external onlyOwner {
        _contractURI = uri;
    }

    function setMetadataCA(address _metadataCA) external onlyOwner {
        metadataCA = _metadataCA;
        
        // Emit event for all existing tokens
        if (_totalMinted() > 0) {
            emit BatchMetadataUpdate(_startTokenId(), _startTokenId() + _totalMinted() - 1);
        }
    }

    function set404Image(string calldata imageDataURI) external onlyOwner {
        _404Image = imageDataURI;
        
        // Emit event for tokens without metadata contract
        if (metadataCA == address(0) && _totalMinted() > 0) {
            emit BatchMetadataUpdate(_startTokenId(), _startTokenId() + _totalMinted() - 1);
        }
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        if (metadataCA != address(0)) {
            return IMetadata(metadataCA).tokenURI(tokenId);
        }
        
        // Return 404-like JSON when no metadata contract is set
        string memory image;
        if (bytes(_404Image).length > 0) {
            image = _404Image;
        } else {
            // Default simple 404 SVG
            string memory svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f0f0f0"/><text x="200" y="200" font-family="Arial" font-size="72" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#666">404</text><text x="200" y="250" font-family="Arial" font-size="24" text-anchor="middle" fill="#999">Not Found</text></svg>';
            image = string(abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            ));
        }
        
        string memory json = string(abi.encodePacked(
            '{"name":"404","description":"Metadata not found","image":"',
            image,
            '"}'
        ));
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}