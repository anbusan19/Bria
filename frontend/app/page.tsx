import ImageGenerator from "./components/ImageGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 pointer-events-none"></div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
            Bria AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate professional visuals with responsible AI.
            <span className="block mt-2 text-sm text-gray-500">Powered by Bria 2.3 / 3.2 Models</span>
          </p>
        </div>

        <ImageGenerator />

        <footer className="mt-20 text-gray-600 text-sm">
          <p>Built with Next.js & Bria API</p>
        </footer>
      </main>
    </div>
  );
}
