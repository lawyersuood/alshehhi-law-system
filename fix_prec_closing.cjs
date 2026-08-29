const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* شبكة المبادئ القضائية \*\/\}/;

const replacement = `</select>
                    </div>
                  </div>
                  )}
                </div>
                {/* شبكة المبادئ القضائية */}`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed precedents closing bracket");
} else {
    console.log("Not found target");
}
