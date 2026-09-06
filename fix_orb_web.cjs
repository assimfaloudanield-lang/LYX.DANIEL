const fs = require('fs');
let code = fs.readFileSync('src/components/IPhonePowerButton.tsx', 'utf8');

code = code.replace(
  'className="relative z-10 w-[120px] h-[120px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none transition-transform duration-300"',
  'className="relative z-10 w-[120px] h-[120px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none transition-transform duration-300"\n          style={{ WebkitTapHighlightColor: "transparent" }}'
);
// Make sure we didn't duplicate the style if it had one, wait, it already has:
// style={{ background: 'rgba(0,0,0,0.5)', padding: '2px' }}
// Let's replace the whole button start
