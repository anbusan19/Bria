import React from 'react';
import { ArrowRight, Mail } from './icons';

interface BottomCTAProps {
  onGetStarted?: () => void;
}

const BottomCTA: React.FC<BottomCTAProps> = ({ onGetStarted }) => {
  return (
    <section id="cta" className="py-24 px-6 relative overflow-hidden">
        {/* Dot background limited to this area container if needed, but here we use absolute positioning */}
       <div className="absolute inset-0 bg-dot-pattern dot-bg opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto bg-[#0f0f11] rounded-2xl border border-white/5 p-8 md:p-16 relative overflow-hidden">
        
        {/* Abstract Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight">
              GitHub Actions <br />
              for Brand Assets
            </h2>
            <p className="text-lg text-gray-400 font-light max-w-md">
              Sync transforms image generation from a creative task into an infrastructure process. When the configuration is updated, the system automatically regenerates the asset library using Bria FIBO, ensuring mathematical consistency.
            </p>
            
            <button 
              onClick={onGetStarted}
              className="group flex items-center gap-2 font-mono text-sm tracking-wide text-white uppercase border-b border-white pb-1 hover:text-accent hover:border-accent transition-all pt-4"
            >
                Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Visual Element - Right Side */}
          <div className="relative hidden lg:block h-[400px]">
             {/* Mockup Card */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#050505] rounded-xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        SYNC STATE RUNNING...
                    </div>
                    <Mail size={14} className="text-gray-600" />
                </div>
                
                <div className="space-y-4 font-mono text-xs">
                    <p className="text-gray-400">sync.json updated</p>
                    <p className="text-gray-300 leading-relaxed">
                        Changed lighting from "studio" to "neon_lights"
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        Regenerating 24 assets with Bria FIBO...
                    </p>
                     <p className="text-gray-500 italic">
                        Composition unchanged. Lighting updated globally.
                    </p>
                    <p className="text-gray-500">
                        Deterministic. Consistent. Enterprise-ready.
                    </p>
                </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute -right-12 top-10 w-24 h-24 border border-dashed border-white/10 rounded-full animate-spin-slow"></div>
             <div className="absolute -left-4 bottom-20 w-16 h-16 border border-dashed border-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;

