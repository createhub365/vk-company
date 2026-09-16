import { cancelFrame, frame, type FrameData } from "framer-motion";
import * as THREE from "three";
import { MEDIA_INTERACTION, type MediaInteraction } from "@/lib/media-interaction";

// One lazy, bounded perspective scene. No perpetual render loop or global input.
export function createQuoteBubbles(host: HTMLElement, onFailure: () => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "quote-bubble-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
  camera.position.z = 7;
  scene.add(new THREE.AmbientLight(0xd6f6f4, 2));
  const key = new THREE.DirectionalLight(0xffffff, 5); key.position.set(-3, 4, 5); scene.add(key);
  const fill = new THREE.PointLight(0x71ded8, 35); fill.position.set(3, -2, 4); scene.add(fill);
  const rim = new THREE.PointLight(0xffffff, 45); rim.position.set(-2, 3, 2); scene.add(rim);
  const geometry = new THREE.SphereGeometry(1, 40, 28);
  const materials = [0x62b8b4, 0xd4e3e6].map(color => new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: .63, metalness: .38, roughness: .17, clearcoat: 1, clearcoatRoughness: .08, depthWrite: false }));
  const anchors = [[-.84,.53,.18,.29],[.84,.62,-.1,.22],[-.82,-.66,-.15,.17],[.83,-.57,.24,.32]];
  const spheres = anchors.map(([, , , radius], i) => { const mesh = new THREE.Mesh(geometry, materials[i % 2]); mesh.scale.setScalar(radius); scene.add(mesh); return mesh; });
  let active = false, disposed = false, broken = false, queued = false, last = 0, tap = -Infinity, frames = 0;
  let width = 1, height = 1;
  const pointer = new THREE.Vector2(), current = new THREE.Vector2();
  function request() { if (active && !disposed && !broken && !queued) { queued = true; frame.render(render); } }
  function render({ timestamp: now }: FrameData) {
    queued = false;
    if (!active || disposed || broken) return;
    const dt = Math.min((now - last) / 1000 || .016, .04); last = now;
    current.lerp(pointer, 1 - Math.exp(-dt * 13));
    const elapsed = now - tap;
    const burst = elapsed < 640 ? Math.sin(elapsed / 640 * Math.PI) * Math.exp(-elapsed / 500) : 0;
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(18)) * 7;
    spheres.forEach((mesh, i) => {
      const [x,y,z] = anchors[i];
      mesh.position.set(x * viewHeight * width / height / 2 + current.x * .10 + Math.sign(x) * burst * .18,
        y * viewHeight / 2 - current.y * .10 + Math.sign(y) * burst * .18, z + burst * .1);
    });
    try { renderer.render(scene, camera); host.dataset.bubbles = "webgl"; renderer.domElement.dataset.frames = String(++frames); }
    catch { fail(); return; }
    if (current.distanceTo(pointer) > .001 || elapsed < 640) request();
  }
  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); request();
  }
  function interaction(event: Event) {
    if (!active) return;
    const { kind, x, y } = (event as CustomEvent<MediaInteraction>).detail;
    if (kind === "tap") { tap = performance.now(); pointer.set(0,0); }
    else pointer.set(kind === "leave" ? 0 : x, kind === "leave" ? 0 : y);
    request();
  }
  function fail() { broken = true; cancelFrame(render); queued = false; renderer.domElement.style.display = "none"; onFailure(); }
  const observer = new ResizeObserver(resize); observer.observe(host);
  host.addEventListener(MEDIA_INTERACTION, interaction);
  renderer.domElement.addEventListener("webglcontextlost", fail);
  resize();
  return {
    setActive(value: boolean) {
      active = value;
      if (active) { last = performance.now(); request(); }
      else { cancelFrame(render); queued = false; pointer.set(0,0); current.set(0,0); tap = -Infinity; }
    },
    dispose() {
      disposed = true; cancelFrame(render); queued = false; observer.disconnect();
      host.removeEventListener(MEDIA_INTERACTION, interaction); renderer.domElement.removeEventListener("webglcontextlost", fail);
      geometry.dispose(); materials.forEach(material => material.dispose()); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
