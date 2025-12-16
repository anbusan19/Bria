import React from 'react';
import { Code, GitBranch, Video, Shield } from './icons';

const FeatureCard = ({ title, subtitle, children, icon: Icon, iconLabel }: { title: string, subtitle: string, children?: React.ReactNode, icon: any, iconLabel: string }) => (
  <div className="bg-[#0f0f11] rounded-xl border border-white/5 p-8 flex flex-col h-full overflow-hidden group hover:border-white/10 transition-colors">
    {/* Visual Container */}
    <div className="flex-1 min-h-[240px] bg-black/40 rounded-lg border border-white/5 mb-8 relative overflow-hidden flex items-center justify-center p-4">
      {children}
    </div>

    <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider mb-3">
      <Icon size={14} />
      <span>{iconLabel}</span>
    </div>
    
    <h3 className="text-xl font-medium text-white mb-3">
      {title}
    </h3>
    <p className="text-gray-500 text-sm leading-relaxed">
      {subtitle}
    </p>
  </div>
);

const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-12 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        
        {/* Card 1: Configuration as Code */}
        <FeatureCard 
          icon={Code} 
          iconLabel="Configuration as Code"
          title="Define your entire visual identity in a single JSON file"
          subtitle="The entire visual identity of a campaign is defined in a single, version-controllable JSON file. Enforce immutable rules like specific Hex codes, Camera Angles, and Lighting conditions."
        >
          <div className="w-full h-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border border-white/10 rounded bg-[#151518] p-4 font-mono text-[10px]">
                  <div className="flex items-center gap-2 mb-3 text-green-400">
                      <Code size={12} />
                      <span>sync.json</span>
                  </div>
                  <div className="space-y-1 text-gray-400">
                      <div>"lighting": <span className="text-white">"studio"</span></div>
                      <div>"camera_angle": <span className="text-white">"low"</span></div>
                      <div>"color_scheme": <span className="text-white">"brand"</span></div>
                  </div>
                  <div className="absolute -bottom-3 left-4 w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 blur-sm"></div>
              </div>
              <div className="absolute top-10 left-10 text-[10px] text-gray-600 font-mono">VERSION CONTROL</div>
              <div className="absolute bottom-10 right-10 text-[10px] text-gray-600 font-mono">GIT</div>
          </div>
        </FeatureCard>

        {/* Card 2: Deterministic Diffs */}
        <FeatureCard 
          icon={GitBranch} 
          iconLabel="Deterministic Diffs"
          title="Visual refactors with mathematical consistency"
          subtitle="Change 'lighting: studio' to 'lighting: neon' in the code, and the entire product catalog regenerates. The products and camera angles remain identical; only the lighting updates globally."
        >
            <div className="w-full max-w-sm bg-[#151518] rounded border border-white/10 p-4 font-mono text-[10px]">
                <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-500/20">- studio</span>
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-500/20">+ neon</span>
                </div>
                <div className="space-y-2 mb-3">
                    <div className="text-gray-500">DIFF: <span className="text-white">1 change</span></div>
                    <div className="text-gray-500">ASSETS: <span className="text-white">24 regenerated</span></div>
                </div>
                <div className="mt-3 p-2 bg-white/5 rounded border border-white/5 text-gray-600 italic">
                    Composition unchanged. Lighting updated globally.
                </div>
            </div>
        </FeatureCard>

        {/* Card 3: Video Pipelines */}
        <FeatureCard 
          icon={Video} 
          iconLabel="Video Pipelines"
          title="Motion CI/CD for video assets (Beta)"
          subtitle="Sync is expanding beyond static images. We're building the rails for Video CI/CD, allowing brands to define motion paths and transition styles in code, ensuring video assets adhere to the same strict brand guidelines."
        >
             <div className="flex items-center justify-center h-full w-full">
                <div className="relative">
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-500/20 text-[10px] font-mono">BETA</span>
                    <div className="flex gap-8">
                        {/* Node 1 */}
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-24 p-2 bg-[#151518] border border-white/10 rounded flex items-center justify-center text-xs text-gray-400">
                                Static
                             </div>
                             <div className="w-0.5 h-4 bg-white/10"></div>
                             <div className="w-32 p-2 bg-[#151518] border border-white/5 rounded text-[8px] text-gray-600">
                                Image Assets
                             </div>
                        </div>
                        {/* Node 2 */}
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-24 p-2 bg-[#151518] border border-white/10 rounded flex items-center justify-center text-xs text-gray-400">
                                Motion
                             </div>
                             <div className="w-0.5 h-4 bg-white/10"></div>
                             <div className="w-32 p-2 bg-[#151518] border border-white/5 rounded text-[8px] text-gray-600">
                                Video Assets
                             </div>
                        </div>
                    </div>
                     {/* Connecting Lines (svg) */}
                     <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                        <path d="M70 -10 L70 -20 L180 -20 L180 -10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        <circle cx="125" cy="-20" r="3" fill="#333" stroke="rgba(255,255,255,0.2)" />
                     </svg>
                </div>
             </div>
        </FeatureCard>

        {/* Card 4: Commercial Safety */}
        <FeatureCard 
          icon={Shield} 
          iconLabel="Commercial Safety"
          title="Fully licensed data, indemnity-ready for enterprise"
          subtitle="Built on Bria FIBO, the only foundation model trained on fully licensed data. Sync ensures that every generated pixel is indemnity-ready for enterprise use."
        >
             <div className="w-full max-w-sm mx-auto">
                <div className="flex justify-center mb-4">
                     <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                        <Shield size={12} className="text-green-400" />
                        <span>Licensed</span>
                     </div>
                </div>
                <div className="bg-[#151518] border border-white/10 rounded p-4 space-y-4">
                    <div>
                        <div className="text-[10px] text-gray-500 font-mono mb-1">MODEL:</div>
                        <div className="p-2 bg-white/5 border border-white/5 rounded text-xs text-gray-300">
                            Bria FIBO
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 font-mono mb-1">STATUS:</div>
                        <div className="text-xs text-green-400">
                            ✓ Fully Licensed
                        </div>
                        <div className="text-xs text-green-400">
                            ✓ Enterprise Ready
                        </div>
                        <div className="text-xs text-green-400">
                            ✓ Indemnity Protected
                        </div>
                    </div>
                </div>
             </div>
        </FeatureCard>

      </div>
    </section>
  );
};

export default FeatureGrid;

