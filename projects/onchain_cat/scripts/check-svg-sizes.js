const fs = require('fs');
const path = require('path');

// Function to extract and measure SVG from return statement
function extractSVG(content, functionName) {
    // Look for the function and its return statement
    const funcIndex = content.indexOf(`function ${functionName}(`);
    if (funcIndex === -1) return null;
    
    // Find the return statement
    const returnIndex = content.indexOf('return "', funcIndex);
    if (returnIndex === -1) return null;
    
    // Find the end of the return statement
    const startQuote = returnIndex + 8; // after 'return "'
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
    // Unescape the quotes
    const actualSvg = svgData.replace(/\\"/g, '"');
    
    return {
        raw: svgData,
        actual: actualSvg,
        size: Buffer.from(actualSvg).length,
        chars: actualSvg.length
    };
}

// Analyze each contract
const contracts = [
    { file: 'BackBank1.sol', functions: ['getBabyBlueGingham', 'getCheckerboard', 'getCheckered', 'getCloudPattern'] },
    { file: 'BackBank2.sol', functions: ['getGingham', 'getHoundstooth', 'getPolkaDots'] },
    { file: 'BackBank3.sol', functions: ['getStars', 'getStripes', 'getTartan'] }
];

const results = [];

contracts.forEach(contract => {
    const filePath = path.join(__dirname, '../contracts/banks', contract.file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n${contract.file}:`);
    console.log('='.repeat(50));
    
    contract.functions.forEach(func => {
        const svg = extractSVG(content, func);
        if (svg) {
            console.log(`\n${func}:`);
            console.log(`  Size: ${svg.size} bytes`);
            console.log(`  Characters: ${svg.chars}`);
            
            // Count rect elements as a proxy for complexity
            const rectCount = (svg.actual.match(/<rect/g) || []).length;
            console.log(`  Rect elements: ${rectCount}`);
            
            results.push({
                contract: contract.file,
                function: func,
                size: svg.size,
                rects: rectCount
            });
        }
    });
});

// Sort by size and show largest
console.log('\n\nLargest SVG patterns:');
console.log('='.repeat(50));
results.sort((a, b) => b.size - a.size);
results.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.function} (${r.contract}): ${r.size} bytes, ${r.rects} rects`);
});

// Check deployment config
const deployConfigPath = path.join(__dirname, '../deploy-config.json');
if (fs.existsSync(deployConfigPath)) {
    const config = JSON.parse(fs.readFileSync(deployConfigPath, 'utf8'));
    console.log('\n\nDeployment Configuration:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(config, null, 2));
}