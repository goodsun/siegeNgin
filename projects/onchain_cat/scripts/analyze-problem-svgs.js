const fs = require('fs');
const path = require('path');

// SVG patterns that were mentioned as problematic
const problemPatterns = [
    { contract: 'BackBank2.sol', function: 'getHoundstooth', name: 'Houndstooth' },
    { contract: 'BackBank3.sol', function: 'getStars', name: 'Stars' }
];

console.log('Analysis of Problematic SVG Patterns\n' + '='.repeat(50));

problemPatterns.forEach(pattern => {
    const filePath = path.join(__dirname, '../contracts/banks', pattern.contract);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the function
    const funcIndex = content.indexOf(`function ${pattern.function}(`);
    if (funcIndex === -1) {
        console.log(`\n${pattern.name}: Function not found!`);
        return;
    }
    
    // Extract the SVG
    const returnIndex = content.indexOf('return "', funcIndex);
    const startQuote = returnIndex + 8;
    let endQuote = startQuote;
    let escaped = false;
    
    while (endQuote < content.length) {
        if (content[endQuote] === '\\' && !escaped) {
            escaped = true;
        } else if (content[endQuote] === '"' && !escaped) {
            break;
        } else {
            escaped = false;
        }
        endQuote++;
    }
    
    const svgData = content.substring(startQuote, endQuote);
    const actualSvg = svgData.replace(/\\"/g, '"');
    
    console.log(`\n${pattern.name} (${pattern.contract}):`);
    console.log('-'.repeat(40));
    console.log(`Size: ${Buffer.from(actualSvg).length} bytes`);
    console.log(`Characters: ${actualSvg.length}`);
    
    // Analyze the structure
    const rectCount = (actualSvg.match(/<rect/g) || []).length;
    const defsCount = (actualSvg.match(/<defs>/g) || []).length;
    const patternCount = (actualSvg.match(/<pattern/g) || []).length;
    
    console.log(`Structure:`);
    console.log(`  - Rect elements: ${rectCount}`);
    console.log(`  - Defs sections: ${defsCount}`);
    console.log(`  - Pattern elements: ${patternCount}`);
    
    // Check for specific attributes that might cause issues
    const hasViewBox = actualSvg.includes('viewBox');
    const hasShapeRendering = actualSvg.includes('shape-rendering');
    const hasPattern = actualSvg.includes('<pattern');
    
    console.log(`Attributes:`);
    console.log(`  - Has viewBox: ${hasViewBox}`);
    console.log(`  - Has shape-rendering: ${hasShapeRendering}`);
    console.log(`  - Uses pattern: ${hasPattern}`);
    
    // Check for unusual characters
    const nonAscii = actualSvg.match(/[^\x20-\x7E]/g);
    if (nonAscii) {
        console.log(`WARNING: Contains ${nonAscii.length} non-ASCII characters!`);
    }
    
    // Check for very long attributes
    const longAttrs = actualSvg.match(/fill="#[^"]{7,}"/g) || [];
    if (longAttrs.length > 0) {
        console.log(`Long fill attributes: ${longAttrs.length}`);
    }
    
    // Estimate contract code size impact
    // In Solidity, string literals are stored differently than runtime strings
    const estimatedCodeSize = svgData.length + 200; // rough estimate including function overhead
    console.log(`\nEstimated code size contribution: ~${estimatedCodeSize} bytes`);
    
    // Check if it uses pattern references
    if (hasPattern) {
        const patternId = actualSvg.match(/id="([^"]+)"/);
        const patternRef = actualSvg.match(/fill="url\(#([^)]+)\)"/);
        console.log(`Pattern details:`);
        if (patternId) console.log(`  - Pattern ID: ${patternId[1]}`);
        if (patternRef) console.log(`  - Pattern reference: ${patternRef[1]}`);
    }
});

// Compare with successfully deployed patterns
console.log('\n\nComparison with Successful Patterns:');
console.log('='.repeat(50));

const successfulPatterns = [
    { contract: 'BackBank2.sol', function: 'getGingham', name: 'Gingham' },
    { contract: 'BackBank3.sol', function: 'getStripes', name: 'Stripes' }
];

successfulPatterns.forEach(pattern => {
    const filePath = path.join(__dirname, '../contracts/banks', pattern.contract);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const funcIndex = content.indexOf(`function ${pattern.function}(`);
    if (funcIndex === -1) return;
    
    const returnIndex = content.indexOf('return "', funcIndex);
    const startQuote = returnIndex + 8;
    let endQuote = startQuote;
    let escaped = false;
    
    while (endQuote < content.length) {
        if (content[endQuote] === '\\' && !escaped) {
            escaped = true;
        } else if (content[endQuote] === '"' && !escaped) {
            break;
        } else {
            escaped = false;
        }
        endQuote++;
    }
    
    const svgData = content.substring(startQuote, endQuote);
    const actualSvg = svgData.replace(/\\"/g, '"');
    
    console.log(`\n${pattern.name}: ${Buffer.from(actualSvg).length} bytes`);
});

// Check total contract sizes
console.log('\n\nTotal Contract Code Analysis:');
console.log('='.repeat(50));

['BackBank2.sol', 'BackBank3.sol'].forEach(contractFile => {
    const filePath = path.join(__dirname, '../contracts/banks', contractFile);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count total size of all return statements
    let totalSvgSize = 0;
    const returnMatches = content.matchAll(/return "([^"]*(?:\\"[^"]*)*)"/g);
    
    for (const match of returnMatches) {
        const svg = match[1].replace(/\\"/g, '"');
        totalSvgSize += Buffer.from(svg).length;
    }
    
    console.log(`\n${contractFile}:`);
    console.log(`  Total contract size: ${content.length} bytes`);
    console.log(`  Total SVG data size: ${totalSvgSize} bytes`);
    console.log(`  Non-SVG code: ${content.length - totalSvgSize} bytes`);
});

// Ethereum contract size limit
console.log('\n\nEthereum Contract Size Limit:');
console.log('='.repeat(50));
console.log('Maximum contract size: 24,576 bytes (24KB)');
console.log('This includes the deployed bytecode, not the source code.');