'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2, Zap, Layers, Sparkles, Database } from './icons';

interface AccordionItemProps {
  title: string;
  icon: any;
  isOpen: boolean;
  onClick: () => void;
  content: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon: Icon, isOpen, onClick, content }) => (
  <div className="border border-white/10 rounded overflow-hidden mb-3 bg-[#0f0f11]">
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'}`}
    >
      <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-wide">
        <Icon size={16} className={isOpen ? 'text-accent' : 'text-gray-600'} />
        {title}
      </div>
      <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="p-6 border-t border-white/5 text-sm text-gray-400 leading-relaxed">
        <p>
          {content}
        </p>
      </div>
    </div>
  </div>
);

interface PipelineSectionProps {
  onGetStarted?: () => void;
}

const PipelineSection: React.FC<PipelineSectionProps> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { 
      title: "Configuration as Code", 
      icon: Layers,
      content: "The entire visual identity of a campaign is defined in a single, version-controllable JSON file. Enforce immutable rules like specific Hex codes, Camera Angles, and Lighting conditions."
    },
    { 
      title: "Deterministic Diffs", 
      icon: Zap,
      content: "Because Sync utilizes Bria FIBO's structured parameters, it enables 'Visual Refactors.' Change 'lighting: studio' to 'lighting: neon' in the code, and the entire product catalog regenerates with identical composition but updated lighting."
    },
    { 
      title: "Video Pipelines", 
      icon: Database,
      content: "Sync is expanding beyond static images. We're building the rails for Video CI/CD, allowing brands to define motion paths and transition styles in code, ensuring video assets adhere to the same strict brand guidelines."
    },
    { 
      title: "Commercial Safety", 
      icon: Sparkles,
      content: "Built on Bria FIBO, the only foundation model trained on fully licensed data. Sync ensures that every generated pixel is indemnity-ready for enterprise use."
    },
  ];

  return (
    <section id="solution" className="py-24 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
          <h2 className="text-4xl md:text-6xl font-medium text-white leading-tight">
            Sync treats Brand <br />
            Guidelines as <br />
            <span className="text-gray-500">Configuration-as-Code</span>
          </h2>
          
          <div className="text-gray-400 text-lg font-light space-y-2">
            <p>Instead of prompting an AI with vague descriptions, Sync manages a centralized sync.json state:</p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 size={18} className="text-gray-600" /> Brand Lock — Enforce immutable rules
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 size={18} className="text-gray-600" /> Manifest — Structured list of assets to generate
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 size={18} className="text-gray-600" /> Automatic regeneration on config changes
              </li>
            </ul>
          </div>

          <button 
            onClick={onGetStarted}
            className="group flex items-center gap-2 font-mono text-sm tracking-wide text-white uppercase border-b border-white pb-1 hover:text-accent hover:border-accent transition-all pt-4"
          >
             Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div>
          {tabs.map((tab, index) => (
            <AccordionItem
              key={index}
              title={tab.title}
              icon={tab.icon}
              isOpen={activeTab === index}
              onClick={() => setActiveTab(index)}
              content={tab.content}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;

