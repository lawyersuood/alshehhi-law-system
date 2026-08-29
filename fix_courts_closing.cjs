const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* قائمة بطاقات وسائل التواصل التفصيلية للمحاكم/;

const replacement = `</div>
                  </div>
                  )}
                </div>
                {/* قائمة بطاقات وسائل التواصل التفصيلية للمحاكم`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed courts closing bracket");
} else {
    console.log("Not found courts target");
}
