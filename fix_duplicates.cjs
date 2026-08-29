const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tagRegex = /<(input|select|textarea)([^>]+)>/g;

code = code.replace(tagRegex, (match, tag, attrs) => {
    // Find all value= attributes
    const valueRegex = /\s+value=\{[^\}]*\}/g;
    let matchArr = attrs.match(valueRegex);
    if (matchArr && matchArr.length > 1) {
        // Keep the first one, remove the rest
        let first = true;
        attrs = attrs.replace(valueRegex, (vMatch) => {
            if (first) {
                first = false;
                return vMatch;
            }
            return '';
        });
    }
    // Also remove any remaining defaultValue if value is present
    if (attrs.match(/\s+value=/)) {
        attrs = attrs.replace(/\s+defaultValue=(?:"[^"]*"|\{[^\}]*\})/, '');
    }
    
    return `<${tag}${attrs}>`;
});

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed duplicate attributes.");
