const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldAlt = 'alt="developed by WRLD feat Antigravity"';
const newAlt = 'alt="developed by WRLD with Antigravity"';

if (code.includes(oldAlt)) {
    code = code.replace(oldAlt, newAlt);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Footer updated to use "with Antigravity"');
} else {
    console.log('Old alt text not found');
}
