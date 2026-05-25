import { useState, useEffect, useRef } from "react";

const C = {
  lightest: "#D7CCC8", light: "#BCAAA4", mid: "#A1887F",
  dark: "#8D6E63", darkest: "#795548", cream: "#FAF7F5",
  white: "#FFFFFF", text: "#3E2723", textMid: "#5D4037", textSoft: "#795548",
};

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.cream}; color: ${C.text}; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.lightest}; }
  ::-webkit-scrollbar-thumb { background: ${C.mid}; border-radius: 3px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes spin   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }

  .fade-up  { animation: fadeUp  0.55s ease both; }
  .fade-in  { animation: fadeIn  0.4s ease both; }
  .slide-up { animation: slideUp 0.35s ease both; }
  .slide-in { animation: slideIn 0.35s ease both; }
  .delay-1 { animation-delay:0.08s; } .delay-2 { animation-delay:0.16s; }
  .delay-3 { animation-delay:0.24s; } .delay-4 { animation-delay:0.32s; }
  .delay-5 { animation-delay:0.40s; }

  a { text-decoration:none; color:inherit; cursor:pointer; }
  button { cursor:pointer; border:none; outline:none; font-family:inherit; }
  input, select, textarea { font-family:inherit; outline:none; }

  /* ── Mobile-first media queries ── */
  .hide-mobile { display: none !important; }
  @media (min-width: 768px) {
    .hide-mobile  { display: flex !important; }
    .hide-desktop { display: none !important; }
  }

  /* Bottom nav */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,247,245,0.97); backdrop-filter: blur(12px);
    border-top: 1px solid ${C.lightest};
    display: flex; justify-content: space-around; align-items: center;
    padding: 8px 0 max(8px, env(safe-area-inset-bottom));
    height: 64px;
  }
  @media (min-width: 768px) { .bottom-nav { display: none !important; } }

  /* Touch targets */
  .touch-target { min-height: 48px; min-width: 48px; }

  /* Mobile card */
  @media (max-width: 767px) {
    .doctor-grid { grid-template-columns: 1fr !important; }
    .hero-grid   { grid-template-columns: 1fr !important; }
    .hero-card   { display: none !important; }
    .profile-grid { grid-template-columns: 1fr !important; }
    .stats-grid  { grid-template-columns: repeat(2,1fr) !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .about-grid  { grid-template-columns: repeat(2,1fr) !important; }
    .booking-sticky { position: static !important; }
    .footer-grid { flex-direction: column !important; gap: 28px !important; }
  }
`;
const styleEl = document.createElement("style");
styleEl.textContent = globalCSS;
document.head.appendChild(styleEl);

// ── Data ──────────────────────────────────────────────────────────────────────
const DOCTORS = [
  { id:1,  name:"Dr. Amara Osei",      specialty:"Cardiologist",        rating:4.9, reviews:312, fee:85,  exp:14, img:"AO", available:true,  bio:"Board-certified cardiologist with expertise in preventive cardiology and heart failure management.", slots:["09:00","10:00","11:00","14:00","15:00"] },
  { id:2,  name:"Dr. Leila Nouri",     specialty:"Dermatologist",       rating:4.8, reviews:241, fee:75,  exp:9,  img:"LN", available:true,  bio:"Specialises in medical and cosmetic dermatology. Passionate about skin health and evidence-based treatments.", slots:["08:00","09:30","13:00","16:00"] },
  { id:3,  name:"Dr. Samuel Obeng",    specialty:"Neurologist",         rating:4.7, reviews:189, fee:95,  exp:17, img:"SO", available:false, bio:"Expert in headache disorders, epilepsy, and neurodegenerative diseases with a holistic care philosophy.", slots:[] },
  { id:4,  name:"Dr. Priya Sharma",    specialty:"Pediatrician",        rating:5.0, reviews:408, fee:65,  exp:12, img:"PS", available:true,  bio:"Dedicated children's health advocate. Trained at Johns Hopkins. Mother of two.", slots:["08:30","10:30","12:00","15:30","17:00"] },
  { id:5,  name:"Dr. Marcus Reid",     specialty:"Psychiatrist",        rating:4.8, reviews:274, fee:110, exp:11, img:"MR", available:true,  bio:"Mental health specialist focusing on anxiety, depression, and trauma-informed care.", slots:["10:00","11:30","14:30","16:30"] },
  { id:6,  name:"Dr. Fatima Al-Amin", specialty:"Endocrinologist",     rating:4.6, reviews:156, fee:90,  exp:16, img:"FA", available:true,  bio:"Expert in diabetes, thyroid disorders, and hormonal conditions. Published researcher.", slots:["09:00","13:30","15:00"] },
  { id:7,  name:"Dr. Chen Wei",        specialty:"Orthopedist",         rating:4.7, reviews:203, fee:80,  exp:13, img:"CW", available:false, bio:"Sports medicine and joint replacement specialist. Worked with national athletic teams.", slots:[] },
  { id:8,  name:"Dr. Ingrid Larsson",  specialty:"Gynecologist",        rating:4.9, reviews:367, fee:85,  exp:18, img:"IL", available:true,  bio:"Women's health advocate with expertise in reproductive health and minimally invasive surgery.", slots:["08:00","09:00","11:00","14:00","16:00"] },
  { id:9,  name:"Dr. Kofi Mensah",     specialty:"General Practitioner",rating:4.8, reviews:512, fee:55,  exp:8,  img:"KM", available:true,  bio:"Your trusted family doctor. Comprehensive care for all ages with a warm, approachable style.", slots:["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"] },
  { id:10, name:"Dr. Sofia Ruiz",      specialty:"Ophthalmologist",     rating:4.7, reviews:178, fee:70,  exp:10, img:"SR", available:true,  bio:"Eye health expert specialising in cataract surgery, glaucoma management, and vision correction.", slots:["09:30","11:00","14:30","16:00"] },
  { id:11, name:"Dr. James Asante",    specialty:"Pulmonologist",       rating:4.6, reviews:142, fee:88,  exp:15, img:"JA", available:false, bio:"Respiratory health specialist with expertise in asthma, COPD, and sleep-related breathing disorders.", slots:[] },
  { id:12, name:"Dr. Nadia Petrov",    specialty:"Rheumatologist",      rating:4.8, reviews:195, fee:92,  exp:20, img:"NP", available:true,  bio:"Two decades of experience treating autoimmune and musculoskeletal conditions with precision.", slots:["10:00","12:00","15:00","17:00"] },
];
const SPECIALTIES = ["All", ...new Set(DOCTORS.map(d => d.specialty))];

const avatarColor = (i) => {
  const colors = [["#D7CCC8","#5D4037"],["#BCAAA4","#3E2723"],["#A1887F","#FFF8F6"],["#8D6E63","#FAF7F5"],["#795548","#FAF7F5"],["#D7CCC8","#795548"]];
  return colors[(i.charCodeAt(0) + i.charCodeAt(1)) % colors.length];
};

const ls = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── useIsMobile ───────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 48 }) {
  const [bg, fg] = avatarColor(initials);
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color:fg,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:size*0.35, letterSpacing:"0.04em" }}>
      {initials}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{ color:C.dark, fontSize:13 }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))}
      <span style={{ color:C.textSoft, marginLeft:4 }}>{rating}</span>
    </span>
  );
}

function Badge({ children, color = C.lightest }) {
  return <span style={{ background:color, color:C.textMid, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase" }}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", style:s={}, disabled=false }) {
  const base = { padding:"13px 28px", borderRadius:10, fontSize:15, fontWeight:500, letterSpacing:"0.03em",
    transition:"all 0.2s", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1,
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, minHeight:48 };
  const v = {
    primary:   { background:C.darkest, color:C.cream, border:`2px solid ${C.darkest}` },
    secondary: { background:"transparent", color:C.darkest, border:`2px solid ${C.darkest}` },
    ghost:     { background:"transparent", color:C.textMid, border:`1px solid ${C.light}` },
    danger:    { background:"#c62828", color:"#fff", border:"2px solid #c62828" },
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{...base,...v[variant],...s}}
      onMouseEnter={e=>{ if(disabled)return; if(variant==="primary"){e.currentTarget.style.background=C.dark;e.currentTarget.style.borderColor=C.dark;} if(variant==="secondary"){e.currentTarget.style.background=C.darkest;e.currentTarget.style.color=C.cream;} if(variant==="ghost"){e.currentTarget.style.background=C.lightest;} }}
      onMouseLeave={e=>{ if(disabled)return; Object.assign(e.currentTarget.style,{...base,...v[variant]}); }}
    >{children}</button>
  );
}

// ── Navbar (desktop only) ─────────────────────────────────────────────────────
function Navbar({ page, setPage, user, setUser }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className="hide-mobile" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:scrolled?"rgba(250,247,245,0.96)":"transparent",
      backdropFilter:scrolled?"blur(12px)":"none",
      borderBottom:scrolled?`1px solid ${C.lightest}`:"none",
      transition:"all 0.3s", padding:"0 5vw",
      flexDirection:"row",
    }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:68, width:"100%" }}>
        <div onClick={()=>setPage("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.mid},${C.darkest})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:C.cream, fontSize:16 }}>✦</span>
          </div>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:C.text }}>
            Consult<em style={{ fontStyle:"italic", color:C.mid }}>MD</em>
          </span>
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          {[["home","Home"],["doctors","Doctors"],["about","About"],[user?"dashboard":"login", user?"Dashboard":"Login"]].map(([id,label])=>(
            <button key={id} onClick={()=>setPage(id)} style={{
              background:"none", border:"none", padding:"8px 16px", fontSize:14,
              fontWeight:page===id?500:400, color:page===id?C.darkest:C.textMid,
              borderBottom:page===id?`2px solid ${C.dark}`:"2px solid transparent",
              transition:"all 0.2s", cursor:"pointer",
            }}>{label}</button>
          ))}
          {user && <button onClick={()=>{setUser(null);ls.set("user",null);setPage("home");}} style={{ background:"none", border:`1px solid ${C.light}`, borderRadius:6, padding:"7px 14px", fontSize:13, color:C.textSoft, cursor:"pointer", marginLeft:4 }}>Sign out</button>}
        </div>
      </div>
    </nav>
  );
}

// ── Mobile Top Bar ────────────────────────────────────────────────────────────
function MobileHeader({ title, onBack, rightAction }) {
  return (
    <div className="hide-desktop" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(250,247,245,0.97)", backdropFilter:"blur(12px)",
      borderBottom:`1px solid ${C.lightest}`,
      height:56, display:"flex", alignItems:"center",
      padding:"0 16px", gap:12,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background:"none", border:"none", fontSize:22, color:C.text, padding:"4px 8px 4px 0", minWidth:36 }}>‹</button>
      )}
      {!onBack && (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.mid},${C.darkest})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:C.cream, fontSize:12 }}>✦</span>
          </div>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:C.text }}>
            Consult<em style={{ fontStyle:"italic", color:C.mid }}>MD</em>
          </span>
        </div>
      )}
      {title && onBack && <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:C.text, flex:1 }}>{title}</span>}
      <div style={{ marginLeft:"auto" }}>{rightAction}</div>
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ page, setPage, user }) {
  const tabs = [
    { id:"home",      icon:"🏠", label:"Home" },
    { id:"doctors",   icon:"🩺", label:"Doctors" },
    { id:"about",     icon:"ℹ️",  label:"About" },
    { id: user ? "dashboard" : "login", icon: user ? "📋" : "👤", label: user ? "Dashboard" : "Login" },
  ];
  return (
    <div className="bottom-nav">
      {tabs.map(t => (
        <button key={t.id} onClick={()=>setPage(t.id)} style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          background:"none", border:"none", flex:1,
          color: page===t.id ? C.darkest : C.textSoft,
          minHeight:48,
        }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight: page===t.id ? 600 : 400, letterSpacing:"0.04em" }}>{t.label}</span>
          {page===t.id && <div style={{ width:18, height:2, borderRadius:2, background:C.darkest, marginTop:1 }} />}
        </button>
      ))}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const isMobile = useIsMobile();
  const features = [
    { icon:"🩺", title:"Expert Doctors",    desc:"Board-certified specialists across 20+ fields, available on your schedule." },
    { icon:"📅", title:"Instant Booking",   desc:"Book same-day or future appointments in under two minutes." },
    { icon:"🎥", title:"Video Consult",     desc:"High-quality video consultations from the comfort of your home." },
    { icon:"🔒", title:"Fully Secure",      desc:"HIPAA-compliant platform with end-to-end encrypted consultations." },
  ];
  const stats = [
    { value:"12,000+", label:"Patients" },
    { value:"98%",     label:"Satisfaction" },
    { value:"200+",    label:"Specialists" },
    { value:"24/7",    label:"Available" },
  ];

  return (
    <div style={{ paddingBottom: isMobile ? 72 : 0 }}>
      {/* Hero */}
      <section style={{
        minHeight: isMobile ? "100svh" : "100vh",
        background:`linear-gradient(160deg,${C.cream} 0%,${C.lightest} 60%,${C.light} 100%)`,
        display:"flex", alignItems:"center",
        padding: isMobile ? "80px 20px 40px" : "120px 5vw 80px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle,${C.light}44,transparent 70%)`, pointerEvents:"none" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%" }}>
          {/* Mobile hero */}
          {isMobile && (
            <div>
              <div className="fade-up" style={{ marginBottom:16 }}><Badge>Trusted Healthcare</Badge></div>
              <h1 className="fade-up delay-1" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:300, lineHeight:1.1, color:C.text, marginBottom:20, letterSpacing:"-0.02em" }}>
                Your Health,<br/><em style={{ fontStyle:"italic", color:C.mid }}>Expert Care</em><br/><span style={{ fontWeight:600 }}>Anywhere.</span>
              </h1>
              <p className="fade-up delay-2" style={{ fontSize:16, color:C.textSoft, lineHeight:1.7, marginBottom:28 }}>
                Connect with verified specialists for video consultations and seamless booking.
              </p>
              <div className="fade-up delay-3" style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:36 }}>
                <Btn onClick={()=>setPage("doctors")} style={{ width:"100%" }}>Find a Doctor →</Btn>
                <Btn onClick={()=>setPage("register")} variant="secondary" style={{ width:"100%" }}>Create Free Account</Btn>
              </div>
              {/* Stats row */}
              <div className="fade-up delay-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {stats.map(s=>(
                  <div key={s.label} style={{ background:C.white, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${C.lightest}` }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:C.darkest }}>{s.value}</div>
                    <div style={{ fontSize:10, color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.04em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desktop hero */}
          {!isMobile && (
            <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
              <div>
                <div className="fade-up" style={{ marginBottom:20 }}><Badge>Trusted Healthcare Platform</Badge></div>
                <h1 className="fade-up delay-1" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(42px,6vw,72px)", fontWeight:300, lineHeight:1.1, color:C.text, marginBottom:24, letterSpacing:"-0.02em" }}>
                  Your Health,<br/><em style={{ fontStyle:"italic", color:C.mid }}>Expert Care</em><br/><span style={{ fontWeight:600 }}>Anywhere.</span>
                </h1>
                <p className="fade-up delay-2" style={{ fontSize:16, color:C.textSoft, lineHeight:1.7, maxWidth:460, marginBottom:36 }}>
                  ConsultMD connects you with verified specialists for video consultations, seamless appointment booking, and continuous care.
                </p>
                <div className="fade-up delay-3" style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:40 }}>
                  <Btn onClick={()=>setPage("doctors")}>Find a Doctor →</Btn>
                  <Btn onClick={()=>setPage("about")} variant="secondary">How It Works</Btn>
                </div>
                <div className="fade-up delay-4" style={{ display:"flex", gap:32 }}>
                  {stats.map(s=>(
                    <div key={s.label}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, color:C.darkest }}>{s.value}</div>
                      <div style={{ fontSize:12, color:C.textSoft, letterSpacing:"0.06em", textTransform:"uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Hero card */}
              <div className="hero-card fade-in delay-3" style={{ position:"relative", height:420, display:"flex", justifyContent:"center" }}>
                <div style={{ position:"absolute", top:30, right:20, width:300, height:360, background:C.light, borderRadius:20, opacity:0.5, transform:"rotate(4deg)" }} />
                <div style={{ position:"absolute", top:0, right:0, width:310, height:380, background:C.white, borderRadius:20, boxShadow:`0 20px 60px ${C.dark}33`, padding:28, display:"flex", flexDirection:"column", gap:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar initials="AO" size={52} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:15 }}>Dr. Amara Osei</div>
                      <div style={{ fontSize:13, color:C.textSoft }}>Cardiologist · 14 yrs</div>
                      <StarRating rating={4.9} />
                    </div>
                  </div>
                  <div style={{ background:C.cream, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ fontSize:11, color:C.textSoft, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Next Available</div>
                    <div style={{ display:"flex", gap:8 }}>
                      {["09:00","10:00","11:00"].map(t=>(
                        <div key={t} style={{ background:C.lightest, borderRadius:8, padding:"6px 12px", fontSize:13, color:C.darkest, fontWeight:500 }}>{t}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:"#66bb6a", animation:"pulse 2s infinite" }} />
                    <span style={{ fontSize:13, color:C.textSoft }}>Available for video consult</span>
                  </div>
                  <Btn onClick={()=>setPage("doctors")} style={{ width:"100%" }}>Book Appointment</Btn>
                  <div style={{ textAlign:"center", fontSize:12, color:C.textSoft }}>Consultation fee: <strong style={{ color:C.darkest }}>$85</strong></div>
                </div>
                <div style={{ position:"absolute", bottom:20, left:-10, background:C.white, borderRadius:14, padding:"12px 18px", boxShadow:`0 8px 30px ${C.dark}22`, display:"flex", alignItems:"center", gap:10, animation:"fadeUp 0.8s 0.6s both" }}>
                  <div style={{ fontSize:22 }}>✅</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>Appointment Confirmed</div>
                    <div style={{ fontSize:11, color:C.textSoft }}>Today at 10:00 AM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: isMobile ? "48px 20px" : "100px 5vw", background:C.white }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: isMobile ? 32 : 64 }}>
            <Badge>Why ConsultMD</Badge>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 34 : 44, fontWeight:300, color:C.text, marginTop:12, letterSpacing:"-0.02em" }}>Healthcare reimagined</h2>
          </div>
          <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap: isMobile ? 14 : 28 }}>
            {features.map((f,i)=>(
              <div key={f.title} className={`fade-up delay-${i+1}`} style={{ background:C.cream, borderRadius:16, padding: isMobile ? "20px 18px" : "32px 28px", border:`1px solid ${C.lightest}`, display:"flex", flexDirection: isMobile ? "row" : "column", gap: isMobile ? 14 : 0, alignItems: isMobile ? "flex-start" : "flex-start" }}>
                <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: isMobile ? 0 : 16, flexShrink:0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 18 : 22, fontWeight:600, color:C.text, marginBottom:6 }}>{f.title}</h3>
                  <p style={{ fontSize: isMobile ? 13 : 14, color:C.textSoft, lineHeight:1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "48px 20px" : "80px 5vw", background:`linear-gradient(135deg,${C.darkest},${C.dark})`, textAlign:"center" }}>
        <Badge color={`${C.mid}66`}>Get Started Today</Badge>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 36 : 48, fontWeight:300, color:C.cream, margin:"16px 0 12px", letterSpacing:"-0.02em" }}>Ready for better healthcare?</h2>
        <p style={{ color:C.lightest, fontSize:15, marginBottom:28, opacity:0.85 }}>Join 12,000+ patients who trust ConsultMD.</p>
        <Btn onClick={()=>setPage("register")} style={{ background:C.cream, color:C.darkest, border:`2px solid ${C.cream}`, width: isMobile ? "100%" : "auto" }}>Create Free Account</Btn>
      </section>
    </div>
  );
}

// ── DOCTORS ───────────────────────────────────────────────────────────────────
function DoctorsPage({ setPage, setSelectedDoctor }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = DOCTORS.filter(d => {
    const ms = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const msp = specialty==="All" || d.specialty===specialty;
    const ma = !onlyAvailable || d.available;
    return ms && msp && ma;
  });

  return (
    <div style={{ paddingTop: isMobile ? 56 : 88, paddingBottom: isMobile ? 80 : 0, minHeight:"100vh", background:C.cream }}>
      {isMobile && <MobileHeader title="Find a Doctor" />}

      {/* Header */}
      <div style={{ background:`linear-gradient(120deg,${C.lightest},${C.cream})`, padding: isMobile ? "20px 20px 16px" : "48px 5vw 40px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          {!isMobile && (
            <>
              <Badge>Our Specialists</Badge>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:300, color:C.text, margin:"12px 0 8px", letterSpacing:"-0.02em" }}>Find Your Doctor</h1>
              <p style={{ color:C.textSoft, fontSize:15, marginBottom:24 }}>Browse our verified specialists and book in minutes.</p>
            </>
          )}
          {/* Search */}
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ flex:1, position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, color:C.textSoft }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctors or specialty…"
                style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:10, border:`1.5px solid ${C.light}`, background:C.white, fontSize:15, color:C.text, minHeight:48 }}
              />
            </div>
            {isMobile && (
              <button onClick={()=>setShowFilters(v=>!v)} style={{ background:showFilters?C.darkest:C.white, border:`1.5px solid ${showFilters?C.darkest:C.light}`, borderRadius:10, padding:"12px 14px", fontSize:14, color:showFilters?C.cream:C.textMid, minHeight:48, minWidth:48, display:"flex", alignItems:"center", gap:6 }}>
                ⚙️
              </button>
            )}
          </div>
          {/* Filters */}
          {(!isMobile || showFilters) && (
            <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap", alignItems:"center" }}>
              <select value={specialty} onChange={e=>setSpecialty(e.target.value)} style={{ padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.light}`, background:C.white, fontSize:14, color:C.text, minHeight:44, flex: isMobile ? 1 : "unset" }}>
                {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
              </select>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:C.textMid, minHeight:44, padding:"0 4px" }}>
                <input type="checkbox" checked={onlyAvailable} onChange={e=>setOnlyAvailable(e.target.checked)} style={{ width:18, height:18, accentColor:C.darkest }} />
                Available only
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding: isMobile ? "16px 16px" : "40px 5vw" }}>
        <p style={{ fontSize:13, color:C.textSoft, marginBottom:16 }}>{filtered.length} doctor{filtered.length!==1?"s":""} found</p>
        <div className="doctor-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap: isMobile ? 12 : 24 }}>
          {filtered.map((doc,i)=>(
            <DoctorCard key={doc.id} doc={doc} isMobile={isMobile}
              onView={()=>{ setSelectedDoctor(doc); setPage("doctor-profile"); }}
            />
          ))}
        </div>
        {filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.textSoft }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p>No doctors found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ doc, isMobile, onView }) {
  return (
    <div className="fade-up" style={{ background:C.white, borderRadius:16, padding: isMobile ? 16 : 24, border:`1px solid ${C.lightest}`, transition:"transform 0.2s,box-shadow 0.2s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 12px 36px ${C.dark}18`; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
    >
      <div style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
        <Avatar initials={doc.img} size={isMobile?48:54} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize: isMobile ? 15 : 16, color:C.text }}>{doc.name}</div>
          <div style={{ fontSize:13, color:C.textSoft, marginBottom:3 }}>{doc.specialty}</div>
          <StarRating rating={doc.rating} />
        </div>
        <div style={{ width:9, height:9, borderRadius:"50%", background:doc.available?"#66bb6a":"#bdbdbd", flexShrink:0, marginTop:6, animation:doc.available?"pulse 2.5s infinite":"none" }} />
      </div>
      {!isMobile && <p style={{ fontSize:13, color:C.textSoft, lineHeight:1.6, marginBottom:14 }}>{doc.bio}</p>}
      <div style={{ display:"flex", gap:10, marginBottom:14, fontSize:13, color:C.textMid, flexWrap:"wrap" }}>
        <span>⏱ {doc.exp} yrs</span>
        <span>📋 {doc.reviews} reviews</span>
        <span style={{ marginLeft:"auto", fontWeight:600, color:C.darkest }}>${doc.fee}</span>
      </div>
      <Btn onClick={onView} style={{ width:"100%" }} variant={doc.available?"primary":"ghost"} disabled={!doc.available}>
        {doc.available ? "View & Book" : "Not Available"}
      </Btn>
    </div>
  );
}

// ── DOCTOR PROFILE ────────────────────────────────────────────────────────────
function DoctorProfilePage({ doc, setPage, user, appointments, setAppointments }) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  if (!doc) { setPage("doctors"); return null; }

  const today = new Date().toISOString().split("T")[0];
  const dates = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()+i); return d.toISOString().split("T")[0]; });

  const handleBook = () => {
    if (!user) { setPage("login"); return; }
    if (!selectedDate || !selectedSlot) return;
    setLoading(true);
    setTimeout(()=>{
      const appt = { id:Date.now(), doctorId:doc.id, doctorName:doc.name, specialty:doc.specialty, date:selectedDate, slot:selectedSlot, reason, fee:doc.fee, status:"upcoming" };
      const updated = [...appointments, appt];
      setAppointments(updated); ls.set("appointments", updated);
      setBooked(true); setLoading(false);
    }, 1200);
  };

  if (booked) return (
    <div style={{ paddingTop:isMobile?56:88, minHeight:"100vh", background:C.cream, display:"flex", alignItems:"center", justifyContent:"center", padding: isMobile ? "56px 20px 20px" : "88px 20px 20px" }}>
      <div className="fade-up" style={{ background:C.white, borderRadius:20, padding: isMobile ? "40px 24px" : "56px 48px", textAlign:"center", width:"100%", maxWidth:440, boxShadow:`0 20px 60px ${C.dark}18` }}>
        <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:600, color:C.text, marginBottom:10 }}>Booked!</h2>
        <p style={{ color:C.textSoft, fontSize:15, marginBottom:6 }}>Appointment with <strong>{doc.name}</strong></p>
        <p style={{ color:C.textMid, fontSize:15, marginBottom:32 }}>{selectedDate} at {selectedSlot}</p>
        <div style={{ display:"flex", flexDirection: isMobile?"column":"row", gap:12, justifyContent:"center" }}>
          <Btn onClick={()=>setPage("dashboard")} style={{ width: isMobile?"100%":"auto" }}>Go to Dashboard</Btn>
          <Btn onClick={()=>setPage("doctors")} variant="secondary" style={{ width: isMobile?"100%":"auto" }}>Find More</Btn>
        </div>
      </div>
    </div>
  );

  // Mobile booking sheet
  const BookingPanel = () => (
    <div style={{ background:C.white, borderRadius: isMobile?"20px 20px 0 0":20, padding: isMobile ? "24px 20px 32px" : 32, border: isMobile ? "none" : `1px solid ${C.lightest}` }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:C.text, marginBottom:20 }}>Book Appointment</h3>
      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:11, fontWeight:500, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:10 }}>Select Date</label>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {dates.map(d=>{
            const label = d===today ? "Today" : new Date(d).toLocaleDateString("en",{weekday:"short",day:"numeric"});
            return (
              <button key={d} onClick={()=>{setSelectedDate(d);setSelectedSlot("");}} style={{
                padding:"10px 14px", borderRadius:10, fontSize:13, flexShrink:0,
                border:`1.5px solid ${selectedDate===d?C.darkest:C.lightest}`,
                background:selectedDate===d?C.darkest:C.cream,
                color:selectedDate===d?C.cream:C.textMid, cursor:"pointer", minHeight:44,
              }}>{label}</button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:500, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:10 }}>Available Slots</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {doc.slots.map(s=>(
              <button key={s} onClick={()=>setSelectedSlot(s)} style={{
                padding:"10px 16px", borderRadius:10, fontSize:14, minHeight:44,
                border:`1.5px solid ${selectedSlot===s?C.darkest:C.light}`,
                background:selectedSlot===s?C.darkest:C.white,
                color:selectedSlot===s?C.cream:C.textMid, cursor:"pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:11, fontWeight:500, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:10 }}>Reason for Visit</label>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Briefly describe your symptoms…"
          style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1.5px solid ${C.light}`, background:C.cream, fontSize:14, color:C.text, resize:"vertical" }}
        />
      </div>
      <Btn onClick={handleBook} disabled={!selectedDate||!selectedSlot||loading} style={{ width:"100%" }}>
        {loading ? "⏳ Booking…" : `Confirm · $${doc.fee}`}
      </Btn>
      {!user && <p style={{ textAlign:"center", fontSize:12, color:C.textSoft, marginTop:10 }}>You'll need to sign in to confirm.</p>}
    </div>
  );

  return (
    <div style={{ paddingTop:isMobile?56:88, paddingBottom:isMobile?80:0, minHeight:"100vh", background:C.cream }}>
      {isMobile && <MobileHeader title={doc.name} onBack={()=>setPage("doctors")} />}

      <div style={{ maxWidth:1100, margin:"0 auto", padding: isMobile ? "16px 16px" : "48px 5vw" }}>
        {!isMobile && (
          <button onClick={()=>setPage("doctors")} style={{ background:"none", border:"none", color:C.textSoft, fontSize:14, marginBottom:28, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            ← Back to Doctors
          </button>
        )}

        <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:28, alignItems:"start" }}>
          {/* Doctor info */}
          <div>
            <div className="fade-up" style={{ background:C.white, borderRadius:16, padding: isMobile ? 20 : 32, marginBottom:16, border:`1px solid ${C.lightest}` }}>
              <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:20 }}>
                <Avatar initials={doc.img} size={isMobile?60:80} />
                <div>
                  <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 24 : 32, fontWeight:600, color:C.text, marginBottom:4 }}>{doc.name}</h1>
                  <div style={{ fontSize:15, color:C.textSoft, marginBottom:6 }}>{doc.specialty}</div>
                  <StarRating rating={doc.rating} />
                  <div style={{ fontSize:13, color:C.textSoft, marginTop:2 }}>{doc.reviews} reviews</div>
                </div>
              </div>
              <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[["Experience",`${doc.exp} yrs`],["Patients",`${doc.reviews*3}`],["Fee",`$${doc.fee}`]].map(([l,v])=>(
                  <div key={l} style={{ background:C.cream, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 20 : 24, fontWeight:600, color:C.darkest }}>{v}</div>
                    <div style={{ fontSize:11, color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-up delay-1" style={{ background:C.white, borderRadius:16, padding: isMobile ? 20 : 28, border:`1px solid ${C.lightest}`, marginBottom: isMobile ? 16 : 0 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:C.text, marginBottom:12 }}>About</h3>
              <p style={{ color:C.textSoft, lineHeight:1.8, fontSize:15 }}>{doc.bio}</p>
            </div>
            {/* Mobile book button */}
            {isMobile && doc.available && !showBooking && (
              <Btn onClick={()=>setShowBooking(true)} style={{ width:"100%", marginTop:4 }}>Book Appointment · ${doc.fee}</Btn>
            )}
          </div>

          {/* Desktop booking panel */}
          {!isMobile && (
            <div className="booking-sticky fade-up delay-2" style={{ position:"sticky", top:90 }}>
              <BookingPanel />
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {isMobile && showBooking && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)" }} onClick={()=>setShowBooking(false)}>
          <div className="slide-up" style={{ position:"absolute", bottom:0, left:0, right:0 }} onClick={e=>e.stopPropagation()}>
            <BookingPanel />
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardPage({ user, appointments, setPage, setVideoDoc }) {
  const isMobile = useIsMobile();
  const upcoming = appointments.filter(a=>a.status==="upcoming");
  const past = appointments.filter(a=>a.status!=="upcoming");

  if (!user) return (
    <div style={{ paddingTop:isMobile?56:88, minHeight:"100vh", background:C.cream, display:"flex", alignItems:"center", justifyContent:"center", padding: isMobile ? "56px 20px 80px" : "88px 20px 20px" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.text, marginBottom:16 }}>Sign in to view your dashboard</h2>
        <Btn onClick={()=>setPage("login")} style={{ width: isMobile?"100%":"auto" }}>Sign In</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:isMobile?56:88, paddingBottom:isMobile?80:0, minHeight:"100vh", background:C.cream }}>
      {isMobile && <MobileHeader title="Dashboard" rightAction={
        <span style={{ fontSize:13, color:C.textSoft }}>{user.name.split(" ")[0]}</span>
      } />}
      <div style={{ maxWidth:1100, margin:"0 auto", padding: isMobile ? "16px 16px" : "48px 5vw" }}>
        {!isMobile && (
          <div style={{ marginBottom:36 }}>
            <Badge>My Account</Badge>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:44, fontWeight:300, color:C.text, margin:"12px 0 4px", letterSpacing:"-0.02em" }}>
              Welcome back, <em style={{ fontStyle:"italic", color:C.mid }}>{user.name.split(" ")[0]}</em>
            </h1>
          </div>
        )}
        {isMobile && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:C.text }}>
              Hello, <em style={{ color:C.mid }}>{user.name.split(" ")[0]}</em> 👋
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: isMobile ? 10 : 18, marginBottom: isMobile ? 24 : 36 }}>
          {[
            { label:"Upcoming", value:upcoming.length, icon:"📅" },
            { label:"Completed", value:past.length,    icon:"✅" },
            { label:"Doctors",  value:new Set(appointments.map(a=>a.doctorId)).size, icon:"🩺" },
          ].map(s=>(
            <div key={s.label} style={{ background:C.lightest, borderRadius:14, padding: isMobile ? "14px 12px" : "20px 24px", textAlign:"center" }}>
              <div style={{ fontSize: isMobile ? 22 : 28, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 26 : 32, fontWeight:600, color:C.darkest }}>{s.value}</div>
              <div style={{ fontSize: isMobile ? 11 : 13, color:C.textSoft }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 22 : 26, fontWeight:600, color:C.text, marginBottom:14 }}>Upcoming</h2>
        {upcoming.length===0 ? (
          <div style={{ background:C.white, borderRadius:14, padding:"28px 20px", textAlign:"center", marginBottom:24 }}>
            <p style={{ color:C.textSoft, marginBottom:14, fontSize:14 }}>No upcoming appointments.</p>
            <Btn onClick={()=>setPage("doctors")} variant="secondary" style={{ width: isMobile?"100%":"auto" }}>Find a Doctor</Btn>
          </div>
        ) : (
          <div style={{ display:"grid", gap: isMobile ? 10 : 14, marginBottom:28 }}>
            {upcoming.map(a=>(
              <AppointmentCard key={a.id} appt={a} isMobile={isMobile} onJoin={()=>{
                const doc = DOCTORS.find(d=>d.id===a.doctorId);
                setVideoDoc(doc); setPage("video");
              }} />
            ))}
          </div>
        )}
        {past.length>0 && (
          <>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 22 : 26, fontWeight:600, color:C.text, marginBottom:14 }}>Past</h2>
            <div style={{ display:"grid", gap: isMobile ? 10 : 14 }}>
              {past.map(a=><AppointmentCard key={a.id} appt={a} isMobile={isMobile} isPast />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onJoin, isPast, isMobile }) {
  return (
    <div className="fade-in" style={{ background:C.white, borderRadius:14, padding: isMobile ? "14px 16px" : "18px 24px", border:`1px solid ${C.lightest}`, opacity:isPast?0.7:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Avatar initials={DOCTORS.find(d=>d.id===appt.doctorId)?.img||"DR"} size={isMobile?40:46} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize: isMobile ? 14 : 15, color:C.text }}>{appt.doctorName}</div>
          <div style={{ fontSize:12, color:C.textSoft }}>{appt.specialty}</div>
          <div style={{ fontSize:13, color:C.textMid, marginTop:2 }}>{appt.date} · {appt.slot}</div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontWeight:600, color:C.darkest, fontSize:14 }}>${appt.fee}</div>
          {!isPast && (
            <button onClick={onJoin} style={{ background:C.darkest, border:"none", borderRadius:8, padding:"7px 14px", color:C.cream, fontSize:13, cursor:"pointer", marginTop:6, minHeight:36 }}>
              🎥 Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── VIDEO ─────────────────────────────────────────────────────────────────────
function VideoPage({ doc, user, setPage }) {
  const isMobile = useIsMobile();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([{ from:"doctor", text:"Hello! I can see and hear you clearly. How are you feeling today?", time:"now" }]);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState("connecting");
  const chatRef = useRef(null);

  useEffect(()=>{ const t=setTimeout(()=>setStatus("live"),2000); return()=>clearTimeout(t); },[]);
  useEffect(()=>{ if(status!=="live")return; const t=setInterval(()=>setSeconds(s=>s+1),1000); return()=>clearInterval(t); },[status]);
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[messages]);

  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const sendMsg = () => {
    if(!msg.trim())return;
    const now = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setMessages(m=>[...m,{from:"me",text:msg,time:now}]);
    setMsg("");
    setTimeout(()=>{
      const replies=["I understand. Can you tell me more?","That's helpful to know.","How long have you been experiencing this?","I'll make a note of that."];
      setMessages(m=>[...m,{from:"doctor",text:replies[Math.floor(Math.random()*replies.length)],time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    },1800);
  };

  if(!doc){setPage("dashboard");return null;}

  return (
    <div style={{ height:"100svh", background:"#1a1008", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "10px 16px" : "14px 24px", background:"rgba(0,0,0,0.5)", zIndex:10, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 17 : 20, fontWeight:600, color:C.cream }}>Consult<em style={{ color:C.light }}>MD</em></span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {status==="live" && (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#ef5350", animation:"pulse 1.5s infinite" }} />
                <span style={{ color:"#ef5350", fontSize:12, fontWeight:600, letterSpacing:"0.1em" }}>LIVE</span>
              </div>
              <span style={{ color:C.lightest, fontSize:14, fontFamily:"monospace" }}>{fmt(seconds)}</span>
            </>
          )}
          {status==="connecting" && <span style={{ color:C.light, fontSize:13 }}>⏳ Connecting…</span>}
        </div>
        <button onClick={()=>setChatOpen(o=>!o)} style={{ background:chatOpen?C.mid:"rgba(255,255,255,0.12)", border:"none", borderRadius:8, padding:"7px 12px", color:C.cream, fontSize:13, cursor:"pointer" }}>💬{isMobile?"":" Chat"}</button>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative", minHeight:0 }}>
        {/* Doctor feed */}
        <div style={{ flex:1, position:"relative", background:`linear-gradient(135deg,${C.darkest}cc,#1a1008)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {status==="connecting" ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:44, height:44, border:`3px solid ${C.light}`, borderTop:`3px solid ${C.mid}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 14px" }} />
              <p style={{ color:C.lightest, fontSize:15 }}>Connecting to {doc.name}…</p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:"center" }}>
                <Avatar initials={doc.img} size={isMobile?80:100} />
                <p style={{ color:C.lightest, marginTop:14, fontSize: isMobile ? 15 : 16 }}>{doc.name}</p>
                <p style={{ color:C.light, fontSize:13 }}>{doc.specialty}</p>
              </div>
              <div style={{ position:"absolute", bottom:16, left:16, background:"rgba(0,0,0,0.6)", borderRadius:8, padding:"6px 12px" }}>
                <span style={{ color:C.cream, fontSize:13 }}>{doc.name}</span>
              </div>
            </>
          )}
          {/* PiP */}
          <div style={{ position:"absolute", bottom: isMobile ? 16 : 20, right: isMobile ? 16 : 20, width: isMobile ? 110 : 180, height: isMobile ? 80 : 120, borderRadius:10, background:camOn?`linear-gradient(135deg,${C.mid},${C.dark})`:"#333", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:`2px solid ${C.light}44`, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
            {camOn ? (<><Avatar initials={user?user.name.split(" ").map(n=>n[0]).join("").slice(0,2):"ME"} size={isMobile?30:40} /><span style={{ color:C.cream, fontSize:10, marginTop:4 }}>You</span></>) : (<span style={{ color:"#aaa", fontSize:11 }}>Cam off</span>)}
            {!micOn && <div style={{ position:"absolute", top:5, right:6, fontSize:12 }}>🔇</div>}
          </div>
        </div>

        {/* Chat */}
        {chatOpen && (
          <div className={isMobile?"slide-up":"slide-in"} style={isMobile ? {
            position:"absolute", bottom:0, left:0, right:0, height:"55%", background:"#111", borderRadius:"16px 16px 0 0", display:"flex", flexDirection:"column", zIndex:50,
          } : { width:300, background:"#111", borderLeft:`1px solid ${C.dark}44`, display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.dark}44`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:C.lightest, fontWeight:600 }}>Chat</span>
              {isMobile && <button onClick={()=>setChatOpen(false)} style={{ background:"none", border:"none", color:C.light, fontSize:20, cursor:"pointer" }}>×</button>}
            </div>
            <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"14px 12px", display:"flex", flexDirection:"column", gap:10 }}>
              {messages.map((m,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.from==="me"?"flex-end":"flex-start" }}>
                  <div style={{ background:m.from==="me"?C.darkest:"rgba(255,255,255,0.1)", color:C.cream, borderRadius:10, padding:"8px 12px", maxWidth:"80%", fontSize:13, lineHeight:1.5 }}>{m.text}</div>
                  <span style={{ fontSize:10, color:"#666", marginTop:2 }}>{m.time}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 12px", borderTop:`1px solid ${C.dark}44`, display:"flex", gap:8 }}>
              <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type…"
                style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8, padding:"10px 12px", color:C.cream, fontSize:14, minHeight:44 }}
              />
              <button onClick={sendMsg} style={{ background:C.darkest, border:"none", borderRadius:8, padding:"10px 14px", color:C.cream, cursor:"pointer", fontSize:16, minHeight:44 }}>↑</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ background:"rgba(0,0,0,0.7)", padding: isMobile ? "12px 16px 20px" : "16px 24px", display:"flex", alignItems:"center", justifyContent:"center", gap: isMobile ? 12 : 14, flexShrink:0 }}>
        {[
          { icon:micOn?"🎙️":"🔇", label:micOn?"Mute":"Unmute", action:()=>setMicOn(v=>!v), active:micOn },
          { icon:camOn?"📹":"📷", label:camOn?"Cam off":"Cam on",  action:()=>setCamOn(v=>!v), active:camOn },
        ].map(ctrl=>(
          <button key={ctrl.label} onClick={ctrl.action} style={{ background:ctrl.active?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)", border:`1px solid ${ctrl.active?C.light+"44":"#ff6b6b44"}`, borderRadius:10, padding: isMobile ? "10px 16px" : "12px 18px", color:ctrl.active?C.cream:"#ff8a80", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth: isMobile ? 64 : 72, fontSize: isMobile ? 22 : 20 }}>
            <span>{ctrl.icon}</span>
            <span style={{ fontSize:10, opacity:0.8 }}>{ctrl.label}</span>
          </button>
        ))}
        <button onClick={()=>setPage("dashboard")} style={{ background:"#c62828", border:"none", borderRadius:10, padding: isMobile ? "10px 20px" : "12px 28px", color:"#fff", cursor:"pointer", fontSize:14, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth: isMobile ? 70 : 80 }}>
          <span style={{ fontSize: isMobile ? 22 : 20 }}>📴</span>
          <span style={{ fontSize:10 }}>End Call</span>
        </button>
      </div>
    </div>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function AboutPage({ setPage }) {
  const isMobile = useIsMobile();
  const steps = [
    { n:"01", title:"Create Account", desc:"Register in seconds. No paperwork, no hassle." },
    { n:"02", title:"Find a Specialist", desc:"Browse verified doctors by specialty, rating, or availability." },
    { n:"03", title:"Book Your Slot", desc:"Pick a time that suits you — today, tomorrow, or next week." },
    { n:"04", title:"Join Video Call", desc:"Connect from anywhere via secure HD video." },
  ];
  return (
    <div style={{ paddingTop:isMobile?56:88, paddingBottom:isMobile?80:0, minHeight:"100vh", background:C.cream }}>
      {isMobile && <MobileHeader title="About" />}
      <div style={{ background:`linear-gradient(120deg,${C.lightest},${C.cream})`, padding: isMobile ? "20px 20px 32px" : "64px 5vw 60px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          {!isMobile && <Badge>About Us</Badge>}
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 38 : 52, fontWeight:300, color:C.text, margin: isMobile ? "0 0 16px" : "16px 0 20px", letterSpacing:"-0.02em" }}>
            Humanising <em style={{ fontStyle:"italic", color:C.mid }}>digital healthcare</em>
          </h1>
          <p style={{ color:C.textSoft, fontSize: isMobile ? 15 : 16, lineHeight:1.8 }}>
            ConsultMD was founded on a simple belief: every person deserves prompt access to expert medical care, regardless of where they live.
          </p>
        </div>
      </div>
      <div style={{ maxWidth:1100, margin:"0 auto", padding: isMobile ? "32px 16px" : "80px 5vw" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 28 : 36, fontWeight:300, color:C.text, textAlign:"center", marginBottom: isMobile ? 24 : 48 }}>How It Works</h2>
        <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap: isMobile ? 12 : 24 }}>
          {steps.map((s,i)=>(
            <div key={s.n} className={`fade-up delay-${i+1}`} style={{ background:C.white, borderRadius:16, padding: isMobile ? "20px 18px" : "28px 24px", border:`1px solid ${C.lightest}` }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 36 : 48, fontWeight:600, color:C.lightest, lineHeight:1, marginBottom:12 }}>{s.n}</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 18 : 22, fontWeight:600, color:C.text, marginBottom:8 }}>{s.title}</h3>
              <p style={{ fontSize: isMobile ? 13 : 14, color:C.textSoft, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop: isMobile ? 32 : 48 }}>
          <Btn onClick={()=>setPage("register")} style={{ width: isMobile ? "100%" : "auto" }}>Get Started Free →</Btn>
        </div>
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function LoginPage({ setPage, setUser }) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if(!email||!password){setError("Please fill in all fields.");return;}
    setLoading(true); setError("");
    setTimeout(()=>{
      const user={name:email.split("@")[0].replace(/\./g," ").replace(/\b\w/g,l=>l.toUpperCase()),email};
      setUser(user); ls.set("user",user); setPage("dashboard"); setLoading(false);
    },1000);
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to your ConsultMD account" isMobile={isMobile} onBack={()=>setPage("home")}>
    {error && <div style={{ background:"#ffebee", color:"#c62828", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{error}</div>}
    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
    <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
    <Btn onClick={handle} disabled={loading} style={{ width:"100%", marginTop:8 }}>{loading?"Signing in…":"Sign In"}</Btn>
    <p style={{ textAlign:"center", fontSize:13, color:C.textSoft, marginTop:18 }}>
      No account?{" "}
      <button onClick={()=>setPage("register")} style={{ background:"none", border:"none", color:C.darkest, fontWeight:500, cursor:"pointer", fontSize:13 }}>Create one →</button>
    </p>
  </AuthLayout>;
}

function RegisterPage({ setPage, setUser }) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if(!name||!email||!password)return;
    setLoading(true);
    setTimeout(()=>{
      const user={name,email}; setUser(user); ls.set("user",user); setPage("dashboard"); setLoading(false);
    },1000);
  };

  return <AuthLayout title="Create account" subtitle="Join ConsultMD — it's free" isMobile={isMobile} onBack={()=>setPage("home")}>
    <Field label="Full Name" value={name} onChange={setName} placeholder="Kwame Mensah" />
    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
    <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Choose a strong password" />
    <Btn onClick={handle} disabled={loading} style={{ width:"100%", marginTop:8 }}>{loading?"Creating…":"Create Account"}</Btn>
    <p style={{ textAlign:"center", fontSize:13, color:C.textSoft, marginTop:18 }}>
      Have an account?{" "}
      <button onClick={()=>setPage("login")} style={{ background:"none", border:"none", color:C.darkest, fontWeight:500, cursor:"pointer", fontSize:13 }}>Sign in →</button>
    </p>
  </AuthLayout>;
}

function Field({ label, type="text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ fontSize:12, fontWeight:500, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1.5px solid ${C.light}`, background:C.cream, fontSize:15, color:C.text, minHeight:48 }}
      />
    </div>
  );
}

function AuthLayout({ title, subtitle, children, isMobile, onBack }) {
  return (
    <div style={{ paddingTop:isMobile?56:88, minHeight:"100vh", background:`linear-gradient(135deg,${C.lightest},${C.cream})`, display:"flex", alignItems:"center", justifyContent:"center", padding: isMobile ? "56px 20px 20px" : "88px 20px 20px" }}>
      {isMobile && <MobileHeader title={title} onBack={onBack} />}
      <div className="fade-up" style={{ background:C.white, borderRadius:20, padding: isMobile ? "28px 20px" : "44px 40px", width:"100%", maxWidth:420, boxShadow:`0 20px 60px ${C.dark}18` }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 28 : 32, fontWeight:600, color:C.text, marginBottom:6 }}>{title}</h2>
        <p style={{ color:C.textSoft, fontSize:14, marginBottom:28 }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

// ── 404 ───────────────────────────────────────────────────────────────────────
function NotFoundPage({ setPage }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ paddingTop:isMobile?56:88, minHeight:"100vh", background:C.cream, display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"20px" }}>
      <div className="fade-up">
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 80 : 120, fontWeight:300, color:C.lightest, lineHeight:1 }}>404</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 24 : 32, color:C.text, margin:"12px 0 14px" }}>Page not found</h2>
        <p style={{ color:C.textSoft, marginBottom:24, fontSize:14 }}>The page you're looking for doesn't exist.</p>
        <Btn onClick={()=>setPage("home")} style={{ width: isMobile ? "100%" : "auto" }}>← Back to Home</Btn>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background:C.text, color:C.lightest, padding:"44px 5vw 28px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div className="footer-grid" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:32, flexWrap:"wrap", marginBottom:32 }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, marginBottom:8 }}>Consult<em style={{ color:C.mid }}>MD</em></div>
            <p style={{ fontSize:13, opacity:0.7, maxWidth:240, lineHeight:1.7 }}>Expert healthcare, wherever you are.</p>
          </div>
          <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
            {[
              { heading:"Platform", links:[["home","Home"],["doctors","Doctors"],["about","About"]] },
              { heading:"Account",  links:[["login","Login"],["register","Register"],["dashboard","Dashboard"]] },
            ].map(col=>(
              <div key={col.heading}>
                <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", opacity:0.5, marginBottom:12 }}>{col.heading}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(([id,label])=>(
                    <button key={id} onClick={()=>setPage(id)} style={{ background:"none", border:"none", color:C.lightest, fontSize:14, opacity:0.8, cursor:"pointer", textAlign:"left", padding:0, minHeight:32 }}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop:`1px solid ${C.dark}44`, paddingTop:18, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:12, opacity:0.5 }}>© 2026 ConsultMD. All rights reserved.</span>
          <span style={{ fontSize:12, opacity:0.5 }}>HIPAA Compliant · Secure · Private</span>
        </div>
      </div>
    </footer>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]             = useState("home");
  const [user, setUser]             = useState(()=>ls.get("user",null));
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [videoDoc, setVideoDoc]     = useState(null);
  const [appointments, setAppointments] = useState(()=>ls.get("appointments",[]));
  const isMobile = useIsMobile();

  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[page]);

  const noFrame = page==="video";
  const pages = ["home","doctors","doctor-profile","dashboard","video","about","login","register"];

  return (
    <div>
      {!noFrame && !isMobile && <Navbar page={page} setPage={setPage} user={user} setUser={setUser} />}
      {!noFrame && isMobile && <BottomNav page={page} setPage={setPage} user={user} />}

      {page==="home"           && <HomePage setPage={setPage} />}
      {page==="doctors"        && <DoctorsPage setPage={setPage} setSelectedDoctor={setSelectedDoctor} />}
      {page==="doctor-profile" && <DoctorProfilePage doc={selectedDoctor} setPage={setPage} user={user} appointments={appointments} setAppointments={setAppointments} />}
      {page==="dashboard"      && <DashboardPage user={user} appointments={appointments} setPage={setPage} setVideoDoc={setVideoDoc} />}
      {page==="video"          && <VideoPage doc={videoDoc||selectedDoctor} user={user} setPage={setPage} />}
      {page==="about"          && <AboutPage setPage={setPage} />}
      {page==="login"          && <LoginPage setPage={setPage} setUser={setUser} />}
      {page==="register"       && <RegisterPage setPage={setPage} setUser={setUser} />}
      {!pages.includes(page)   && <NotFoundPage setPage={setPage} />}

      {!noFrame && !isMobile && <Footer setPage={setPage} />}
    </div>
  );
}

