import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const PRIMARY = '#800020';
const GOLD = '#c9a44a';

export default function InvitationPage() {
    const { hash } = useParams<{ hash?: string }>();
    const location = useLocation();
    const [sheet, setSheet] = useState(0); // 0=closed 1=letter
    const [flipped, setFlipped] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [guestName, setGuestName] = useState<string>('');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (hash) {
            try {
                // Giải mã Base64 hash
                const decodedStr = decodeURIComponent(atob(hash));
                const parts = decodedStr.split('|');
                if (parts.length >= 2) {
                    // Phần đầu là ID, phần sau là Tên (Trường hợp tên có dấu | thì join lại)
                    const name = parts.slice(1).join('|');
                    setGuestName(name);
                } else {
                    setHasError(true);
                }
            } catch (error) {
                console.error("Invalid invitation hash");
                setHasError(true);
            }
        } else {
            // Hỗ trợ backwards compatibility (nếu cần)
            const searchParams = new URLSearchParams(location.search);
            const nameEncoded = searchParams.get('k');

            if (nameEncoded) {
                try {
                    const decodedName = decodeURIComponent(atob(nameEncoded));
                    setGuestName(decodedName);
                } catch (error) {
                    console.error("Invalid encoded name URL");
                    setHasError(true);
                }
            } else {
                const nameParam = searchParams.get('name');
                if (nameParam) {
                    setGuestName(nameParam);
                }
            }
        }
    }, [hash, location.search]);

    const close = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSheet(0);
            setIsClosing(false);
        }, 300);
    };

    if (hasError) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#1a0008 0%,#3d0015 50%,#1a0008 100%)', padding: '24px 16px', fontFamily: "'Be Vietnam Pro',sans-serif" }}>
                <div style={{ background: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 style={{ color: PRIMARY, fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', fontFamily: "'Be Vietnam Pro',sans-serif" }}>Thiệp Không Hợp Lệ</h2>
                    <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6' }}>Rất tiếc, đường dẫn thiệp mời này không đúng hoặc đã bị chỉnh sửa sai lệch. Vui lòng kiểm tra lại link bạn nhận được.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#1a0008 0%,#3d0015 50%,#1a0008 100%)', padding: '24px 16px', fontFamily: "'Be Vietnam Pro',sans-serif" }}>

            {/* ── 3D Card ── */}
            <div style={{ width: '100%', maxWidth: 540, perspective: '1200px' }}>
                <div style={{ width: '100%', aspectRatio: '5/3', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.85s cubic-bezier(0.4,0.2,0.2,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

                    {/* Front */}
                    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(150deg,#800020 0%,#6b0018 50%,#4d0012 100%)', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 36px' }}>
                        <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${GOLD},#f0d090,${GOLD})`, zIndex: 20, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${GOLD},#f0d090,${GOLD})`, zIndex: 20, pointerEvents: 'none' }} />
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Save Our Day</p>
                        <div style={{ width: 40, height: '0.5px', background: 'rgba(255,255,255,0.3)', marginBottom: 10 }} />
                        <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(24px,6.5vw,38px)', color: 'rgba(255,255,255,0.95)', lineHeight: 1.1, textAlign: 'center', marginBottom: 12, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>Hồng Ngọc &amp; Hoàng Sơn</p>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, letterSpacing: '0.2em', fontWeight: 600, marginBottom: 40 }}>24.05.2026</p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 8.5, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Kính Mời</p>
                        {guestName && (
                            <p style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontSize: 13, fontWeight: 700, color: '#f0d090', marginBottom: 12, letterSpacing: '0.05em', textAlign: 'center' }}>
                                {guestName}
                            </p>
                        )}
                        <div style={{ width: 140, borderBottom: '1px dashed rgba(255,255,255,0.35)', marginTop: guestName ? 0 : 4 }} />
                    </div>

                    {/* Back */}
                    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(150deg,#800020 0%,#6b0018 50%,#4d0012 100%)', boxShadow: '0 40px 90px rgba(0,0,0,0.7)' }}>
                        <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${GOLD},#f0d090,${GOLD})`, zIndex: 5 }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${GOLD},#f0d090,${GOLD})`, zIndex: 5 }} />
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 540 324" preserveAspectRatio="none">
                            <path d="M0 324 L270 180 L540 324Z" fill="rgba(0,0,0,0.18)" />
                            <path d="M0 0 L270 155 L540 0Z" fill="rgba(0,0,0,0.12)" />
                            <path d="M0 0 L0 324 L270 162Z" fill="rgba(0,0,0,0.08)" />
                            <path d="M540 0 L540 324 L270 162Z" fill="rgba(0,0,0,0.08)" />
                            <line x1="0" y1="0" x2="270" y2="162" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                            <line x1="540" y1="0" x2="270" y2="162" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                            <line x1="0" y1="324" x2="270" y2="162" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                            <line x1="540" y1="324" x2="270" y2="162" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(201,164,74,0.18)', border: `1.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontSize: 26, boxShadow: '0 0 20px rgba(201,164,74,0.3)' }}>囍</div>
                        </div>

                        {/* QR Location inside back card bottom right */}
                        <div
                            style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderRadius: 10, padding: '8px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', border: `1.5px solid ${GOLD}60`, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); window.open('https://wedding-ngoc.vercel.app/location', '_blank'); }}
                        >
                            <img src="/QR_wedding.jpg" alt="QR Map" style={{ width: 44, height: 44, display: 'block', borderRadius: 4 }} />
                            <div style={{ paddingRight: 4 }}>
                                <p style={{ fontSize: 9.5, color: PRIMARY, fontWeight: 800, marginBottom: 2, letterSpacing: '0.02em' }}>📍 Chỉ đường</p>
                                <p style={{ fontSize: 7.5, color: '#666', lineHeight: 1.3, maxWidth: 90 }}>Quét mã hoặc<br />nhấn vào đây</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Buttons ── */}
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button onClick={() => { setFlipped(false); setSheet(1); }} style={{ padding: '9px 22px', borderRadius: 22, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: `linear-gradient(135deg,${PRIMARY},#a0002a)`, color: 'white', border: `1.5px solid ${PRIMARY}`, boxShadow: '0 4px 14px rgba(128,0,32,0.45)' }}>📩 Mở thư</button>
                <button onClick={() => { setSheet(0); setFlipped(o => !o); }} style={{ padding: '9px 22px', borderRadius: 22, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,255,255,0.25)' }}>{flipped ? '↩ Mặt trước' : '🗺 Quay mặt sau'}</button>
            </div>

            {/* ════ TỜ 1 — Landscape 2 cột ════ */}
            {sheet >= 1 && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,0,8,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '30px 16px', overflowY: 'auto', animation: isClosing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease' }} onClick={close}>
                    <div style={{ width: '100%', maxWidth: 860, margin: 'auto', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: `0 40px 100px rgba(0,0,0,0.6),0 0 0 1.5px ${GOLD}60`, animation: isClosing ? 'slideDown 0.3s ease forwards' : 'slideUp 0.35s ease' }} onClick={e => e.stopPropagation()}>

                        {/* 2-column body */}
                        <div className="invite-container">

                            {/* ── CỘT TRÁI ── */}
                            <div className="invite-left">
                                {/* Title */}
                                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                                    <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 36, color: PRIMARY, lineHeight: 1 }}>Wedding</p>
                                    <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#bbb', marginTop: 2 }}>I N V I T A T I O N</p>
                                </div>


                                {/* Nhà Gái / Nhà Trai */}
                                <div style={{ display: 'flex', gap: 6, paddingBottom: 10, borderBottom: `1px dashed ${PRIMARY}20`, marginBottom: 12, fontSize: 8.5, textAlign: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 7.5, color: '#bbb', letterSpacing: '0.1em', marginBottom: 3 }}>NHÀ GÁI</p>
                                        <p style={{ fontWeight: 700, color: '#444', fontSize: 9, lineHeight: 1.6 }}>Ông Lưu Hoài Phương<br />Bà Lê Ngọc Điệp</p>
                                        <p style={{ fontSize: 7.5, color: '#888', marginTop: 2 }}>Quận 11, TP.HCM</p>
                                    </div>
                                    <div style={{ width: 1, background: `${PRIMARY}15`, margin: '0 4px' }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 7.5, color: '#bbb', letterSpacing: '0.1em', marginBottom: 3 }}>NHÀ TRAI</p>
                                        <p style={{ fontWeight: 700, color: '#444', fontSize: 9, lineHeight: 1.6 }}>Ông Vũ Mạnh Hùng<br />Bà Nguyễn Thị Tám</p>
                                        <p style={{ fontSize: 7.5, color: '#888', marginTop: 2 }}>Hoàng Mai, Hà Nội</p>
                                    </div>
                                </div>

                                {/* Couple announcement */}
                                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <p style={{ fontSize: 9, letterSpacing: '0.25em', color: '#bbb', marginBottom: 8, textTransform: 'uppercase' }}>Trân Trọng Báo Tin</p>
                                    <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 38, color: PRIMARY, lineHeight: 1.1, marginBottom: 8 }}>Lễ Vu Quy</p>
                                    <p style={{ fontSize: 9, color: '#bbb', marginBottom: 12, letterSpacing: '0.12em' }}>của con chúng tôi</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                                        <div style={{ flex: 1, height: '0.5px', background: `${PRIMARY}20` }} /><span style={{ color: GOLD, fontSize: 9 }}>✦</span><div style={{ flex: 1, height: '0.5px', background: `${PRIMARY}20` }} />
                                    </div>
                                    <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(18px,4vw,25px)', color: PRIMARY, lineHeight: 1.2, marginBottom: 0 }}>Hồng Ngọc</p>
                                    <p style={{ fontSize: 9, color: '#888', marginBottom: 4, fontStyle: 'italic' }}>(Trưởng nữ)</p>
                                    <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 32, color: GOLD, lineHeight: 1, marginBottom: 4 }}>&amp;</p>
                                    <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(18px,4vw,25px)', color: PRIMARY, lineHeight: 1.2, marginBottom: 0 }}>Hoàng Sơn</p>
                                    <p style={{ fontSize: 9, color: '#888', marginBottom: 12, fontStyle: 'italic' }}>(Trưởng nam)</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div style={{ flex: 1, height: '0.5px', background: `${PRIMARY}20` }} /><span style={{ color: GOLD, fontSize: 9 }}>❧</span><div style={{ flex: 1, height: '0.5px', background: `${PRIMARY}20` }} />
                                    </div>
                                </div>
                            </div>

                            {/* ── CỘT PHẢI ── */}
                            <div className="invite-right">
                                <p style={{ fontSize: 8.5, color: '#888', lineHeight: 1.9, marginBottom: 12 }}>
                                    ĐẾN DỰ BUỔI TIỆC RƯỢU CHUNG VUI<br />CÙNG GIA ĐÌNH CHÚNG TÔI TẠI:
                                </p>

                                <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 26, color: PRIMARY, lineHeight: 1.1, marginBottom: 8 }}>Tư Gia Nhà Gái</p>

                                <p style={{ fontSize: 9, fontWeight: 800, color: '#333', letterSpacing: '0.04em', marginBottom: 3 }}>Xã Phước Vân, huyện Cần Đước, tỉnh Long An</p>
                                <p style={{ fontSize: 8, color: '#aaa', marginBottom: 14 }}>(nay là xã Long Cang, tỉnh Tây Ninh)</p>

                                {/* Time slots — elegant */}
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        <div style={{ flex: 1, height: '0.5px', background: `${PRIMARY}25` }} />
                                        <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 10, color: '#bbb', letterSpacing: '0.05em' }}>Chương trình</p>
                                        <div style={{ flex: 1, height: '0.5px', background: `${PRIMARY}25` }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div style={{ flex: 1, borderLeft: `2.5px solid ${PRIMARY}`, paddingLeft: 8, textAlign: 'left' }}>
                                            <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 13, color: '#888', lineHeight: 1.2 }}>Đón Khách</p>
                                            <p style={{ fontSize: 18, fontWeight: 900, color: PRIMARY, lineHeight: 1.1, letterSpacing: '-0.02em' }}>16:00</p>
                                        </div>
                                        <div style={{ width: 1, background: `${PRIMARY}15` }} />
                                        <div style={{ flex: 1, borderLeft: `2.5px solid ${GOLD}`, paddingLeft: 8, textAlign: 'left' }}>
                                            <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 13, color: '#888', lineHeight: 1.2 }}>Đãi Tiệc</p>
                                            <p style={{ fontSize: 18, fontWeight: 900, color: PRIMARY, lineHeight: 1.1, letterSpacing: '-0.02em' }}>17:00</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Date block */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                                    <div style={{ flex: 1, height: '1.5px', background: PRIMARY, borderRadius: 2 }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.12em' }}>CHỦ NHẬT</p>
                                        <p style={{ fontSize: 36, fontWeight: 900, color: PRIMARY, lineHeight: 1 }}>24</p>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>05</p>
                                    </div>
                                    <p style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.08em', lineHeight: 1.5 }}>NĂM<br />2026</p>
                                    <div style={{ flex: 1, height: '1.5px', background: PRIMARY, borderRadius: 2 }} />
                                </div>
                                <p style={{ fontSize: 8, color: '#bbb', fontStyle: 'italic', marginBottom: 10 }}>(Nhằm ngày 8 tháng 4 năm Bính Ngọ)</p>

                                <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 12, color: '#777', lineHeight: 1.8, marginBottom: 8 }}>
                                    Sự hiện diện của Quý Khách<br />là niềm vinh hạnh cho gia đình chúng tôi!
                                </p>
                                <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: 20, color: PRIMARY }}>Kính Mời!</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ background: '#f9f5f5', padding: '12px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid #eee' }}>
                            <button onClick={close} style={{ padding: '8px 24px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: `linear-gradient(135deg,${PRIMARY},#a0002a)`, color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(128,0,32,0.3)' }}>Đóng Thư Mời</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes fadeOut { from{opacity:1} to{opacity:0} }
                @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
                @keyframes slideDown { from{transform:translateY(0);opacity:1} to{transform:translateY(20px);opacity:0} }

                .invite-container {
                    display: flex;
                    min-height: 480px;
                    flex-direction: row;
                }
                .invite-left {
                    flex: 0 0 46%;
                    background: #fdfafa;
                    display: flex;
                    flex-direction: column;
                    border-right: 1.5px solid ${PRIMARY}15;
                    padding: 22px 20px;
                }
                .invite-right {
                    flex: 0 0 54%;
                    padding: 22px 22px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                }
                
                @media (max-width: 768px) {
                    .invite-container {
                        flex-direction: column;
                        min-height: auto;
                    }
                    .invite-left {
                        flex: 0 0 auto;
                        border-right: none;
                        border-bottom: 1.5px dashed ${PRIMARY}20;
                        padding: 32px 16px 24px;
                    }
                    .invite-right {
                        flex: 0 0 auto;
                        padding: 24px 16px 32px;
                    }
                }
            `}</style>
        </div>
    );
}
