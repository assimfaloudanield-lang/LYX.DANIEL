const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// There is a state issue in the logic we inserted earlier
// Let's rewrite the main render flow to explicitly handle states.

// Remove previous flawed logic first
const oldCheck = `  if (isAuthenticated && !isOnboarded) {
    return <OnboardingScreen onStart={() => setIsOnboarded(true)} />;
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A061C] font-sans flex flex-col justify-between">`;

const newCheck = `  // 1. Tela de Login
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
        <CosmicFloatingParticles />
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  // 2. Tela de Onboarding (após login, mas antes de acessar a Home)
  if (isAuthenticated && !isOnboarded) {
    return <OnboardingScreen onStart={() => setIsOnboarded(true)} />;
  }

  // 3. Home (Acesso garantido)
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A061C] font-sans flex flex-col justify-between">`;

// Instead of complex replaces, let's use a regex to replace the whole authentication render block
// from "if (!isAuthenticated) {" to the return of the Galaxy view
code = code.replace(/if \(!isAuthenticated\) \{[\s\S]*?return \(\s*<div className="relative min-h-\[100dvh\] w-full overflow-hidden bg-\[\#0A061C\] font-sans flex flex-col justify-between">/, newCheck);

fs.writeFileSync('src/App.tsx', code);
console.log('Flow corrected: Login -> Onboarding -> Home');
