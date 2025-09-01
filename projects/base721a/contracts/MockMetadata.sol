// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IMetadata.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MockMetadata is IMetadata {
    using Strings for uint256;
    
    string public name;
    string public description;
    string public imageURL;
    
    constructor(string memory _name, string memory _description, string memory _imageURL) {
        name = _name;
        description = _description;
        imageURL = _imageURL;
    }
    
    function setName(string memory _name) external {
        name = _name;
    }
    
    function setDescription(string memory _description) external {
        description = _description;
    }
    
    function setImageURL(string memory _imageURL) external {
        imageURL = _imageURL;
    }
    
    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        string memory json = string(
            abi.encodePacked(
                '{"name":"', name, ' #', tokenId.toString(), '",',
                '"description":"', description, '",',
                '"image":"', imageURL, '"}'
            )
        );
        
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }
}