// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IMetadata.sol";

contract Base721A is ERC721A, Ownable {
    string private _baseTokenURI;
    string private _contractURI;
    address public metadataCA;

    constructor(string memory name, string memory symbol) ERC721A(name, symbol) {}

    function mint(uint256 quantity) external onlyOwner {
        _mint(msg.sender, quantity);
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setContractURI(string calldata uri) external onlyOwner {
        _contractURI = uri;
    }

    function setMetadataCA(address _metadataCA) external onlyOwner {
        metadataCA = _metadataCA;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        if (metadataCA != address(0)) {
            return IMetadata(metadataCA).tokenURI(tokenId);
        }
        
        return super.tokenURI(tokenId);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}