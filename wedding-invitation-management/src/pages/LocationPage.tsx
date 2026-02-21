import { useState } from 'react';

const PRIMARY = '#800020';
const ADDRESS = 'HHW5+29J Cần Đước, Long An, Vietnam';
const LANDMARK = 'Cửa Hàng VLXD Năm Hạnh, Đường tỉnh 835D';
const MAPS_LINK = 'https://maps.app.goo.gl/zeZhd2H683iTon7r9';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95"
            style={{
                borderColor: copied ? '#16a34a' : PRIMARY,
                color: copied ? '#16a34a' : PRIMARY,
                background: copied ? '#f0fdf4' : 'transparent',
            }}
        >
            {copied ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
            <span>{copied ? 'Đã copy' : 'Copy'}</span>
        </button>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${PRIMARY}, #c0003a)` }} />
            <div className="p-4">{children}</div>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: `${PRIMARY}99` }}>
            {children}
        </p>
    );
}

export default function LocationPage() {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: '#fdf8f8' }}
        >
            {/* ── Header ── */}
            <header className="sticky top-0 z-50" style={{ background: `linear-gradient(90deg, ${PRIMARY}, #c0003a)` }}>
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.87 7 21 10.13 21 14V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V14C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base leading-tight">Địa Điểm Tổ Chức</h1>
                        <p className="text-white/60 text-[11px]">Wedding Venue · Cần Đước, Long An</p>
                    </div>
                </div>
            </header>

            {/* ── Hero strip (1 dòng) ── */}
            <div className="py-5 px-4 text-center" style={{ background: `linear-gradient(180deg, ${PRIMARY}10, transparent)` }}>
                <p className="font-bold text-lg text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                    🎊 Kính mời quý khách tham dự lễ cưới
                </p>
            </div>

            {/* ── Content ── */}
            <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-8 space-y-3">

                {/* Địa chỉ */}
                <Card>
                    <SectionLabel>Địa chỉ</SectionLabel>
                    <div className="flex items-start gap-2 mb-3">
                        <p className="flex-1 text-gray-800 font-semibold text-sm leading-relaxed">{ADDRESS}</p>
                        <CopyButton text={ADDRESS} />
                    </div>
                    <a
                        href={MAPS_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY}, #c0003a)` }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Mở Google Maps
                    </a>
                </Card>

                {/* Đi xe công nghệ */}
                <Card>
                    <SectionLabel>Đặt xe Grab / Xanh SM</SectionLabel>

                    {/* App logos */}
                    <div className="flex gap-2.5 mb-3">
                        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCb7jfvtaiulITOpBWFnFOKODijKJySTagwQ&s"
                                alt="Grab"
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                                <p className="font-bold text-gray-800 text-xs">Grab</p>
                                <p className="text-gray-400 text-[11px]">GrabCar / Bike</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                            <img
                                src="https://st.download.com.vn/data/image/2023/04/08/taxi-xanh-sm-200.png"
                                alt="Xanh SM"
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                                <p className="font-bold text-gray-800 text-xs">Xanh SM</p>
                                <p className="text-gray-400 text-[11px]">Taxi / Xe máy</p>
                            </div>
                        </div>
                    </div>

                    {/* Mốc nhập */}
                    <p className="text-xs text-gray-500 mb-2">Nhập điểm đến:</p>
                    <div
                        className="rounded-xl px-3.5 py-3 flex items-center justify-between gap-3"
                        style={{ background: `${PRIMARY}08`, border: `1.5px dashed ${PRIMARY}30` }}
                    >
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{LANDMARK}</p>
                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: PRIMARY }}>
                                📍 Địa điểm tổ chức nằm ngay đối diện
                            </p>
                        </div>
                        <CopyButton text={LANDMARK} />
                    </div>
                </Card>

                {/* Bản đồ */}
                <Card>
                    <SectionLabel>Bản đồ</SectionLabel>
                    <div className="relative rounded-xl overflow-hidden" style={{ paddingTop: '60%' }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.7963088111924!2d106.5558156753076!3d10.595092762511749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317535f67da40c87%3A0xc55735a4149cb82a!2zSEhXNSsyOUosIEPhuqduIMSQxrDhu5tjLCBMb25nIEFuLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1771679804990!5m2!1sen!2s"
                            className="absolute inset-0 w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Wedding Venue Location"
                        />
                    </div>
                </Card>

            </main>
        </div>
    );
}
