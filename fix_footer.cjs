const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldFooter = '<span className="text-[10px] tracking-[0.2em] font-thin text-[#D1D5DB] opacity-60">developed by WRLD feat Antigravity</span>';
const newFooter = '<img src="./developed.png" alt="developed by WRLD feat Antigravity" className="h-4 opacity-50 grayscale contrast-200 brightness-200" style={{ filter: "grayscale(100%) opacity(40%)" }} />';

if (code.includes(oldFooter)) {
    code = code.replace(oldFooter, newFooter);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Footer updated to use developed.png');
} else {
    console.log('Footer not found');
}
