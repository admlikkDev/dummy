import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

const CATEGORY_META = {
    warung: {
        name: "Nu's Warung",
        tagline: 'Nuansa dapur & jajanan retro',
        color: '#E9A23B',
        soft: '#FBEBD3',
        image: 'https://loremflickr.com/400/400/warung,indonesia,kitchen?lock=21',
    },
    laundry: {
        name: "Nu's Laundry Room",
        tagline: 'Playful, ruang cuci mesin koin',
        color: '#4FA8D8',
        soft: '#DCEFF9',
        image: 'https://loremflickr.com/400/400/laundromat,laundry?lock=32',
    },
    bedroom: {
        name: "Nu's Bedroom",
        tagline: 'Cozy corner, lampu hangat & bantal',
        color: '#C77DAE',
        soft: '#F6E3EF',
        image: 'https://loremflickr.com/400/400/cozy,bedroom,fairylights?lock=43',
    },
    postcard: {
        name: 'Postcard',
        tagline: 'Frame kartu pos klasik & kalem',
        color: '#5E9C76',
        soft: '#E1EFE6',
        image: 'https://loremflickr.com/400/400/vintage,postcard,travel?lock=54',
    },
};

const themePackets = [
    { category: 'warung', nominal: 35000, base_frames: 2 },
    { category: 'laundry', nominal: 35000, base_frames: 2 },
    { category: 'bedroom', nominal: 35000, base_frames: 2 },
    { category: 'postcard', nominal: 35000, base_frames: 2 },
].map(p => ({ ...p, ...CATEGORY_META[p.category] }));

const PRICE_PER_STRIP = 7500;
const todayStr = () => new Date().toLocaleDateString('en-CA');

export default function BookingPage() {
    const navigate = useNavigate();
    const { get, post } = useFetch();

    const [expandedCategory, setExpandedCategory] = useState(null);
    const [dateByCategory, setDateByCategory] = useState({});
    const [timeByCategory, setTimeByCategory] = useState({});
    const [stripByCategory, setStripByCategory] = useState({});
    const [slotsData, setSlotsData] = useState({});

    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

    const [customerData, setCustomerData] = useState({ name: '', email: '' });
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showCashSuccessModal, setShowCashSuccessModal] = useState(false);
    const [qrisResults, setQrisResults] = useState(null); 
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Rye&family=Nunito:wght@500;600;700;800;900&display=swap';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    const currentDateFor = (category) => dateByCategory[category] || todayStr();

    useEffect(() => {
        if (!expandedCategory) return;
        const date = currentDateFor(expandedCategory);
        fetchSlots(expandedCategory, date);
    }, [expandedCategory, dateByCategory]);

    const fetchSlots = async (category, date) => {
        const key = `${category}_${date}`;
        setSlotsData(prev => ({ ...prev, [key]: { loading: true, slots: [], error: null } }));

        const result = await get(`machines/${category}/slots?date=${date}`);
        if (!result.status) {
            setSlotsData(prev => ({
                ...prev,
                [key]: { loading: false, slots: [], error: result.message || 'Jadwal tidak dapat dimuat.' },
            }));
            return;
        }
        setSlotsData(prev => ({ ...prev, [key]: { loading: false, slots: result.data.slots || [], error: null } }));
    };

    const toggleExpand = (category) => {
        setExpandedCategory(prev => (prev === category ? null : category));
    };

    const handleAddToCart = (packet) => {
        const time = timeByCategory[packet.category];
        const date = currentDateFor(packet.category);
        if (!time) return;

        const stripCount = stripByCategory[packet.category] || 0;
        const totalFrames = packet.base_frames + stripCount;
        const totalAmount = packet.nominal + stripCount * PRICE_PER_STRIP;

        setCart(prev => ([
            ...prev,
            {
                cartId: `${packet.category}-${Date.now()}`,
                category: packet.category,
                name: packet.name,
                color: packet.color,
                date,
                time,
                stripCount,
                totalFrames,
                totalAmount,
            },
        ]));

        setTimeByCategory(prev => ({ ...prev, [packet.category]: null }));
        setStripByCategory(prev => ({ ...prev, [packet.category]: 0 }));
        setExpandedCategory(null);
        setShowCart(true);
    };

    const handleRemoveFromCart = (cartId) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.totalAmount, 0);

    const openCheckout = () => {
        if (cart.length === 0) return;
        setShowCart(false);
        setShowCheckoutModal(true);
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        if (!paymentMethod) {
            alert('Silakan tentukan metode pembayaran!');
            return;
        }

        setLoading(true);

        const itemsPayload = cart.map(item => ({
            category: item.category,
            booking_date: item.date,
            booking_time: item.time,
            total_frames: item.totalFrames,
            total_amount: item.totalAmount
        }));

        try {
            const result = await post('bookings/bulk-checkout', {
                customer_name: customerData.name,
                customer_email: customerData.email,
                payment_method: paymentMethod,
                items: itemsPayload
            });
            console.log(result)

            if (!result.status) {
                // throw new Error(result.message || 'Gagal memproses transaksi.');
                alert(result.message)
                return
            }

            setShowCheckoutModal(false);
            setCart([]);

            if (paymentMethod === 'cash') {
                setShowCashSuccessModal(true);
            } else if (paymentMethod === 'qris') {
                setQrisResults({
                    name: "Total Belanja Gabungan",
                    qrUrl: result.data.payment?.qr_url || null,
                });
            } else {
                if (result.data.payment?.snap_token && window.snap) {
                    window.snap.pay(result.data.payment.snap_token, {
                        onSuccess: function() { navigate('/success'); },
                        onPending: function(res) { console.log('Pending', res); },
                        onError: function(res) { console.error('Error', res); }
                    });
                }
            }
        } catch (error) {
            alert(error.message || 'Terjadi gangguan koneksi sistem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FCFAF6] relative overflow-x-hidden font-sans text-[#3E3228]">
            <style>{`
                .font-wordmark { font-family: 'Rye', cursive; }
                body { font-family: 'Nunito', sans-serif; }
                .strip-frame {
                    box-shadow: 0 1px 2px rgba(62,50,40,0.06), 0 8px 20px -8px rgba(62,50,40,0.18);
                }
                .tape {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-3deg);
                    width: 34px;
                    height: 14px;
                    background: rgba(255,255,255,0.55);
                    border: 1px solid rgba(62,50,40,0.08);
                }
                @media (max-width: 480px) {
                    .safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 84px); }
                }
            `}</style>

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute w-[380px] h-[380px] bg-[#FBD7E3] rounded-full blur-[100px] opacity-30 -top-40 -left-40"></div>
                <div className="absolute w-[320px] h-[320px] bg-[#CDE9F2] rounded-full blur-[100px] opacity-40 -bottom-32 -right-24"></div>
            </div>

            {/* NAVBAR */}
            <nav className="w-full sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-[#3E3228]/10 py-3 px-4 sm:px-8 flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-wordmark text-[#1b5e3a] tracking-wide">Nu Snaps</h1>
                <button
                    type="button"
                    onClick={() => setShowCart(true)}
                    className="relative flex items-center gap-2 bg-[#1b5e3a] text-white font-bold text-xs sm:text-sm pl-3 pr-3.5 py-2.5 rounded-full shadow-md active:scale-95 transition-transform"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.694 2.602-7.152.078-.316-.16-.62-.485-.62H5.106M7.5 14.25L5.106 5.25M7.5 14.25L6.075 19.5m0 0a1.125 1.125 0 102.25 0 1.125 1.125 0 00-2.25 0zm9.75 0a1.125 1.125 0 102.25 0 1.125 1.125 0 00-2.25 0z" />
                    </svg>
                    <span>{cart.length}</span>
                    {cartTotal > 0 && <span className="hidden xs:inline text-[11px] bg-white/20 px-1.5 py-0.5 rounded">Rp {cartTotal.toLocaleString()}</span>}
                </button>
            </nav>

            {/* HERO */}
            <div className="w-full text-center z-10 px-4 pt-10 pb-8">
                <h1 className="text-3xl sm:text-5xl font-wordmark text-[#1b5e3a] mb-3">Welcome to Nu Snaps</h1>
                <p className="font-semibold text-sm text-[#3E3228]/60 max-w-md mx-auto">
                    Pilih tema favoritmu, atur jadwal, lalu bayar sekaligus saat checkout keranjang.
                </p>
            </div>

            {/* LIST PAKET */}
            <div className={`w-full max-w-3xl mx-auto px-4 pb-16 z-10 flex flex-col gap-4 ${showCart || showCheckoutModal || qrisResults || showCashSuccessModal ? '' : 'safe-bottom'}`}>
                {themePackets.map((packet) => {
                    const isExpanded = expandedCategory === packet.category;
                    const date = currentDateFor(packet.category);
                    const key = `${packet.category}_${date}`;
                    const slotState = slotsData[key];
                    const selectedTime = timeByCategory[packet.category];

                    return (
                        <div
                            key={packet.category}
                            className="bg-white rounded-3xl border border-[#3E3228]/10 shadow-sm transition-shadow overflow-hidden"
                            style={isExpanded ? { boxShadow: `0 0 0 2px ${packet.color}33` } : undefined}
                        >
                            <div onClick={() => toggleExpand(packet.category)} className="cursor-pointer select-none active:opacity-90">
                                <div className="relative w-full h-36 sm:h-44" style={{ backgroundColor: packet.soft }}>
                                    <img
                                        src={packet.image}
                                        alt={packet.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none"></div>
                                    <span
                                        className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full shadow-sm"
                                        style={{ backgroundColor: packet.color }}
                                    >
                                        Rp {packet.nominal.toLocaleString()}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        className={`absolute top-3 right-3 w-5 h-5 shrink-0 text-white bg-black/25 rounded-full p-1 backdrop-blur-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                                <div className="px-4 sm:px-5 pt-3 pb-4">
                                    <h3 className="font-extrabold text-base sm:text-lg leading-tight truncate">{packet.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{packet.tagline}</p>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-4 border-t border-gray-100 flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pilih Tanggal</label>
                                        <input 
                                            type="date" 
                                            min={todayStr()} 
                                            value={date} 
                                            onChange={(e) => setDateByCategory(prev => ({ ...prev, [packet.category]: e.target.value }))}
                                            className="w-full border rounded-xl p-3 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2"
                                            style={{ '--tw-ring-color': packet.color }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pilih Jam Tersedia</label>
                                        {slotState?.loading ? (
                                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <div key={i} className="h-10 w-16 shrink-0 rounded-xl bg-gray-100 animate-pulse"></div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
                                                {slotState?.slots?.map(s => (
                                                    <button
                                                        key={s.time}
                                                        type="button"
                                                        disabled={!s.isAvailable}
                                                        onClick={() => setTimeByCategory(prev => ({ ...prev, [packet.category]: s.time }))}
                                                        className={`shrink-0 snap-start px-4 py-2.5 text-xs font-bold rounded-xl transition-all border active:scale-95 ${!s.isAvailable ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed' : selectedTime === s.time ? 'text-white border-transparent shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                                                        style={selectedTime === s.time && s.isAvailable ? { backgroundColor: packet.color } : undefined}
                                                    >
                                                        {s.time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {slotState?.error && <p className="text-xs text-red-500 mt-1">{slotState.error}</p>}
                                        {!slotState?.loading && slotState?.slots?.length === 0 && !slotState?.error && (
                                            <p className="text-xs text-gray-400 mt-1">Tidak ada jam tersedia untuk tanggal ini.</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Ekstra Strip</label>
                                            <span className="text-[11px] text-gray-400">+Rp {PRICE_PER_STRIP.toLocaleString()} / strip</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                type="button" 
                                                onClick={() => setStripByCategory(prev => ({ ...prev, [packet.category]: Math.max(0, (prev[packet.category] || 0) - 2) }))}
                                                className="w-9 h-9 rounded-lg bg-white border border-gray-200 font-bold flex items-center justify-center text-sm active:scale-90 transition-transform"
                                            >-</button>
                                            <span className="font-bold text-sm w-6 text-center">{stripByCategory[packet.category] || 0}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => setStripByCategory(prev => ({ ...prev, [packet.category]: (prev[packet.category] || 0) + 2 }))}
                                                className="w-9 h-9 rounded-lg bg-white border border-gray-200 font-bold flex items-center justify-center text-sm active:scale-90 transition-transform"
                                            >+</button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={!selectedTime}
                                        onClick={() => handleAddToCart(packet)}
                                        className="w-full mt-1 text-white text-sm font-bold py-3.5 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 transition-colors active:scale-[0.98]"
                                        style={selectedTime ? { backgroundColor: packet.color } : undefined}
                                    >
                                        Masukkan Keranjang
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* MOBILE STICKY CART BAR */}
            {!showCart && !showCheckoutModal && !qrisResults && !showCashSuccessModal && cart.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowCart(true)}
                    className="fixed bottom-4 left-4 right-4 z-40 sm:hidden bg-[#1b5e3a] text-white rounded-2xl shadow-xl px-5 py-4 flex items-center justify-between active:scale-[0.98] transition-transform"
                    style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
                >
                    <span className="font-bold text-sm">{cart.length} item di keranjang</span>
                    <span className="font-extrabold text-sm">Rp {cartTotal.toLocaleString()} →</span>
                </button>
            )}

            {/* MODAL KERANJANG */}
            {showCart && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full sm:max-w-md bg-white h-full p-5 sm:p-6 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-bold">Keranjang Belanja</h2>
                            <button onClick={() => setShowCart(false)} className="text-gray-400 font-bold w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                                    <span className="text-3xl">🛍️</span>
                                    <p className="text-sm text-gray-400">Keranjang kosong</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.cartId} className="border p-4 rounded-2xl flex items-center gap-3 bg-gray-50">
                                    <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.date} • Jam {item.time} ({item.stripCount} Ekstra Strip)</p>
                                        <span className="text-xs font-bold text-[#1b5e3a]">Rp {item.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => handleRemoveFromCart(item.cartId)} className="text-red-500 text-xs font-semibold px-2.5 py-1.5 hover:bg-red-50 active:bg-red-100 rounded-lg shrink-0">Hapus</button>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-4 font-bold">
                                <span>Total Pembayaran</span>
                                <span className="text-lg text-[#1b5e3a]">Rp {cartTotal.toLocaleString()}</span>
                            </div>
                            <button disabled={cart.length === 0} onClick={openCheckout} className="w-full bg-[#1b5e3a] text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 active:scale-[0.98] transition-transform">
                                Lanjutkan Checkout Tunggal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TRANSAKSI GABUNGAN */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <form onSubmit={handleProcessPayment} className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl max-h-[92vh] overflow-y-auto">
                        <h2 className="text-xl font-bold">Detail Pembayaran Gabungan</h2>
                        
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nama Pemesan</label>
                            <input required type="text" value={customerData.name} onChange={e => setCustomerData(prev => ({...prev, name: e.target.value}))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/40"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Konfirmasi</label>
                            <input required type="email" value={customerData.email} onChange={e => setCustomerData(prev => ({...prev, email: e.target.value}))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/40"/>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Metode Pembayaran</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['cash', 'qris', 'transfer'].map(method => (
                                    <button type="button" key={method} onClick={() => setPaymentMethod(method)} className={`py-2.5 text-xs font-bold uppercase border rounded-xl transition-all active:scale-95 ${paymentMethod === method ? 'bg-[#1b5e3a] text-white border-transparent' : 'bg-gray-50 border-gray-200'}`}>
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between text-sm font-bold mt-2">
                            <span>Total ({cart.length} item)</span>
                            <span className="text-base text-[#1b5e3a]">Rp {cartTotal.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2 mt-2 sticky bottom-0 bg-white pt-1">
                            <button type="button" onClick={() => setShowCheckoutModal(false)} className="flex-1 bg-gray-100 font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform">Batal</button>
                            <button type="submit" disabled={loading} className="flex-1 bg-[#1b5e3a] text-white font-bold py-3.5 rounded-xl text-sm disabled:bg-gray-300 active:scale-[0.98] transition-transform">
                                {loading ? 'Memproses...' : 'Bayar Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL HASIL QRIS GABUNGAN */}
            {qrisResults && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center flex flex-col items-center gap-4">
                        <h3 className="font-bold text-lg">Scan QRIS Tunggal</h3>
                        <p className="text-xs text-gray-500">Silakan scan kode QR di bawah ini untuk membayar seluruh pesanan Anda sekaligus</p>
                        {qrisResults.qrUrl ? (
                            <img src={qrisResults.qrUrl} alt="QRIS Code" className="w-52 h-52 border p-2 rounded-2xl shadow-sm"/>
                        ) : (
                            <p className="text-red-500 text-sm font-bold">Gagal generate gambar QRIS.</p>
                        )}
                        <button onClick={() => setQrisResults(null)} className="mt-2 w-full bg-[#1b5e3a] text-white font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-transform">Selesai</button>
                    </div>
                </div>
            )}

            {/* MODAL SUKSES CASH */}
            {showCashSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center flex flex-col gap-3">
                        <div className="text-3xl">🏪</div>
                        <h3 className="font-bold text-lg">Booking Berhasil Dicatat!</h3>
                        <p className="text-sm text-gray-500">Silakan menuju ke kasir studio Nu Snaps dan lakukan pembayaran tunai untuk konfirmasi final.</p>
                        <button onClick={() => setShowCashSuccessModal(false)} className="w-full bg-[#1b5e3a] text-white font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-transform">Mengerti</button>
                    </div>
                </div>
            )}
        </div>
    );
}