const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// regex to remove defaultValue="xxx" or defaultValue={xxx} if value={...} is present on the same tag
const tagRegex = /<(input|select|textarea)[^>]*value=\{[^\}]*\}[^>]*defaultValue=(?:"[^"]*"|\{[^\}]*\})[^>]*>/g;

code = code.replace(tagRegex, (match) => {
    return match.replace(/\s+defaultValue=(?:"[^"]*"|\{[^\}]*\})/, '');
});

// Also the reverse order: defaultValue before value
const tagRegex2 = /<(input|select|textarea)[^>]*defaultValue=(?:"[^"]*"|\{[^\}]*\})[^>]*value=\{[^\}]*\}[^>]*>/g;
code = code.replace(tagRegex2, (match) => {
    return match.replace(/\s+defaultValue=(?:"[^"]*"|\{[^\}]*\})/, '');
});

fs.writeFileSync('src/App.tsx', code);
console.log("Removed conflicting defaultValues");
