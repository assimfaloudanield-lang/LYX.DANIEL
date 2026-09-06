const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
    'export default function App() {\n  const [isOn, setIsOn] = useState(false);',
    'export default function App() {\n  const [isAuthenticated, setIsAuthenticated] = useState(false);\n  const [isOn, setIsOn] = useState(false);'
);
fs.writeFileSync('src/App.tsx', code);
