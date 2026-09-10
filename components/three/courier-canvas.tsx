"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { SceneVariant } from "./scene-types";

const colors = {
  navy: "#16344f",
  navyDeep: "#0a2033",
  teal: "#14839a",
  tealBright: "#44bfd0",
  paper: "#f7f4ec",
  silver: "#a9bbc2",
  road: "#4d6069",
  rubber: "#152128",
  parcel: "#b8895d",
};

export function BrandPlaque({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const texture = useTexture("/brand/vk-and-company-logo-transparent.png");
  const brandTexture = useMemo(() => {
    const clone = texture.clone();
    clone.colorSpace = THREE.SRGBColorSpace;
    clone.anisotropy = 4;
    clone.needsUpdate = true;
    return clone;
  }, [texture]);
  useEffect(() => () => brandTexture.dispose(), [brandTexture]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[1.18, 1.18, 0.07]} radius={0.06} smoothness={3} castShadow>
        <meshStandardMaterial color="#d9d7d0" metalness={0.18} roughness={0.42} />
      </RoundedBox>
      <mesh position={[0, 0, 0.039]}>
        <planeGeometry args={[1.08, 1.08]} />
        <meshBasicMaterial map={brandTexture} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}

function Wheel({ position, spin = 0 }: { position: [number, number, number]; spin?: number }) {
  return (
    <group name="truck-wheel" position={position} rotation={[Math.PI / 2, spin, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.3, 32]} />
        <meshStandardMaterial color={colors.rubber} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.32, 20]} />
        <meshStandardMaterial color={colors.silver} metalness={0.72} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <torusGeometry args={[0.31, 0.025, 8, 24]} />
        <meshStandardMaterial color="#5c7079" metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function Truck({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], progress = 0, rootRef, doorOpen, wheelSpin }: { scale?: number; position?: [number, number, number]; rotation?: [number, number, number]; progress?: number; rootRef?: React.RefObject<THREE.Group | null>; doorOpen?: number; wheelSpin?: number }) {
  const doorAngle = (doorOpen ?? Math.max(0, 1 - progress * 5)) * 0.82;
  const spin = wheelSpin ?? progress * Math.PI * 12;
  return (
    <group ref={rootRef} scale={scale} position={position} rotation={rotation}>
      <RoundedBox args={[4.05, 2.25, 2.55]} radius={0.13} smoothness={4} position={[0.42, 1.48, 0]} castShadow>
        <meshStandardMaterial color={colors.navy} metalness={0.17} roughness={0.36} />
      </RoundedBox>
      {[[-0.75, 1.48], [0.55, 1.48], [1.8, 1.48]].map(([x, y]) => <mesh key={x} position={[x, y, 1.281]}><boxGeometry args={[0.022, 1.95, 0.025]} /><meshStandardMaterial color="#31536b" metalness={0.4} /></mesh>)}
      <RoundedBox args={[1.35, 1.8, 2.36]} radius={0.23} smoothness={4} position={[-2.18, 1.12, 0]} castShadow>
        <meshStandardMaterial color={colors.teal} metalness={0.13} roughness={0.32} />
      </RoundedBox>
      <mesh position={[-2.76, 1.72, 0]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.06, 0.72, 1.74]} />
        <meshPhysicalMaterial color="#9ed2dd" transparent opacity={0.76} metalness={0.28} roughness={0.1} transmission={0.12} />
      </mesh>
      {[-1.14, 1.14].map((z) => <mesh key={z} position={[-2.37, 1.48, z]}><planeGeometry args={[0.55, 0.72]} /><meshPhysicalMaterial color="#87beca" transparent opacity={0.72} roughness={0.12} metalness={0.2} /></mesh>)}
      {[-1, 1].map((z) => <group key={z} position={[-2.74, 1.48, z * 1.27]}><mesh><boxGeometry args={[0.32, 0.08, 0.08]} /><meshStandardMaterial color="#263942" metalness={0.7} /></mesh><mesh position={[-0.17, 0, z * 0.05]}><boxGeometry args={[0.18, 0.3, 0.05]} /><meshStandardMaterial color="#1c303b" metalness={0.45} /></mesh></group>)}
      <mesh position={[-2.88, 0.67, 0]}><boxGeometry args={[0.12, 0.52, 1.15]} /><meshStandardMaterial color="#203742" metalness={0.68} roughness={0.3} /></mesh>
      {[-0.36, -0.14, 0.08, 0.3].map((y) => <mesh key={y} position={[-2.951, 0.67 + y, 0]}><boxGeometry args={[0.02, 0.035, 0.88]} /><meshStandardMaterial color="#8799a0" metalness={0.8} /></mesh>)}
      {[-0.92, 0.92].map((z) => <mesh key={z} position={[-2.96, 0.82, z]}><boxGeometry args={[0.07, 0.24, 0.34]} /><meshStandardMaterial color="#f8e4a8" emissive="#e4b64a" emissiveIntensity={0.7} /></mesh>)}
      <mesh position={[-2.93, 0.33, 0]}><boxGeometry args={[0.18, 0.22, 2.5]} /><meshStandardMaterial color="#b5c3c7" metalness={0.78} roughness={0.25} /></mesh>
      <BrandPlaque position={[0.1, 1.48, 1.323]} scale={0.82} />
      {[[-2.15, 0.45, 1.28], [-2.15, 0.45, -1.28], [1.42, 0.45, 1.28], [1.42, 0.45, -1.28]].map((p, index) => <Wheel key={index} position={p as [number, number, number]} spin={spin} />)}
      {[1, -1].map((side) => <mesh name="rear-door" userData={{ side }} key={side} position={[2.48, 1.5, side * 0.65]} rotation={[0, side * doorAngle, 0]} castShadow><boxGeometry args={[0.09, 2.06, 1.2]} /><meshStandardMaterial color="#28536d" metalness={0.22} roughness={0.4} />{[0.36, -0.36].map((z) => <mesh key={z} position={[0.065, 0, z]}><boxGeometry args={[0.04, 1.65, 0.04]} /><meshStandardMaterial color={colors.silver} metalness={0.7} /></mesh>)}</mesh>)}
    </group>
  );
}

export function Parcel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, branded = false }: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number]; branded?: boolean }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[1, 0.8, 0.86]} radius={0.055} smoothness={3} castShadow>
        <meshStandardMaterial color={colors.parcel} roughness={0.78} />
      </RoundedBox>
      <mesh position={[0, 0.405, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.19, 0.86]} /><meshStandardMaterial color="#ead4aa" roughness={0.82} /></mesh>
      {branded && <BrandPlaque position={[0, 0, 0.435]} scale={0.27} />}
    </group>
  );
}

function Conveyor({ position = [0, 0, 0], length = 5 }: { position?: [number, number, number]; length?: number }) {
  return (
    <group position={position}>
      <RoundedBox args={[length, 0.18, 1.2]} radius={0.08} smoothness={3} position={[0, 0.72, 0]} castShadow><meshStandardMaterial color="#748790" metalness={0.5} roughness={0.35} /></RoundedBox>
      {Array.from({ length: Math.floor(length * 2) }).map((_, index) => <mesh key={index} position={[-length / 2 + 0.3 + index * 0.5, 0.83, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 1.05, 12]} /><meshStandardMaterial color="#c0cbd0" metalness={0.7} roughness={0.28} /></mesh>)}
      {[-length / 2 + 0.35, length / 2 - 0.35].flatMap((x) => [-0.45, 0.45].map((z) => <mesh key={`${x}-${z}`} position={[x, 0.32, z]}><boxGeometry args={[0.11, 0.72, 0.11]} /><meshStandardMaterial color="#596c75" metalness={0.55} /></mesh>))}
    </group>
  );
}

function Warehouse({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[5.5, 4.4, 3.6]} radius={0.16} smoothness={3} position={[0, 2.2, 0]} castShadow><meshStandardMaterial color="#dfe6e7" roughness={0.77} /></RoundedBox>
      <mesh position={[-2.755, 1.45, 0]}><boxGeometry args={[0.06, 2.9, 2.45]} /><meshStandardMaterial color="#244b63" metalness={0.22} /></mesh>
      {[-0.78, 0, 0.78].map((z) => <mesh key={z} position={[-2.79, 1.45, z]}><boxGeometry args={[0.06, 2.55, 0.045]} /><meshStandardMaterial color="#8ea1aa" metalness={0.58} /></mesh>)}
      <BrandPlaque position={[-2.82, 3.42, 0]} rotation={[0, -Math.PI / 2, 0]} scale={0.76} />
      <mesh position={[0, 4.43, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[3.95, 3.95, 3.55]} /><meshStandardMaterial color="#bed0d4" roughness={0.62} /></mesh>
    </group>
  );
}

function Road({ position = [0, 0, 0], rotation = [0, 0, 0], length = 16 }: { position?: [number, number, number]; rotation?: [number, number, number]; length?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[length, 0.14, 3.3]} radius={0.34} smoothness={5} receiveShadow><meshStandardMaterial color={colors.road} roughness={0.92} /></RoundedBox>
      {Array.from({ length: Math.ceil(length / 2) }).map((_, index) => <mesh key={index} position={[-length / 2 + 1 + index * 2.2, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.05, 0.075]} /><meshBasicMaterial color="#e8eeee" /></mesh>)}
      {[-1.5, 1.5].map((z) => <mesh key={z} position={[0, 0.078, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[length - 0.7, 0.045]} /><meshBasicMaterial color={colors.tealBright} /></mesh>)}
    </group>
  );
}

function CurvedRoad() {
  return (
    <group>
      {Array.from({ length: 11 }).map((_, index) => {
        const angle = -0.56 + index * 0.112;
        return <group key={index} position={[Math.sin(angle) * 8, 0, Math.cos(angle) * 8 - 7.45]} rotation={[0, angle, 0]}><RoundedBox args={[1.72, 0.14, 3.3]} radius={0.2} smoothness={4} receiveShadow><meshStandardMaterial color={colors.road} roughness={0.92} /></RoundedBox><mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.82, 0.075]} /><meshBasicMaterial color="#e8eeee" /></mesh>{[-1.5, 1.5].map((z) => <mesh key={z} position={[0, 0.078, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.62, 0.045]} /><meshBasicMaterial color={colors.tealBright} /></mesh>)}</group>;
      })}
    </group>
  );
}

function CityBlock({ position, height = 2.4, color = "#c7d6da" }: { position: [number, number, number]; height?: number; color?: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.35, height, 1.25]} radius={0.09} smoothness={3} position={[0, height / 2, 0]} castShadow><meshStandardMaterial color={color} roughness={0.72} /></RoundedBox>
      {Array.from({ length: Math.max(2, Math.floor(height)) }).map((_, row) => [-0.36, 0.36].map((x) => <mesh key={`${row}-${x}`} position={[x, 0.65 + row * 0.65, 0.631]}><planeGeometry args={[0.28, 0.25]} /><meshStandardMaterial color="#67acb9" emissive="#227d91" emissiveIntensity={0.14} /></mesh>))}
    </group>
  );
}

function Globe({ rotation = [0, 0, 0], scale = 1 }: { rotation?: [number, number, number]; scale?: number }) {
  const land = [[0.75, 0.42, 1.02], [-0.62, 0.7, 1.02], [-0.92, -0.25, 1.02], [0.24, -0.64, 1.04], [0.98, -0.22, 0.4]];
  return (
    <group rotation={rotation} scale={scale}>
      <mesh castShadow><sphereGeometry args={[1.75, 48, 32]} /><meshPhysicalMaterial color="#0d4564" metalness={0.16} roughness={0.3} clearcoat={0.4} /></mesh>
      <mesh><sphereGeometry args={[1.77, 24, 16]} /><meshBasicMaterial color="#42b8c9" wireframe transparent opacity={0.17} /></mesh>
      {land.map(([x, y, z], index) => <mesh key={index} position={[x, y, z]} rotation={[y * 0.42, x * 0.38, index * 0.3]} scale={[0.72, 0.38, 0.12]}><sphereGeometry args={[0.62, 12, 8]} /><meshStandardMaterial color="#58b8a4" roughness={0.68} /></mesh>)}
      {[0.26, -0.42].map((tilt) => <mesh key={tilt} rotation={[Math.PI / 2 + tilt, tilt, 0]}><torusGeometry args={[2.08, 0.018, 8, 96, Math.PI * 1.45]} /><meshBasicMaterial color={colors.tealBright} /></mesh>)}
    </group>
  );
}

function CargoPlane({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.28, 2.6, 8, 20]} /><meshStandardMaterial color={colors.paper} metalness={0.28} roughness={0.27} /></mesh>
      <mesh position={[0, -0.05, 0]}><boxGeometry args={[0.72, 0.12, 3.8]} /><meshStandardMaterial color={colors.teal} metalness={0.25} roughness={0.3} /></mesh>
      <mesh position={[1.02, 0.34, 0]}><boxGeometry args={[0.7, 0.75, 0.1]} /><meshStandardMaterial color={colors.navy} /></mesh>
      <mesh position={[1.12, 0.1, 0]}><boxGeometry args={[0.7, 0.08, 1.42]} /><meshStandardMaterial color={colors.teal} /></mesh>
      {[-0.92, 0.92].map((z) => <group key={z} position={[-0.15, -0.17, z]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.23, 0.55, 18]} /><meshStandardMaterial color="#263b45" metalness={0.35} /></mesh><mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.11, 0.11, 0.65, 16]} /><meshStandardMaterial color="#b7c3c8" metalness={0.6} /></mesh></group>)}
      <mesh position={[-1.42, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><coneGeometry args={[0.29, 0.6, 20]} /><meshStandardMaterial color="#d9e4e7" metalness={0.2} roughness={0.3} /></mesh>
    </group>
  );
}

function LocationPin({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.54, 28, 20]} /><meshStandardMaterial color={colors.tealBright} metalness={0.22} roughness={0.3} /></mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.42, 1.1, 28]} /><meshStandardMaterial color={colors.tealBright} metalness={0.22} roughness={0.3} /></mesh>
      <mesh position={[0, 0.75, 0.5]}><circleGeometry args={[0.19, 24]} /><meshBasicMaterial color={colors.paper} /></mesh>
    </group>
  );
}

function RouteArc({ radius = 2.2, color = colors.tealBright, rotation = [0, 0, 0] }: { radius?: number; color?: string; rotation?: [number, number, number] }) {
  return <mesh rotation={rotation}><torusGeometry args={[radius, 0.027, 8, 90, Math.PI * 1.4]} /><meshBasicMaterial color={color} /></mesh>;
}

function Studio({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <>
      <ambientLight intensity={dark ? 0.7 : 1.05} />
      <hemisphereLight args={[dark ? "#4ebfd1" : "#eaf7f8", dark ? "#081723" : "#7b898c", dark ? 0.75 : 1.1]} />
      <directionalLight castShadow position={[-7, 10, 7]} intensity={dark ? 2.5 : 2.15} color={dark ? "#9edbea" : "#fff9e8"} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[7, 3, -4]} intensity={dark ? 18 : 6} color={colors.tealBright} distance={16} />
      {children}
      <ContactShadows opacity={dark ? 0.5 : 0.28} scale={26} blur={2.8} far={12} color={dark ? "#020a10" : "#334c57"} />
    </>
  );
}

function Ground({ dark = false }: { dark?: boolean }) {
  return <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}><planeGeometry args={[44, 34]} /><meshStandardMaterial color={dark ? colors.navyDeep : "#e6eeed"} roughness={0.92} /></mesh>;
}

function SceneContent({ variant, reduced, progress, quoteScale }: { variant: SceneVariant; reduced: boolean; progress: number; quoteScale: [number, number, number] }) {
  const moving = useRef<THREE.Group>(null);
  const secondary = useRef<THREE.Group>(null);
  const baseProgress = reduced ? 0.42 : progress;
  useFrame((state, delta) => {
    if (moving.current && !reduced) {
      moving.current.rotation.y += delta * (variant === "international" ? 0.11 : 0.04);
      moving.current.position.y += Math.sin(state.clock.elapsedTime * 1.25) * 0.0008;
    }
    if (secondary.current && !reduced) secondary.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.75) * 0.025;
  });

  if (variant === "journey") {
    const loading = Math.min(1, baseProgress * 3.1);
    const closing = Math.max(0, Math.min(1, (baseProgress - 0.3) * 4.4));
    const travel = Math.max(0, Math.min(1, (baseProgress - 0.54) * 2.2));
    return <Studio><Ground /><Warehouse position={[5, 0, -2.2]} scale={0.92} /><Conveyor position={[1.8, 0, 1.8]} length={4.8} />{[-0.9, 0.35, 1.5].map((x, i) => <Parcel key={x} position={[x + loading * 1.9, 1.15, 1.8]} scale={0.55} branded={i === 1} />)}<group ref={moving} position={[-0.8 + travel * 6.2, 0, 0]}><Truck scale={0.88} progress={closing + travel * 0.8} /></group><Road position={[-5, 0, 0]} length={12} /></Studio>;
  }
  if (variant === "services") return <Studio><Ground /><group position={[-3.5, 0, 0.4]}><Road length={7} /><Truck scale={0.48} position={[-1 + baseProgress * 2.2, 0, 0]} progress={baseProgress} /><LocationPin position={[2.2, 0.1, -0.7]} scale={0.65} /></group><group ref={moving} position={[3.8, 2.2, 0]}><Globe scale={0.9} /><CargoPlane position={[-1.2, 1.5, 1.3]} rotation={[0.1, -0.2, -0.2]} scale={0.5} /></group></Studio>;
  if (variant === "process") return <Studio><Ground />{[-4.2, -1.4, 1.4, 4.2].map((x, i) => <group key={x} position={[x, 0, 0]}><RoundedBox args={[1.9, 0.3, 1.9]} radius={0.14} smoothness={4} position={[0, 0.12, 0]}><meshStandardMaterial color={i <= Math.round(baseProgress * 3) ? colors.teal : colors.silver} metalness={0.35} roughness={0.4} /></RoundedBox><mesh position={[0, 0.35, 0]}><torusGeometry args={[0.48, 0.025, 8, 32]} /><meshBasicMaterial color={colors.tealBright} /></mesh></group>)}<group ref={moving} position={[-4.2 + baseProgress * 8.4, 1.12, 0]} rotation={[0, baseProgress * Math.PI * 2, 0]}><Parcel branded scale={0.75} /></group><RouteArc radius={4.3} rotation={[Math.PI / 2, 0, 0]} /></Studio>;
  if (variant === "domestic") {
    const angle = -0.5 + baseProgress;
    const position: [number, number, number] = [Math.sin(angle) * 8, 0, Math.cos(angle) * 8 - 7.45];
    return <Studio><Ground /><CurvedRoad /><group ref={moving} position={position} rotation={[0, angle + Math.PI, 0]}><Truck scale={0.68} progress={baseProgress} /></group><CityBlock position={[-4.5, 0, -3.2]} height={2.5} /><CityBlock position={[-2.7, 0, -3.4]} height={3.8} color="#aec5ca" /><CityBlock position={[2.9, 0, -3.3]} height={2.9} /><CityBlock position={[4.8, 0, -3.2]} height={4.1} color="#abc2c8" /><Warehouse position={[7.6, 0, -2.8]} scale={0.55} /><LocationPin position={[5.5, 0.1, 1.45]} scale={0.58} /></Studio>;
  }
  if (variant === "international") return <Studio dark><Ground dark /><group ref={moving} position={[-1.4, 2.25, 0]}><Globe scale={1.42} /></group><group ref={secondary} position={[2.6 + Math.cos(baseProgress * Math.PI) * 1.4, 3.6 + Math.sin(baseProgress * Math.PI) * 0.9, 1.2]}><CargoPlane scale={0.8} rotation={[0.08, -0.35, -0.16]} /></group><RouteArc radius={3.2} rotation={[1.2, 0.3, -0.6]} /><Parcel position={[4.8, 0.55, 0]} scale={0.8} branded /></Studio>;
  if (variant === "quote") return <Studio><Ground /><group ref={moving} position={[0, 1.35, 0]} rotation={[0.06, baseProgress * 0.45, 0]}><Parcel branded scale={quoteScale} /></group><RouteArc radius={2.8} rotation={[Math.PI / 2, 0, 0.15]} /><LocationPin position={[-3, 0.15, 0.4]} scale={0.8} /><LocationPin position={[3, 0.15, -0.4]} scale={0.8} /></Studio>;
  if (variant === "about") return <Studio><Ground /><Warehouse position={[2.8, 0, -1.4]} scale={0.78} /><group ref={moving} position={[-3.2, 2.1, 0]}><Globe scale={0.85} /></group>{[[-2.2, 0.5, 1.4], [-0.8, 0.65, 1.1], [0.6, 0.5, 1.3]].map((p, i) => <Parcel key={i} position={p as [number, number, number]} scale={0.62} branded={i === 1} />)}<RouteArc radius={3.6} rotation={[Math.PI / 2, 0, -0.2]} /></Studio>;
  if (variant === "contact") return <Studio><Ground /><Float speed={reduced ? 0 : 1.2} floatIntensity={0.18}><LocationPin position={[0, 1.6, 0]} scale={1.25} /></Float><Parcel position={[-2.2, 0.6, 0.5]} scale={0.8} branded /><Parcel position={[2.1, 0.52, -0.4]} scale={0.68} /><RouteArc radius={2.9} rotation={[Math.PI / 2, 0, 0.35]} /></Studio>;
  if (variant === "faq") return <Studio><Ground />{[-1.35, 0, 1.35].map((y, i) => <group key={y} position={[i * 0.48 - 0.48, y * 0.58 + 1, -i * 0.12]} rotation={[0, -0.18 + i * 0.12, -0.05 + i * 0.03]}><Parcel branded={i === 1} scale={[2.4, 0.55, 1.25]} /></group>)}</Studio>;
  if (variant === "legal") return <Studio><Ground /><Parcel position={[-1.2, 0.8, 0]} scale={[1.35, 1.2, 1.35]} branded /><group position={[1.25, 1.28, 0]} rotation={[0, -0.2, -0.08]}><RoundedBox args={[2.2, 2.8, 0.12]} radius={0.09} smoothness={4}><meshStandardMaterial color={colors.paper} roughness={0.7} /></RoundedBox>{[-0.65, -0.2, 0.25, 0.7].map((y) => <mesh key={y} position={[0, y, 0.07]}><planeGeometry args={[1.5, 0.05]} /><meshBasicMaterial color={colors.teal} /></mesh>)}</group></Studio>;
  if (variant === "footer") return <Studio dark><Ground dark /><Warehouse position={[4.1, 0, -1.8]} scale={0.52} /><Road position={[-2.5, 0, 0]} length={11} /><group ref={moving} position={[-1.5 + baseProgress * 1.7, 0, 0]}><Truck scale={0.49} progress={1} /></group></Studio>;
  return <Studio dark><Ground dark /><Warehouse position={[2.65, 0, -2.2]} scale={0.9} /><Parcel position={[-1.9, 0.82, 1.15]} scale={1.12} branded /><Conveyor position={[-0.2, 0, 1.75]} length={4.8} /><Truck position={[-2.3, 0, -1.25]} scale={0.46} progress={0.8} /></Studio>;
}

function CameraRig({ variant, reduced, progress }: { variant: SceneVariant; reduced: boolean; progress: number }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const mobile = window.innerWidth < 700;
    const darkScene = variant === "international" || variant === "footer" || variant === "admin";
    const targetX = mobile ? 0 : (darkScene ? 0.5 : -0.5) + (reduced ? 0 : pointer.x * 0.28);
    const targetY = mobile ? 4.8 : 4.5 + (reduced ? 0 : pointer.y * 0.16);
    const closeScene = ["quote", "contact", "faq", "legal", "admin"].includes(variant);
    const targetZ = mobile ? (closeScene ? 11.8 : 14.4) : variant === "footer" ? 14 : closeScene ? 10.2 : 13.2 - progress * (reduced ? 0 : 0.35);
    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), reduced ? 1 : 0.045);
    camera.lookAt(variant === "journey" ? 1.15 : 0, 1.1, 0);
  });
  return null;
}

function World({ variant, reduced, progress }: { variant: SceneVariant; reduced: boolean; progress: number }) {
  const [quoteScale, setQuoteScale] = useState<[number, number, number]>([1.4, 1.2, 1.25]);
  useEffect(() => {
    const onQuote = (event: Event) => {
      const detail = (event as CustomEvent<{ dimensions?: [number, number, number]; success?: boolean }>).detail;
      if (detail?.dimensions) setQuoteScale(detail.dimensions);
      if (detail?.success) setQuoteScale([1.15, 1.15, 1.15]);
    };
    window.addEventListener("vk:quote-visual", onQuote);
    return () => {
      window.removeEventListener("vk:quote-visual", onQuote);
    };
  }, []);
  return <><CameraRig variant={variant} reduced={reduced} progress={progress} /><SceneContent variant={variant} reduced={reduced} progress={progress} quoteScale={quoteScale} /></>;
}

export default function CourierCanvas({ variant, reduced, active, progress }: { variant: SceneVariant; reduced: boolean; active: boolean; progress: number }) {
  return (
    <Canvas
      shadows
      frameloop={active && !reduced ? "always" : "demand"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 4.5, 13.2], fov: 39, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={<div className={`scene-fallback scene-fallback-${variant}`} role="img" aria-label={`${variant} courier illustration`} />}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        const canvas = gl.domElement;
        const lost = (event: Event) => { event.preventDefault(); window.dispatchEvent(new Event("vk:webgl-failed")); };
        const restored = () => window.dispatchEvent(new Event("vk:webgl-restored"));
        canvas.addEventListener("webglcontextlost", lost, false);
        canvas.addEventListener("webglcontextrestored", restored, false);
      }}
    >
      <Suspense fallback={null}><World variant={variant} reduced={reduced} progress={progress} /></Suspense>
    </Canvas>
  );
}
