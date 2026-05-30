import { useRef, useEffect, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import "./LandingPage.css";

// ─── Canvas error boundary ────────────────────────────────────────────────────

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MouseRef = { current: { x: number; y: number } };

// ─── 3D: Morphing blob ────────────────────────────────────────────────────────

function Blob({ mouse }: { mouse: MouseRef }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    mesh.current.rotation.x = THREE.MathUtils.lerp(
      mesh.current.rotation.x,
      mouse.current.y * 0.3,
      0.05
    );
    mesh.current.rotation.y = THREE.MathUtils.lerp(
      mesh.current.rotation.y,
      mouse.current.x * 0.3,
      0.05
    );
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2, 4]} />
        <MeshDistortMaterial
          color="#6d28d9"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          emissive="#2e1065"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

// ─── 3D: Orbiting ring of dots ────────────────────────────────────────────────

function Ring({ mouse }: { mouse: MouseRef }) {
  const group = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    group.current.rotation.y = clock.elapsedTime * 0.22;
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      mouse.current.x * 0.14,
      0.04
    );
  });

  return (
    <group ref={group}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.8, Math.sin(a) * 3.8, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={4} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── 3D: Second tilted ring ───────────────────────────────────────────────────

function Ring2({ mouse }: { mouse: MouseRef }) {
  const group = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    group.current.rotation.x = clock.elapsedTime * 0.18;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      mouse.current.y * 0.12,
      0.03
    );
  });

  return (
    <group ref={group} rotation={[Math.PI / 3, 0, 0]}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={5} />
          </mesh>
        );
      })}
    </group>
  );
}

function Scene({ mouse }: { mouse: MouseRef }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[8, 8, 8]} intensity={5} color="#7c3aed" />
      <pointLight position={[-8, -8, -8]} intensity={4} color="#22d3ee" />
      <pointLight position={[0, 10, -6]} intensity={2} color="#a855f7" />
      <Stars radius={120} depth={60} count={6000} factor={3} saturation={0.4} fade speed={0.4} />
      <Blob mouse={mouse} />
      <Ring mouse={mouse} />
      <Ring2 mouse={mouse} />
    </>
  );
}

// ─── Terminal logs ────────────────────────────────────────────────────────────

const LOGS = [
  { color: "#22d3ee", text: "[INFO] Initializing infrastructure..." },
  { color: "#22d3ee", text: "[INFO] Connecting global nodes..." },
  { color: "#4ade80", text: "[SUCCESS] AI routing enabled" },
  { color: "#22d3ee", text: "[INFO] Neural firewall online" },
  { color: "#4ade80", text: "[SUCCESS] Kubernetes mesh synced" },
  { color: "#facc15", text: "[WARNING] Threat blocked — 18,221" },
];

function Terminal() {
  const [lines, setLines] = useState<typeof LOGS>([]);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      const idx = i++;
      setLines(prev => (idx < LOGS.length ? [...prev, LOGS[idx]] : prev));
      if (i >= LOGS.length) clearInterval(iv);
    }, 700);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="lp-terminal">
      <div className="lp-terminal-bar">
        <span className="lp-dot" style={{ background: "#ef4444" }} />
        <span className="lp-dot" style={{ background: "#facc15" }} />
        <span className="lp-dot" style={{ background: "#4ade80" }} />
        <span className="lp-terminal-title">neural-ops ~ system</span>
      </div>
      <div className="lp-terminal-body">
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.color }}>{l.text}</div>
        ))}
        {lines.length < LOGS.length && <span className="lp-blink">█</span>}
      </div>
    </div>
  );
}

// ─── Page data ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "◈",
    title: "3D Infrastructure",
    desc: "Visualize your entire cloud topology as a live, navigable 3D graph in real time.",
  },
  {
    icon: "⚡",
    title: "AI Routing",
    desc: "Neural networks compute optimal packet paths across your mesh in under 10ms.",
  },
  {
    icon: "⬡",
    title: "Neural Firewall",
    desc: "Adaptive threat detection that evolves with every new attack pattern it sees.",
  },
  {
    icon: "◎",
    title: "Edge Mesh",
    desc: "Instant deployment to 420+ edge nodes across 78 countries worldwide.",
  },
];

const STATS = [
  { value: "420+", label: "Edge Nodes" },
  { value: "12ms", label: "Avg Latency" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "18k+", label: "Threats Blocked" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState(false);

  // Mouse tracking — update 3D scene ref and cursor glow via DOM (no re-render)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("revealed")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* Cursor glow — position updated via ref, no re-render */}
      <div ref={cursorRef} className="lp-cursor-glow" />

      {/* Ambient background orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <span className="lp-logo-mark">N</span>
          NEURAL OPS
        </div>
        <div className="lp-nav-links">
          <a href="#">Infrastructure</a>
          <a href="#">AI Routing</a>
          <a href="#">Security</a>
          <a href="#">Edge Mesh</a>
        </div>
        <button className="lp-btn-outline" onClick={() => setModal(true)}>
          Get Access
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-canvas">
          <CanvasBoundary>
            <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
              <Scene mouse={mouseRef} />
            </Canvas>
          </CanvasBoundary>
        </div>

        <div className="lp-hero-content">
          <div className="lp-eyebrow">
            <span className="lp-pulse-dot" />
            GLOBAL NETWORK ACTIVE — 420 NODES ONLINE
          </div>

          <h1 className="lp-hero-title">
            Control<br />
            <span className="lp-grad">Global</span><br />
            Infrastructure
          </h1>

          <p className="lp-hero-sub">
            Interactive 3D neural infrastructure visualization with
            realtime AI routing and adaptive threat detection.
          </p>

          <div className="lp-hero-btns">
            <button className="lp-btn-primary" onClick={() => setModal(true)}>
              Launch System
            </button>
            <button className="lp-btn-ghost">View Network →</button>
          </div>

          <Terminal />
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="lp-stats reveal">
        {STATS.map(s => (
          <div key={s.label} className="lp-stat">
            <span className="lp-stat-val">{s.value}</span>
            <span className="lp-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="lp-features">
        <div className="lp-section-head reveal">
          <p className="lp-eyebrow">
            <span className="lp-pulse-dot" />
            CAPABILITIES
          </p>
          <h2 className="lp-section-title">
            Built for the next<br />
            <span className="lp-grad">generation</span> of networks
          </h2>
        </div>

        <div className="lp-feature-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="lp-card reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="lp-card-icon">{f.icon}</div>
              <h3 className="lp-card-title">{f.title}</h3>
              <p className="lp-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="lp-cta reveal">
        <h2 className="lp-cta-title">
          Ready to take<br />
          <span className="lp-grad">control?</span>
        </h2>
        <p className="lp-cta-sub">Join 1,200+ teams already running on Neural Ops.</p>
        <button className="lp-btn-primary lp-btn-lg" onClick={() => setModal(true)}>
          Get Early Access — Free
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-logo" style={{ marginBottom: 12 }}>
          <span className="lp-logo-mark">N</span>
          NEURAL OPS
        </div>
        <p>© 2026 Neural Ops. All rights reserved.</p>
      </footer>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {modal && (
        <div className="lp-backdrop" onClick={() => setModal(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <button className="lp-modal-close" onClick={() => setModal(false)}>✕</button>
            <h3 className="lp-grad" style={{ fontSize: "1.8rem", margin: "0 0 8px" }}>
              Get Early Access
            </h3>
            <p className="lp-modal-sub">
              Join the waitlist and be first to experience Neural Ops.
            </p>
            <form
              className="lp-form"
              onSubmit={e => { e.preventDefault(); setModal(false); }}
            >
              <input type="text" placeholder="Your name" required />
              <input type="email" placeholder="Work email" required />
              <button type="submit" className="lp-btn-primary" style={{ width: "100%" }}>
                Request Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
