const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');
text = text.replace(/\\`/g, '`').replace(/\\\${/g, '${');
fs.writeFileSync('index.html', text, 'utf8');
console.log('Fixed');
