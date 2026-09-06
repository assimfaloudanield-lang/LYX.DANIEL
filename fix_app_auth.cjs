const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add AuthScreen import
if (!code.includes('import { AuthScreen }')) {
    code = code.replace(
        `import { CosmicFloatingParticles } from './components/CosmicFloatingParticles';`,
        `import { AuthScreen } from './components/AuthScreen';\nimport { CosmicFloatingParticles } from './components/CosmicFloatingParticles';`
    );
}

// 2. Add auth state
const stateTarget = `  // Estados principais da UI
  const [isOn, setIsOn] = useState(false);`;
const stateReplace = `  // Estados de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados principais da UI
  const [isOn, setIsOn] = useState(false);`;

if (code.includes(stateTarget) && !code.includes('const [isAuthenticated, setIsAuthenticated]')) {
    code = code.replace(stateTarget, stateReplace);
}

// 3. Conditional render at the top of the return block
// The main return block is:
//   return (
//     <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-between py-6 px-5 sm:px-8">
//       {/* BACKGROUND DA TELA */}

const returnTarget = `  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-between py-6 px-5 sm:px-8">
      {/* BACKGROUND DA TELA */}
      <div className="absolute inset-0 pointer-events-none z-0">`;

const returnReplace = `  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-between py-6 px-5 sm:px-8">
      {/* BACKGROUND DA TELA */}
      <div className="absolute inset-0 pointer-events-none z-0">`;

// Wait, the GalaxyCanvas and Particles should be outside so they run for both auth and main app.
// But the current layout wraps everything inside this main div.
// Let's restructure the return slightly to wrap the inner content conditionally.

// We need to wrap from after the background and canvases until the end.
// Actually, let's just do:
/*
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-center">
        <div className="absolute inset-0 pointer-events-none z-0">
          <img src="./EDA55B6A-2D3E.png" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <img src="./Galaxy.png" className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-50 mix-blend-screen" />
          <div className="absolute inset-0 bg-[#010006]/60 bg-gradient-to-b from-[#010006]/70 via-black/40 to-[#010006]/90 backdrop-brightness-[0.75]" />
        </div>
        <GalaxyCanvas isOn={true} />
        <CosmicFloatingParticles isOn={true} />
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return ( ... the rest ... )
*/

const topReturnTarget = `  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-between py-6 px-5 sm:px-8">`;

const topReturnReplace = `  if (!isAuthenticated) {
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
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-between py-6 px-5 sm:px-8">`;

if (code.includes(topReturnTarget) && !code.includes('if (!isAuthenticated) {')) {
    code = code.replace(topReturnTarget, topReturnReplace);
    fs.writeFileSync('src/App.tsx', code);
    console.log('App.tsx updated for auth screen rendering');
} else {
    console.log('Could not find top return target or already updated');
}

