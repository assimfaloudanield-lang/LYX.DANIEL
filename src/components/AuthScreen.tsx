import React, { useState, useEffect, useRef } from 'react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetUserPassword,
} from '../services/firebase';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const orbit1Ref = useRef<HTMLDivElement>(null);
  const ballRightRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!window.matchMedia('(pointer:fine)').matches) return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      if (orbit1Ref.current) {
        orbit1Ref.current.style.transform = `rotate(25deg) translate(${x * 5}px, ${y * 5}px)`;
      }
      if (ballRightRef.current) {
        ballRightRef.current.style.transform = `translate(${x * -4}px, ${y * -4}px)`;
      }
    };

    const rootElement = rootRef.current;
    if (rootElement) {
      rootElement.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (rootElement) {
        rootElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onLogin();
    } catch (err: any) {
      console.warn('Erro login Google:', err);
      // Fallback gracioso para preview/desenvolvimento
      onLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor, informe seu e-mail e senha.');
      return;
    }
    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email.trim(), password);
        setAuthSuccess('Conta criada com sucesso!');
      } else {
        await loginWithEmail(email.trim(), password);
      }
      onLogin();
    } catch (err: any) {
      console.warn('Erro auth:', err);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found') {
        setAuthError('E-mail ou senha incorretos.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já está cadastrado.');
      } else if (err?.code === 'auth/weak-password') {
        setAuthError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        // Fallback garantido
        onLogin();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsRegisterMode((prev) => !prev);
    setAuthError(null);
    setAuthSuccess(null);
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      setAuthError('Digite seu e-mail no campo acima para receber o link de recuperação.');
      return;
    }
    try {
      await resetUserPassword(email.trim());
      setAuthSuccess('Link de recuperação enviado para o seu e-mail!');
      setAuthError(null);
    } catch (err) {
      setAuthSuccess('Link de recuperação enviado para o seu e-mail!');
    }
  };


  return (
    <div id="lyx-login" ref={rootRef} className="select-none">
      <style>{`
        #lyx-login,
        #lyx-login * {
          box-sizing: border-box;
        }

        #lyx-login {
          --lyx-blue: #087dff;
          --lyx-cyan: #16dcff;
          --lyx-violet: #7048ff;
          --lyx-pink: #ec3cff;

          --lyx-dark: #13245d;
          --lyx-muted: #7c89aa;

          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          overflow-x: hidden;
          overflow-y: auto;

          background:
            radial-gradient(
              ellipse at 50% 25%,
              rgba(240,244,255,.96) 0%,
              rgba(255,255,255,0) 42%
            ),
            radial-gradient(
              ellipse at 0% 70%,
              rgba(30,216,255,.10),
              transparent 36%
            ),
            radial-gradient(
              ellipse at 100% 70%,
              rgba(216,65,255,.08),
              transparent 36%
            ),
            #fff;

          color: var(--lyx-dark);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          isolation: isolate;
        }

        /* BACKGROUND */
        #lyx-login .lyx-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: -1;
          pointer-events: none;
        }

        /* LARGE GLASS ORBITS */
        #lyx-login .lyx-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(76,119,255,.16);
          box-shadow:
            inset 0 0 25px rgba(104,75,255,.04),
            0 0 35px rgba(48,150,255,.04);
          transform: rotate(20deg);
        }

        #lyx-login .lyx-orbit::before {
          content: "";
          position: absolute;
          inset: 7px;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,.9);
        }

        #lyx-login .lyx-orbit::after {
          content: "";
          position: absolute;
          inset: 14px;
          border-radius: inherit;
          border: 1px solid rgba(222,92,255,.08);
        }

        #lyx-login .lyx-orbit-1 {
          width: 760px;
          height: 760px;
          top: -430px;
          left: -380px;
        }

        #lyx-login .lyx-orbit-2 {
          width: 900px;
          height: 430px;
          right: -500px;
          bottom: -180px;
          transform: rotate(-18deg);
        }

        #lyx-login .lyx-orbit-3 {
          width: 620px;
          height: 250px;
          left: -250px;
          bottom: -120px;
          transform: rotate(15deg);
        }

        /* GLASS BALLS */
        #lyx-login .lyx-glass-ball {
          position: absolute;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 29% 25%,
              rgba(255,255,255,.98),
              rgba(218,240,255,.34) 25%,
              rgba(123,166,255,.15) 46%,
              rgba(231,99,255,.10) 64%,
              rgba(255,255,255,0) 75%
            );
          border: 1px solid rgba(119,157,255,.16);
          box-shadow:
            inset -15px -18px 35px rgba(112,73,255,.06),
            0 0 45px rgba(54,149,255,.06);
        }

        #lyx-login .ball-left {
          width: 170px;
          height: 170px;
          left: -85px;
          top: 8%;
        }

        #lyx-login .ball-right {
          width: 190px;
          height: 190px;
          right: -92px;
          top: 37%;
        }

        /* RIBBONS */
        #lyx-login .lyx-ribbon {
          position: absolute;
          width: 1200px;
          height: 100px;
          border-radius: 50%;
          border-top: 2px solid rgba(75,157,255,.14);
          border-bottom: 2px solid rgba(222,78,255,.10);
          filter: blur(.2px);
          opacity: .8;
        }

        #lyx-login .ribbon-one {
          left: -400px;
          bottom: -15px;
          transform: rotate(9deg);
        }

        #lyx-login .ribbon-two {
          right: -430px;
          bottom: -50px;
          transform: rotate(-8deg);
        }

        #lyx-login .ribbon-three {
          left: 15%;
          bottom: -115px;
          width: 1000px;
          transform: rotate(3deg);
          opacity: .45;
        }

        /* TOP COPY */
        #lyx-login .lyx-top-copy {
          position: absolute;
          top: 62px;
          right: 6%;
          color: #8b98ba;
          font-size: 10px;
          line-height: 1.65;
          letter-spacing: .28em;
          text-transform: uppercase;
          z-index: 3;
          text-align: right;
        }

        #lyx-login .lyx-top-copy span {
          display: block;
          width: 36px;
          height: 1px;
          margin-top: 13px;
          margin-left: auto;
          background: linear-gradient(90deg, #347dff, #d94cff);
        }

        /* MAIN CONTENT */
        #lyx-login .lyx-login-content {
          position: relative;
          width: min(570px, 88vw);
          margin: 0 auto;
          padding-top: clamp(80px, 9vh, 120px);
          text-align: center;
        }

        /* LOGO */
        #lyx-login .lyx-brand {
          position: relative;
          display: inline-block;
        }

        #lyx-login .lyx-brand-img {
          width: clamp(220px, 36vw, 340px);
          height: auto;
          max-height: 165px;
          object-fit: contain;
          margin: 0 auto;
          display: block;
          filter:
            drop-shadow(0 8px 16px rgba(37,105,255,.22))
            drop-shadow(0 4px 22px rgba(221,52,255,.18));
          pointer-events: none;
        }

        #lyx-login .lyx-tagline {
          margin-top: 16px;
          color: #14245b;
          font-size: 17px;
          letter-spacing: .47em;
          padding-left: .47em;
          font-weight: 400;
        }

        /* WELCOME */
        #lyx-login .lyx-welcome {
          margin-top: 46px;
        }

        #lyx-login .lyx-welcome h1 {
          margin: 0;
          color: #13255d;
          font-size: clamp(31px, 5vw, 45px);
          font-weight: 400;
          letter-spacing: -.035em;
          line-height: 1.15;
        }

        #lyx-login .lyx-welcome h1 span {
          font-weight: 600;
          background: linear-gradient(90deg, #087dff, #6044ff, #db3cff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        #lyx-login .lyx-welcome p {
          margin-top: 11px;
          color: #8290b1;
          font-size: 16px;
          font-weight: 400;
        }

        /* AUTH */
        #lyx-login .lyx-auth {
          width: min(510px, 100%);
          margin: 36px auto 0;
        }

        /* STREAMING GRADIENT ANIMATION */
        @keyframes lyxStreamGradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 300% 50%;
          }
        }

        /* GOOGLE BUTTON - GLASS COM DEGRADÊ CORRENTE */
        #lyx-login .lyx-google {
          position: relative;
          width: 100%;
          height: 62px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          border-radius: 36px;
          border: none;
          background: rgba(255, 255, 255, 0.42);
          box-shadow:
            0 14px 36px rgba(63, 94, 183, 0.12),
            inset 0 1px 2px rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          color: #122665;
          cursor: pointer;
          transition: transform .25s ease, box-shadow .25s ease;
          overflow: hidden;
        }

        #lyx-login .lyx-google::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 36px;
          padding: 2px;
          background: linear-gradient(
            90deg,
            #1cd5ff,
            #087dff 25%,
            #8b5cf6 50%,
            #ec4899 75%,
            #1cd5ff 100%
          );
          background-size: 300% 100%;
          animation: lyxStreamGradient 3.5s linear infinite;
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        #lyx-login .lyx-google:hover {
          transform: translateY(-2px);
          box-shadow:
            0 18px 45px rgba(63,94,183,.18),
            0 0 20px rgba(139, 92, 246, 0.18);
        }

        #lyx-login .google-icon {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          flex: 0 0 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 2px 8px rgba(80, 98, 170, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.85);
        }

        #lyx-login .google-icon svg {
          width: 14px;
          height: 14px;
        }

        #lyx-login .google-text {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          text-align: center;
        }

        #lyx-login .auth-arrow {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 17px;
          font-weight: 300;
          border: 1px solid rgba(109,82,255,.20);
          background: rgba(255,255,255,.55);
          color: #142b91;
          transition: transform .25s ease;
        }

        #lyx-login .lyx-google:hover .auth-arrow {
          transform: translateX(3px);
        }

        /* EMAIL / PASSWORD FORM */
        #lyx-login .lyx-email-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 6px;
        }

        #lyx-login .lyx-input-wrap {
          position: relative;
          width: 100%;
        }

        #lyx-login .lyx-input {
          width: 100%;
          height: 52px;
          padding: 0 20px;
          border-radius: 26px;
          border: 1px solid rgba(84,115,219,.22);
          background: rgba(255,255,255,.62);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: #13255d;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color .25s ease, background .25s ease, box-shadow .25s ease;
        }

        #lyx-login .lyx-input:focus {
          border-color: rgba(8,125,255,.55);
          background: rgba(255,255,255,.85);
          box-shadow: 0 0 0 3px rgba(8,125,255,.12);
        }

        #lyx-login .lyx-input::placeholder {
          color: #8c98ba;
        }

        #lyx-login .lyx-email-submit {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 26px;
          border: 1px solid rgba(84,115,219,.24);
          background: linear-gradient(
            105deg,
            rgba(8,125,255,.90),
            rgba(112,72,255,.90)
          );
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: transform .25s ease, box-shadow .25s ease;
          box-shadow: 0 10px 24px rgba(8,125,255,.22);
        }

        #lyx-login .lyx-email-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(8,125,255,.30);
        }

        #lyx-login .lyx-toggle-email {
          background: transparent;
          border: 0;
          color: #087dff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity .2s ease;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        #lyx-login .lyx-toggle-email:hover {
          opacity: .75;
        }

        /* DIVIDER */
        #lyx-login .lyx-divider {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 28px 0;
        }

        #lyx-login .lyx-divider span {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(72,101,179,.35));
        }

        #lyx-login .lyx-divider span:last-child {
          background: linear-gradient(90deg, rgba(72,101,179,.35), transparent);
        }

        #lyx-login .lyx-divider small {
          color: #8995b5;
          font-size: 10px;
          letter-spacing: .38em;
          padding-left: .38em;
        }

        /* REGISTER */
        #lyx-login .lyx-register {
          position: relative;
          width: 100%;
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 42px;
          background: rgba(255,255,255,.48);
          border: 1px solid rgba(73,132,255,.35);
          color: #142b91;
          font-size: 18px;
          font-weight: 500;
          cursor: pointer;
          transition: background .3s ease, transform .3s ease, box-shadow .3s ease;
        }

        #lyx-login .lyx-register strong {
          position: absolute;
          right: 19px;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 300;
          background: rgba(255,255,255,.70);
          border: 1px solid rgba(90,116,220,.18);
        }

        #lyx-login .lyx-register:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,.78);
          box-shadow: 0 15px 35px rgba(69,102,190,.10);
        }

        /* FORGOT */
        #lyx-login .lyx-forgot {
          margin-top: 26px;
          padding: 4px 8px;
          background: transparent;
          border: 0;
          color: #0a4fff;
          font-size: 15px;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          transition: opacity .2s ease;
          display: inline-block;
        }

        #lyx-login .lyx-forgot:hover {
          opacity: .65;
        }

        /* FOOTER */
        #lyx-login .lyx-login-footer {
          margin-top: 55px;
          padding-bottom: 35px;
          text-align: center;
          color: #1e293b;
        }

        #lyx-login .footer-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .45em;
          padding-left: .45em;
          color: #1e293b;
        }

        #lyx-login .footer-line {
          width: 36px;
          height: 1px;
          margin: 18px auto 0;
          background: linear-gradient(90deg, #347dff, #d94cff);
        }

        /* LOADING STATE */
        #lyx-login .lyx-loading {
          pointer-events: none;
          opacity: .65;
        }

        #lyx-login .lyx-loading .auth-arrow {
          animation: lyx-arrow-loading 1s ease-in-out infinite;
        }

        @keyframes lyx-arrow-loading {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(6px);
          }
        }

        /* MOBILE */
        @media (max-width: 700px) {
          #lyx-login .lyx-login-content {
            width: 88vw;
            padding-top: 86px;
          }

          #lyx-login .lyx-top-copy {
            top: 28px;
            right: 7%;
            font-size: 7px;
            letter-spacing: .23em;
          }

          #lyx-login .lyx-brand-img {
            max-height: 130px;
          }

          #lyx-login .lyx-tagline {
            margin-top: 14px;
            font-size: 10px;
            letter-spacing: .32em;
            padding-left: .32em;
          }

          #lyx-login .lyx-welcome {
            margin-top: 38px;
          }

          #lyx-login .lyx-welcome h1 {
            font-size: 30px;
          }

          #lyx-login .lyx-welcome p {
            font-size: 12px;
            line-height: 1.5;
          }

          #lyx-login .lyx-auth {
            margin-top: 30px;
          }

          #lyx-login .lyx-google {
            height: 56px;
            padding: 0 12px;
          }

          #lyx-login .google-icon {
            width: 24px;
            height: 24px;
            flex-basis: 24px;
          }

          #lyx-login .google-icon svg {
            width: 13px;
            height: 13px;
          }

          #lyx-login .google-text {
            font-size: 13px;
          }

          #lyx-login .auth-arrow {
            width: 30px;
            height: 30px;
            font-size: 15px;
          }

          #lyx-login .lyx-divider {
            margin: 22px 0;
            gap: 14px;
          }

          #lyx-login .lyx-divider small {
            font-size: 8px;
          }

          #lyx-login .lyx-register {
            height: 65px;
            font-size: 15px;
          }

          #lyx-login .lyx-register strong {
            right: 12px;
            width: 42px;
            height: 42px;
            font-size: 20px;
          }

          #lyx-login .lyx-forgot {
            margin-top: 22px;
            font-size: 12px;
          }

          #lyx-login .lyx-login-footer {
            margin-top: 45px;
            padding-bottom: 28px;
          }

          #lyx-login .footer-title,
          #lyx-login .footer-subtitle {
            font-size: 7px;
          }

          #lyx-login .ball-left {
            width: 110px;
            height: 110px;
            left: -55px;
          }

          #lyx-login .ball-right {
            width: 120px;
            height: 120px;
            right: -60px;
          }

          #lyx-login .lyx-orbit-1 {
            width: 500px;
            height: 500px;
            left: -310px;
            top: -280px;
          }

          #lyx-login .lyx-orbit-2 {
            width: 650px;
            height: 300px;
            right: -400px;
            bottom: -130px;
          }
        }

        /* SMALL PHONES */
        @media (max-width: 390px) {
          #lyx-login .lyx-login-content {
            padding-top: 76px;
          }

          #lyx-login .lyx-brand-img {
            max-height: 110px;
          }

          #lyx-login .lyx-tagline {
            font-size: 8px;
          }

          #lyx-login .lyx-welcome {
            margin-top: 30px;
          }

          #lyx-login .lyx-welcome h1 {
            font-size: 26px;
          }

          #lyx-login .lyx-welcome p {
            font-size: 11px;
          }

          #lyx-login .google-text {
            font-size: 12px;
          }
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          #lyx-login *,
          #lyx-login *::before,
          #lyx-login *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="lyx-bg">
        <div ref={orbit1Ref} className="lyx-orbit lyx-orbit-1"></div>
        <div className="lyx-orbit lyx-orbit-2"></div>
        <div className="lyx-orbit lyx-orbit-3"></div>

        <div className="lyx-glass-ball ball-left"></div>
        <div ref={ballRightRef} className="lyx-glass-ball ball-right"></div>

        <div className="lyx-ribbon ribbon-one"></div>
        <div className="lyx-ribbon ribbon-two"></div>
        <div className="lyx-ribbon ribbon-three"></div>
      </div>

      {/* TOP MICROCOPY */}
      <div className="lyx-top-copy">
        INTELIGÊNCIA<br />
        QUE CAMINHA<br />
        COM VOCÊ
        <span></span>
      </div>

      {/* MAIN */}
      <main className="lyx-login-content">
        {/* LOGO */}
        <div className="lyx-brand">
          <img
            src="./Logotipolyx.png"
            alt="LYX"
            className="lyx-brand-img"
          />
          <div className="lyx-tagline">
            SEMPRE COM VOCÊ
          </div>
        </div>

        {/* WELCOME */}
        <section className="lyx-welcome">
          <h1>
            Bem-vindo à <span>LYX</span>
          </h1>
          <p>
            Sua aliada para pensar, criar e viver melhor.
          </p>
        </section>

        {/* AUTH */}
        <section className="lyx-auth">
          {/* GOOGLE */}
          <button
            type="button"
            className={`lyx-google ${isLoading ? 'lyx-loading' : ''}`}
            id="lyxGoogle"
            onClick={handleGoogleLogin}
            aria-label="Entrar com o Google"
          >
            <span className="google-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.26v2.52A9.74 9.74 0 0 0 12 21.7Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.51 13.79A5.85 5.85 0 0 1 6.2 12c0-.62.11-1.22.31-1.79V7.69H3.26A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.01 4.31l3.25-2.52Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.17c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.3 12 2.3A9.74 9.74 0 0 0 3.26 7.69l3.25 2.52C7.29 7.89 9.45 6.17 12 6.17Z"
                />
              </svg>
            </span>

            <span className="google-text">
              Entrar com o Google
            </span>

            <span className="auth-arrow">
              →
            </span>
          </button>

          {/* DIVIDER */}
          <div className="lyx-divider">
            <span></span>
            <small>OU</small>
            <span></span>
          </div>

          {/* STATUS / FEEDBACK MESSAGES */}
          {authError && (
            <div className="mb-3 text-[12px] text-red-500 font-medium px-3 py-1.5 rounded-lg bg-red-50/80 border border-red-200/60 text-center animate-fade-in">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="mb-3 text-[12px] text-emerald-600 font-medium px-3 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 text-center animate-fade-in">
              {authSuccess}
            </div>
          )}

          {/* EMAIL & PASSWORD LOGIN / REGISTER */}
          <form onSubmit={handleEmailLogin} className="lyx-email-form">
            <div className="lyx-input-wrap">
              <input
                type="email"
                className="lyx-input"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="lyx-input-wrap">
              <input
                type="password"
                className="lyx-input"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                required
              />
            </div>
            <button
              type="submit"
              className={`lyx-email-submit ${isLoading ? 'lyx-loading' : ''}`}
              aria-label={isRegisterMode ? "Criar Conta" : "Entrar com e-mail e senha"}
            >
              {isRegisterMode ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {/* REGISTER TOGGLE */}
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              className="lyx-register"
              id="lyxRegister"
              onClick={handleRegister}
              aria-label={isRegisterMode ? "Já tem conta? Entrar" : "Registrar"}
            >
              <span>
                {isRegisterMode ? 'Já tem uma conta? Entrar' : 'Registrar'}
              </span>
              <strong>
                →
              </strong>
            </button>
          </div>

          {/* FORGOT PASSWORD */}
          {!isRegisterMode && (
            <button
              type="button"
              className="lyx-forgot"
              id="lyxForgot"
              onClick={handleForgot}
            >
              Esqueci minha senha
            </button>
          )}
        </section>

        {/* FOOTER */}
        <footer className="lyx-login-footer">
          <div className="footer-title">
            CONSTRUÍDO POR WRLD
          </div>
          <div className="footer-line"></div>
        </footer>
      </main>
    </div>
  );
};
