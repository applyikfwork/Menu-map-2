import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  iconOnly?: boolean;
  light?: boolean;
  rounded?: string;
}

export const MenuMapLogo: React.FC<LogoProps> = ({ 
  className = 'w-10 h-10', 
  size, 
  rounded = 'rounded-xl' 
}) => {
  return (
    <img
      src="/logo.jpg"
      alt="MenuMap"
      style={size ? { width: size, height: size } : undefined}
      className={`object-cover ${rounded} shadow-xs shrink-0 select-none ${className}`}
      loading="eager"
      onError={(e) => {
        // Fallback to local root if needed
        (e.target as HTMLImageElement).src = '/logo.jpg';
      }}
    />
  );
};

export const MenuMapBrand: React.FC<{ 
  lightText?: boolean; 
  textSize?: string; 
  className?: string;
  iconSize?: number;
}> = ({
  lightText = false,
  textSize = 'text-2xl',
  className = '',
  iconSize = 38,
}) => {
  return (
    <div className={`flex items-center gap-2.5 font-extrabold tracking-tight select-none ${className}`}>
      <MenuMapLogo size={iconSize} className="shrink-0" />
      <span className={`hd ${textSize} font-black tracking-tight ${lightText ? 'text-white' : 'text-[#14110F]'}`}>
        Menu<span className="text-[#FF5A36]">Map</span>
      </span>
    </div>
  );
};
