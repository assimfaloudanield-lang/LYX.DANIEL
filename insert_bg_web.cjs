const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<img
          src="./Galaxy.png"
          alt="Galaxy Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-80"
        />`;

const replacementStr = `<img
          src="./Galaxy.png"
          alt="Galaxy Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-80"
        />
        {/* Nova imagem adicionada (50% opacidade) abaixo do overlay de gradiente */}
        <img
          src="./EDA55B6A-2D3E.png"
          alt="Custom Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        />`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added placeholder for EDA55B6A-2D3E.png in App.tsx');
} else {
  console.log('Target string not found in App.tsx');
}
