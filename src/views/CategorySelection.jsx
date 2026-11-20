import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';

const bubbleFont = { fontFamily: '"Baloo 2", ui-rounded, "Nunito", sans-serif' };

const gridBackgroundStyle = {
    backgroundColor: '#FFF6ED',
    backgroundImage: `
        radial-gradient(circle at 12% 8%, rgba(246,175,199,0.25), transparent 32%),
        radial-gradient(circle at 88% 92%, rgba(147,197,253,0.18), transparent 32%),
        linear-gradient(to right, #F3E1CE 1px, transparent 1px),
        linear-gradient(to bottom, #F3E1CE 1px, transparent 1px)
    `,
    backgroundSize: 'auto, auto, 24px 24px, 24px 24px',
};

const CATEGORIES = [
    { 
        key: 'supermarket', 
        label: 'Supermarket', 
        bgColor: 'bg-[#E3F2FD]', 
        borderColor: 'border-[#90CAF9]',
        packageName: 'Photoboot A (Supermarket)',
        imgUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
        maxShoot: 'Max 8x Shoot',
        digitalCopy: 'All Digital Copies',
        photoPrint: '1 Photo Print',
        maxPerson: 'Max. 5 Person',
        priceLabel: 'Rp 45.000',
        numericPrice: 45000,
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#1E88E5" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 00-20.713 0m-2.76 0L5.703 16.512M12 14.25a3 3 0 003-3v-4.5A3 3 0 0012 3.75v10.5z" />
            </svg>
        )
    },
    { 
        key: 'packing', 
        label: 'Packing', 
        bgColor: 'bg-[#FFF3E0]', 
        borderColor: 'border-[#FFB74D]',
        packageName: 'Photoboot B (Packing)',
        imgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60',
        maxShoot: 'Max 10x Shoot',
        digitalCopy: 'All Digital Copies',
        photoPrint: '2 Photo Print',
        maxPerson: 'Max. 4 Person',
        priceLabel: 'Rp 60.000',
        numericPrice: 60000,
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#F57C00" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
        )
    },
    { 
        key: 'living', 
        label: 'Living', 
        bgColor: 'bg-[#E8F5E9]', 
        borderColor: 'border-[#81C784]',
        packageName: 'Photoboot C (Living)',
        imgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60',
        maxShoot: 'Max 8x Shoot',
        digitalCopy: 'Standard Digital Copies',
        photoPrint: '1 Photo Print',
        maxPerson: 'Max. 3 Person',
        priceLabel: 'Rp 40.000',
        numericPrice: 40000,
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#388E3C" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        )
    },
    { 
        key: 'studio', 
        label: 'Studio', 
        bgColor: 'bg-[#F3E5F5]', 
        borderColor: 'border-[#BA68C8]',
        packageName: 'Photoboot VIP (Studio)',
        imgUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500&auto=format&fit=crop&q=60',
        maxShoot: 'Unlimited Shoot (5 Mins)',
        digitalCopy: 'All Digital Copies',
        photoPrint: '4 Photo Print',
        maxPerson: 'Max. 8 Person',
        priceLabel: 'Rp 100.000',
        numericPrice: 100000,
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#7B1FA2" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.747 6.747 0 00-3.42-3.42" />
            </svg>
        )
    },
];

const Icons = {
    Camera: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#E3628A" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
    ),
    Folder: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#E3628A" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0A2.25 2.25 0 004.5 15h15a2.25 2.25 0 002.25-2.25m-19.5 0v.158c0 .538.214 1.055.596 1.438l.705.705a1.5 1.5 0 001.061.44h13.157c.398 0 .78-.158 1.06-.44l.706-.705c.382-.383.596-.9.596-1.438V12.75M5.25 9.75V6.108c0-.202.12-.381.304-.467a19.206 19.206 0 017.394-1.466c2.6 0 5.091.516 7.394 1.466a.47.47 0 01.304.467V9.75" /></svg>
    ),
    Frame: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#E3628A" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 018 20.25H6A2.25 2.25 0 013.75 18V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75v16.5M15 3.75v16.5M3.75 9h16.5M3.75 15h16.5" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#E3628A" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a.75.75 0 000-1.5 11.95 11.95 0 00-6.75-2.06 11.95 11.95 0 00-6.75 2.06.75.75 0 000 1.5h13.5zM12 11.25a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75zM21 16.5c0-1.35-.635-2.557-1.635-3.342a5.593 5.593 0 00-2.615-.818 7.493 7.493 0 013.5 6.16.75.75 0 001.5 0v-2zM16.5 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
    ),
    Wallet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#E3628A" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
    ),
    Sparkle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 2l1.6 5.9L19.5 9.5 13.6 11.1 12 17l-1.6-5.9L4.5 9.5l5.9-1.6L12 2z" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
    ),
};

export default function CategorySelection() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { post } = useFetch();
    
    const [activePreview, setActivePreview] = useState(null);
    // State kendali view di dalam modal ('details' atau 'form')
    const [modalStep, setModalStep] = useState('details'); 
    const [formData, setFormData] = useState({ customer_name: '', customer_email: '' });

    // if (!user || !user.token) return <Navigate to="/" replace />;

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCloseModal = () => {
        setActivePreview(null);
        setModalStep('details');
        setFormData({ customer_name: '', customer_email: '' });
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (loading || !formData.customer_name) return;

        setError(null);
        setLoading(true);

        const payload = {
            customer_name: formData.customer_name,
            customer_email: formData.customer_email || null,
            category: activePreview.key,
            total_frames: 2, // Default frame value
            total_amount: activePreview.numericPrice
        };
        const res = await post(`bookings`, payload);
        if (!res.status) {
            setError(res.message)
            return
        }
        setLoading(false)
        navigate(`/${activePreview.key}/${res.data.booking_id}/package`);
    };

    return (
        <div style={gridBackgroundStyle} className="min-h-screen flex items-center justify-center p-4">
            <style>{`
                @keyframes ns-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes ns-pop-in { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes ns-card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes ns-float { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-4px) rotate(-2deg); } }
                .ns-modal-backdrop { animation: ns-fade-in 0.18s ease-out; }
                .ns-modal-card { animation: ns-pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
                .ns-cat-card { animation: ns-card-in 0.4s ease-out both; }
                .ns-poster { animation: ns-float 3.5s ease-in-out infinite; }
                .ns-cat-card:focus-visible, .ns-btn:focus-visible {
                    outline: 3px solid #F6AFC7;
                    outline-offset: 2px;
                }
            `}</style>
            <div
                className="w-full max-w-md bg-[#FFFDF9] border-[6px] border-[#F7DCE7] rounded-[2.5rem] p-8 shadow-[0_16px_32px_-6px_rgba(74,50,38,0.18)] relative overflow-hidden"
                style={bubbleFont}
            >
                {/* Decorative corner sparkle */}
                <div className="absolute -top-3 -right-3 w-14 h-14 bg-[#FFE8B6] rounded-full blur-2xl opacity-70 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#BFE3FF] rounded-full blur-2xl opacity-60 pointer-events-none" />

                {/* Header Title */}
                <div className="text-center mb-6 relative">
                    <div className="inline-flex items-center gap-1.5 text-[#E3628A] mb-1">
                        <Icons.Sparkle />
                        <span className="text-[11px] font-extrabold tracking-[0.2em] uppercase">Photobooth Booking</span>
                        <Icons.Sparkle />
                    </div>
                    <h1 className="text-4xl font-black tracking-wide text-[#4A3226] drop-shadow-[0_2px_0_rgba(246,175,199,0.5)]">NU SNAPS</h1>
                    <div className="w-16 h-1.5 bg-gradient-to-r from-[#F6AFC7] to-[#FBD0DE] rounded-full mx-auto mt-2" />
                </div>

                {/* Progress Step Indicator */}
                <div className="relative flex items-center justify-between bg-[#FFF6ED] border border-[#F0D5B1] rounded-2xl px-4 py-3 mb-6">
                    <div className="absolute left-[16%] right-[16%] top-1/2 -translate-y-[calc(50%+9px)] h-[2px] bg-[#F0D5B1] -z-0" />
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold shadow-[0_2px_0_rgba(74,50,38,0.3)]">1</span>
                        <p className="text-[11px] font-extrabold text-[#4A3226]">Pilih Paket</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 relative z-10 opacity-45">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                        <p className="text-[11px] font-bold text-[#4A3226]">Custom</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 relative z-10 opacity-45">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold">3</span>
                        <p className="text-[11px] font-bold text-[#4A3226]">Bayar</p>
                    </div>
                </div>

                <p className="text-center text-base font-black text-[#4A3226] mb-5">Silahkan Pilih Kategori</p>

                {error && modalStep === 'details' && (
                    <div className="bg-[#FFEEEF] border border-[#E3628A] rounded-xl p-2.5 mb-4 text-center">
                        <p className="text-xs font-bold text-[#E3628A]">{error}</p>
                    </div>
                )}

                {/* Grid Layout 4 Kotak Utama */}
                <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.key}
                            type="button"
                            onClick={() => setActivePreview(cat)}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className={`
                                ns-cat-card group relative flex flex-col items-center justify-center text-center p-5 rounded-3xl transition-all duration-200
                                border-[3px] ${cat.borderColor} ${cat.bgColor}
                                shadow-[0_6px_0_0_rgba(74,50,38,0.15)]
                                hover:shadow-[0_9px_0_0_rgba(74,50,38,0.2)] hover:-translate-y-1
                                active:shadow-[0_2px_0_0_rgba(74,50,38,0.15)] active:translate-y-1
                            `}
                        >
                            <span className="absolute top-2 right-2 text-[9px] font-black text-[#4A3226]/40 tracking-widest">{cat.priceLabel}</span>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 border-2 border-[#4A3226]/5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                                {cat.svgIcon}
                            </div>
                            <span className="font-extrabold text-base text-[#4A3226] block leading-tight">{cat.label}</span>
                            <span className="text-[10px] font-bold text-[#4A3226]/50 mt-0.5">{cat.maxPerson}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* DYNAMIC MODAL PREVIEW & IDENTITY FORM */}
            {activePreview && (
                <div className="ns-modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" style={bubbleFont}>
                    <div className="ns-modal-card w-full max-w-sm bg-white rounded-[2.5rem] border-[4px] border-[#F7DCE7] overflow-hidden shadow-2xl flex flex-col my-auto">
                        
                        {/* Atas: Gambar Poster / Header Tergantung Step */}
                        <div className="bg-gradient-to-br from-[#F6AFC7] to-[#F499B8] p-6 flex justify-center items-center min-h-[200px] relative overflow-hidden">
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-8 -right-4 w-28 h-28 bg-white/10 rounded-full" />
                            <button 
                                type="button" 
                                onClick={handleCloseModal}
                                className="ns-btn absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white text-[#4A3226] rounded-full font-black text-sm flex items-center justify-center shadow-sm z-10 transition-transform hover:scale-110 active:scale-95"
                            >
                                ✕
                            </button>
                            {modalStep === 'details' ? (
                                <img 
                                    src={activePreview.imgUrl} 
                                    alt={activePreview.packageName}
                                    className="ns-poster w-36 h-auto object-cover rounded-md shadow-lg border-4 border-white relative z-10"
                                />
                            ) : (
                                <div className="text-center text-white px-2 relative z-10">
                                    <h2 className="text-2xl font-black tracking-wide drop-shadow-sm">DATA DIRIMU</h2>
                                    <p className="text-xs font-bold text-white/80 mt-1">Satu langkah lagi sebelum masuk ke studio snaps!</p>
                                </div>
                            )}
                        </div>

                        {/* Bawah: Konten Dinamis */}
                        <div className="p-6 flex flex-col bg-white">
                            {error && (
                                <div className="bg-[#FFEEEF] border border-[#E3628A] rounded-xl p-2 mb-3 text-center">
                                    <p className="text-xs font-bold text-[#E3628A]">{error}</p>
                                </div>
                            )}

                            {modalStep === 'details' ? (
                                /* STEP VIEW A: Spesifikasi Paket */
                                <>
                                    <h3 className="text-xl font-black text-[#E3628A] text-center mb-4">{activePreview.packageName}</h3>
                                    
                                    <div className="space-y-3 text-[#4A3226] font-bold text-sm mb-6 px-1">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-[#FFF6ED] border border-[#F7DCE7] flex items-center justify-center"><Icons.Camera /></span>
                                            <span>{activePreview.maxShoot}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-[#FFF6ED] border border-[#F7DCE7] flex items-center justify-center"><Icons.Folder /></span>
                                            <span>{activePreview.digitalCopy}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-[#FFF6ED] border border-[#F7DCE7] flex items-center justify-center"><Icons.Frame /></span>
                                            <span>{activePreview.photoPrint}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-[#FFF6ED] border border-[#F7DCE7] flex items-center justify-center"><Icons.Users /></span>
                                            <span>{activePreview.maxPerson}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[#E3628A] font-black text-base pt-2 mt-1 border-t border-dashed border-[#F0D5B1]">
                                            <span className="w-7 h-7 rounded-full bg-[#FEECEB] border border-[#F6AFC7] flex items-center justify-center"><Icons.Wallet /></span>
                                            <span>{activePreview.priceLabel}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setModalStep('form')}
                                            className="ns-btn w-full py-3.5 bg-[#F6AFC7] hover:bg-[#F499B8] text-[#4A3226] font-black text-md rounded-2xl border-b-4 border-[#d58ea6] transition active:border-b-0 active:translate-y-1 text-center"
                                        >
                                            Pilih & Lanjutkan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="ns-btn w-full py-2 text-sm text-[#4A3226]/60 font-bold hover:text-[#4A3226] transition text-center"
                                        >
                                            Kembali ke Kategori
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* STEP VIEW B: Form Pengisian Identitas */
                                <form onSubmit={handleFinalSubmit} className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-extrabold text-[#4A3226] pl-1">Nama Lengkap *</label>
                                        <input
                                            type="text"
                                            name="customer_name"
                                            required
                                            value={formData.customer_name}
                                            onChange={handleFormChange}
                                            placeholder="Masukkan namamu..."
                                            className="w-full px-4 py-2.5 bg-[#FFF6ED] border-2 border-[#F0D5B1] focus:border-[#F6AFC7] rounded-xl font-bold text-[#4A3226] outline-none placeholder-[#4A3226]/30 text-sm transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-extrabold text-[#4A3226] pl-1">Email (Opsional)</label>
                                        <input
                                            type="email"
                                            name="customer_email"
                                            value={formData.customer_email}
                                            onChange={handleFormChange}
                                            placeholder="nama@email.com"
                                            className="w-full px-4 py-2.5 bg-[#FFF6ED] border-2 border-[#F0D5B1] focus:border-[#F6AFC7] rounded-xl font-bold text-[#4A3226] outline-none placeholder-[#4A3226]/30 text-sm transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading || !formData.customer_name}
                                            className="ns-btn w-full py-3.5 bg-[#F6AFC7] hover:bg-[#F499B8] text-[#4A3226] font-black text-md rounded-2xl border-b-4 border-[#d58ea6] transition active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-[#4A3226]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Membuat Sesi...
                                                </>
                                            ) : (
                                                <>
                                                    <Icons.Check />
                                                    Mulai Sesi Foto
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setModalStep('details')}
                                            disabled={loading}
                                            className="ns-btn w-full py-1 text-xs text-[#4A3226]/50 font-bold hover:text-[#4A3226] transition text-center"
                                        >
                                            Lihat Detail Paket Kembali
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}