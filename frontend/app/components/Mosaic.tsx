'use client';

import React, { useMemo } from 'react';

import { motion } from 'framer-motion';

interface MosaicProps {

  mousePosition: { x: number; y: number };

}

// 1. Define SVG Patterns for "Dither" levels

// These represent brightness levels using dot density instead of opacity

const DitherPatterns = () => (

  <svg className="absolute w-0 h-0">

    <defs>

      {/* Level 1: Sparse Dots (Darkest Grey) */}

      <pattern id="pattern-1" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">

        <circle cx="2" cy="2" r="0.5" fill="white" />

      </pattern>

      {/* Level 2: Medium Dots (Mid Grey) */}

      <pattern id="pattern-2" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">

        <circle cx="1" cy="1" r="1" fill="white" />

        <circle cx="3" cy="3" r="1" fill="white" />

      </pattern>

      {/* Level 3: Dense Dots (Light Grey) */}

      <pattern id="pattern-3" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">

        <rect x="0" y="0" width="4" height="4" fill="black" />

        <circle cx="2" cy="2" r="1.5" fill="white" />

        <circle cx="0" cy="0" r="1" fill="white" />

        <circle cx="4" cy="0" r="1" fill="white" />

        <circle cx="0" cy="4" r="1" fill="white" />

        <circle cx="4" cy="4" r="1" fill="white" />

      </pattern>

    </defs>

  </svg>

);

const Mosaic: React.FC<MosaicProps> = ({ mousePosition }) => {

  const rows = 12; // Increased density for better dither resolution

  const cols = 12;

  const gridItems = useMemo(() => {

    const items = [];

    for (let r = 0; r < rows; r++) {

      for (let c = 0; c < cols; c++) {

        items.push({

          id: `${r}-${c}`,

          r,

          c,

        });

      }

    }

    return items;

  }, []);

  return (

    <div className="relative w-full max-w-[600px] aspect-square bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl group font-mono">

      <DitherPatterns />

      {/* Background Noise Texture (Simulating film grain) */}

      <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 

           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} 

      />

      {/* Scanline Effect */}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none" />

      {/* Grid Container */}

      <div 

        className="absolute inset-0 p-8 grid gap-1 z-10"

        style={{

          gridTemplateColumns: `repeat(${cols}, 1fr)`,

          gridTemplateRows: `repeat(${rows}, 1fr)`,

        }}

      >

        {gridItems.map((item) => (

          <DitherTile 

            key={item.id} 

            item={item} 

            mousePosition={mousePosition} 

            rows={rows} 

            cols={cols} 

          />

        ))}

      </div>

      {/* Retro UI Badge */}

      <motion.div 

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ delay: 1 }}

        className="absolute bottom-6 left-6 z-30 flex flex-col gap-1"

      >

         <div className="flex items-center gap-2">

            <div className="w-2 h-2 bg-white animate-pulse" />

            <span className="text-[10px] uppercase tracking-widest text-white/70">System.Idle</span>

         </div>

         <div className="h-[1px] w-24 bg-white/30" />

         <span className="text-[9px] text-white/40">MEMORY: 64KB OK</span>

      </motion.div>

    </div>

  );

};

const DitherTile: React.FC<{ 

  item: { r: number, c: number }, 

  mousePosition: { x: number, y: number },

  rows: number,

  cols: number

}> = ({ item, mousePosition, rows, cols }) => {

  

  // Calculate center of this specific tile in relative coordinates (0 to 1)

  const tileX = (item.c + 0.5) / cols;

  const tileY = (item.r + 0.5) / rows;

  // Calculate distance from mouse

  const dx = tileX - mousePosition.x;

  const dy = tileY - mousePosition.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  // Determine "Luminance" based on distance

  // Close to mouse = 1 (White), Far = 0 (Black)

  // We use steps to create the "banding" dither effect

  let patternId: string | null = null;

  let backgroundColor = '#050505';

  

  // Dither Thresholds

  if (dist < 0.15) {

    // Core: Solid White

    backgroundColor = 'white';

  } else if (dist < 0.3) {

    // Inner Ring: Dense Pattern

    patternId = 'pattern-3';

    backgroundColor = 'black';

  } else if (dist < 0.45) {

     // Mid Ring: Medium Pattern

    patternId = 'pattern-2';

    backgroundColor = 'black';

  } else if (dist < 0.6) {

    // Outer Ring: Sparse Pattern

    patternId = 'pattern-1';

    backgroundColor = 'black';

  } else {

    // Background: Black (or very faint border)

    backgroundColor = '#050505';

  }

  return (

    <motion.div

      className="w-full h-full border border-white/5 relative overflow-hidden"

      initial={{ scale: 0, opacity: 0 }}

      animate={{ scale: 1, opacity: 1 }}

      transition={{ 

        duration: 0.4,

        delay: (item.c + item.r) * 0.02, // Diagonal sweep load

        ease: "circOut"

      }}

    >

      {patternId ? (

        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">

          <rect width="100%" height="100%" fill={backgroundColor} />

          <rect width="100%" height="100%" fill={`url(#${patternId})`} />

        </svg>

      ) : (

        <div 

          className="absolute inset-0 transition-colors duration-200"

          style={{ backgroundColor }}

        />

      )}

    </motion.div>

  );

}

export default Mosaic;
