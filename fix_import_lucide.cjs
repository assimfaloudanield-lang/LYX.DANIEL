const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('lucide-react')) {
  code = "import { User, MessageCircle, ArrowRight, Star, Lock } from 'lucide-react';\n" + code;
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added lucide-react import');
}
