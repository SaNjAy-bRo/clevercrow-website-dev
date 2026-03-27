const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
// Fix escaped backticks
content = content.replace(/\\`/g, '`');
// Fix escaped dollar signs
content = content.replace(/\\\$\{/g, '${');
fs.writeFileSync('src/app/page.tsx', content);
