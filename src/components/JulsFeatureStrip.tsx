import React from 'react';
import { MessageSquare, Mic, Sparkles } from 'lucide-react';

interface FeatureItemProps {
  iconType: 'chat' | 'mic' | 'sparkles';
  title: string;
  subtitle: string;
  colors: [string, string];
  gradientId: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  iconType,
  title,
  subtitle,
  colors,
  gradientId,
}) => {
  const [color1, color2] = colors;

  return (
    <div className="flex-1 flex flex-col items-center select-none text-center">
      {/* Container compacto para os ícones secundários */}
      <div className="relative w-[32px] h-[32px] flex items-center justify-center">
        {/* Definição de gradiente SVG */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
        </svg>

        {/* Ícones secundários discretos e finos */}
        {iconType === 'chat' && (
          <MessageSquare
            size={16}
            strokeWidth={1.3}
            style={{ stroke: `url(#${gradientId})` }}
          />
        )}
        {iconType === 'mic' && (
          <Mic
            size={16}
            strokeWidth={1.3}
            style={{ stroke: `url(#${gradientId})` }}
          />
        )}
        {iconType === 'sparkles' && (
          <Sparkles
            size={16}
            strokeWidth={1.3}
            style={{ stroke: `url(#${gradientId})` }}
          />
        )}
      </div>

      {/* Espaçamento sutil */}
      <div className="h-[4px]" />

      {/* Título principal do recurso */}
      <span
        className="font-semibold uppercase tracking-wider leading-tight"
        style={{
          color: '#E2E8F0',
          fontSize: '7.5px',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </span>

      {/* Subtítulo explicativo */}
      <span
        className="mt-0.5 font-normal leading-tight text-gray-400/90"
        style={{
          fontSize: '6.5px',
          letterSpacing: '0.2px',
        }}
      >
        {subtitle}
      </span>
    </div>
  );
};

const DividerLine: React.FC = () => (
  <div
    className="w-[1px] h-[36px] mx-[2px] shrink-0 self-center"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    }}
  />
);

export const JulsFeatureStrip: React.FC = () => {
  return (
    <div className="w-full max-w-[360px] mx-auto px-3 pt-1 pb-1 flex items-start justify-center gap-[4%] select-none opacity-90">
      <FeatureItem
        iconType="chat"
        title="CONVERSE NATURALMENTE"
        subtitle="Fale sem precisar digitar."
        colors={['#5CE1FF', '#7B5CFF']}
        gradientId="juls-grad-1"
      />
      <DividerLine />
      <FeatureItem
        iconType="mic"
        title="FALE DO SEU JEITO"
        subtitle="Uma conversa por voz, sem comandos rígidos."
        colors={['#B07BFF', '#6A5CFF']}
        gradientId="juls-grad-2"
      />
      <DividerLine />
      <FeatureItem
        iconType="sparkles"
        title="TENHA UMA VOZ SEMPRE POR PERTO"
        subtitle="Converse quando quiser, com resposta rápida e natural."
        colors={['#5CE1FF', '#8B5CFF']}
        gradientId="juls-grad-3"
      />
    </div>
  );
};
