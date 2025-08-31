// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CatComposer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CatMetadata is Ownable {
    CatComposer public catComposer;
    
    // Material description mappings
    mapping(uint8 => string) private backDescriptions;
    mapping(uint8 => string) private mainDescriptions;
    mapping(uint8 => string) private itemDescriptions;
    mapping(uint8 => string) private frontDescriptions;

    event ComposerUpdated(address indexed previousComposer, address indexed newComposer);

    constructor(address _catComposer) Ownable(msg.sender) {
        require(_catComposer != address(0), "Invalid composer address");
        catComposer = CatComposer(_catComposer);
        initializeDescriptions();
    }

    function setComposer(address _newComposer) external onlyOwner {
        require(_newComposer != address(0), "Invalid composer address");
        address previousComposer = address(catComposer);
        catComposer = CatComposer(_newComposer);
        emit ComposerUpdated(previousComposer, _newComposer);
    }

    function initializeDescriptions() private {
        // Background descriptions
        backDescriptions[0] = "a soft baby blue gingham pattern";
        backDescriptions[1] = "a classic black and white checkerboard";
        backDescriptions[2] = "a soft pink and lavender checkered pattern";
        backDescriptions[3] = "fluffy white clouds";
        backDescriptions[4] = "a pink gingham pattern";
        backDescriptions[5] = "an elegant houndstooth pattern";
        backDescriptions[6] = "playful polka dots";
        backDescriptions[7] = "a starry night sky";
        backDescriptions[8] = "bold horizontal stripes";
        backDescriptions[9] = "a traditional Scottish tartan";

        // Main cat descriptions
        mainDescriptions[0] = "A blue-colored Abyssinian cat";
        mainDescriptions[1] = "A spotted Japanese bobtail cat";
        mainDescriptions[2] = "A black and white tuxedo cat";
        mainDescriptions[3] = "A sleek black cat with golden eyes";
        mainDescriptions[4] = "A calico cat with orange, black and white patches";
        mainDescriptions[5] = "A mechanical robot cat";
        mainDescriptions[6] = "A Scottish Fold with adorable folded ears";
        mainDescriptions[7] = "A Siamese cat with distinctive color points";
        mainDescriptions[8] = "A hairless Sphinx cat";
        mainDescriptions[9] = "A classic brown tabby cat";

        // Item (accessory) descriptions
        itemDescriptions[0] = "wearing a golden bell collar";
        itemDescriptions[1] = "sitting in a cardboard box";
        itemDescriptions[2] = "sporting a baseball cap";
        itemDescriptions[3] = "adorned with a flower crown";
        itemDescriptions[4] = "equipped with a protective gas mask";
        itemDescriptions[5] = "wearing a stylish top hat";
        itemDescriptions[6] = "decorated with a silk ribbon";
        itemDescriptions[7] = "wrapped in a cozy scarf";
        itemDescriptions[8] = "dressed in a formal suit";
        itemDescriptions[9] = "looking cool in sunglasses";

        // Front (held item) descriptions
        frontDescriptions[0] = "holding a fresh red apple";
        frontDescriptions[1] = "playing with a toy mouse";
        frontDescriptions[2] = "munching on dry cat food";
        frontDescriptions[3] = "proudly displaying a caught fish";
        frontDescriptions[4] = "presenting a beautiful flower";
        frontDescriptions[5] = "carrying fresh catnip";
        frontDescriptions[6] = "with a bottle of sake";
        frontDescriptions[7] = "feasting on a piece of meat";
        frontDescriptions[8] = "holding a rice ball";
        frontDescriptions[9] = "with a bowl of rice";
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(tokenId >= 1 && tokenId <= catComposer.TOTAL_SUPPLY(), "Invalid token ID");

        string memory svg = catComposer.composeSVG(tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));
        string memory description = generateDescription(tokenId);
        string memory attributes = generateAttributes(tokenId);

        bytes memory json = abi.encodePacked(
            '{"name":"OnchainCats #',
            toString(tokenId),
            '","description":"',
            description,
            '","image":"data:image/svg+xml;base64,',
            svgBase64,
            '","attributes":[',
            attributes,
            ']}'
        );

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }

    function generateDescription(uint256 tokenId) private view returns (string memory) {
        CatComposer.CatAttributes memory attrs = catComposer.getCatAttributes(tokenId);
        
        return string(abi.encodePacked(
            mainDescriptions[attrs.mainId],
            ", ",
            itemDescriptions[attrs.itemId],
            ", ",
            frontDescriptions[attrs.frontId],
            ", set against ",
            backDescriptions[attrs.backId],
            "."
        ));
    }

    function generateAttributes(uint256 tokenId) private view returns (string memory) {
        (
            string memory backName,
            string memory mainName,
            string memory itemName,
            string memory frontName
        ) = catComposer.getAttributeNames(tokenId);

        return string(abi.encodePacked(
            '{"trait_type":"Background","value":"', backName, '"},',
            '{"trait_type":"Cat","value":"', mainName, '"},',
            '{"trait_type":"Accessory","value":"', itemName, '"},',
            '{"trait_type":"Item","value":"', frontName, '"}'
        ));
    }

    function contractURI() external view returns (string memory) {
        bytes memory json = abi.encodePacked(
            '{"name":"OnchainCats",'
            '"description":"OnchainCats is a fully on-chain NFT collection featuring 10,000 unique cats. All 10,000 cats exist from deployment and can be purchased. Each cat is procedurally generated and stored entirely on the blockchain with no external dependencies.",'
            '"image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(generateSampleSVG())),
            '",'
            '"external_link":"https://onchainscats.com",'
            '"seller_fee_basis_points":500,'
            '"fee_recipient":"',
            toHexString(uint160(owner()), 20),
            '",'
            '"total_supply":10000'
            '}'
        );
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }
    
    function generateSampleSVG() private view returns (string memory) {
        // Generate a representative sample cat for the collection image
        uint256 sampleTokenId = 1;
        return catComposer.composeSVG(sampleTokenId);
    }
    
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = bytes1(uint8(value & 0xf) + (uint8(value & 0xf) < 10 ? 48 : 87));
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

// Base64 encoding library
library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = TABLE;
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        
        string memory result = new string(encodedLen);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                
            } {
                let dataPtr := add(data, add(32, i))
                let input := 0
                
                // Read 3 bytes
                let byte1 := byte(0, mload(dataPtr))
                let byte2 := 0
                let byte3 := 0
                
                if lt(add(i, 1), mload(data)) {
                    byte2 := byte(0, mload(add(dataPtr, 1)))
                }
                if lt(add(i, 2), mload(data)) {
                    byte3 := byte(0, mload(add(dataPtr, 2)))
                }
                
                input := or(or(shl(16, byte1), shl(8, byte2)), byte3)
                
                // Encode 4 characters
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                
                switch lt(add(i, 1), mload(data))
                case 1 {
                    mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                    resultPtr := add(resultPtr, 1)
                }
                default {
                    mstore8(resultPtr, 0x3d)  // '='
                    resultPtr := add(resultPtr, 1)
                }
                
                switch lt(add(i, 2), mload(data))
                case 1 {
                    mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                    resultPtr := add(resultPtr, 1)
                }
                default {
                    mstore8(resultPtr, 0x3d)  // '='
                    resultPtr := add(resultPtr, 1)
                }
                
                i := add(i, 3)
            }
            
            mstore(result, encodedLen)
        }
        
        return result;
    }
}