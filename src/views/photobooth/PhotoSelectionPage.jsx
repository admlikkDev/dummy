import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Play, Check, Loader2, RotateCcw } from "lucide-react";
import useFetch from "../../hooks/useFetch";
import { toPng } from "html-to-image";

// Konfigurasi koordinat slot dalam persentase (%) terhadap resolusi template (1333 x 2000)
// Rumus persentase: (Koordinat / Dimensi Asli) * 100
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
      { left: "2.5%", top: "6%", width: "46%", height: "30%", isRound: false },
      { left: "53%", top: "6%", width: "46%", height: "30%", isRound: false },
      { left: "2.5%", top: "38%", width: "46%", height: "22%", isRound: false },
      { left: "53%", top: "38%", width: "46%", height: "22%", isRound: false },
      { left: "2.5%", top: "61%", width: "46%", height: "31%", isRound: false },
      { left: "53%", top: "61%", width: "46%", height: "31%", isRound: false }
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
      { left: "2.3%", top: "6%", width: "44.8%", height: "19.6%" },
      { left: "49.5%", top: "6%", width: "48.6%", height: "19.6%" },
      { left: "2.3%", top: "26.1%", width: "44.8%", height: "19.6%" },
      { left: "49.5%", top: "26.1%", width: "48.6%", height: "19.6%" },
      { left: "2.3%", top: "45.2%", width: "44.8%", height: "19.6%" },
      { left: "49.5%", top: "45.2%", width: "48.6%", height: "19.6%" },
      { left: "2.3%", top: "64.3%", width: "44.8%", height: "19.6%" },
      { left: "49.5%", top: "64.3%", width: "48.6%", height: "19.6%" }
    ]
  }
};

export default function PhotoSelectionPage() {
  const { name, code } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { get, post } = useFetch();

  const ref = useRef(null)
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!code) return;

    async function fetchBooking() {
      setLoading(true);
      setError(null);
      try {
        const res = await get(`bookings/${code}`);
        if (!res.status) {
          throw new Error("Gagal memuat data booking.");
        }

        const data = res.data.data;
        const designFile = data.frame_design + '.png' || "flowers.png";

        // Ambil konfigurasi layout frame berdasarkan nama file dari backend
        const config = FRAME_CONFIGS[designFile] || FRAME_CONFIGS["flowers.png"];
        const totalFrames = config.total_frames;

        const fotos = normalizePhotoList(data.fotos);

        setBooking({ ...data, fotos, total_frames: totalFrames, designFile, config });
        setSlots(Array(totalFrames).fill(null));
      } catch (err) {
        setError(err.message || "Terjadi kesalahan.");
        console.log(err)
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [code]);

  function normalizePhotoList(raw) {
    if (!raw) return [];
    let list = raw;
    if (typeof raw === "string") {
      try {
        list = JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(list)) return [];
    return list.map((item, i) =>
      typeof item === "string" ? { id: i, url: item } : { id: item.id ?? i, url: item.url ?? item.path }
    );
  }

  const filledCount = slots.filter(Boolean).length;
  const isComplete = booking ? filledCount === booking.total_frames : false;

  function slotIndexOf(url) {
    // const finalUrl = url.split('/').pop()    
    const targetFormat = `/api/get-photo?path=${url}`;
    return slots.findIndex((s) => s === targetFormat);
  }

  function handlePhotoClick(url) {
    // const finalUrl = url.split('/').pop()
    //gua mau dari storage/booking/123.png jadi 123.png gimana caranya
    const foto = `/api/get-photo?path=${url}`
    const existingIndex = slotIndexOf(foto);

    if (existingIndex !== -1) {
      setSlots((prev) => {
        const next = [...prev];
        next[existingIndex] = null;
        return next;
      });
      return;
    }

    const nextEmptyIndex = slots.findIndex((s) => s === null);
    if (nextEmptyIndex === -1) return;
    setSlots((prev) => {
      const next = [...prev];
      next[nextEmptyIndex] = foto;
      return next;
      // console.log(next)
    });
  }

  function handleSlotClick(index) {
    if (!slots[index]) return;
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function handleReset() {
    setSlots((prev) => prev.map(() => null));
  }

  async function handleConfirm() {
    if (!isComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await post(`bookings/${code}/select-photos`, {
        ordered_photos: slots,
      });

      if (!res.status) {
        alert(res.message);
        return
      }

      // Navigasi ke halaman preview cetak setelah sukses menyimpan ke database
      navigate(`/${name}/select-filter/${code}`);
    } catch (err) {
      setError(err.message || "Gagal menyimpan pilihan foto.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF3DE]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B1B3A]" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF3DE] px-6">
        <div className="text-center">
          <p className="text-[#1B1B3A] font-semibold mb-1">Oops!</p>
          <p className="text-[#6b6b56]">{error}</p>
        </div>
      </div>
    );
  }

  const handleToImage = () => {
    if (ref.current) {
      // Tambahkan konfigurasi cacheBust dan pixelRatio agar gambar tajam dan tidak pecah
      toPng(ref.current, {
        cacheBust: true, // Menghindari masalah cache browser
        pixelRatio: 2    // Menaikkan resolusi gambar agar hasilnya HD / tajam
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `frame-${booking.id || 'result'}.png`; // Tentukan nama berkas hasil unduhan
          link.href = dataUrl;
          document.body.appendChild(link); // Masukkan sementara ke DOM untuk kompatibilitas browser
          link.click();                    // Jalankan aksi klik unduh otomatis
          link.remove();                   // Hapus kembali elemen dari DOM
        })
        .catch((err) => {
          console.error("Gagal membuat gambar:", err);
        });
    }
  };


  return (
    <div className="min-h-screen bg-[#FBF3DE] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[minmax(280px,340px)_1fr] gap-6">

        {/* ---------- LEFT: Realtime Frame Preview (Menggunakan Template PNG Asli) ---------- */}
        <div className="bg-[#FBF3DE] border border-[#e4dcc0] rounded-2xl p-5 flex flex-col items-center">
          <div className="mb-4 flex items-center gap-1">
            <span className="text-2xl font-serif font-bold tracking-wide text-[#e0447b]">
              NU SNAPS
            </span>
            <Camera className="w-5 h-5 text-[#1B1B3A]" />
          </div>

          {/* Container Frame Utama */}
          <div
            className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-[#d3cbaf] w-full max-w-[260px] select-none"
            style={{ aspectRatio: "2/3" }}
            ref={ref}
          >
            {/* Layer 1: Slot foto yang dirender di posisi koordinat absolut (di belakang frame) */}
            {booking.config.slots.map((slot, i) => {
              const url = slots[i];
              return (
                <button
                  key={i}
                  onClick={() => handleSlotClick(i)}
                  style={{
                    position: "absolute",
                    left: slot.left,
                    top: slot.top,
                    width: slot.width,
                    height: slot.height,
                    borderRadius: slot.isRound ? "50%" : "4px",
                    zIndex: 10,
                  }}
                  className={`overflow-hidden flex items-center justify-center transition border border-dashed border-gray-400/50
                    ${url ? "bg-white cursor-pointer hover:opacity-90" : "bg-[#1B1B3A]/5 cursor-default"}`}
                >
                  {url ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${url}`}
                      alt={`Slot ${i + 1}`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="text-[#1B1B3A]/30 text-xs font-bold">{i + 1}</span>
                  )}
                </button>
              );
            })}

            {/* Layer 2: Gambar Template Frame Transparan (di atas foto) */}
            <img
              src={`/templates/${booking.designFile}`}
              alt="Frame Template"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
              onError={(e) => {
                console.error("Gagal memuat template:", e.target.src);
              }}
            />
          </div>

          <p className="mt-4 text-sm text-[#6b6b56] text-center font-medium">
            {filledCount} / {booking.total_frames} Slot Terisi
          </p>
        </div>

        {/* ---------- RIGHT: Photo Picker ---------- */}
        <div className="bg-[#FBF3DE] border border-[#e4dcc0] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-serif font-semibold text-[#1B1B3A] tracking-wide">
                CHOOSE YOUR PHOTO
              </h1>
              {filledCount > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-sm text-[#6b6b56] hover:text-[#1B1B3A] transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>

            {booking.fotos.length === 0 ? (
              <p className="text-[#6b6b56] text-sm">Belum ada foto untuk booking ini.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2">
                {booking.fotos.map((foto) => {
                  const order = slotIndexOf(foto.url);
                  const isSelected = order !== -1;
                  return (
                    <button
                      key={foto.id}
                      onClick={() => handlePhotoClick(foto.url)}
                      disabled={!isSelected && filledCount >= booking.total_frames}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-[#d9d9d9] border-2 transition
                        ${isSelected ? "border-[#e0447b]" : "border-transparent"}
                        ${!isSelected && filledCount >= booking.total_frames ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"}`}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${foto.url}`}
                        alt="Hasil foto"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute top-2 left-2 bg-[#e0447b] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                          {order + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <button
              // onClick={handleToImage}
              onClick={handleConfirm}
              disabled={!isComplete || submitting}
              className={`mt-6 w-full flex items-center justify-center gap-2 rounded-full py-3 font-semibold tracking-wide transition
                ${isComplete ? "bg-[#1B1B3A] text-white hover:bg-[#2a2a52]" : "bg-[#e4dcc0] text-[#a29d84] cursor-not-allowed"}`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isComplete ? "Confirm & Generate Frame" : `Pilih ${booking.total_frames - filledCount} foto lagi`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}