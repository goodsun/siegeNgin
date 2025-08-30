const fs = require('fs');
const path = require('path');

// Read contract files
const contractsDir = path.join(__dirname, '../contracts/banks');
const contracts = [
    { name: 'BackBank1.sol', patterns: ['BabyBlueGingham', 'Checkerboard', 'Checkered', 'CloudPattern'] },
    { name: 'BackBank2.sol', patterns: ['Gingham', 'Houndstooth', 'PolkaDots'] },
    { name: 'BackBank3.sol', patterns: ['Stars', 'Stripes', 'Tartan'] }
];

console.log('SVG Data Size Analysis\n' + '='.repeat(50));

contracts.forEach(contract => {
    const filePath = path.join(contractsDir, contract.name);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n${contract.name}:`);
    console.log('-'.repeat(40));
    
    contract.patterns.forEach(pattern => {
        // Find the function that returns this pattern
        const functionName = `get${pattern}`;
        // Match multiline return statements with escaped quotes
        const regex = new RegExp(`function ${functionName}\\(\\)[^{]*{[^}]*return\\s*"([^"]*(?:\\\\"[^"]*)*)"`, 's');
        const match = content.match(regex);
        
        if (match) {
            const svgData = match[1];
            // Replace escaped quotes for accurate size calculation
            const actualSvg = svgData.replace(/\\"/g, '"');
            const byteSize = Buffer.from(actualSvg).length;
            const charCount = actualSvg.length;
            
            console.log(`  ${pattern}:`);
            console.log(`    Characters: ${charCount}`);
            console.log(`    Bytes: ${byteSize}`);
            
            // Check for special characters
            const hasSpecialChars = /[^\x20-\x7E]/.test(actualSvg);
            if (hasSpecialChars) {
                console.log(`    WARNING: Contains non-ASCII characters!`);
            }
            
            // Count escaped quotes in original
            const innerQuotes = (svgData.match(/\\"/g) || []).length;
            if (innerQuotes > 0) {
                console.log(`    Note: Contains ${innerQuotes} escaped quotes in source`);
            }
        } else {
            console.log(`  ${pattern}: NOT FOUND`);
        }
    });
    
    // Also check getBackSVG function
    const backSVGRegex = /function getBackSVG[^{]*{([^}]+)}/s;
    const backMatch = content.match(backSVGRegex);
    if (backMatch) {
        const functionBody = backMatch[1];
        const returnMatches = functionBody.matchAll(/return\s*"([^"]+)"/g);
        console.log(`\n  getBackSVG inline SVGs:`);
        let index = 0;
        for (const match of returnMatches) {
            const svgData = match[1];
            const byteSize = Buffer.from(svgData).length;
            console.log(`    SVG ${index++}: ${byteSize} bytes`);
        }
    }
});

// Compare with deployment gas limits
console.log('\n\nDeployment Configuration Analysis:');
console.log('='.repeat(50));

const deployConfigPath = path.join(__dirname, '../deploy-config.json');
if (fs.existsSync(deployConfigPath)) {
    const deployConfig = JSON.parse(fs.readFileSync(deployConfigPath, 'utf8'));
    console.log('\nGas settings from deploy-config.json:');
    if (deployConfig.gasLimit) {
        console.log(`  Gas Limit: ${deployConfig.gasLimit}`);
    }
    if (deployConfig.gasPrice) {
        console.log(`  Gas Price: ${deployConfig.gasPrice}`);
    }
}

// Summary
console.log('\n\nSummary:');
console.log('='.repeat(50));
console.log('\nLargest SVG patterns by size:');

const allPatterns = [];
contracts.forEach(contract => {
    const filePath = path.join(contractsDir, contract.name);
    const content = fs.readFileSync(filePath, 'utf8');
    
    contract.patterns.forEach(pattern => {
        const functionName = `get${pattern}`;
        const regex = new RegExp(`function ${functionName}\\(\\)[^{]*{[^}]*return\\s*"([^"]*(?:\\\\"[^"]*)*)"`, 's');
        const match = content.match(regex);
        
        if (match) {
            const actualSvg = match[1].replace(/\\"/g, '"');
            allPatterns.push({
                contract: contract.name,
                pattern: pattern,
                size: Buffer.from(actualSvg).length
            });
        }
    });
});

allPatterns.sort((a, b) => b.size - a.size);
allPatterns.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.pattern} (${p.contract}): ${p.size} bytes`);
});