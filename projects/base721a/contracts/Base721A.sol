// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./IMetadata.sol";

contract Base721A is ERC721A, Ownable {
    string private _contractURI;
    address public metadataCA;

    constructor(string memory name, string memory symbol) ERC721A(name, symbol) {}

    function mint(uint256 quantity) external onlyOwner {
        _mint(msg.sender, quantity);
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        if (metadataCA != address(0)) {
            return IMetadata(metadataCA).tokenURI(tokenId);
        }
        
        // Return 404-like JSON when no metadata contract is set
        string memory json = '{"name":"404","description":"Metadata not found","image":""}';
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