import React, { forwardRef } from 'react';

// Konfigurasi koordinat slot frame foto/video terbaru
export const FRAME_CONFIGS = {
    "flowers.png": {
        total_frames: 6,
        slots: [
            { left: "7.05%", top: "6.35%", width: "40.66%", height: "22.1%" },
            { left: "52.36%", top: "6.35%", width: "40.66%", height: "22.1%" },
            { left: "7.05%", top: "35.65%", width: "40.66%", height: "22.1%" },
            { left: "52.36%", top: "35.65%", width: "40.66%", height: "22.1%" },
            { left: "7.05%", top: "65.0%", width: "40.66%", height: "22.1%" },
            { left: "52.36%", top: "65.0%", width: "40.66%", height: "22.1%" },
        ]
    },
    "fruits.png": {
        total_frames: 6,
        slots: [
            { left: "7.05%", top: "6.35%", width: "40.66%", height: "22.1%", isRound: false },
            { left: "52.36%", top: "6.35%", width: "40.66%", height: "22.1%", isRound: false },
            { left: "7.05%", top: "35.65%", width: "40.66%", height: "27.1%", isRound: true },
            { left: "52.36%", top: "35.65%", width: "40.66%", height: "27.1%", isRound: true },
            { left: "7.05%", top: "65.0%", width: "40.66%", height: "22.1%", isRound: false },
            { left: "52.36%", top: "65.0%", width: "40.66%", height: "22.1%", isRound: false },
        ]
    },
    "good_vibes.png": {
        total_frames: 8,
        slots: [
            { left: "7.05%", top: "6.35%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "6.35%", width: "40.66%", height: "18.1%" },
            { left: "7.05%", top: "25.9%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "25.9%", width: "40.66%", height: "18.1%" },
            { left: "7.05%", top: "45.45%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "45.45%", width: "40.66%", height: "18.1%" },
            { left: "7.05%", top: "65.0%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "65.0%", width: "40.66%", height: "18.1%" },
        ]
    },
    "movie.png": {
        total_frames: 6,
        slots: [
            { left: "3.5%", top: "19%", width: "43.5%", height: "21.6%" },
            { left: "3.5%", top: "40%", width: "43.5%", height: "22.6%" },
            { left: "3.5%", top: "62.5%", width: "43.5%", height: "22.2%" },
            { left: "52.7%", top: "19.8%", width: "43.5%", height: "20.5%" },
            { left: "52.9%", top: "40%", width: "43.5%", height: "22.6%" },
            { left: "52.9%", top: "62.5%", width: "43.5%", height: "22.2%" },
        ]
    },
    "halloween.png": {
        total_frames: 6,
        slots: [
            { left: "4.8%", top: "14.2%", width: "43.5%", height: "21.6%" },
            { left: "4.8%", top: "39.5%", width: "43.5%", height: "21.6%" },
            { left: "4.8%", top: "64.8%", width: "43.5%", height: "21.6%" },
            { left: "51.7%", top: "14.2%", width: "43.5%", height: "21.6%" },
            { left: "51.7%", top: "39.5%", width: "43.5%", height: "21.6%" },
            { left: "51.7%", top: "64.8%", width: "43.5%", height: "21.6%" },
        ]
    }
};

/**
 * Komponen Generator Dinamis untuk Template Frame 
 */
const BaseFrame = forwardRef(({ frameKey, photos = [], filter = 'none', positions = [] }, ref) => {
    const config = FRAME_CONFIGS[frameKey];
    
    // Fallback aman jika nama file template tidak valid
    if (!config) {
        return (
            <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center rounded-xl border border-gray-300">
                <span className="text-xs text-gray-500 font-bold">Config for {frameKey} missing</span>
            </div>
        );
    }

    // Mengambil base URL template frame dari environment
    const frameOverlayUrl = `${import.meta.env.VITE_API_BASE_URL}/frame/${frameKey}`;

    return (
        <div 
            ref={ref} 
            className="relative w-full aspect-[2/3] select-none overflow-hidden bg-white shadow-sm"
            style={{ contentVisibility: 'auto' }}
        >
            {/* ── ITERASI SLOT FOTO / VIDEO ── */}
            {config.slots.map((slot, idx) => {
                const mediaItem = photos[idx];
                const pos = positions[idx] || { x: 50, y: 50 };
                
                // Cek ekstensi jika yang dikirimkan berformat video (.webm / .mp4)
                const isVideo = mediaItem && (mediaItem.endsWith('.webm') || mediaItem.endsWith('.mp4'));

                return (
                    <div
                        key={idx}
                        className="absolute overflow-hidden bg-[#EFEFEF]"
                        style={{
                            left: slot.left,
                            top: slot.top,
                            width: slot.width,
                            height: slot.height,
                            borderRadius: slot.isRound ? '9999px' : '0px',
                        }}
                    >
                        {mediaItem && (
                            isVideo ? (
                                <video
                                    src={mediaItem}
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    style={{ 
                                        filter,
                                        objectPosition: `${pos.x}% ${pos.y}%`
                                    }}
                                />
                            ) : (
                                <img
                                    src={mediaItem}
                                    alt={`Slot ${idx + 1}`}
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    style={{ 
                                        filter,
                                        objectPosition: `${pos.x}% ${pos.y}%`
                                    }}
                                />
                            )
                        )}
                    </div>
                );
            })}

            {/* ── TEMPLATE FRAME PNG OVERLAY ── */}
            <img
                src={frameOverlayUrl}
                alt="Template Frame"
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full z-10 pointer-events-none object-fill"
            />
        </div>
    );
});

BaseFrame.displayName = 'BaseFrame';

// ── REGISTRY MAPPING UTAMA ──
// Memetakan string dari API (contoh: data.frame) agar langsung terhubung ke komponen pembungkusnya
export const FrameRegistry = {
    "flowers.png": forwardRef((props, ref) => <BaseFrame {...props} ref={ref} frameKey="flowers.png" />),
    "fruits.png": forwardRef((props, ref) => <BaseFrame {...props} ref={ref} frameKey="fruits.png" />),
    "good_vibes.png": forwardRef((props, ref) => <BaseFrame {...props} ref={ref} frameKey="good_vibes.png" />),
    "movie.png": forwardRef((props, ref) => <BaseFrame {...props} ref={ref} frameKey="movie.png" />),
    "halloween.png": forwardRef((props, ref) => <BaseFrame {...props} ref={ref} frameKey="halloween.png" />),
};

// Set displayName untuk kebutuhan devtools debugging React forwardRef
Object.keys(FrameRegistry).forEach(key => {
    FrameRegistry[key].displayName = `FrameRegistry[${key}]`;
});