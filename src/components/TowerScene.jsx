import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { projects } from "../content";

const BRONZE = "#c9a06a";
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/* Tower geometry                                                       */
/* ------------------------------------------------------------------ */
const TOWER_H = 7;
const R_BOTTOM = 2.0;
const R_TOP = 1.6;
const radiusAt = (y) =>
  R_BOTTOM - ((y + TOWER_H / 2) / TOWER_H) * (R_BOTTOM - R_TOP);

// one level per project, 90° apart around the tower
const LEVELS = [2.4, 0.8, -0.8, -2.4].map((y, i) => ({
  index: i,
  y,
  angle: i * (Math.PI / 2),
}));

/* ------------------------------------------------------------------ */
/* Canvas-drawn label: small ivory serif, engraved not glowing         */
/* ------------------------------------------------------------------ */
function makeLabelTexture(index, title) {
  const c = document.createElement("canvas");
  const pad = 48;
  const measure = c.getContext("2d");
  const titleFont = "300 64px Fraunces, Georgia, serif";
  measure.font = titleFont;
  const tw = Math.ceil(measure.measureText(title.toUpperCase()).width);
  c.width = tw + pad * 2;
  c.height = 176;

  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.textBaseline = "middle";

  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(236,233,223,0.55)";
  ctx.fillText(`0${index + 1}`, pad, 32);

  ctx.fillStyle = "rgba(236,233,223,0.28)";
  ctx.fillRect(pad, 54, 40, 1.5);

  ctx.font = titleFont;
  ctx.fillStyle = "#ece9df";
  ctx.fillText(title.toUpperCase(), pad, 118);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: c.width / c.height };
}

function LevelLabel({ index, title, y, angle }) {
  const { tex, aspect } = useMemo(
    () => makeLabelTexture(index, title),
    [index, title]
  );
  useEffect(() => () => tex.dispose(), [tex]);
  const r = radiusAt(y) + 0.62;
  const h = 0.42;
  return (
    <mesh
      position={[Math.sin(angle) * r, y, Math.cos(angle) * r]}
      rotation={[0, angle, 0]}
    >
      <planeGeometry args={[h * aspect, h]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Drifting dust motes                                                  */
/* ------------------------------------------------------------------ */
function Dust({ count = 250 }) {
  const ref = useRef();
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 9;
      const a = Math.random() * TAU;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = -4 + Math.random() * 10;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.05 + Math.random() * 0.12;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const attr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i) + speeds[i] * dt;
      if (y > 6) y = -4;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#9a8f7a"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Crown ring with a slow pulse                                         */
/* ------------------------------------------------------------------ */
function Crown() {
  const mat = useRef();
  useFrame(({ clock }) => {
    if (mat.current)
      mat.current.opacity = 0.42 + Math.sin(clock.elapsedTime * 1.2) * 0.14;
  });
  return (
    <mesh position={[0, 3.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.45, 0.022, 12, 72]} />
      <meshBasicMaterial ref={mat} color={BRONZE} transparent opacity={0.5} />
    </mesh>
  );
}

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(201,160,106,0.2)");
  g.addColorStop(0.5, "rgba(201,160,106,0.06)");
  g.addColorStop(1, "rgba(201,160,106,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------ */
/* Camera handle for GSAP dolly tweens                                   */
/* ------------------------------------------------------------------ */
function CameraRig({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => {
    cameraRef.current = camera;
    camera.lookAt(0, 1.2, 0);
  }, [camera, cameraRef]);
  return null;
}

/* ------------------------------------------------------------------ */
/* The tower: rotation, levels, interaction                             */
/* ------------------------------------------------------------------ */
function Tower({ selected, onSelect, onFirstInteract, cameraRef, wrapRef }) {
  const group = useRef();
  const target = useRef(0.6); // rest angle: turned slightly for depth
  const lastTouch = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const movedFar = useRef(false);
  const suppressClick = useRef(false);
  const glowTex = useMemo(makeGlowTexture, []);

  const poke = () => {
    lastTouch.current = performance.now();
    onFirstInteract();
  };

  // face the selected level toward the camera + dolly in
  useEffect(() => {
    if (selected == null) {
      if (cameraRef.current)
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 1.6,
          z: 11,
          duration: 1.4,
          ease: "power3.inOut",
        });
      return;
    }
    const lvl = LEVELS[selected];
    const desired = -lvl.angle;
    const cur = target.current;
    const delta = ((((desired - cur + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    gsap.to(target, {
      current: cur + delta,
      duration: 1.5,
      ease: "power3.inOut",
    });
    if (cameraRef.current)
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 1.45,
        z: 8.6,
        duration: 1.5,
        ease: "power3.inOut",
      });
  }, [selected, cameraRef]);

  // wheel + horizontal drag rotate the tower (native listeners on wrapper)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      poke();
      target.current += e.deltaY * 0.0016;
    };

    const onPointerDown = (e) => {
      dragging.current = true;
      movedFar.current = false;
      lastX.current = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      if (Math.abs(dx) > 2) movedFar.current = true;
      if (dx !== 0) {
        poke();
        target.current += dx * 0.005;
      }
    };
    const onPointerUp = () => {
      dragging.current = false;
      el.style.cursor = "grab";
      if (movedFar.current) {
        // a drag just ended — swallow the click that follows it
        suppressClick.current = true;
        setTimeout(() => {
          suppressClick.current = false;
        }, 80);
      }
      movedFar.current = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapRef]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const g = group.current;
    if (!g) return;
    const idle =
      performance.now() - lastTouch.current > 6000 &&
      selected == null &&
      !dragging.current;
    if (idle) target.current += dt * 0.07; // very slow drift
    const d = target.current - g.rotation.y;
    g.rotation.y += d * (1 - Math.exp(-dt * 4.5));
  });

  const handleLevelClick = (e, i) => {
    e.stopPropagation();
    if (suppressClick.current) return;
    poke();
    onSelect(i);
  };

  return (
    <>
      <group ref={group}>
        {/* monolith — matte architectural stone, not glossy metal */}
        <mesh>
          <cylinderGeometry args={[R_TOP, R_BOTTOM, TOWER_H, 6, 1]} />
          <meshStandardMaterial
            color="#17171a"
            roughness={0.6}
            metalness={0.3}
            flatShading
          />
        </mesh>

        {/* faint seams at the hexagon vertices — barely there */}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <group key={k} rotation={[0, (k * Math.PI) / 3, 0]}>
            <mesh position={[0, 0, 1.8]} rotation={[-0.0571, 0, 0]}>
              <boxGeometry args={[0.03, 6.9, 0.03]} />
              <meshBasicMaterial color="#4a3f30" transparent opacity={0.55} />
            </mesh>
          </group>
        ))}

        {/* project levels */}
        {LEVELS.map((lvl) => {
          const p = projects[lvl.index];
          const r = radiusAt(lvl.y);
          return (
            <group key={lvl.index}>
              {/* thin bronze ring band — the one sanctioned accent */}
              <mesh position={[0, lvl.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r + 0.05, 0.016, 12, 72]} />
                <meshBasicMaterial color={BRONZE} transparent opacity={0.75} />
              </mesh>
              {/* floating title */}
              <LevelLabel
                index={lvl.index}
                title={p.title}
                y={lvl.y}
                angle={lvl.angle}
              />
              {/* generous invisible hit band */}
              <mesh
                position={[0, lvl.y, 0]}
                onClick={(e) => handleLevelClick(e, lvl.index)}
                onPointerOver={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "";
                }}
              >
                <cylinderGeometry
                  args={[r + 0.42, r + 0.42, 1.2, 24, 1, true]}
                />
                <meshBasicMaterial
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
            </group>
          );
        })}

        <Crown />
      </group>

      {/* base platform + glow (static, outside the rotating group) */}
      <mesh position={[0, -3.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 64]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.9} metalness={0.1} />
      </mesh>
      <sprite position={[0, -3.3, 0]} scale={[9, 9, 1]}>
        <spriteMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          opacity={0.5}
        />
      </sprite>

      <Dust />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scene: canvas, lights, fog                                           */
/* ------------------------------------------------------------------ */
export default function TowerScene({ selected, onSelect, onFirstInteract }) {
  const wrapRef = useRef();
  const cameraRef = useRef(null);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 touch-none select-none"
      style={{ cursor: "grab" }}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.6, 11], fov: 42 }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={["#0e0e10", 13, 26]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 8, 6]} intensity={1.0} color="#ffd9a8" />
        <directionalLight
          position={[-6, 3, -5]}
          intensity={0.5}
          color="#7a8cff"
        />
        <CameraRig cameraRef={cameraRef} />
        <Tower
          selected={selected}
          onSelect={onSelect}
          onFirstInteract={onFirstInteract}
          cameraRef={cameraRef}
          wrapRef={wrapRef}
        />
      </Canvas>
    </div>
  );
}
