"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function BrandPanel() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768; canvas.height = 180;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#f6f5f1"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#203a55"; context.font = "800 52px Arial"; context.textAlign = "center"; context.textBaseline = "middle";
    context.fillText("VK AND COMPANY", canvas.width / 2, canvas.height / 2);
    const created = new THREE.CanvasTexture(canvas);
    created.colorSpace = THREE.SRGBColorSpace;
    return created;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 1.15, 1.511]}><planeGeometry args={[3.7, .86]} /><meshBasicMaterial map={texture} /></mesh>;
}

function Wheel({ position }: { position: [number, number, number] }) {
  return <group position={position} rotation={[Math.PI / 2, 0, 0]} name="wheel"><mesh castShadow><cylinderGeometry args={[.44, .44, .28, 24]} /><meshStandardMaterial color="#17232a" roughness={.7} /></mesh><mesh position={[0,.15,0]}><cylinderGeometry args={[.18,.18,.3,16]} /><meshStandardMaterial color="#8aa0a9" metalness={.6} /></mesh></group>;
}

function Truck({ truckRef, leftDoorRef, rightDoorRef }: { truckRef: React.RefObject<THREE.Group | null>; leftDoorRef: React.RefObject<THREE.Group | null>; rightDoorRef: React.RefObject<THREE.Group | null> }) {
  return <group ref={truckRef} position={[1.2, .45, 0]}>
    <mesh castShadow position={[.4,1.2,0]}><boxGeometry args={[4.2,2.45,3]} /><meshStandardMaterial color="#203a55" roughness={.42} /></mesh>
    <BrandPanel />
    <mesh castShadow position={[-2.15,.95,0]}><boxGeometry args={[1.25,1.95,2.82]} /><meshStandardMaterial color="#227d91" roughness={.38} /></mesh>
    <mesh castShadow position={[-2.34,1.68,0]} rotation={[0,0,-.08]}><boxGeometry args={[.82,.75,2.84]} /><meshStandardMaterial color="#227d91" /></mesh>
    <mesh position={[-2.77,1.72,.83]} rotation={[0,-Math.PI/2,0]}><planeGeometry args={[.9,.52]} /><meshStandardMaterial color="#9cc8d2" metalness={.25} roughness={.2} /></mesh>
    <mesh position={[-2.18,1.73,1.421]}><planeGeometry args={[.62,.52]} /><meshStandardMaterial color="#acd4dc" metalness={.2} /></mesh>
    <mesh position={[-2.79,.92,1.1]}><boxGeometry args={[.05,.22,.42]} /><meshStandardMaterial color="#f5dd9e" emissive="#d6aa45" emissiveIntensity={.4} /></mesh>
    <mesh position={[-2.79,.72,-1.1]}><boxGeometry args={[.05,.18,.38]} /><meshStandardMaterial color="#d95c52" /></mesh>
    <Wheel position={[-2.05,.1,1.48]} /><Wheel position={[-2.05,.1,-1.48]} /><Wheel position={[1.45,.1,1.48]} /><Wheel position={[1.45,.1,-1.48]} />
    <group position={[2.51,1.2,0]}>
      <group ref={leftDoorRef} position={[0,0,1.48]}><mesh castShadow position={[0,0,-.72]}><boxGeometry args={[.09,2.3,1.42]} /><meshStandardMaterial color="#2f5f78" /></mesh></group>
      <group ref={rightDoorRef} position={[0,0,-1.48]}><mesh castShadow position={[0,0,.72]}><boxGeometry args={[.09,2.3,1.42]} /><meshStandardMaterial color="#2f5f78" /></mesh></group>
    </group>
  </group>;
}

function Parcel({ position, parcelRef }: { position: [number,number,number]; parcelRef: (node: THREE.Mesh | null) => void }) {
  return <mesh ref={parcelRef} castShadow position={position}><boxGeometry args={[.55,.5,.55]} /><meshStandardMaterial color="#b88a58" roughness={.78} /><mesh position={[0,.251,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.13,.55]} /><meshBasicMaterial color="#e8cf9c" /></mesh></mesh>;
}

function Warehouse() {
  return <group position={[4.8,0,-1.2]}>
    <mesh castShadow position={[1,2.2,-1.6]}><boxGeometry args={[4.8,4.4,3.2]} /><meshStandardMaterial color="#d6e0e3" roughness={.82} /></mesh>
    <mesh position={[-1.41,1.45,-.2]}><boxGeometry args={[.1,2.9,2.35]} /><meshStandardMaterial color="#35576a" /></mesh>
    <mesh position={[-1.48,.35,0]}><boxGeometry args={[1.8,.45,2.2]} /><meshStandardMaterial color="#8fa1aa" /></mesh>
    <mesh position={[-2.4,.63,0]}><boxGeometry args={[2.3,.12,1.05]} /><meshStandardMaterial color="#6f858e" metalness={.3} /></mesh>
    {[-3.15,-2.65,-2.15,-1.65].map((x) => <mesh key={x} position={[x,.56,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.11,.11,1,12]} /><meshStandardMaterial color="#b9c6ca" metalness={.5} /></mesh>)}
  </group>;
}

function World({ reduced }: { reduced: boolean }) {
  const truck = useRef<THREE.Group>(null);
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);
  const domestic = useRef<THREE.Group>(null);
  const international = useRef<THREE.Group>(null);
  const parcels = useRef<THREE.Mesh[]>([]);
  const { invalidate } = useThree();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!truck.current || !leftDoor.current || !rightDoor.current || reduced) {
      invalidate(); return;
    }
    const wheels = truck.current.getObjectsByProperty("name", "wheel") as THREE.Object3D[];
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: "#dispatch-hero", start: "top top", end: "bottom top", scrub: .35, invalidateOnRefresh: true },
        onUpdate: invalidate,
      });
      parcels.current.forEach((parcel, index) => timeline.to(parcel.position, { x: 2.5, y: 1.2, z: (index - 1) * .6, duration: .16 }, index * .055));
      timeline.to(leftDoor.current!.rotation, { y: -Math.PI / 2, duration: .12 }, .24)
        .to(rightDoor.current!.rotation, { y: Math.PI / 2, duration: .12 }, .24)
        .to(truck.current!.position, { x: -9.5, duration: .45 }, .4)
        .to(wheels.map((wheel) => wheel.rotation), { z: -Math.PI * 8, duration: .45 }, .4)
        .fromTo(domestic.current!.position, { x: 8 }, { x: -3, duration: .28 }, .48)
        .fromTo(international.current!.position, { y: 8, x: 7 }, { y: 3.8, x: -1, duration: .25 }, .72);
    });
    return () => context.revert();
  }, [invalidate, reduced]);

  useFrame(() => undefined);
  return <>
    <color attach="background" args={["#e8f1f2"]} />
    <fog attach="fog" args={["#e8f1f2", 17, 36]} />
    <ambientLight intensity={1.25} /><hemisphereLight args={["#e7f4f5", "#6d7f83", 1.1]} /><directionalLight castShadow position={[-5,10,8]} intensity={2.2} shadow-mapSize={[1024,1024]} />
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0,0]}><planeGeometry args={[60,40]} /><meshStandardMaterial color="#dbe4e5" /></mesh>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[-4,.02,0]}><planeGeometry args={[35,7]} /><meshStandardMaterial color="#657781" roughness={.9} /></mesh>
    {[...Array(10)].map((_,index)=><mesh key={index} rotation={[-Math.PI/2,0,0]} position={[-16+index*4,.031,0]}><planeGeometry args={[1.6,.08]} /><meshBasicMaterial color="#e6ecee" /></mesh>)}
    <Warehouse />
    {[[-3,.45,.1],[-2.4,.45,.1],[-1.8,.45,.1]].map((position,index)=><Parcel key={index} position={position as [number,number,number]} parcelRef={(node) => { if(node) parcels.current[index]=node; }} />)}
    <Truck truckRef={truck} leftDoorRef={leftDoor} rightDoorRef={rightDoor} />
    <group ref={domestic} position={[8,0,-4]}>{[-2,0,2].map((x,index)=><group key={x} position={[x,0,0]}><mesh castShadow position={[0,.7,0]}><boxGeometry args={[1.45,1.4,1.4]} /><meshStandardMaterial color={index===1?"#eef1ee":"#c9d8d8"} /></mesh><mesh castShadow position={[0,1.65,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[1.25,.9,4]} /><meshStandardMaterial color="#45677a" /></mesh></group>)}</group>
    <group ref={international} position={[7,8,-7]} rotation={[0,-.25,.08]}><mesh><boxGeometry args={[3.3,.5,.55]} /><meshStandardMaterial color="#f4f2ea" /></mesh><mesh position={[.1,.1,0]}><boxGeometry args={[.8,.8,.7]} /><meshStandardMaterial color="#f4f2ea" /></mesh><mesh position={[0,0,0]}><boxGeometry args={[.65,.12,4.5]} /><meshStandardMaterial color="#227d91" /></mesh></group>
    <ContactShadows opacity={.3} scale={35} blur={2.8} far={10} />
  </>;
}

export default function DispatchCanvas({ reduced }: { reduced: boolean }) {
  return <Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{ position: [-7,6,11], fov: 39 }} gl={{ antialias: true, powerPreference: "high-performance" }} fallback={<div className="scene-fallback"><StaticDispatchArt /></div>}>
    <World reduced={reduced} />
  </Canvas>;
}

export function StaticDispatchArt() { return <div className="fallback-art" role="img" aria-label="Illustration of a delivery truck leaving a parcel dispatch centre"><div className="fallback-truck" /></div>; }
