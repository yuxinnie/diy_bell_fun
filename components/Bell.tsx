import React, { useState, useEffect } from 'react';

interface BellProps {
  triggered: boolean;
  pullOffset: number; // 0 to 1 (percentage of max pull)
  isCelebrating?: boolean;
}

const Bell: React.FC<BellProps> = ({ triggered, pullOffset, isCelebrating }) => {
  const [animationClass, setAnimationClass] = useState("animate-shake-subtle");

  useEffect(() => {
    if (triggered) {
      setAnimationClass("animate-swing-wild");
    } else {
      setAnimationClass("animate-shake-subtle");
    }
  }, [triggered]);

  // Calculate visual offset based on pull
  // We limit how far it visually moves to keep it on screen
  const visualY = triggered ? 0 : Math.min(pullOffset * 150, 200); 
  const ropeStretch = triggered ? 40 : 35 + (pullOffset * 5); // Rope gets longer

  return (
    <div 
      className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[80vh] flex flex-col items-center pointer-events-none z-20 transition-opacity duration-1000 ${isCelebrating ? 'opacity-20' : 'opacity-100'}`}
      style={{ transform: `translate(-50%, 0)` }}
    >
      {/* Rope */}
      {/* We apply the translation mainly to the bell, but the rope stretches */}
      <div 
        className={`w-1 bg-gradient-to-b from-gray-800 to-red-600 origin-top shadow-sm`}
        style={{ 
            height: `${ropeStretch}vh`,
            transition: triggered ? 'height 0.3s ease-out' : 'height 0.1s linear'
        }}
      ></div>
      
      {/* Bell Container */}
      <div 
        className={`relative ${triggered ? 'animate-bell-ring' : ''}`}
        style={{
            transform: triggered ? '' : `translateY(${visualY}px) rotate(${pullOffset * 5}deg)`,
            transition: triggered ? '' : 'transform 0.1s linear' 
        }}
      >
        {/* Bell Body */}
        <div className={`relative ${!triggered && pullOffset === 0 ? 'animate-sway-gentle' : ''}`}>
             {/* Bell Dome */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                <path d="M60 10C35 10 15 35 10 70C5 90 0 100 0 100H120C120 100 115 90 110 70C105 35 85 10 60 10Z" fill="url(#paint0_linear)"/>
                <path d="M60 10C35 10 15 35 10 70C5 90 0 100 0 100H120C120 100 115 90 110 70C105 35 85 10 60 10Z" stroke="#B45309" strokeWidth="2"/>
                {/* Decoration */}
                <circle cx="60" cy="110" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
                
                <defs>
                    <linearGradient id="paint0_linear" x1="60" y1="10" x2="60" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FCD34D"/>
                        <stop offset="1" stopColor="#F59E0B"/>
                    </linearGradient>
                </defs>
            </svg>
            
            {/* Clapper (The thing inside) */}
             <div className={`absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-yellow-700 ${triggered ? 'animate-clapper' : ''}`}></div>
        </div>
      </div>
      
      <style>{`
        @keyframes sway {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(1deg); }
            75% { transform: rotate(-1deg); }
            100% { transform: rotate(0deg); }
        }
        .animate-sway-gentle {
            transform-origin: top center;
            animation: sway 4s ease-in-out infinite;
        }
        
        @keyframes ring {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(15deg); }
            20% { transform: rotate(-12deg); }
            30% { transform: rotate(10deg); }
            40% { transform: rotate(-8deg); }
            50% { transform: rotate(6deg); }
            60% { transform: rotate(-4deg); }
            100% { transform: rotate(0deg); }
        }
        .animate-bell-ring {
             transform-origin: top center;
             animation: ring 1.5s ease-in-out infinite;
        }

        @keyframes clapper {
             0% { transform: translateX(-50%) rotate(0deg); }
             10% { transform: translateX(-0%) rotate(45deg); }
             20% { transform: translateX(-100%) rotate(-45deg); }
             100% { transform: translateX(-50%) rotate(0deg); }
        }
        .animate-clapper {
            animation: clapper 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Bell;