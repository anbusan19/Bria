'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight, Search, Zap, Send } from './icons';
import Mosaic from './Mosaic';

const StepCard = ({ step, title, icon: Icon, children }: { step: string; title: string; icon: any; children?: React.ReactNode }) => (
  <div className="bg-[#0f0f11] border border-white/10 rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all duration-300 h-full">
    <div className="flex items-center justify-between text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-accent" />
        <span>Step {step}</span>
      </div>
      <span>— {title}</span>
    </div>
    <div className="flex-1">
      {children}
    </div>
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
  </div>
);

interface HeroProps {
  onGetStarted?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  }, []);

  return (
    <section id="hero" className="relative pt-32 pb-32 px-6 overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505] to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Main Hero Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          {/* Left Column - Headline */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-400 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Powered by Bria FIBO
            </div>
            
            <h1 className="text-6xl md:text-8xl tracking-tight leading-[1.05] text-white">
              Visual CI/CD <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">for the</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white">Enterprise</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-xl">
              The first deterministic infrastructure for Generative AI. Transform image generation from a creative task into an infrastructure process.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              <button 
                onClick={onGetStarted}
                className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onGetStarted}
                className="group flex items-center gap-2 font-mono text-sm tracking-wide text-white uppercase border border-white/20 px-6 py-4 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all"
              >
                View Demo
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative lg:pl-8" onMouseMove={handleMouseMove}>
            <Mosaic mousePosition={mousePosition} />
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>

        {/* 4 Steps Visualization */}
        <div className="relative pt-8">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none -z-10"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
          {/* Step 1: Configure */}
          <StepCard step="1" title="Configure" icon={Search}>
            <div className="p-3 bg-white/5 rounded border border-white/5 text-[10px] font-mono text-gray-400 space-y-2">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-green-400">sync.json</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">2.3 KB</span>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">"lighting": <span className="text-white">"studio"</span></div>
                <div className="text-gray-500">"camera_angle": <span className="text-white">"low"</span></div>
                <div className="text-gray-500">"color_scheme": <span className="text-white">"brand"</span></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Define brand guidelines as code</p>
            </div>
          </StepCard>

          {/* Step 2: Generate */}
          <StepCard step="2" title="Generate" icon={Zap}>
             <div className="p-3 bg-white/5 rounded border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 border-b border-white/5 pb-2">
                    <div className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">AI</div>
                    <span>Bria FIBO Processing...</span>
                </div>
                <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-gray-700 rounded"></div>
                    <div className="h-1.5 w-11/12 bg-gray-700 rounded"></div>
                    <div className="h-1.5 w-full bg-gray-700 rounded"></div>
                    <div className="h-1.5 w-3/4 bg-gray-700 rounded"></div>
                </div>
                <div className="flex gap-2">
                    <span className="text-[8px] border border-white/10 px-1 py-0.5 rounded text-gray-500">SNEAKER</span>
                    <span className="text-[8px] border border-white/10 px-1 py-0.5 rounded text-gray-500">BAG</span>
                </div>
             </div>
             <p className="text-[10px] text-gray-500 mt-2">Deterministic generation with consistency</p>
          </StepCard>

          {/* Step 3: Refactor */}
          <StepCard step="3" title="Refactor" icon={Send}>
            <div className="p-3 bg-white/5 rounded border border-white/5 text-[10px] font-mono text-gray-400 space-y-2">
               <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-gray-600">DIFF</span>
                 <span className="text-green-500 text-[8px] border border-green-500/30 px-1 rounded">+1</span>
               </div>
               <div className="space-y-1">
                  <div className="text-red-400">- "lighting": "studio"</div>
                  <div className="text-green-400">+ "lighting": "neon"</div>
               </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Change config, regenerate entire catalog</p>
          </StepCard>

          {/* Step 4: Deploy */}
          <StepCard step="4" title="Deploy" icon={Send}>
            <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[10px] text-gray-300">Assets Ready</span>
                    </div>
                    <span className="text-[8px] text-gray-500">24/24</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5 opacity-50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] text-gray-300">Video Pipeline</span>
                    </div>
                     <span className="text-[8px] text-gray-500">BETA</span>
                </div>
                 <div className="h-px w-full bg-white/5 my-1"></div>
                 <div className="text-[10px] text-gray-400 p-2 bg-white/5 rounded italic">
                    "GitHub Actions for Brand Assets"
                 </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Version-controlled visual infrastructure</p>
          </StepCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

