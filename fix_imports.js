const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('Lock')) {
  code = code.replace('User, MessageCircle, ArrowRight, Star', 'User, MessageCircle, ArrowRight, Star, Lock');
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added Lock import');
}
