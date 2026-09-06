const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the previous image tag with a more refined style
const oldFooter = '<img src="./developed.png" alt="developed by WRLD feat Antigravity" className="h-4 opacity-50 grayscale contrast-200 brightness-200" style={{ filter: "grayscale(100%) opacity(40%)" }} />';
const newFooter = '<img src="./developed.png" alt="developed by WRLD feat Antigravity" className="h-[14px] opacity-40 mix-blend-screen" style={{ filter: "grayscale(100%) brightness(150%) contrast(80%) drop-shadow(0 0 0 transparent)" }} />';

if (code.includes(oldFooter)) {
    code = code.replace(oldFooter, newFooter);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Footer updated to clear gray without stroke effect');
} else {
    console.log('Old footer not found');
}
