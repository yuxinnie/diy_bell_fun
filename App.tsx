import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from './types';
import Bell from './components/Bell';
import MotionTrigger from './components/MotionTrigger';
import Snow from './components/Snow';
import { generateCheerAudio } from './services/audioService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [celebrationText, setCelebrationText] = useState<string>("emva's time!");
  const [inputText, setInputText] = useState<string>("emva's time!");
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Audio nodes references to stop them later
  const bellNodesRef = useRef<AudioNode[]>([]);
  const musicNodesRef = useRef<AudioNode[]>([]);

  // Initialize Audio Context on first interaction
  useEffect(() => {
    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };
    window.addEventListener('mousedown', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => {
        window.removeEventListener('mousedown', initAudio);
        window.removeEventListener('touchstart', initAudio);
    }
  }, []);

  const stopAudio = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      bellNodesRef.current.forEach(node => {
          try { (node as any).stop?.(); } catch(e){}
          try { node.disconnect(); } catch(e){}
      });
      bellNodesRef.current = [];

      musicNodesRef.current.forEach(node => {
        try { (node as any).stop?.(); } catch(e){}
        try { node.disconnect(); } catch(e){}
      });
      musicNodesRef.current = [];
  }

  // A bright, musical bell chime
  const playMusicalBell = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const t = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(0.7, t + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 4.0);

    // Bronze bell harmonic series
    const frequencies = [440, 880, 1056, 1320, 1760, 2112]; 
    const gains = [0.6, 0.4, 0.3, 0.2, 0.1, 0.05];

    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        
        g.gain.setValueAtTime(gains[i], t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (3.0 / (i + 1)));
        
        osc.connect(g);
        g.connect(masterGain);
        
        osc.start(t);
        osc.stop(t + 4);
        bellNodesRef.current.push(osc, g);
    });
    
    bellNodesRef.current.push(masterGain);
  };

  const playCelebrationMusic = () => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const t = ctx.currentTime;

      // Festive upbeat arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25];
      const speed = 0.12;
      
      const masterVol = ctx.createGain();
      masterVol.gain.value = 0.18;
      masterVol.connect(ctx.destination);
      musicNodesRef.current.push(masterVol);

      // Main Melody Layer
      for(let i = 0; i < 64; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          const freq = notes[i % notes.length];
          osc.frequency.setValueAtTime(freq, t + i * speed);
          
          gain.gain.setValueAtTime(0, t + i * speed);
          gain.gain.linearRampToValueAtTime(0.3, t + i * speed + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, t + i * speed + speed);
          
          osc.connect(gain);
          gain.connect(masterVol);
          
          osc.start(t + i * speed);
          osc.stop(t + i * speed + speed);
          musicNodesRef.current.push(osc, gain);
      }

      // "Jingle Bell" Sparkle Layer (Higher frequency FM-style bursts)
      for(let i = 0; i < 64; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(3000 + Math.random() * 2000, t + i * speed + (speed/2));
          
          gain.gain.setValueAtTime(0, t + i * speed + (speed/2));
          gain.gain.linearRampToValueAtTime(0.1, t + i * speed + (speed/2) + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * speed + (speed/2) + 0.05);
          
          osc.connect(gain);
          gain.connect(masterVol);
          osc.start(t + i * speed + (speed/2));
          osc.stop(t + i * speed + (speed/2) + 0.1);
          musicNodesRef.current.push(osc, gain);
      }
  };

  const playCrowdCheer = async () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    try {
        const buffer = await generateCheerAudio(celebrationText);
        if (buffer && ctx) {
            const decodedBuffer = await ctx.decodeAudioData(buffer);
            
            // Create a bigger "Crowd" by layering 10 voices
            const voiceCount = 10;
            for(let i = 0; i < voiceCount; i++) {
                const source = ctx.createBufferSource();
                source.buffer = decodedBuffer;
                
                const delay = Math.random() * 0.5;
                const detune = (Math.random() - 0.5) * 500; 
                source.detune.value = detune;
                
                const panner = ctx.createStereoPanner();
                panner.pan.value = (Math.random() - 0.5) * 2; 
                
                const voiceGain = ctx.createGain();
                voiceGain.gain.value = 0.3 + Math.random() * 0.5;
                
                source.connect(voiceGain);
                voiceGain.connect(panner);
                panner.connect(ctx.destination);
                
                source.start(ctx.currentTime + 0.1 + delay);
            }
        }
    } catch (e) {
        console.error("Audio playback failed", e);
    }
  };

  const handlePullTrigger = useCallback(() => {
    if (appState !== AppState.IDLE) return;
    
    setAppState(AppState.TRIGGERED);
    playMusicalBell();

    setTimeout(() => {
      setAppState(AppState.CELEBRATING);
      playCelebrationMusic();
      playCrowdCheer();
    }, 800); 
  }, [appState, celebrationText]);

  const handleReset = () => {
    stopAudio();
    setAppState(AppState.IDLE);
    setPullProgress(0);
    setIsPanelExpanded(false);
  };

  const handleSaveText = () => {
    setCelebrationText(inputText);
    setIsPanelExpanded(false);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-[2000ms] ${appState === AppState.CELEBRATING ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800' : 'bg-slate-50'}`}>
      
      {appState === AppState.CELEBRATING && <Snow />}

      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
        <div className={`transition-all duration-1000 transform ${appState === AppState.CELEBRATING ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-20'}`}>
           <h1 className="font-festive text-7xl md:text-[12rem] text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)] text-center p-4 select-none uppercase leading-tight">
             {celebrationText}
           </h1>
        </div>
      </div>

      <Bell 
        triggered={appState !== AppState.IDLE} 
        pullOffset={pullProgress} 
        isCelebrating={appState === AppState.CELEBRATING}
      />

      <MotionTrigger 
        onPull={handlePullTrigger} 
        onPullProgress={setPullProgress}
        isActive={appState === AppState.IDLE} 
      />

      {/* Floating Action / Settings Area */}
      <div className="absolute bottom-6 right-0 z-50 flex items-end pointer-events-auto">
        {appState === AppState.CELEBRATING ? (
             <div className="mr-6 mb-6">
                <button 
                  onClick={handleReset}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border border-white/50 px-8 py-3 rounded-full shadow-2xl transition-all font-bold text-lg"
                >
                  Reset
                </button>
             </div>
        ) : (
            <div 
              onMouseEnter={() => setIsPanelExpanded(true)}
              onMouseLeave={() => setIsPanelExpanded(false)}
              className={`flex items-center transition-transform duration-500 ease-in-out ${isPanelExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}
            >
                {/* Visual Handle - Light Gray, Slimmer */}
                <div className="bg-gray-200 w-10 h-20 rounded-l-2xl shadow-xl flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-500 ${isPanelExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>

                <div className="bg-white p-6 rounded-l-none rounded-r-none shadow-2xl border-l border-gray-100 flex flex-col gap-3 w-72 h-auto">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Shout message</label>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium"
                        placeholder="emva's time!"
                    />
                    <button 
                        onClick={handleSaveText}
                        className="bg-gray-800 text-white text-sm font-bold py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                    >
                        OK
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]"></div>
    </div>
  );
};

export default App;