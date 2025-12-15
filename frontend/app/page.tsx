'use client';

import { useState } from 'react';
import ImageGenerator from "./components/ImageGenerator";
import ImageEditor from "./components/ImageEditor";
import VideoEditor from "./components/VideoEditor";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generator' | 'editor' | 'video'>('generator');

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 pointer-events-none"></div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
            Bria AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate professional visuals with responsible AI.
            <span className="block mt-2 text-sm text-gray-500">Powered by Bria 2.3 / 3.2 Models</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'generator'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'editor'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'video'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Video
          </button>
        </div>

        <div className="w-full animate-fadeIn">
          {activeTab === 'generator' ? <ImageGenerator /> : activeTab === 'editor' ? <ImageEditor /> : <VideoEditor />}
        </div>

        <footer className="mt-20 text-gray-600 text-sm">
          <p>Built with Next.js & Bria API</p>
        </footer>
      </main>
    </div>
  );
}

