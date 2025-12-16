import React from 'react';
import { Layers, Database, Command } from './icons';

const ProblemCard = ({ icon: Icon, title, description, color }: { icon: any, title: React.ReactNode, description: string, color: string }) => (
  <div className="bg-[#0f0f11] p-8 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
    <div className={`w-10 h-10 rounded mb-6 flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <h3 className="text-lg font-medium text-gray-200 mb-3 leading-snug">
      {title}
    </h3>
    <p className="text-gray-500 text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const ProblemSection: React.FC = () => {
  return (
    <section id="problem" className="py-24 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-medium text-white mb-16 max-w-2xl leading-tight">
          The Problem: <br />
          <span className="text-gray-400">The Hallucination Barrier</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <ProblemCard
            icon={Layers}
            color="text-red-400 bg-red-400/10"
            title={<><span className="text-red-400">Inconsistency</span> — Standard models drift significantly between generations.</>}
            description="It's currently difficult to request an exact lighting setup across multiple distinct assets."
          />
          <ProblemCard
            icon={Command}
            color="text-orange-400 bg-orange-400/10"
            title={<><span className="text-orange-400">Unscalable Workflows</span> — Marketing teams rely on fragile prompt engineering.</>}
            description="Prompt engineering is subjective and unsuited for enterprise production at scale."
          />
          <ProblemCard
            icon={Database}
            color="text-blue-400 bg-blue-400/10"
            title={<><span className="text-blue-400">Compliance Risks</span> — Brands cannot risk violating strict guidelines.</>}
            description="Brands cannot risk generating assets that violate strict color palettes or visual identity guidelines."
          />
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;

