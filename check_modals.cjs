const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const inputs = code.match(/<(input|select|textarea)[^>]*onChange=\{[^\}]*\}[^>]*>/g) || [];
const badInputs = inputs.filter(i => !i.includes('value=') && !i.includes('defaultValue=') && !i.includes('type="file"'));
console.log(`Found ${badInputs.length} missing values.`);
badInputs.forEach(i => console.log('  ', i));
