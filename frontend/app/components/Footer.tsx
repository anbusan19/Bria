import React from 'react';
import { Linkedin } from './icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6">
              <img 
                src="/sync-title.svg" 
                alt="Sync" 
                className="h-6 w-auto"
              />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Visual CI/CD for the Enterprise. The first deterministic infrastructure for Generative AI. Transform image generation from a creative task into an infrastructure process.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Configuration as Code</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Deterministic Diffs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Video Pipelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Commercial Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bria FIBO</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Follow Us</h4>
            <div className="flex gap-4">
               <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                 <Linkedin size={18} /> LinkedIn
               </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono uppercase">
          <p>&copy; 2025 Sync. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
          </div>
        </div>
      </div>
      
      {/* Chat Bubble placeholder */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform z-50">
        <div className="w-6 h-4 bg-black rounded-sm relative">
            <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/4 rotate-45 w-2 h-2 bg-black"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

