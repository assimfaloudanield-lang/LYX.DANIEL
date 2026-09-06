const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// A regex replacement might have missed or done something unexpected earlier.
// Let's replace the whole authentication render part very carefully.

const oldAuthBlock = `  if (!isAuthenticated) {
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
          <div className="absolute inset-0 bg-[#010006]/60 bg-gradient-to-b from-[#010006]/70 via-black/40 to-[#010006]/90 backdrop-brightness-[0.75]" />
        </div>
        <GalaxyCanvas isOn={true} />
        <CosmicFloatingParticles isOn={true} />
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A061C] font-sans flex flex-col justify-between">
      {/* BACKGROUND DA TELA */}`;

const newAuthBlock = `  if (!isAuthenticated) {
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
          <div className="absolute inset-0 bg-[#010006]/60 bg-gradient-to-b from-[#010006]/70 via-black/40 to-[#010006]/90 backdrop-brightness-[0.75]" />
        </div>
        <GalaxyCanvas isOn={true} />
        <CosmicFloatingParticles isOn={true} />
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  if (isAuthenticated && !isOnboarded) {
    return <OnboardingScreen onStart={() => setIsOnboarded(true)} />;
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A061C] font-sans flex flex-col justify-between">
      {/* BACKGROUND DA TELA */}`;

if (code.includes(oldAuthBlock)) {
    code = code.replace(oldAuthBlock, newAuthBlock);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Explicitly injected OnboardingScreen block before Home.');
} else {
    console.log('Failed to match auth block.');
}
