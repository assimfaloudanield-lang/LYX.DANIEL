const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(!isAuthenticated\) \{[\s\S]*?<AuthScreen onLogin=\{\(\) => setIsAuthenticated\(true\)\} \/>\s*<\/div>\s*\);\s*\}/;

const newAuthBlock = `  // 1. Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-center">
        {/* BACKGROUND DA TELA */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src="./EDA55B6A-2D3E.png"
            alt="Custom Background"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <img
            src="./Galaxy.png"
            alt="Galaxy Background"
            className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-50 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-[#0A061C]/80 bg-gradient-to-t from-[#0A061C] via-[#0A061C]/95 to-black/50" />
        </div>
        <GalaxyCanvas isOn={true} />
        <CosmicFloatingParticles isOn={true} />
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  // 2. Tela de Onboarding (após login, mas antes de acessar a Home)
  if (isAuthenticated && !isOnboarded) {
    return <OnboardingScreen onStart={() => setIsOnboarded(true)} />;
  }
`;

if (regex.test(code)) {
    code = code.replace(regex, newAuthBlock);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Successfully injected OnboardingScreen routing block');
} else {
    console.log('Regex failed');
}
