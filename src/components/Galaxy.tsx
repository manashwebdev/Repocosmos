"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useState } from "react";
import type { Star } from "@/lib/layout";

function Stars({ data, t, onHover, onSelect }: { data: Star[]; t: number; onHover?: (s: Star | null) => void; onSelect?: (s: Star | null) => void }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D(), c = new THREE.Color();
    data.forEach((s, i) => { o.position.set(s.x, s.y, s.z); o.scale.setScalar(s.born <= t ? s.r : 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); c.set(s.color).multiplyScalar(2.2); m.setColorAt(i, c); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [data, t]);
  const hit = (e: ThreeEvent<PointerEvent | MouseEvent>) => (e.instanceId != null ? data[e.instanceId] : null);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.length]} frustumCulled={false}
      onPointerMove={(e) => { e.stopPropagation(); onHover?.(hit(e)); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover?.(null); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(hit(e)); }}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
function Backdrop() {
  const g = useRef<THREE.Points>(null);
  const pos = useRef(new Float32Array(Array.from({ length: 2400 }, (_, i) => (((i * 9301 + 49297) % 233280) / 233280 - 0.5) * 400)));
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * 0.005; });
  return <points ref={g}><bufferGeometry><bufferAttribute attach="attributes-position" array={pos.current} count={800} itemSize={3} /></bufferGeometry><pointsMaterial size={0.5} color="#8A90A6" sizeAttenuation transparent opacity={0.6} /></points>;
}
export default function Galaxy({ data, t = 1, onHover, onSelect, autoRotate = true }: { data: Star[]; t?: number; onHover?: (s: Star | null) => void; onSelect?: (s: Star | null) => void; autoRotate?: boolean }) {
  const [hq, setHq] = useState(true);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, -70, 60], fov: 55 }} gl={{ antialias: false, preserveDrawingBuffer: true }} onPointerMissed={() => onSelect?.(null)}>
      <color attach="background" args={["#05060A"]} />
      <PerformanceMonitor onDecline={() => setHq(false)} />
      <Backdrop />
      <Stars data={data} t={t} onHover={onHover} onSelect={onSelect} />
      <OrbitControls enableDamping autoRotate={autoRotate && !reduce} autoRotateSpeed={0.35} maxDistance={220} minDistance={8} />
      {hq && <EffectComposer><Bloom intensity={1.1} luminanceThreshold={0.2} mipmapBlur /></EffectComposer>}
    </Canvas>
  );
}
