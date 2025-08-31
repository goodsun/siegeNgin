// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DummyComposer {
    uint256 public constant TOTAL_SUPPLY = 10000;

    struct CatAttributes {
        uint8 backId;
        uint8 mainId;
        uint8 itemId;
        uint8 frontId;
    }

    function getCatAttributes(uint256 tokenId) public pure returns (CatAttributes memory) {
        require(tokenId >= 1 && tokenId <= TOTAL_SUPPLY, "Invalid token ID");

        // Return dummy attributes - all zeros
        return CatAttributes(0, 0, 0, 0);
    }

    function composeSVG(uint256) external pure returns (string memory) {
        // Return a simple dummy SVG of a cat face
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350">',
            '<rect width="350" height="350" fill="#f0f0f0"/>',
            '<circle cx="175" cy="175" r="100" fill="#888888"/>',
            '<circle cx="150" cy="160" r="10" fill="#000000"/>',
            '<circle cx="200" cy="160" r="10" fill="#000000"/>',
            '<path d="M 175 180 Q 175 190 165 195 M 175 180 Q 175 190 185 195" stroke="#000000" fill="none" stroke-width="2"/>',
            '<path d="M 120 140 L 140 120 L 140 150 Z" fill="#888888"/>',
            '<path d="M 230 140 L 210 120 L 210 150 Z" fill="#888888"/>',
            '<text x="175" y="300" text-anchor="middle" font-family="Arial" font-size="20" fill="#333333">not found</text>',
            '</svg>'
        ));
    }

    function getAttributeNames(uint256) external pure returns (
        string memory backName,
        string memory mainName,
        string memory itemName,
        string memory frontName
    ) {
        // Return dummy attribute names
        return (
            "not found",
            "not found",
            "not found",
            "not found"
        );
    }
}