'use client';

import { useState } from 'react';
import ImageGenerator from "./components/ImageGenerator";
import ImageEditor from "./components/ImageEditor";
import VideoEditor from "./components/VideoEditor";
import HistoryPanel from "./components/HistoryPanel";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSection from "./components/ProblemSection";
import PipelineSection from "./components/PipelineSection";
import FeatureGrid from "./components/FeatureGrid";
import BottomCTA from "./components/BottomCTA";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function HomeContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'generator' | 'editor' | 'video' | 'history'>('generator');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowLanding(false);
      setActiveTab('generator');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowLanding(false);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page by default
  if (showLanding) {
    return (
      <>
        <Navbar onGetStarted={handleGetStarted} onLogin={handleLogin} />
        <main>
          <Hero onGetStarted={handleGetStarted} />
          <ProblemSection />
          <PipelineSection onGetStarted={handleGetStarted} />
          <FeatureGrid />
          <BottomCTA onGetStarted={handleGetStarted} />
        </main>
        <Footer />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Show editor interface
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-accent selection:text-black relative">
      {/* Header with Navbar */}
      <Navbar onGetStarted={handleGetStarted} onLogin={handleLogin} />

      <main className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Powered by Bria FIBO
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                AI Studio
              </h1>
            </div>
            <button
              onClick={() => setShowLanding(true)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-all"
            >
              ← Back to Landing
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'generator'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'editor'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'video'
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Video
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'history'
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              History
            </button>
          </div>

          {/* Editor Content */}
          <div className="w-full animate-fadeIn">
            {activeTab === 'generator' ? (
              <ImageGenerator />
            ) : activeTab === 'editor' ? (
              <ImageEditor />
            ) : activeTab === 'video' ? (
              <VideoEditor />
            ) : (
              <HistoryPanel />
            )}
          </div>
        </div>
      </main>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
