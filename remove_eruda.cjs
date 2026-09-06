const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const erudaScriptStart = '<!-- Sandbox Mobile Developer Console (Eruda) -->';
const erudaScriptEnd = '</script>';

if (code.includes(erudaScriptStart)) {
    const startIndex = code.indexOf(erudaScriptStart);
    const endIndex = code.indexOf(erudaScriptEnd, startIndex) + erudaScriptEnd.length;
    
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('index.html', code);
    console.log('Eruda completely removed from index.html to prevent Script errors');
} else {
    console.log('Eruda not found');
}
