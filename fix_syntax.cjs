const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{/* PROGRESS BAR (GUARDADO - Botão/Barra de Download desativada a pedido)`;
const replace = `{/* PROGRESS BAR (GUARDADO - Botão/Barra de Download desativada a pedido) */}\n        {/*`;

if (code.includes(target) && !code.includes(replace)) {
    code = code.replace(target, replace);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Fixed comment syntax');
} else {
    console.log('No change needed or already fixed');
}
