import { useState, useEffect, useRef } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  lightest: "#D7CCC8",
  light:    "#BCAAA4",
  mid:      "#A1887F",
  dark:     "#8D6E63",
  darkest:  "#795548",
  cream:    "#FAF7F5",
  white:    "#FFFFFF",
  text:     "#3E2723",
  textMid:  "#5D4037",
  textSoft: "#795548",
};

// ── Google Fonts injection ────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

// ── Global Styles ─────────────────────────────────────────────────────────────
const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: ${C.cream};
    color: ${C.text};
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.lightest}; }
  ::-webkit-scrollbar-thumb { background: ${C.mid}; border-radius: 3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
  @keyframes timerTick {
    from { opacity: 0.6; } to { opacity: 1; }
  }

  .fade-up  { animation: fadeUp  0.6s ease both; }
  .fade-in  { animation: fadeIn  0.4s ease both; }
  .slide-in { animation: slideIn 0.35s ease both; }

  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }

  a { text-decoration: none; color: inherit; cursor: pointer; }
  button { cursor: pointer; border: none; outline: none; font-family: inherit; }
  input, select, textarea { font-family: inherit; outline: none; }
`;
const styleEl = document.createElement("style");
styleEl.textContent = globalCSS;
document.head.appendChild(styleEl);

// ── Mock Data ─────────────────────────────────────────────────────────────────
const DOCTORS = [
  { id: 1, name: "Dr. Amara Osei",      specialty: "Cardiologist",       rating: 4.9, reviews: 312, fee: 85,  exp: 14, img: "AO", available: true,  bio: "Board-certified cardiologist with expertise in preventive cardiology and heart failure management.", slots: ["09:00","10:00","11:00","14:00","15:00"] },
  { id: 2, name: "Dr. Leila Nouri",     specialty: "Dermatologist",      rating: 4.8, reviews: 241, fee: 75,  exp: 9,  img: "LN", available: true,  bio: "Specialises in medical and cosmetic dermatology. Passionate about skin health and evidence-based treatments.", slots: ["08:00","09:30","13:00","16:00"] },
  { id: 3, name: "Dr. Samuel Obeng",    specialty: "Neurologist",        rating: 4.7, reviews: 189, fee: 95,  exp: 17, img: "SO", available: false, bio: "Expert in headache disorders, epilepsy, and neurodegenerative diseases with a holistic care philosophy.", slots: [] },
  { id: 4, name: "Dr. Priya Sharma",    specialty: "Pediatrician",       rating: 5.0, reviews: 408, fee: 65,  exp: 12, img: "PS", available: true,  bio: "Dedicated children's health advocate. Trained at Johns Hopkins. Mother of two.", slots: ["08:30","10:30","12:00","15:30","17:00"] },
  { id: 5, name: "Dr. Marcus Reid",     specialty: "Psychiatrist",       rating: 4.8, reviews: 274, fee: 110, exp: 11, img: "MR", available: true,  bio: "Mental health specialist focusing on anxiety, depression, and trauma-informed care.", slots: ["10:00","11:30","14:30","16:30"] },
  { id: 6, name: "Dr. Fatima Al-Amin",  specialty: "Endocrinologist",    rating: 4.6, reviews: 156, fee: 90,  exp: 16, img: "FA", available: true,  bio: "Expert in diabetes, thyroid disorders, and hormonal conditions. Published researcher.", slots: ["09:00","13:30","15:00"] },
  { id: 7, name: "Dr. Chen Wei",        specialty: "Orthopedist",        rating: 4.7, reviews: 203, fee: 80,  exp: 13, img: "CW", available: false, bio: "Sports medicine and joint replacement specialist. Worked with national athletic teams.", slots: [] },
  { id: 8, name: "Dr. Ingrid Larsson",  specialty: "Gynecologist",       rating: 4.9, reviews: 367, fee: 85,  exp: 18, img: "IL", available: true,  bio: "Women's health advocate with expertise in reproductive health and minimally invasive surgery.", slots: ["08:00","09:00","11:00","14:00","16:00"] },
  { id: 9, name: "Dr. Kofi Mensah",     specialty: "General Practitioner",rating: 4.8, reviews: 512, fee: 55, exp: 8,  img: "KM", available: true,  bio: "Your trusted family doctor. Comprehensive care for all ages with a warm, approachable style.", slots: ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"] },
  { id:10, name: "Dr. Sofia Ruiz",      specialty: "Ophthalmologist",    rating: 4.7, reviews: 178, fee: 70,  exp: 10, img: "SR", available: true,  bio: "Eye health expert specialising in cataract surgery, glaucoma management, and vision correction.", slots: ["09:30","11:00","14:30","16:00"] },
  { id:11, name: "Dr. James Asante",    specialty: "Pulmonologist",      rating: 4.6, reviews: 142, fee: 88,  exp: 15, img: "JA", available: false, bio: "Respiratory health specialist with expertise in asthma, COPD, and sleep-related breathing disorders.", slots: [] },
  { id:12, name: "Dr. Nadia Petrov",    specialty: "Rheumatologist",     rating: 4.8, reviews: 195, fee: 92,  exp: 20, img: "NP", available: true,  bio: "Two decades of experience treating autoimmune and musculoskeletal conditions with precision.", slots: ["10:00","12:00","15:00","17:00"] },
];

const SPECIALTIES = ["All", ...new Set(DOCTORS.map(d => d.specialty))];

const avatarColor = (initials) => {
  const colors = [
    ["#D7CCC8","#5D4037"], ["#BCAAA4","#3E2723"], ["#A1887F","#FFF8F6"],
    ["#8D6E63","#FAF7F5"], ["#795548","#FAF7F5"], ["#D7CCC8","#795548"],
  ];
  const i = (initials.charCodeAt(0) + initials.charCodeAt(1)) % colors.length;
  return colors[i];
};

// ── Utility ───────────────────────────────────────────────────────────────────
const ls = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── Shared Components ─────────────────────────────────────────────────────────
function Avatar({ initials, size = 48 }) {
  const [bg, fg] = avatarColor(initials);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600, fontSize: size * 0.35,
      flexShrink: 0, letterSpacing: "0.04em",
    }}>{initials}</div>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{ color: C.dark, fontSize: 13, letterSpacing: "0.08em" }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: C.textSoft, marginLeft: 4, fontFamily: "'DM Sans'" }}>{rating}</span>
    </span>
  );
}

function Badge({ children, color = C.lightest }) {
  return (
    <span style={{
      background: color, color: C.textMid,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 500, letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", style: s = {}, disabled = false }) {
  const base = {
    padding: "11px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500,
    letterSpacing: "0.04em", transition: "all 0.2s ease",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: 8,
  };
  const variants = {
    primary:   { background: C.darkest, color: C.cream, border: `2px solid ${C.darkest}` },
    secondary: { background: "transparent", color: C.darkest, border: `2px solid ${C.darkest}` },
    ghost:     { background: "transparent", color: C.textMid, border: `1px solid ${C.light}` },
    danger:    { background: "#c62828", color: "#fff", border: "2px solid #c62828" },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...s }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === "primary")   { e.currentTarget.style.background = C.dark; e.currentTarget.style.borderColor = C.dark; }
        if (variant === "secondary") { e.currentTarget.style.background = C.darkest; e.currentTarget.style.color = C.cream; }
        if (variant === "ghost")     { e.currentTarget.style.background = C.lightest; }
      }}
      onMouseLeave={e => {
        if (disabled) return;
        Object.assign(e.currentTarget.style, { ...base, ...variants[variant] });
      }}
    >{children}</button>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, user, setUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Home",    id: "home" },
    { label: "Doctors", id: "doctors" },
    { label: "About",   id: "about" },
    { label: user ? "Dashboard" : "Login", id: user ? "dashboard" : "login" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(250,247,245,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.lightest}` : "none",
      transition: "all 0.3s ease",
      padding: "0 5vw",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.mid}, ${C.darkest})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: C.cream, fontSize: 16 }}>✦</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: "-0.02em" }}>
            Consult<em style={{ fontStyle: "italic", color: C.mid }}>MD</em>
          </span>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{
              background: "none", border: "none", padding: "8px 16px",
              fontSize: 14, fontWeight: page === l.id ? 500 : 400,
              color: page === l.id ? C.darkest : C.textMid,
              borderBottom: page === l.id ? `2px solid ${C.dark}` : "2px solid transparent",
              transition: "all 0.2s",
              cursor: "pointer",
            }}>{l.label}</button>
          ))}
          {user && (
            <button onClick={() => { setUser(null); ls.set("user", null); setPage("home"); }} style={{
              background: "none", border: `1px solid ${C.light}`, borderRadius: 6,
              padding: "7px 14px", fontSize: 13, color: C.textSoft, cursor: "pointer",
              marginLeft: 4,
            }}>Sign out</button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const features = [
    { icon: "🩺", title: "Expert Doctors", desc: "Access board-certified specialists across 20+ medical fields, available on your schedule." },
    { icon: "📅", title: "Instant Booking", desc: "Book same-day or future appointments in under two minutes. No hold music." },
    { icon: "🎥", title: "Video Consult", desc: "High-quality video consultations from the privacy and comfort of your own home." },
    { icon: "🔒", title: "Fully Secure", desc: "HIPAA-compliant platform with end-to-end encrypted consultations and records." },
  ];
  const stats = [
    { value: "12,000+", label: "Patients Served" },
    { value: "98%",     label: "Satisfaction Rate" },
    { value: "200+",    label: "Specialists" },
    { value: "24/7",    label: "Availability" },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${C.cream} 0%, ${C.lightest} 60%, ${C.light} 100%)`,
        display: "flex", alignItems: "center",
        padding: "120px 5vw 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.light}44, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "30%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.mid}22, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div className="fade-up" style={{ marginBottom: 20 }}>
              <Badge color={C.lightest}>Trusted Healthcare Platform</Badge>
            </div>
            <h1 className="fade-up delay-1" style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(42px, 6vw, 72px)",
              fontWeight: 300, lineHeight: 1.1,
              color: C.text, marginBottom: 24,
              letterSpacing: "-0.02em",
            }}>
              Your Health,<br />
              <em style={{ fontStyle: "italic", color: C.mid }}>Expert Care</em><br />
              <span style={{ fontWeight: 600 }}>Anywhere.</span>
            </h1>
            <p className="fade-up delay-2" style={{ fontSize: 16, color: C.textSoft, lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
              ConsultMD connects you with verified specialists for video consultations, seamless appointment booking, and continuous care — all in one place.
            </p>
            <div className="fade-up delay-3" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Btn onClick={() => setPage("doctors")}>Find a Doctor →</Btn>
              <Btn onClick={() => setPage("about")} variant="secondary">How It Works</Btn>
            </div>
            {/* Trust badges */}
            <div className="fade-up delay-4" style={{ display: "flex", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: C.darkest }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.textSoft, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card stack */}
          <div className="fade-in delay-3" style={{ position: "relative", height: 420, display: "flex", justifyContent: "center" }}>
            {/* Background card */}
            <div style={{
              position: "absolute", top: 30, right: 20, width: 300, height: 360,
              background: C.light, borderRadius: 20, opacity: 0.5,
              transform: "rotate(4deg)",
            }} />
            {/* Main card */}
            <div style={{
              position: "absolute", top: 0, right: 0, width: 310, height: 380,
              background: C.white, borderRadius: 20,
              boxShadow: `0 20px 60px ${C.dark}33`,
              padding: 28, display: "flex", flexDirection: "column", gap: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials="AO" size={52} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>Dr. Amara Osei</div>
                  <div style={{ fontSize: 13, color: C.textSoft }}>Cardiologist · 14 yrs exp</div>
                  <StarRating rating={4.9} />
                </div>
              </div>
              <div style={{ background: C.cream, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: C.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Next Available</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["09:00","10:00","11:00"].map(t => (
                    <div key={t} style={{
                      background: C.lightest, borderRadius: 8,
                      padding: "6px 12px", fontSize: 13, color: C.darkest, fontWeight: 500,
                    }}>{t}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: "#66bb6a", animation: "pulse 2s infinite",
                }} />
                <span style={{ fontSize: 13, color: C.textSoft }}>Available for video consult</span>
              </div>
              <Btn onClick={() => setPage("doctors")} style={{ width: "100%", justifyContent: "center" }}>Book Appointment</Btn>
              <div style={{ textAlign: "center", fontSize: 12, color: C.textSoft }}>Consultation fee: <strong style={{ color: C.darkest }}>$85</strong></div>
            </div>
            {/* Floating notification */}
            <div style={{
              position: "absolute", bottom: 20, left: -10,
              background: C.white, borderRadius: 14, padding: "12px 18px",
              boxShadow: `0 8px 30px ${C.dark}22`,
              display: "flex", alignItems: "center", gap: 10,
              animation: "fadeUp 0.8s 0.6s both",
            }}>
              <div style={{ fontSize: 22 }}>✅</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Appointment Confirmed</div>
                <div style={{ fontSize: 11, color: C.textSoft }}>Today at 10:00 AM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "100px 5vw", background: C.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Badge>Why ConsultMD</Badge>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300, color: C.text, marginTop: 16, letterSpacing: "-0.02em" }}>
              Healthcare reimagined
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
            {features.map((f, i) => (
              <div key={f.title} className={`fade-up delay-${i+1}`} style={{
                background: C.cream, borderRadius: 16, padding: "32px 28px",
                border: `1px solid ${C.lightest}`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${C.dark}18`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 5vw",
        background: `linear-gradient(135deg, ${C.darkest}, ${C.dark})`,
        textAlign: "center",
      }}>
        <Badge color={`${C.mid}66`}>Get Started Today</Badge>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: C.cream, margin: "20px 0 16px", letterSpacing: "-0.02em" }}>
          Ready for better healthcare?
        </h2>
        <p style={{ color: C.lightest, fontSize: 16, marginBottom: 36, opacity: 0.85 }}>
          Join 12,000+ patients who trust ConsultMD for their care.
        </p>
        <Btn onClick={() => setPage("register")} style={{ background: C.cream, color: C.darkest, border: `2px solid ${C.cream}` }}>
          Create Free Account
        </Btn>
      </section>
    </div>
  );
}

// ── DOCTORS PAGE ──────────────────────────────────────────────────────────────
function DoctorsPage({ setPage, setSelectedDoctor }) {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = DOCTORS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec   = specialty === "All" || d.specialty === specialty;
    const matchAvail  = !onlyAvailable || d.available;
    return matchSearch && matchSpec && matchAvail;
  });

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(120deg, ${C.lightest}, ${C.cream})`, padding: "48px 5vw 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Badge>Our Specialists</Badge>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: C.text, margin: "12px 0 8px", letterSpacing: "-0.02em" }}>
            Find Your Doctor
          </h1>
          <p style={{ color: C.textSoft, fontSize: 15 }}>Browse our verified specialists and book in minutes.</p>

          {/* Filters */}
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or specialty…"
              style={{
                flex: "1 1 260px", padding: "11px 18px", borderRadius: 8,
                border: `1.5px solid ${C.light}`, background: C.white, fontSize: 14, color: C.text,
                minWidth: 200,
              }}
            />
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={{
              padding: "11px 18px", borderRadius: 8, border: `1.5px solid ${C.light}`,
              background: C.white, fontSize: 14, color: C.text, cursor: "pointer",
            }}>
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: C.textMid }}>
              <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: C.darkest }} />
              Available only
            </label>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 5vw" }}>
        <p style={{ fontSize: 13, color: C.textSoft, marginBottom: 24 }}>{filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 24 }}>
          {filtered.map((doc, i) => (
            <DoctorCard key={doc.id} doc={doc} delay={i % 6}
              onView={() => { setSelectedDoctor(doc); setPage("doctor-profile"); }}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.textSoft }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No doctors found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ doc, delay, onView }) {
  return (
    <div className={`fade-up delay-${delay}`} style={{
      background: C.white, borderRadius: 16, padding: 24,
      border: `1px solid ${C.lightest}`,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 36px ${C.dark}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
        <Avatar initials={doc.img} size={54} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: C.text, marginBottom: 2 }}>{doc.name}</div>
          <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 4 }}>{doc.specialty}</div>
          <StarRating rating={doc.rating} />
        </div>
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
          background: doc.available ? "#66bb6a" : "#bdbdbd",
          animation: doc.available ? "pulse 2.5s infinite" : "none",
        }} />
      </div>

      <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6, marginBottom: 16 }}>{doc.bio}</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, fontSize: 13, color: C.textMid }}>
        <span>📋 {doc.reviews} reviews</span>
        <span>⏱ {doc.exp} yrs exp</span>
        <span style={{ marginLeft: "auto", fontWeight: 600, color: C.darkest }}>${doc.fee}</span>
      </div>

      <Btn onClick={onView} style={{ width: "100%", justifyContent: "center" }}
        variant={doc.available ? "primary" : "ghost"}
        disabled={!doc.available}
      >
        {doc.available ? "View & Book" : "Not Available"}
      </Btn>
    </div>
  );
}

// ── DOCTOR PROFILE PAGE ───────────────────────────────────────────────────────
function DoctorProfilePage({ doc, setPage, user, appointments, setAppointments }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!doc) { setPage("doctors"); return null; }

  const today = new Date().toISOString().split("T")[0];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const handleBook = () => {
    if (!user) { setPage("login"); return; }
    if (!selectedDate || !selectedSlot) return;
    setLoading(true);
    setTimeout(() => {
      const appt = { id: Date.now(), doctorId: doc.id, doctorName: doc.name, specialty: doc.specialty,
        date: selectedDate, slot: selectedSlot, reason, fee: doc.fee, status: "upcoming" };
      const updated = [...appointments, appt];
      setAppointments(updated);
      ls.set("appointments", updated);
      setBooked(true);
      setLoading(false);
    }, 1200);
  };

  if (booked) return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="fade-up" style={{ background: C.white, borderRadius: 20, padding: "56px 48px", textAlign: "center", maxWidth: 440, boxShadow: `0 20px 60px ${C.dark}18` }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: C.text, marginBottom: 12 }}>Booked!</h2>
        <p style={{ color: C.textSoft, fontSize: 15, marginBottom: 8 }}>Your appointment with <strong>{doc.name}</strong></p>
        <p style={{ color: C.textMid, fontSize: 15, marginBottom: 32 }}>{selectedDate} at {selectedSlot}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={() => setPage("dashboard")}>Go to Dashboard</Btn>
          <Btn onClick={() => setPage("doctors")} variant="secondary">Find More</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 5vw" }}>
        <button onClick={() => setPage("doctors")} style={{ background: "none", border: "none", color: C.textSoft, fontSize: 14, marginBottom: 32, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Doctors
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 36, alignItems: "start" }}>
          {/* Left: Doctor info */}
          <div>
            <div className="fade-up" style={{ background: C.white, borderRadius: 20, padding: 36, marginBottom: 24, border: `1px solid ${C.lightest}` }}>
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <Avatar initials={doc.img} size={80} />
                <div>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: C.text, marginBottom: 4 }}>{doc.name}</h1>
                  <div style={{ fontSize: 16, color: C.textSoft, marginBottom: 8 }}>{doc.specialty}</div>
                  <StarRating rating={doc.rating} />
                  <div style={{ marginTop: 4, fontSize: 13, color: C.textSoft }}>{doc.reviews} patient reviews</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28 }}>
                {[["Experience", `${doc.exp} years`], ["Patients", `${doc.reviews * 3}`], ["Consultation", `$${doc.fee}`]].map(([l, v]) => (
                  <div key={l} style={{ background: C.cream, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: C.darkest }}>{v}</div>
                    <div style={{ fontSize: 12, color: C.textSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up delay-1" style={{ background: C.white, borderRadius: 20, padding: 32, border: `1px solid ${C.lightest}` }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 14 }}>About</h3>
              <p style={{ color: C.textSoft, lineHeight: 1.8, fontSize: 15 }}>{doc.bio}</p>
            </div>
          </div>

          {/* Right: Booking form */}
          <div className="fade-up delay-2" style={{ background: C.white, borderRadius: 20, padding: 32, border: `1px solid ${C.lightest}`, position: "sticky", top: 90 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 24 }}>Book Appointment</h3>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Select Date</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {dates.map(d => {
                  const date = new Date(d);
                  const label = d === today ? "Today" : date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
                  return (
                    <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlot(""); }} style={{
                      padding: "8px 12px", borderRadius: 8, fontSize: 12,
                      border: `1.5px solid ${selectedDate === d ? C.darkest : C.lightest}`,
                      background: selectedDate === d ? C.darkest : C.cream,
                      color: selectedDate === d ? C.cream : C.textMid,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{label}</button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Available Slots</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {doc.slots.map(s => (
                    <button key={s} onClick={() => setSelectedSlot(s)} style={{
                      padding: "9px 14px", borderRadius: 8, fontSize: 13,
                      border: `1.5px solid ${selectedSlot === s ? C.darkest : C.light}`,
                      background: selectedSlot === s ? C.darkest : C.white,
                      color: selectedSlot === s ? C.cream : C.textMid,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Reason for Visit</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                placeholder="Briefly describe your symptoms or reason…"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  border: `1.5px solid ${C.light}`, background: C.cream,
                  fontSize: 14, color: C.text, resize: "vertical",
                }}
              />
            </div>

            <Btn onClick={handleBook} disabled={!selectedDate || !selectedSlot || loading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "⏳ Booking…" : `Confirm Booking · $${doc.fee}`}
            </Btn>
            {!user && <p style={{ textAlign: "center", fontSize: 12, color: C.textSoft, marginTop: 10 }}>You'll need to log in to confirm.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function DashboardPage({ user, appointments, setPage, setVideoDoc }) {
  const upcoming = appointments.filter(a => a.status === "upcoming");
  const past     = appointments.filter(a => a.status !== "upcoming");

  if (!user) {
    return (
      <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.text, marginBottom: 16 }}>Sign in to view your dashboard</h2>
          <Btn onClick={() => setPage("login")}>Sign In</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 5vw" }}>
        <div style={{ marginBottom: 40 }}>
          <Badge>My Account</Badge>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300, color: C.text, margin: "12px 0 4px", letterSpacing: "-0.02em" }}>
            Welcome back, <em style={{ fontStyle: "italic", color: C.mid }}>{user.name.split(" ")[0]}</em>
          </h1>
          <p style={{ color: C.textSoft }}>Manage your appointments and health records.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 40 }}>
          {[
            { label: "Upcoming", value: upcoming.length, icon: "📅", color: C.lightest },
            { label: "Completed", value: past.length, icon: "✅", color: C.lightest },
            { label: "Doctors Seen", value: new Set(appointments.map(a => a.doctorId)).size, icon: "🩺", color: C.lightest },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.light}22` }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: C.darkest }}>{s.value}</div>
              <div style={{ fontSize: 13, color: C.textSoft }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 18 }}>Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 14, padding: "36px 24px", textAlign: "center", marginBottom: 36 }}>
            <p style={{ color: C.textSoft, marginBottom: 16 }}>No upcoming appointments.</p>
            <Btn onClick={() => setPage("doctors")} variant="secondary">Find a Doctor</Btn>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
            {upcoming.map(a => (
              <AppointmentCard key={a.id} appt={a} onJoin={() => {
                const doc = DOCTORS.find(d => d.id === a.doctorId);
                setVideoDoc(doc); setPage("video");
              }} />
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 18 }}>Past Appointments</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {past.map(a => <AppointmentCard key={a.id} appt={a} isPast />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onJoin, isPast }) {
  return (
    <div className="fade-in" style={{
      background: C.white, borderRadius: 14, padding: "20px 24px",
      border: `1px solid ${C.lightest}`, display: "flex", alignItems: "center", gap: 20,
      opacity: isPast ? 0.7 : 1,
    }}>
      <Avatar initials={DOCTORS.find(d => d.id === appt.doctorId)?.img || "DR"} size={46} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{appt.doctorName}</div>
        <div style={{ fontSize: 13, color: C.textSoft }}>{appt.specialty}</div>
        {appt.reason && <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2, fontStyle: "italic" }}>"{appt.reason}"</div>}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.textMid }}>{appt.date}</div>
        <div style={{ fontSize: 13, color: C.textSoft }}>{appt.slot}</div>
        <div style={{ fontSize: 13, color: C.darkest, fontWeight: 600, marginTop: 2 }}>${appt.fee}</div>
      </div>
      {!isPast && (
        <Btn onClick={onJoin} style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
          🎥 Join Call
        </Btn>
      )}
    </div>
  );
}

// ── VIDEO CONSULTATION PAGE ───────────────────────────────────────────────────
function VideoPage({ doc, user, setPage }) {
  const [micOn, setMicOn]     = useState(true);
  const [camOn, setCamOn]     = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg]         = useState("");
  const [messages, setMessages] = useState([
    { from: "doctor", text: "Hello! I can see and hear you clearly. How are you feeling today?", time: "now" },
  ]);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus]   = useState("connecting"); // connecting | live | ended
  const chatRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setStatus("live"), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== "live") return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const sendMsg = () => {
    if (!msg.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(m => [...m, { from: "me", text: msg, time: now }]);
    setMsg("");
    // Doctor reply
    setTimeout(() => {
      const replies = ["I understand. Can you tell me more about that?", "That's helpful to know.", "How long have you been experiencing this?", "I'll make a note of that."];
      setMessages(m => [...m, { from: "doctor", text: replies[Math.floor(Math.random()*replies.length)], time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) }]);
    }, 1800);
  };

  if (!doc) { setPage("dashboard"); return null; }

  return (
    <div style={{ height: "100vh", background: "#1a1008", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", background: "rgba(0,0,0,0.5)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: C.cream }}>
            Consult<em style={{ color: C.light }}>MD</em>
          </div>
          <span style={{ color: C.light, fontSize: 13, opacity: 0.7 }}>· Secure Session</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {status === "live" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef5350", animation: "pulse 1.5s infinite" }} />
                <span style={{ color: "#ef5350", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em" }}>LIVE</span>
              </div>
              <span style={{ color: C.lightest, fontSize: 14, fontFamily: "monospace", animation: "timerTick 1s infinite" }}>
                {fmtTime(seconds)}
              </span>
            </>
          )}
          {status === "connecting" && (
            <span style={{ color: C.light, fontSize: 13 }}>⏳ Connecting…</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setChatOpen(o => !o)} style={{
            background: chatOpen ? C.mid : "rgba(255,255,255,0.12)",
            border: "none", borderRadius: 8, padding: "8px 14px",
            color: C.cream, fontSize: 13, cursor: "pointer",
          }}>💬 Chat</button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Doctor video (simulated) */}
        <div style={{
          flex: 1, position: "relative",
          background: `linear-gradient(135deg, ${C.darkest}cc, #1a1008)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {status === "connecting" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 50, height: 50, border: `3px solid ${C.light}`, borderTop: `3px solid ${C.mid}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: C.lightest, fontSize: 16 }}>Connecting to {doc.name}…</p>
            </div>
          ) : (
            <>
              {/* Simulated doctor feed */}
              <div style={{ textAlign: "center" }}>
                <Avatar initials={doc.img} size={100} />
                <p style={{ color: C.lightest, marginTop: 16, fontSize: 16 }}>{doc.name}</p>
                <p style={{ color: C.light, fontSize: 13 }}>{doc.specialty}</p>
              </div>
              {/* Doctor name overlay */}
              <div style={{
                position: "absolute", bottom: 20, left: 20,
                background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "6px 14px",
              }}>
                <span style={{ color: C.cream, fontSize: 14 }}>{doc.name} · {doc.specialty}</span>
              </div>
            </>
          )}

          {/* My video (PiP) */}
          <div style={{
            position: "absolute", bottom: 20, right: 20,
            width: 180, height: 120, borderRadius: 12,
            background: camOn ? `linear-gradient(135deg, ${C.mid}, ${C.dark})` : "#333",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: `2px solid ${C.light}44`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}>
            {camOn ? (
              <>
                <Avatar initials={user ? user.name.split(" ").map(n=>n[0]).join("").slice(0,2) : "ME"} size={40} />
                <span style={{ color: C.cream, fontSize: 11, marginTop: 6 }}>You</span>
              </>
            ) : (
              <span style={{ color: "#aaa", fontSize: 12 }}>Camera off</span>
            )}
            {!micOn && (
              <div style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>🔇</div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="slide-in" style={{
            width: 320, background: "#111", borderLeft: `1px solid ${C.dark}44`,
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.dark}44` }}>
              <span style={{ color: C.lightest, fontWeight: 600 }}>Chat</span>
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "me" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    background: m.from === "me" ? C.darkest : "rgba(255,255,255,0.1)",
                    color: C.cream, borderRadius: 10, padding: "9px 13px",
                    maxWidth: 220, fontSize: 13, lineHeight: 1.5,
                    borderBottomRightRadius: m.from === "me" ? 2 : 10,
                    borderBottomLeftRadius:  m.from === "me" ? 10 : 2,
                  }}>{m.text}</div>
                  <span style={{ fontSize: 10, color: "#666", marginTop: 3 }}>{m.time}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.dark}44`, display: "flex", gap: 8 }}>
              <input value={msg} onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
                placeholder="Type a message…"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.08)", border: "none",
                  borderRadius: 8, padding: "9px 12px", color: C.cream, fontSize: 13,
                }}
              />
              <button onClick={sendMsg} style={{
                background: C.darkest, border: "none", borderRadius: 8,
                padding: "9px 14px", color: C.cream, cursor: "pointer", fontSize: 14,
              }}>↑</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        background: "rgba(0,0,0,0.7)", padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
      }}>
        {[
          { icon: micOn ? "🎙️" : "🔇", label: micOn ? "Mute" : "Unmute", action: () => setMicOn(v => !v), active: micOn },
          { icon: camOn ? "📹" : "📷", label: camOn ? "Camera off" : "Camera on", action: () => setCamOn(v => !v), active: camOn },
        ].map(ctrl => (
          <button key={ctrl.label} onClick={ctrl.action} style={{
            background: ctrl.active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${ctrl.active ? C.light+"44" : "#ff6b6b44"}`,
            borderRadius: 10, padding: "12px 18px", color: ctrl.active ? C.cream : "#ff8a80",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 72,
            fontSize: 20,
          }}>
            <span>{ctrl.icon}</span>
            <span style={{ fontSize: 11, opacity: 0.8 }}>{ctrl.label}</span>
          </button>
        ))}
        <button onClick={() => setPage("dashboard")} style={{
          background: "#c62828", border: "none", borderRadius: 10,
          padding: "12px 28px", color: "#fff", cursor: "pointer",
          fontSize: 14, fontWeight: 600, letterSpacing: "0.04em",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <span style={{ fontSize: 20 }}>📴</span>
          <span style={{ fontSize: 11 }}>End Call</span>
        </button>
      </div>
    </div>
  );
}

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
function AboutPage({ setPage }) {
  const steps = [
    { n: "01", title: "Create Account", desc: "Register in seconds. No paperwork, no hassle." },
    { n: "02", title: "Find a Specialist", desc: "Browse our verified doctors by specialty, rating, or availability." },
    { n: "03", title: "Book Your Slot", desc: "Pick a time that suits you — today, tomorrow, or next week." },
    { n: "04", title: "Join Video Call", desc: "Connect with your doctor from anywhere via secure video." },
  ];
  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream }}>
      <div style={{ background: `linear-gradient(120deg, ${C.lightest}, ${C.cream})`, padding: "64px 5vw 60px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Badge>About Us</Badge>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: C.text, margin: "16px 0 20px", letterSpacing: "-0.02em" }}>
            Humanising<br /><em style={{ fontStyle: "italic", color: C.mid }}>digital healthcare</em>
          </h1>
          <p style={{ color: C.textSoft, fontSize: 16, lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
            ConsultMD was founded on a simple belief: every person deserves prompt access to expert medical care, regardless of where they live. We bridge the gap between patients and specialists through thoughtful technology.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 5vw" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: C.text, textAlign: "center", marginBottom: 56 }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
          {steps.map((s, i) => (
            <div key={s.n} className={`fade-up delay-${i+1}`} style={{
              background: C.white, borderRadius: 16, padding: "28px 24px",
              border: `1px solid ${C.lightest}`,
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, color: C.lightest, lineHeight: 1, marginBottom: 16 }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Btn onClick={() => setPage("register")}>Get Started Free →</Btn>
        </div>
      </div>
    </div>
  );
}

// ── AUTH PAGES ────────────────────────────────────────────────────────────────
function LoginPage({ setPage, setUser }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = { name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()), email };
      setUser(user); ls.set("user", user);
      setPage("dashboard"); setLoading(false);
    }, 1000);
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to your ConsultMD account">
    {error && <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}
    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
    <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
    <Btn onClick={handle} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
      {loading ? "Signing in…" : "Sign In"}
    </Btn>
    <p style={{ textAlign: "center", fontSize: 13, color: C.textSoft, marginTop: 18 }}>
      No account?{" "}
      <button onClick={() => setPage("register")} style={{ background: "none", border: "none", color: C.darkest, fontWeight: 500, cursor: "pointer", fontSize: 13 }}>
        Create one →
      </button>
    </p>
  </AuthLayout>;
}

function RegisterPage({ setPage, setUser }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!name || !email || !password) return;
    setLoading(true);
    setTimeout(() => {
      const user = { name, email };
      setUser(user); ls.set("user", user);
      setPage("dashboard"); setLoading(false);
    }, 1000);
  };

  return <AuthLayout title="Create account" subtitle="Join ConsultMD — it's free">
    <Field label="Full Name" value={name} onChange={setName} placeholder="Kwame Mensah" />
    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
    <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Choose a strong password" />
    <Btn onClick={handle} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
      {loading ? "Creating…" : "Create Account"}
    </Btn>
    <p style={{ textAlign: "center", fontSize: 13, color: C.textSoft, marginTop: 18 }}>
      Already have an account?{" "}
      <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: C.darkest, fontWeight: 500, cursor: "pointer", fontSize: 13 }}>
        Sign in →
      </button>
    </p>
  </AuthLayout>;
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 9,
          border: `1.5px solid ${C.light}`, background: C.cream,
          fontSize: 14, color: C.text,
        }}
      />
    </div>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: `linear-gradient(135deg, ${C.lightest}, ${C.cream})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "88px 20px 40px" }}>
      <div className="fade-up" style={{ background: C.white, borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 420, boxShadow: `0 20px 60px ${C.dark}18` }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</h2>
        <p style={{ color: C.textSoft, fontSize: 14, marginBottom: 32 }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

// ── 404 PAGE ──────────────────────────────────────────────────────────────────
function NotFoundPage({ setPage }) {
  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div className="fade-up">
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 120, fontWeight: 300, color: C.lightest, lineHeight: 1 }}>404</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.text, margin: "12px 0 16px" }}>Page not found</h2>
        <p style={{ color: C.textSoft, marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
        <Btn onClick={() => setPage("home")}>← Back to Home</Btn>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background: C.text, color: C.lightest, padding: "50px 5vw 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40, flexWrap: "wrap", marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, marginBottom: 10 }}>
              Consult<em style={{ color: C.mid }}>MD</em>
            </div>
            <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 240, lineHeight: 1.7 }}>Expert healthcare, wherever you are. Trusted by thousands of patients.</p>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {[
              { heading: "Platform", links: [["home","Home"],["doctors","Doctors"],["about","About"]] },
              { heading: "Account",  links: [["login","Login"],["register","Register"],["dashboard","Dashboard"]] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: 14 }}>{col.heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map(([id, label]) => (
                    <button key={id} onClick={() => setPage(id)} style={{ background: "none", border: "none", color: C.lightest, fontSize: 14, opacity: 0.8, cursor: "pointer", textAlign: "left", padding: 0 }}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.dark}44`, paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, opacity: 0.5 }}>© 2026 ConsultMD. All rights reserved.</span>
          <span style={{ fontSize: 12, opacity: 0.5 }}>HIPAA Compliant · Secure · Private</span>
        </div>
      </div>
    </footer>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]               = useState("home");
  const [user, setUser]               = useState(() => ls.get("user", null));
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [videoDoc, setVideoDoc]       = useState(null);
  const [appointments, setAppointments] = useState(() => ls.get("appointments", []));

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  const noFrame = page === "video";

  return (
    <div>
      {!noFrame && <Navbar page={page} setPage={setPage} user={user} setUser={setUser} />}
      
      {page === "home"           && <HomePage setPage={setPage} />}
      {page === "doctors"        && <DoctorsPage setPage={setPage} setSelectedDoctor={setSelectedDoctor} />}
      {page === "doctor-profile" && <DoctorProfilePage doc={selectedDoctor} setPage={setPage} user={user} appointments={appointments} setAppointments={setAppointments} />}
      {page === "dashboard"      && <DashboardPage user={user} appointments={appointments} setPage={setPage} setVideoDoc={setVideoDoc} />}
      {page === "video"          && <VideoPage doc={videoDoc || selectedDoctor} user={user} setPage={setPage} />}
      {page === "about"          && <AboutPage setPage={setPage} />}
      {page === "login"          && <LoginPage setPage={setPage} setUser={setUser} />}
      {page === "register"       && <RegisterPage setPage={setPage} setUser={setUser} />}
      {!["home","doctors","doctor-profile","dashboard","video","about","login","register"].includes(page) && <NotFoundPage setPage={setPage} />}

      {!noFrame && <Footer setPage={setPage} />}
    </div>
  );
}

