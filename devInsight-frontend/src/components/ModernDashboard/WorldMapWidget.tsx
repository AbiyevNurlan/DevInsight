import React from 'react';
import { motion } from 'framer-motion';

export const WorldMapWidget = () => {
    return (
        <motion.div
            className="col-span-12 md:col-span-4 lg:col-span-3 row-span-2 bg-gradient-to-b from-futuristic-card to-slate-900/50 border border-futuristic-border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
        >
            <h3 className="text-white font-semibold mb-2 z-10 relative">Global Talent Pool</h3>
            <p className="text-xs text-slate-500 mb-6 z-10 relative">Top Regions</p>

            {/* Abstract Map Graphic - Simulated with Dots and Connections for futuristic feel */}
            <div className="absolute inset-0 top-16 opacity-30">
                {/* You would typically use a D3 map or SVG here. For this demo, using a styled placeholder that looks like the image */}
                <svg viewBox="0 0 200 100" className="w-full h-full fill-slate-500">
                    <path d="M20,50 Q40,20 60,50 T100,50 T140,50 T180,50" stroke="rgba(255,255,255,0.1)" fill="none" strokeWidth="0.5" />
                    {/* Simplified Continents Outline Placeholder - In a real app, import a GeoJSON or efficient SVG */}
                    <path d="M40,30 L50,30 L55,40 L45,45 Z" fill="rgba(255,255,255,0.1)" /> {/* North America ish */}
                    <path d="M90,30 L110,25 L115,40 L100,45 Z" fill="rgba(255,255,255,0.1)" /> {/* Europe ish */}
                    <path d="M130,35 L150,30 L160,50 L140,55 Z" fill="rgba(255,255,255,0.1)" /> {/* Asia ish */}

                    {/* Animated Hotspots */}
                    <circle cx="48" cy="38" r="2" fill="#06b6d4" className="animate-pulse" />
                    <circle cx="105" cy="32" r="2" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="145" cy="40" r="2" fill="#8b5cf6" className="animate-pulse" />
                </svg>
            </div>

            {/* Helper overlay for neon effect */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 flex justify-between z-10">
                <div className="text-center">
                    <div className="text-lg font-bold text-white">86%</div>
                    <div className="text-[10px] text-slate-500 uppercase">US/EU</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-white">12%</div>
                    <div className="text-[10px] text-slate-500 uppercase">APAC</div>
                </div>
            </div>
        </motion.div>
    );
};
