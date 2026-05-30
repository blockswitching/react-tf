import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

const COLORS = {
  cyan: "#00ffff",
  purple: "#8b5cf6",
  blue: "#06b6d4",
};

function FloatingNode({
  position,
}: {
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state: any) => {
    ref.current.position.y =
      position[1] +
      Math.sin(state.clock.elapsedTime + position[0]) * 0.1;

    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={COLORS.cyan}
        emissive={COLORS.cyan}
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function ConnectionLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const ref = useRef<THREE.Line>(null!);

  const points = useMemo(() => {
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ];
  }, [start, end]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: COLORS.blue,
            transparent: true,
            opacity: 0.3,
          })
        )
      }
      ref={ref}
    />
  );
}

function Packet({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null!);

  const progress = useRef(Math.random());

  useFrame(() => {
    progress.current += 0.003;

    if (progress.current > 1) {
      progress.current = 0;
    }

    const x =
      start[0] + (end[0] - start[0]) * progress.current;

    const y =
      start[1] + (end[1] - start[1]) * progress.current;

    const z =
      start[2] + (end[2] - start[2]) * progress.current;

    ref.current.position.set(x, y, z);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 12, 12]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

function NetworkSphere() {
  const groupRef = useRef<THREE.Group>(null!);

  const nodes = useMemo(() => {
    return Array.from({ length: 80 }, () => [
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
    ]) as [number, number, number][];
  }, []);

  const connections = useMemo(() => {
    const result: {
      start: [number, number, number];
      end: [number, number, number];
    }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];

        const distance = Math.sqrt(
          dx * dx + dy * dy + dz * dz
        );

        if (distance < 2.5 && Math.random() > 0.7) {
          result.push({
            start: nodes[i],
            end: nodes[j],
          });
        }
      }
    }

    return result;
  }, [nodes]);

  useFrame(() => {
    groupRef.current.rotation.y += 0.001;
    groupRef.current.rotation.x += 0.0005;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <FloatingNode key={i} position={node} />
      ))}

      {connections.map((line, i) => (
        <ConnectionLine
          key={i}
          start={line.start}
          end={line.end}
        />
      ))}

      {connections.slice(0, 20).map((line, i) => (
        <Packet
          key={i}
          start={line.start}
          end={line.end}
        />
      ))}
    </group>
  );
}

function TerminalLogs() {
  const logs = [
    "[INFO] Initializing infrastructure...",
    "[INFO] Connecting global nodes...",
    "[SUCCESS] AI routing enabled",
    "[INFO] Neural firewall online",
    "[SUCCESS] Kubernetes mesh synced",
    "[WARNING] Threat blocked",
  ];

  const [visibleLogs, setVisibleLogs] = useState<string[]>(
    []
  );

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setVisibleLogs((prev) => [...prev, logs[i]]);
      i++;

      if (i >= logs.length) {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        marginTop: 30,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(0,255,255,0.2)",
        borderRadius: 16,
        padding: "1rem",
        width: 420,
        fontFamily: "monospace",
        color: "#00ffff",
        backdropFilter: "blur(20px)",
      }}
    >
      {visibleLogs.map((log, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          {log}
        </div>
      ))}
    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "2rem",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.45)",
          marginBottom: 10,
          fontSize: 13,
          letterSpacing: "0.1em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: COLORS.cyan,
          fontSize: "2.5rem",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, #111827 0%, #020617 50%, #000000 100%)",
        color: "white",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        body {
          margin: 0;
          overflow-x: hidden;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .glow {
          text-shadow:
            0 0 10px rgba(0,255,255,0.8),
            0 0 20px rgba(0,255,255,0.4);
        }
      `}</style>

      <div className="grid-bg" />

      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 3rem",
          zIndex: 100,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="glow"
          style={{
            color: COLORS.cyan,
            fontWeight: 900,
            fontSize: 28,
          }}
        >
          NEURAL OPS
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>Infrastructure</span>
          <span>AI Routing</span>
          <span>Security</span>
          <span>Edge Mesh</span>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 6rem",
          position: "relative",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "50%",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(0,255,255,0.08)",
              border: "1px solid rgba(0,255,255,0.2)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.cyan,
              }}
            />

            <span
              style={{
                color: COLORS.cyan,
                fontSize: 13,
                letterSpacing: "0.1em",
              }}
            >
              GLOBAL NETWORK ACTIVE
            </span>
          </div>

          <h1
            className="glow"
            style={{
              fontSize: "6rem",
              lineHeight: 0.9,
              marginTop: 30,
              marginBottom: 20,
              fontWeight: 900,
            }}
          >
            CONTROL
            <br />
            GLOBAL
            <br />
            INFRASTRUCTURE
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.8,
              maxWidth: 650,
              fontSize: 18,
            }}
          >
            Interactive 3D neural infrastructure
            visualization platform with realtime
            packet routing and AI threat detection.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 30,
            }}
          >
            <button
              style={{
                background: COLORS.cyan,
                color: "black",
                border: "none",
                padding: "16px 32px",
                borderRadius: 14,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Launch System
            </button>

            <button
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                padding: "16px 32px",
                borderRadius: 14,
                cursor: "pointer",
              }}
            >
              View Network
            </button>
          </div>

          <TerminalLogs />
        </div>

        {/* 3D */}
        <div
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          <Canvas camera={{ position: [0, 0, 10] }}>
            <ambientLight intensity={0.5} />

            <pointLight
              position={[10, 10, 10]}
              intensity={2}
              color={COLORS.cyan}
            />

            <pointLight
              position={[-10, -10, -10]}
              intensity={2}
              color={COLORS.purple}
            />

            <Stars
              radius={100}
              depth={50}
              count={4000}
              factor={4}
              saturation={0}
              fade
            />

            <NetworkSphere />

            <OrbitControls
              autoRotate
              autoRotateSpeed={0.5}
              enableZoom={false}
            />
          </Canvas>
        </div>
      </section>

      {/* METRICS */}
      <section
        style={{
          padding: "4rem 6rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px,1fr))",
            gap: "1.5rem",
          }}
        >
          <Metric
            title="ACTIVE NODES"
            value="412"
          />

          <Metric
            title="LATENCY"
            value="12ms"
          />

          <Metric
            title="THREATS BLOCKED"
            value="18,221"
          />

          <Metric
            title="AI ROUTING"
            value="ONLINE"
          />
        </div>
      </section>
    </div>
  );
}