import React, { useEffect, useRef, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

const FRAME_CONFIGS = {
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

const filterOptions = [
  { id: 'normal', name: 'Normal', style: { filter: 'none' } },
  { id: 'grayscale', name: 'Black & White', style: { filter: 'grayscale(100%)' } },
  { id: 'sepia', name: 'Vintage Sepia', style: { filter: 'sepia(100%)' } },
  { id: 'invert', name: 'Negative', style: { filter: 'invert(100%)' } },
  { id: 'blur', name: 'Soft Focus', style: { filter: 'blur(1px)' } },
  { id: 'contrast', name: 'High Contrast', style: { filter: 'contrast(150%)' } },
];

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SelectFilter() {
  const ref = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [orderedPhotos, setOrderedPhotos] = useState([]);
  const [frameConfig, setFrameConfig] = useState(null);
  const [designFile, setDesignFile] = useState("flowers.png");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // FIX #1: timestamp cache-bust dibuat SEKALI saat data diambil,
  // bukan setiap kali render (Date.now() di render menyebabkan
  // semua <img> dapat src baru setiap re-render -> foto reload ulang
  // dari server tiap kali user ganti filter / klik submit).
  const [cacheTs, setCacheTs] = useState(() => Date.now());

  const { get, post } = useFetch();
  const { name, code } = useParams();
  const navigate = useNavigate();

  const fetchPhotos = async () => {
    setLoading(true);
    const resp = await get(`bookings/${code}`);
    if (!resp.status) {
      console.log(resp.message);
      setLoading(false);
      return;
    }

    const data = resp.data.data;
    const file = data.frame_design ? `${data.frame_design}.png` : "flowers.png";

    setOrderedPhotos(data.ordered_photos || []);
    setDesignFile(file);
    setFrameConfig(FRAME_CONFIGS[file] || FRAME_CONFIGS["flowers.png"]);
    setCacheTs(Date.now()); // sekali saja, dipakai untuk semua slot
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const getFullImageUrl = (path, index = null) => {
    if (!path) return "https://via.placeholder.com/150";

    let finalUrl = path.startsWith('http')
      ? path
      : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

    if (index !== null) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      // Pakai cacheTs (stabil), bukan Date.now() langsung
      finalUrl = `${finalUrl}${separator}cb_slot=${index}_ts=${cacheTs}`;
    }

    return finalUrl;
  };

  const currentFilterStyle = filterOptions.find(f => f.id === selectedFilter)?.style || { filter: 'none' };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // FIX #2: tunggu SEMUA <img> di dalam ref benar-benar selesai load
  // (bukan sekadar delay 150ms tetap) sebelum toPng() menyalin DOM.
  // Kalau ada gambar yang belum selesai load, toPng akan meng-capture
  // area kosong -> semua slot terlihat "sama" (kosong/placeholder).
  const waitForImages = async () => {
    if (!ref.current) return;
    const imgs = Array.from(ref.current.querySelectorAll('img'));

    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn('Gagal memuat gambar untuk snapshot:', img.src);
            resolve(); // tetap lanjut, jangan sampai proses macet total
          };
        });
      })
    );
  };

  const saveImage = async () => {
    if (!ref.current) return null;

    // Ganti setTimeout tetap dengan menunggu gambar benar-benar siap
    await waitForImages();

    // Beri jeda kecil setelah load agar browser sempat melakukan
    // paint terakhir (filter CSS, dsb) sebelum di-capture.
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      return await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        style: {
          transform: 'scale(1)',
        }
      });
    } catch (err) {
      console.error("Gagal men-generate gambar:", err);
      throw err;
    }
  };

  const handleSaveFilter = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const dataUrl = await saveImage();

      if (dataUrl) {
        const imageFile = dataURLtoFile(dataUrl, `nusnaps-${code}.png`);
        const formData = new FormData();
        formData.append('image', imageFile);

        const resp = await post(`bookings/${code}/save-filter`, formData);
        console.log(resp);
      }

      navigate(`/${name}/result/${code}`);
    } catch (err) {
      console.error("Gagal memproses gambar dan filter:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3636]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[400px_1fr] gap-8 items-start">

        {/* ================= SECTOR KIRI: PREVIEW FRAME ASLI ================= */}
        <div className="bg-[#FAF7F0] rounded-3xl p-6 border border-[#EBE3D5] flex flex-col items-center shadow-sm w-full">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-3xl font-serif font-bold tracking-wide text-[#e0447b]">
              NU SNAPS
            </span>
            <Camera className="w-6 h-6 text-[#1B1B3A]" />
          </div>

          <div
            className="relative bg-white shadow-xl overflow-hidden border border-[#d3cbaf] w-full max-w-[360px] select-none"
            style={{ aspectRatio: "2/3" }}
            ref={ref}
          >
            {frameConfig && frameConfig.slots.map((slot, i) => {
              const url = orderedPhotos[i];
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: slot.left,
                    top: slot.top,
                    width: slot.width,
                    height: slot.height,
                    borderRadius: slot.isRound ? "50%" : "6px",
                    zIndex: 10,
                  }}
                  className="overflow-hidden flex items-center justify-center bg-[#1B1B3A]/5"
                >
                  {url ? (
                    <img
                      src={getFullImageUrl(url, i)}
                      alt={`Slot ${i + 1}`}
                      className="w-full h-full object-cover transition-all duration-300"
                      crossOrigin="anonymous"
                      style={currentFilterStyle}
                    />
                  ) : (
                    <span className="text-[#1B1B3A]/30 text-sm font-bold">{i + 1}</span>
                  )}
                </div>
              );
            })}

            <img
              src={`/templates/${designFile}`}
              alt="Frame Template"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
            />
          </div>

          <p className="mt-4 text-xs text-gray-400 font-mono tracking-wider uppercase">
            Live Preview
          </p>
        </div>

        {/* ================= SECTOR KANAN: PILIHAN FILTER ================= */}
        <div className="bg-[#FAF7F0] rounded-3xl p-8 shadow-sm border border-[#EBE3D5] flex flex-col justify-between min-h-[580px]">
          <div>
            <h3 className="text-[#1A3636] font-bold text-2xl tracking-wide mb-6 uppercase">
              Choose Your Filter
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
              {filterOptions.map((filter) => (
                <div
                  key={filter.id}
                  onClick={() => !submitting && setSelectedFilter(filter.id)}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col gap-3 bg-[#F5EFE6] ${selectedFilter === filter.id
                    ? 'border-[#1A3636] bg-white shadow-md scale-[1.02]'
                    : 'border-transparent hover:border-gray-300 hover:scale-[1.01]'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full aspect-[4/3] rounded-xl bg-gray-400 overflow-hidden shadow-inner">
                    <img
                      src={getFullImageUrl(orderedPhotos[0], 0)}
                      alt={filter.name}
                      className="w-full h-full object-cover"
                      style={filter.style}
                    />
                  </div>
                  <span className="text-center font-semibold text-sm text-[#1A3636]">
                    {filter.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSaveFilter}
              disabled={submitting}
              className="w-full bg-[#1A3636] text-white font-semibold py-4 rounded-xl shadow-md hover:bg-[#2C4E4E] transition-all text-base flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Image...
                </>
              ) : (
                "✓ Save Filter & Continue"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}