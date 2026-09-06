const fs = require('fs');
let code = fs.readFileSync('src/components/IPhonePowerButton.tsx', 'utf8');

code = code.replace(
  /style={{\n\s*background: 'rgba\(0,0,0,0\.5\)',\n\s*padding: '2px',\s*\/\/ Espessura da borda gradiente\n\s*}}/g,
  `style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '2px', // Espessura da borda gradiente
            WebkitTapHighlightColor: 'transparent'
          }}`
);
fs.writeFileSync('src/components/IPhonePowerButton.tsx', code);
console.log('Orb fixed');
