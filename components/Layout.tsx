
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-[#fafafa]">
      {/* Decorative Animated Background Elements - Enhanced with deeper accent colors */}
      
      {/* Rose Accent Blob (Top-Left) */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-rose-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-pulse"></div>
      
      {/* Emerald/Teal Accent Blob (Bottom-Right) */}
      <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[140px] opacity-60 animate-pulse delay-700"></div>
      
      {/* Subtle Amber Glow (Center-Right) */}
      <div className="absolute top-[20%] right-[-15%] w-[40%] h-[40%] bg-amber-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse delay-500"></div>

      {/* Surface Texture/Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-stone-100/30 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-lg mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
