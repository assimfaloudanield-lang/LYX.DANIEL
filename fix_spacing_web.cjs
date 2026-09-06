const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `{/* FOOTER */}
        <div className="w-full flex items-center justify-center gap-4 mt-1 pointer-events-none">`;

const replaceStr = `{/* FOOTER */}
        <div className="absolute bottom-4 left-0 w-full flex items-center justify-center gap-4 pointer-events-none">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  
  // also increase padding bottom on the wrapper
  const wrapperTarget = `<div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-8 sm:pb-12">`;
  const wrapperReplace = `<div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-20 sm:pb-24">`;
  code = code.replace(wrapperTarget, wrapperReplace);
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Web footer and spacing updated');
} else {
  console.log('Target string not found in App.tsx');
}
