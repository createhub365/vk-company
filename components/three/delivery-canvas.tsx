"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { BrandPlaque, Parcel, Truck } from "./courier-canvas";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const x = clamp(value); return x * x * (3 - 2 * x); };
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

function FixedCamera() {
  const { camera } = useThree();
  useEffect(() => {
    const mobile = window.innerWidth < 700;
    camera.position.set(mobile ? 7.7 : 8.4, mobile ? 4.2 : 4.7, mobile ? 13.8 : 13);
    camera.lookAt(mobile ? -0.6 : 0, 1, 0);
  }, [camera]);
  return null;
}

function DeliveryPoint() {
  return <group position={[-3.6, 0, -2.1]}>
    <RoundedBox args={[3.1, 3.4, 2.5]} radius={0.12} smoothness={4} position={[0, 1.7, 0]} castShadow><meshStandardMaterial color="#d9e0df" roughness={0.72}/></RoundedBox>
    <RoundedBox args={[1.3, 2.2, 0.13]} radius={0.05} smoothness={3} position={[0, 1.1, 1.27]}><meshStandardMaterial color="#173952" metalness={0.22} roughness={0.42}/></RoundedBox>
    <mesh position={[0, 2.55, 1.38]}><boxGeometry args={[1.8, 0.18, 0.55]}/><meshStandardMaterial color="#13839a" metalness={0.3}/></mesh>
    <BrandPlaque position={[0, 2.85, 1.31]} scale={0.42}/>
    <mesh position={[1.1, 0.12, 1.7]} receiveShadow><boxGeometry args={[1.8, 0.22, 1.45]}/><meshStandardMaterial color="#92a1a5" roughness={0.8}/></mesh>
  </group>;
}

function DeliveryWorld({ playing, reduced, runId, onComplete }: { playing: boolean; reduced: boolean; runId: number; onComplete: () => void }) {
  const truck = useRef<THREE.Group>(null);
  const parcel = useRef<THREE.Group>(null);
  const elapsed = useRef(reduced ? 7 : 0);
  const completed = useRef(false);

  const renderPose = (time: number) => {
    if (!truck.current || !parcel.current) return;
    const arrival = smooth(time / 1.8);
    const departure = smooth((time - 4.9) / 1.7);
    const truckX = time < 4.9 ? mix(-8.3, 1.2, arrival) : mix(1.2, 9.4, departure);
    truck.current.position.x = truckX;
    const wheelSpin = -(arrival * 9.5 + departure * 8.2) * 2.35;
    truck.current.getObjectsByProperty("name", "truck-wheel").forEach((wheel) => { wheel.rotation.y = wheelSpin; });
    const open = smooth((time - 2.15) / 0.65) * (1 - smooth((time - 4.2) / 0.65));
    truck.current.getObjectsByProperty("name", "rear-door").forEach((door) => { door.rotation.y = Number(door.userData.side) * open * 1.05; });
    const unloading = smooth((time - 2.9) / 1.25);
    parcel.current.visible = time >= 2.7;
    parcel.current.position.set(mix(-1.25, -2.95, unloading), mix(1.32, 0.62, unloading) + Math.sin(unloading * Math.PI) * 0.42, mix(0.45, 1.15, unloading));
    parcel.current.rotation.y = unloading * Math.PI * 0.22;
  };

  useEffect(() => {
    elapsed.current = reduced ? 7 : 0;
    completed.current = false;
    renderPose(elapsed.current);
    // runId is the explicit replay reset signal.
  }, [runId, reduced]);

  useFrame((_, delta) => {
    if (playing && !reduced && elapsed.current < 7) elapsed.current = Math.min(7, elapsed.current + Math.min(delta, 0.05));
    renderPose(elapsed.current);
    if (elapsed.current >= 7 && !completed.current) { completed.current = true; onComplete(); }
  });

  return <>
    <FixedCamera/>
    <fog attach="fog" args={["#102b3e", 15, 30]}/>
    <ambientLight intensity={0.42}/>
    <hemisphereLight args={["#9cc8d0", "#071722", 0.75]}/>
    <directionalLight castShadow position={[-5, 9, 7]} intensity={2.5} color="#f2f3ed" shadow-mapSize={[1024,1024]}/>
    <pointLight position={[5, 3, 3]} intensity={14} distance={15} color="#3da7b9"/>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]}><planeGeometry args={[45,25]}/><meshStandardMaterial color="#263c47" roughness={0.94}/></mesh>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.025,0]}><planeGeometry args={[40,5.4]}/><meshStandardMaterial color="#354a54" roughness={0.9}/></mesh>
    {[-9,-4,1,6,11].map((x)=><mesh key={x} rotation={[-Math.PI/2,0,0]} position={[x,0.04,0]}><planeGeometry args={[2.2,0.08]}/><meshBasicMaterial color="#d8dfdd"/></mesh>)}
    <DeliveryPoint/>
    <mesh position={[-1.65,0.34,0.85]} rotation={[0,0,-0.23]} castShadow><boxGeometry args={[2.5,0.13,1.15]}/><meshStandardMaterial color="#819299" metalness={0.55} roughness={0.36}/></mesh>
    <group ref={truck} position={[-8.3,0,0.1]} rotation={[0,Math.PI,0]}><Truck scale={0.83} progress={1}/></group>
    <group ref={parcel}><Parcel branded scale={0.64}/></group>
    <ContactShadows position={[0,0.05,0]} opacity={0.55} scale={25} blur={2.7} far={10} color="#020b11"/>
  </>;
}

export default function DeliveryCanvas({ playing, reduced, runId, onComplete }: { playing: boolean; reduced: boolean; runId: number; onComplete: () => void }) {
  return <Canvas shadows frameloop={playing && !reduced ? "always" : "demand"} dpr={[1,1.5]} camera={{position:[8.4,4.7,13],fov:38,near:.1,far:60}} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}}>
    <Suspense fallback={null}><DeliveryWorld playing={playing} reduced={reduced} runId={runId} onComplete={onComplete}/></Suspense>
  </Canvas>;
}
