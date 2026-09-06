import React from 'react';

export const renderDefaultGradientAvatar = (size = 32) => (
  <div
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
    }}
    className="rounded-full flex items-center justify-center shrink-0 shadow-xs"
  >
    <svg
      width={Math.round(size * 0.56)}
      height={Math.round(size * 0.56)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="7.5" r="4" fill="#FFFFFF" fillOpacity="0.95" />
      <path
        d="M4.5 19.5C4.5 15.5 8 13.5 12 13.5C16 13.5 19.5 15.5 19.5 19.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const renderUserAvatar = (customImage?: string | null, size = 32) => {
  if (customImage) {
    return (
      <img
        src={customImage}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return renderDefaultGradientAvatar(size);
};
