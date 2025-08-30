// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BackBank.sol";
import "./MainBank.sol";
import "./ItemBank.sol";
import "./FrontBank.sol";

contract CatComposer {
    BackBank public immutable backBank;
    MainBank public immutable mainBank;
    ItemBank public immutable itemBank;
    FrontBank public immutable frontBank;

    // Shuffle algorithm parameters
    uint256 public constant SHUFFLE_SEED = 8901;
    uint256 public constant TOTAL_SUPPLY = 10000;

    constructor(
        address _backBank,
        address _mainBank,
        address _itemBank,
        address _frontBank
    ) {
        backBank = BackBank(_backBank);
        mainBank = MainBank(_mainBank);
        itemBank = ItemBank(_itemBank);
        frontBank = FrontBank(_frontBank);
    }

    struct CatAttributes {
        uint8 backId;
        uint8 mainId;
        uint8 itemId;
        uint8 frontId;
    }

    function getCatAttributes(uint256 tokenId) public pure returns (CatAttributes memory) {
        require(tokenId >= 1 && tokenId <= TOTAL_SUPPLY, "Invalid token ID");

        // Linear Congruential Generator (LCG) for deterministic shuffling
        uint256 shuffled = ((tokenId - 1) * SHUFFLE_SEED + 1) % TOTAL_SUPPLY;

        // Extract attributes from shuffled value (each digit 0-9)
        uint8 frontId = uint8(shuffled % 10);
        uint8 itemId = uint8((shuffled / 10) % 10);
        uint8 mainId = uint8((shuffled / 100) % 10);
        uint8 backId = uint8((shuffled / 1000) % 10);

        return CatAttributes(backId, mainId, itemId, frontId);
    }

    function composeSVG(uint256 tokenId) external view returns (string memory) {
        CatAttributes memory attrs = getCatAttributes(tokenId);

        // Build SVG in parts to avoid stack too deep
        bytes memory part1 = abi.encodePacked(
            '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">',
            '<defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">',
            '<feGaussianBlur in="SourceAlpha" stdDeviation="0.24"/>',
            '<feOffset dx="0.12" dy="0.12" result="offsetblur"/>',
            '<feFlood flood-color="#000000" flood-opacity="0.6"/>',
            '<feComposite in2="offsetblur" operator="in"/>',
            '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>',
            '</filter></defs>'
        );

        bytes memory part2 = abi.encodePacked(
            extractSVGContent(backBank.getBackSVG(attrs.backId)),
            '<g filter="url(#shadow)">',
            extractSVGContent(mainBank.getMainSVG(attrs.mainId)),
            '</g>'
        );

        bytes memory part3 = abi.encodePacked(
            '<g filter="url(#shadow)">',
            extractSVGContent(itemBank.getItemSVG(attrs.itemId)),
            '</g>',
            '<g filter="url(#shadow)">',
            extractSVGContent(frontBank.getFrontSVG(attrs.frontId)),
            '</g>',
            '</svg>'
        );

        return string(abi.encodePacked(part1, part2, part3));
    }

    function extractSVGContent(string memory svg) private pure returns (string memory) {
        // This is a simplified extraction - in production, you'd want more robust parsing
        // For now, we assume the SVG structure is consistent and extract the <g> content
        bytes memory svgBytes = bytes(svg);
        uint256 startPos = 0;
        uint256 endPos = svgBytes.length;

        // Find start of <g
        for (uint256 i = 0; i < svgBytes.length - 2; i++) {
            if (svgBytes[i] == '<' && svgBytes[i+1] == 'g') {
                startPos = i;
                break;
            }
        }

        // Find end of </g>
        for (uint256 i = svgBytes.length - 4; i > 0; i--) {
            if (svgBytes[i] == '<' && svgBytes[i+1] == '/' && svgBytes[i+2] == 'g' && svgBytes[i+3] == '>') {
                endPos = i + 4;
                break;
            }
        }

        // Extract content
        bytes memory result = new bytes(endPos - startPos);
        for (uint256 i = 0; i < endPos - startPos; i++) {
            result[i] = svgBytes[startPos + i];
        }

        return string(result);
    }

    function getAttributeNames(uint256 tokenId) external view returns (
        string memory backName,
        string memory mainName,
        string memory itemName,
        string memory frontName
    ) {
        CatAttributes memory attrs = getCatAttributes(tokenId);

        backName = backBank.getBackName(attrs.backId);
        mainName = mainBank.getMainName(attrs.mainId);
        itemName = itemBank.getItemName(attrs.itemId);
        frontName = frontBank.getFrontName(attrs.frontId);
    }
}