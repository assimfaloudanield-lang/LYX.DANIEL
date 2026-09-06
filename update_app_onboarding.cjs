const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { OnboardingScreen }')) {
    code = code.replace("import { AuthScreen } from './components/AuthScreen';", "import { AuthScreen } from './components/AuthScreen';\nimport { OnboardingScreen } from './components/OnboardingScreen';");
}

if (!code.includes('const [isOnboarded, setIsOnboarded] = useState(false);')) {
    code = code.replace('const [isAuthenticated, setIsAuthenticated] = useState(false);', 'const [isAuthenticated, setIsAuthenticated] = useState(false);\n  const [isOnboarded, setIsOnboarded] = useState(false);');
}

// Modify the rendering logic
const oldIf = 'if (!isAuthenticated) {\n    return (\n      <div className="relative min-h-[100dvh]';

const newIf = `if (!isAuthenticated) {
    return (
      <div className="relative min-h-[100dvh]`;

if (code.includes('if (!isAuthenticated) {')) {
    const renderAppStart = 'return (\n    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A061C] font-sans flex flex-col justify-between">';
    const onboardingCheck = `  if (isAuthenticated && !isOnboarded) {
    return <OnboardingScreen onStart={() => setIsOnboarded(true)} />;
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A061C] font-sans flex flex-col justify-between">`;
    
    code = code.replace(renderAppStart, onboardingCheck);
    
    fs.writeFileSync('src/App.tsx', code);
    console.log('App.tsx updated to support Onboarding screen.');
}
