const fs = require('fs');
const path = require('path');

const contracts = [
    'BackBank1',
    'BackBank2', 
    'BackBank3',
    'MainBank1',
    'MainBank2'
];

console.log('Contract Bytecode Analysis');
console.log('='.repeat(50));
console.log('Note: Ethereum mainnet contract size limit is 24,576 bytes\n');

contracts.forEach(contract => {
    const artifactPath = path.join(__dirname, `../artifacts/contracts/banks/${contract}.sol/${contract}.json`);
    
    if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        
        // Get bytecode (includes constructor)
        const bytecode = artifact.bytecode || '0x';
        const deployedBytecode = artifact.deployedBytecode || '0x';
        
        // Remove 0x prefix and calculate size
        const bytecodeSize = (bytecode.length - 2) / 2; // Each byte is 2 hex chars
        const deployedSize = (deployedBytecode.length - 2) / 2;
        
        console.log(`${contract}:`);
        console.log(`  Constructor bytecode: ${bytecodeSize} bytes`);
        console.log(`  Deployed bytecode: ${deployedSize} bytes`);
        console.log(`  Status: ${deployedSize > 24576 ? '❌ TOO LARGE' : '✅ OK'}`);
        
        if (deployedSize > 24576) {
            const excess = deployedSize - 24576;
            console.log(`  Excess: ${excess} bytes (${(excess/24576*100).toFixed(1)}% over limit)`);
        } else {
            const remaining = 24576 - deployedSize;
            console.log(`  Remaining: ${remaining} bytes (${(remaining/24576*100).toFixed(1)}% under limit)`);
        }
        console.log('');
    } else {
        console.log(`${contract}: Artifact not found\n`);
    }
});

// Also check the specific functions in BackBank2 and BackBank3
console.log('\nDetailed Analysis of Problematic Contracts:');
console.log('='.repeat(50));

['BackBank1', 'BackBank2', 'BackBank3', 'MainBank1', 'MainBank2'].forEach(contract => {
    const sourcePath = path.join(__dirname, `../contracts/banks/${contract}.sol`);
    const source = fs.readFileSync(sourcePath, 'utf8');
    
    // Count the actual character length of each function's return value
    const functions = source.match(/function\s+get\w+\(\)[^{]*{[^}]*return\s+"[^"]+"/g) || [];
    
    console.log(`\n${contract} function sizes:`);
    functions.forEach(func => {
        const funcName = func.match(/function\s+(\w+)/)[1];
        const returnValue = func.match(/return\s+"(.+)"/s)[1];
        console.log(`  ${funcName}: ${returnValue.length} characters in source`);
    });
});