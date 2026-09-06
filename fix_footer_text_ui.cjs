const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldImage = '<img src="./developed.png" alt="developed by WRLD with Antigravity" className="h-[14px] opacity-40 mix-blend-screen" style={{ filter: "grayscale(100%) brightness(150%) contrast(80%) drop-shadow(0 0 0 transparent)" }} />';
const newText = '<span className="text-[10px] tracking-[0.2em] font-thin text-[#D1D5DB] opacity-60">built by WRLD Co with Antigravity</span>';

if (code.includes(oldImage)) {
    code = code.replace(oldImage, newText);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Footer updated to use typed text instead of image');
} else {
    console.log('Old image tag not found');
}
