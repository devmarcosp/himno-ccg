// ==========================================
// COMPONENTES COMPARTIDOS
// Piezas de UI que usan más de una actividad.
// ==========================================
import React from 'react';

export const MusicNote = ({ type, color = "currentColor" }) => {
  const baseClass = "flex items-center justify-center p-1";
  switch (type) {
    case 'Redonda': return (<div className={baseClass}><svg viewBox="0 0 100 60" className="w-14 h-8"><ellipse cx="50" cy="30" rx="35" ry="22" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 50 30)" /></svg></div>);
    case 'Blanca': return (<div className={baseClass}><svg viewBox="0 0 80 140" className="w-10 h-16"><ellipse cx="30" cy="110" rx="22" ry="16" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 30 110)" /><path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" /></svg></div>);
    case 'Negra': return (<div className={baseClass}><svg viewBox="0 0 80 140" className="w-10 h-16"><ellipse cx="30" cy="110" rx="22" ry="16" fill={color} transform="rotate(-20 30 110)" /><path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" /></svg></div>);
    case 'Corcheas': return (<div className={baseClass}><svg viewBox="0 0 140 140" className="w-16 h-16"><ellipse cx="25" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 25 110)" /><path d="M42 20 L42 105" stroke={color} strokeWidth="12" /><ellipse cx="95" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 95 110)" /><path d="M112 20 L112 105" stroke={color} strokeWidth="12" /><path d="M42 25 L112 25" stroke={color} strokeWidth="16" /></svg></div>);
    default: return null;
  }
};

export const ActionButton = ({
  onClick,
  bg,
  border,
  textColor = "text-white",
  py = "py-8",
  rounded = "rounded-3xl",
  fontSize = "text-2xl",
  shadow = "shadow-lg",
  borderSize = "border-b-8",
  icon,
  iconSize = 20,
  gap = "gap-3",
  children,
}) => {
  const I = icon;
  return (
    <button
      onClick={onClick}
      className={`w-full ${bg} ${textColor} ${py} ${rounded} font-black ${fontSize} ${shadow} ${borderSize} ${border} active:scale-95 flex items-center justify-center ${gap}`}
    >
      {I && <I size={iconSize} />}
      {children}
    </button>
  );
};
