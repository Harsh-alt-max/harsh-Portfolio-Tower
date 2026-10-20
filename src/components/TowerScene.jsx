import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { projects, site } from "../content";

const TAU = Math.PI * 2;
const IVORY = "#f6f2e8";
const CHAMPAGNE = "#c9a06a";

/* ------------------------------------------------------------------ */
/* Night mix driver — one place lerps the day→night blend              */
/* ------------------------------------------------------------------ */
function NightDriver({ nightRef }) {
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const n = nightRef.current;
    n.mix += (n.target - n.mix) * (1 - Math.exp(-dt * 2.4));
  }, -1);
  return null;
}

/* ------------------------------------------------------------------ */
/* Sky: gradient dome, deepened by day, indigo by night (uNight)       */
/* ------------------------------------------------------------------ */
function SkyDome({ nightRef }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uNight: { value: 0 } },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uNight;
          varying vec3 vDir;
          void main() {
            float h = vDir.y;
            // DAY — richer cerulean zenith, warm ivory horizon
            vec3 dayZen = vec3(0.561, 0.722, 0.831); // #8fb8d4
            vec3 dayHor = vec3(0.949, 0.929, 0.886); // #f2ede2
            vec3 dayBel = vec3(0.898, 0.847, 0.761);
            vec3 day = h >= 0.0
              ? mix(dayHor, dayZen, smoothstep(0.0, 0.62, h))
              : mix(dayHor, dayBel, smoothstep(0.0, -0.4, h));
            day += vec3(0.030, 0.015, 0.0) * (1.0 - smoothstep(0.0, 0.35, abs(h)));
            // NIGHT — deep indigo zenith, dusky horizon, warm remnant band
            vec3 nigZen = vec3(0.043, 0.063, 0.149); // #0b1026
            vec3 nigHor = vec3(0.165, 0.184, 0.290); // #2a2f4a
            vec3 night = h >= 0.0
              ? mix(nigHor, nigZen, smoothstep(0.0, 0.6, h))
              : mix(nigHor, nigZen * 0.55, smoothstep(0.0, -0.4, h));
            float band = pow(1.0 - smoothstep(0.0, 0.30, abs(h)), 2.0);
            night += vec3(0.420, 0.290, 0.227) * band * 0.5; // #6b4a3a remnant
            gl_FragColor = vec4(mix(day, night, uNight), 1.0);
          }
        `,
      }),
    []
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(() => {
    mat.uniforms.uNight.value = nightRef.current.mix;
  });
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[60, 32, 24]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Stars — pinpoints on the dome, visible only as night falls          */
/* ------------------------------------------------------------------ */
function Stars({ nightRef, count = 400 }) {
  const mat = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * TAU;
      const phi = Math.acos(1 - Math.random() * 0.95); // bias to upper dome
      const r = 55;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) - 4;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);
  useFrame(() => {
    if (mat.current) mat.current.opacity = nightRef.current.mix * 0.9;
  });
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        size={1.6}
        sizeAttenuation={false}
        color="#dfe8ff"
        transparent
        opacity={0}
        depthWrite={false}
        fog={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Clouds: soft white canvas-sprite puffs, slow drift, dimmed by night */
/* ------------------------------------------------------------------ */
function makePuffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  const blobs = [
    [128, 150, 90],
    [90, 160, 60],
    [170, 160, 65],
    [128, 120, 55],
    [70, 140, 40],
    [190, 140, 42],
  ];
  for (const [bx, by, br] of blobs) {
    const g = x.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.beginPath();
    x.arc(bx, by, br, 0, TAU);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const CLOUD_DAY = new THREE.Color("#ffffff");
const CLOUD_NIGHT = new THREE.Color("#79809f");

function Clouds({ nightRef, count = 14 }) {
  const group = useRef();
  const tex = useMemo(makePuffTexture, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * TAU + Math.random() * 0.6;
        const r = 10 + Math.random() * 12;
        return {
          x: Math.cos(a) * r,
          y: -5 + Math.random() * 14,
          z: Math.sin(a) * r,
          s: 6 + Math.random() * 7,
          o: 0.28 + Math.random() * 0.35,
          v: 0.08 + Math.random() * 0.15,
        };
      }),
    [count]
  );
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const kids = group.current?.children;
    if (!kids) return;
    const m = nightRef.current.mix;
    for (let i = 0; i < kids.length; i++) {
      const sp = kids[i];
      sp.position.x += items[i].v * dt;
      if (sp.position.x > 26) sp.position.x = -26;
      sp.material.color.lerpColors(CLOUD_DAY, CLOUD_NIGHT, m);
      sp.material.opacity = items[i].o * (1 - 0.3 * m);
    }
  });
  return (
    <group ref={group}>
      {items.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.55, 1]}>
          <spriteMaterial
            map={tex}
            transparent
            opacity={c.o}
            depthWrite={false}
            fog={false}
            color="#ffffff"
          />
        </sprite>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Atmosphere — fog + light rig that breathes between day and night    */
/* ------------------------------------------------------------------ */
const FOG_DAY = new THREE.Color("#e6dcc4");
const FOG_NIGHT = new THREE.Color("#252a45");
const SUN_DAY = new THREE.Color("#ffe9c8");
const SUN_NIGHT = new THREE.Color("#aebfff");

function Atmosphere({ nightRef }) {
  const { scene } = useThree();
  const amb = useRef();
  const hemi = useRef();
  const sun = useRef();
  const rim = useRef();
  const glow = useRef();
  useFrame(() => {
    const m = nightRef.current.mix;
    const L = THREE.MathUtils.lerp;
    if (scene.fog) scene.fog.color.lerpColors(FOG_DAY, FOG_NIGHT, m);
    if (amb.current) amb.current.intensity = L(0.5, 0.22, m);
    if (hemi.current) hemi.current.intensity = L(0.45, 0.16, m);
    if (sun.current) {
      sun.current.intensity = L(1.75, 0.4, m);
      sun.current.color.lerpColors(SUN_DAY, SUN_NIGHT, m);
    }
    if (rim.current) rim.current.intensity = L(0.65, 0.5, m);
    if (glow.current) glow.current.intensity = L(0, 55, m);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.5} color="#fff6e8" />
      <hemisphereLight ref={hemi} args={["#cfe0ea", "#f2ede2", 0.45]} />
      {/* warm key sun — stronger now, moonlight-blue at night */}
      <directionalLight
        ref={sun}
        position={[6, 10, 5]}
        intensity={1.75}
        color="#ffe9c8"
      />
      {/* defined cool rim so the silhouette reads against the sky */}
      <directionalLight
        ref={rim}
        position={[-5, 4, -6]}
        intensity={0.65}
        color="#9fc3dd"
      />
      <directionalLight position={[4, 2, -7]} intensity={0.3} color="#cfe2ee" />
      {/* warm city glow rising from below-front at night */}
      <pointLight
        ref={glow}
        position={[0, -5.5, 7]}
        intensity={0}
        color="#ff9a5c"
        distance={42}
        decay={1.8}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Billboard canvas texture: DEEP accent panel, ivory serif title      */
/* ------------------------------------------------------------------ */
function fitTitle(ctx, title, maxW, baseSize) {
  const words = title.split(" ");
  const measure = (s) => {
    ctx.font = `300 ${s}px Fraunces, Georgia, serif`;
  };
  let size = baseSize;
  const twoLine = (s) => {
    measure(s);
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      if (ctx.measureText(a).width <= maxW && ctx.measureText(b).width <= maxW)
        return [a, b];
    }
    return null;
  };
  let split = twoLine(size);
  while (!split && size > 58) {
    size -= 6;
    split = twoLine(size);
  }
  const lines = split || [title];
  measure(size);
  while (ctx.measureText(lines[0]).width > maxW && size > 46) {
    size -= 4;
    measure(size);
  }
  return { lines, size };
}

function makeBillboardTexture(p) {
  const W = 1024;
  const H = 752;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");

  // deep gallery-tone panel
  x.fillStyle = p.accent;
  x.fillRect(0, 0, W, H);
  // gentle depth: lighter at top, shadow settling at the base
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(255,255,255,0.13)");
  g.addColorStop(0.45, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(0,0,0,0.14)");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  // thin ivory hairline frame + champagne inner line
  x.strokeStyle = "rgba(246,242,232,0.5)";
  x.lineWidth = 2;
  x.strokeRect(30, 30, W - 60, H - 60);
  x.strokeStyle = "rgba(201,160,106,0.65)";
  x.lineWidth = 1;
  x.strokeRect(38, 38, W - 76, H - 76);

  try {
    x.letterSpacing = "8px";
  } catch {
    /* older canvas */
  }
  x.fillStyle = "rgba(246,242,232,0.78)";
  x.font = "500 30px Inter, system-ui, sans-serif";
  x.textBaseline = "alphabetic";
  x.fillText(p.index, 84, 128);
  try {
    x.letterSpacing = "0px";
  } catch {
    /* older canvas */
  }

  const { lines, size } = fitTitle(x, p.title, W - 168, 96);
  x.fillStyle = IVORY;
  const lh = size * 1.14;
  lines.forEach((ln, i) => x.fillText(ln, 84, 300 + i * lh));

  // champagne rule + tag line in soft ivory
  x.fillStyle = "rgba(217,180,124,0.95)";
  x.fillRect(84, H - 148, 64, 3);
  try {
    x.letterSpacing = "6px";
  } catch {
    /* older canvas */
  }
  x.fillStyle = "rgba(246,242,232,0.74)";
  x.font = "500 26px Inter, system-ui, sans-serif";
  x.fillText(p.tags.join(" · ").toUpperCase(), 84, H - 100);
  try {
    x.letterSpacing = "0px";
  } catch {
    /* older canvas */
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ------------------------------------------------------------------ */
/* Upper-ring texture: repeating serif text wrapping 360°              */
/* ------------------------------------------------------------------ */
function makeRingTexture() {
  const W = 2048;
  const H = 160;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#ded7c2";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#3a342a";
  x.font = "300 64px Fraunces, Georgia, serif";
  try {
    x.letterSpacing = "10px";
  } catch {
    /* older canvas */
  }
  x.textBaseline = "middle";
  const unit = site.ringText;
  const uw = x.measureText(unit).width;
  const reps = Math.ceil(W / uw) + 1;
  let dx = 0;
  for (let i = 0; i < reps; i++) {
    x.fillText(unit, dx, H / 2 + 2);
    dx += uw;
  }
  x.fillStyle = "rgba(201,160,106,0.7)";
  x.fillRect(0, 10, W, 2);
  x.fillRect(0, H - 12, W, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/* ------------------------------------------------------------------ */
/* Scroll-driven camera: keyframed journey + mouse parallax            */
/* ------------------------------------------------------------------ */
const CAM_KEYS = [
  { p: 0.0, pos: [0, -1.5, 13], look: [0, 0.5, 0] },
  { p: 0.5, pos: [0, 2.0, 12], look: [0, 1.9, 0] },
  { p: 1.0, pos: [0, 5.8, 11], look: [0, 4.6, 0] },
];

function camAt(p) {
  let a = CAM_KEYS[0];
  let b = CAM_KEYS[CAM_KEYS.length - 1];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    if (p >= CAM_KEYS[i].p && p <= CAM_KEYS[i + 1].p) {
      a = CAM_KEYS[i];
      b = CAM_KEYS[i + 1];
      break;
    }
  }
  const t = (p - a.p) / Math.max(1e-6, b.p - a.p);
  const lerp3 = (u, v) => [
    u[0] + (v[0] - u[0]) * t,
    u[1] + (v[1] - u[1]) * t,
    u[2] + (v[2] - u[2]) * t,
  ];
  return { pos: lerp3(a.pos, b.pos), look: lerp3(a.look, b.look) };
}

function CameraRig({ scrollRef, mouseRef }) {
  const { camera } = useThree();
  const lookSm = useRef(new THREE.Vector3(0, 0.5, 0));
  useEffect(() => {
    camera.position.set(0, -1.5, 13);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    // smooth the parallax offset toward its target
    const mo = mouseRef.current;
    const mk = 1 - Math.exp(-dt * 2.6);
    mo.x += (mo.tx - mo.x) * mk;
    mo.y += (mo.ty - mo.y) * mk;
    const { pos, look } = camAt(scrollRef.current.p);
    const tx = pos[0] + mo.x * 0.5;
    const ty = pos[1] - mo.y * 0.3;
    const k = 1 - Math.exp(-dt * 3.2);
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (pos[2] - camera.position.z) * k;
    lookSm.current.x += (look[0] - lookSm.current.x) * k;
    lookSm.current.y += (look[1] - lookSm.current.y) * k;
    lookSm.current.z += (look[2] - lookSm.current.z) * k;
    camera.lookAt(lookSm.current);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* One billboard: pop-out hover, champagne outline, lit-signage glow   */
/* ------------------------------------------------------------------ */
const THETA_LEN = 1.15; // billboard arc (~66°)

function Billboard({
  project: p,
  index: i,
  tex,
  nightRef,
  hoverRef,
  onSelect,
  onFocus,
  onHoverChange,
  onHoverMove,
}) {
  const thetaStart = i * (Math.PI / 2) - THETA_LEN / 2;
  const popRef = useRef();
  const matRef = useRef();
  const outMatRef = useRef();

  const edges = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      1.8, 1.8, 1.52, 24, 1, true, thetaStart, THETA_LEN
    );
    const e = new THREE.EdgesGeometry(geo, 20);
    geo.dispose();
    return e;
  }, [thetaStart]);
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const k = 1 - Math.exp(-dt * 9);
    const hovered = hoverRef.current === i;
    const g = popRef.current;
    if (g) {
      const st = hovered ? 1.045 : 1; // radius 1.78 → ~1.86
      g.scale.x += (st - g.scale.x) * k;
      g.scale.z += (st - g.scale.z) * k;
    }
    if (outMatRef.current) {
      const m = outMatRef.current;
      m.opacity += ((hovered ? 0.95 : 0) - m.opacity) * k;
    }
    if (matRef.current) {
      const mix = nightRef.current.mix;
      const target =
        mix * 0.55 + (hovered ? 0.15 + mix * 0.3 : 0); // day lift / night signage glow
      matRef.current.emissiveIntensity +=
        (target - matRef.current.emissiveIntensity) * k;
    }
  });

  const evtXY = (e) => [
    e.clientX ?? e.nativeEvent?.clientX ?? 0,
    e.clientY ?? e.nativeEvent?.clientY ?? 0,
  ];

  return (
    <group>
      <group ref={popRef} position={[0, 1.8, 0]}>
        <mesh>
          <cylinderGeometry
            args={[1.78, 1.78, 1.5, 24, 1, true, thetaStart, THETA_LEN]}
          />
          <meshStandardMaterial
            ref={matRef}
            map={tex}
            emissiveMap={tex}
            emissive="#ffffff"
            emissiveIntensity={0}
            roughness={0.85}
          />
        </mesh>
        {/* champagne outline that fades in on hover */}
        <lineSegments geometry={edges}>
          <lineBasicMaterial
            ref={outMatRef}
            color={CHAMPAGNE}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </lineSegments>
      </group>
      {/* generous invisible hit band */}
      <mesh
        position={[0, 1.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onFocus(i);
          onSelect(i);
        }}
        onPointerOver={(e) => {
          hoverRef.current = i;
          onHoverChange(i);
          onHoverMove(...evtXY(e));
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={(e) => onHoverMove(...evtXY(e))}
        onPointerOut={() => {
          if (hoverRef.current === i) hoverRef.current = -1;
          onHoverChange(null);
          document.body.style.cursor = "";
        }}
      >
        <cylinderGeometry
          args={[1.9, 1.9, 1.7, 24, 1, true, thetaStart - 0.06, THETA_LEN + 0.12]}
        />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The tower — spire, dome, text ring, pod with billboards, ribbed shaft */
/* ------------------------------------------------------------------ */
const TIP_DAY = new THREE.Color("#c9a06a");
const TIP_NIGHT = new THREE.Color("#ffd9a0");

function Tower({
  fontsReady,
  nightRef,
  onSelect,
  onHoverChange,
  onHoverMove,
  scrollRef,
}) {
  const group = useRef();
  const hoverRef = useRef(-1);
  const ringMatRef = useRef();
  const tipMatRef = useRef();

  const billboardTex = useMemo(
    () => (fontsReady ? projects.map(makeBillboardTexture) : []),
    [fontsReady]
  );
  useEffect(() => () => billboardTex.forEach((t) => t.dispose()), [billboardTex]);
  const ringTex = useMemo(
    () => (fontsReady ? makeRingTexture() : null),
    [fontsReady]
  );
  useEffect(() => () => ringTex?.dispose(), [ringTex]);

  // click-to-focus: swing the chosen billboard round to face the camera
  const focusBillboard = (i) => {
    const s = scrollRef.current;
    const base = -i * (Math.PI / 2);
    const k = Math.round((s.spin - base) / TAU);
    gsap.to(s, {
      spin: base + k * TAU,
      duration: 1.5,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  };

  // rotation: slow drift + scroll velocity adds spin, damped
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = scrollRef.current;
    s.spin += dt * 0.06;
    const g = group.current;
    if (g) {
      const delta = s.spin - g.rotation.y;
      g.rotation.y += delta * (1 - Math.exp(-dt * 3.2));
    }
    // night life: ring band glows champagne, spire tip lights up
    const mix = nightRef.current.mix;
    if (ringMatRef.current) ringMatRef.current.emissiveIntensity = mix * 0.9;
    if (tipMatRef.current)
      tipMatRef.current.color.lerpColors(TIP_DAY, TIP_NIGHT, mix);
  });

  return (
    <group ref={group}>
      {/* shaft: long slender, tapered, deeper stone, runs out of frame below */}
      <mesh position={[0, -3.5, 0]}>
        <cylinderGeometry args={[0.42, 0.55, 7, 24]} />
        <meshStandardMaterial color="#d2cbb6" roughness={0.82} metalness={0.06} />
      </mesh>
      {/* vertical ribs */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * TAU;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.53, -3.5, Math.cos(a) * 0.53]}
            rotation={[0, a, 0]}
          >
            <boxGeometry args={[0.045, 6.7, 0.035]} />
            <meshStandardMaterial color="#bfb69c" roughness={0.88} />
          </mesh>
        );
      })}

      {/* collar: tapered transition into the pod */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.5, 0.42, 0.9, 32]} />
        <meshStandardMaterial color="#d6cfb6" roughness={0.78} metalness={0.06} />
      </mesh>

      {/* pod drum — deeper stone so the colored panels carry the contrast */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 1.8, 48]} />
        <meshStandardMaterial color="#dcd4be" roughness={0.78} metalness={0.06} />
      </mesh>
      {/* champagne hairlines, pod top + bottom */}
      {[0.9, 2.7].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.028, 12, 72]} />
          <meshBasicMaterial color={CHAMPAGNE} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* billboards: deep gallery panels wrapped on the pod */}
      {fontsReady &&
        projects.map((p, i) => (
          <Billboard
            key={p.index}
            project={p}
            index={i}
            tex={billboardTex[i]}
            nightRef={nightRef}
            hoverRef={hoverRef}
            onSelect={onSelect}
            onFocus={focusBillboard}
            onHoverChange={onHoverChange}
            onHoverMove={onHoverMove}
          />
        ))}

      {/* upper ring with repeating serif text — glows champagne at night */}
      {fontsReady && (
        <mesh position={[0, 2.925, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.45, 48, 1, true]} />
          <meshStandardMaterial
            ref={ringMatRef}
            map={ringTex}
            emissiveMap={ringTex}
            emissive="#c9a06a"
            emissiveIntensity={0}
            roughness={0.85}
          />
        </mesh>
      )}
      {[2.7, 3.15].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.024, 12, 72]} />
          <meshBasicMaterial color={CHAMPAGNE} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* dome cap */}
      <mesh position={[0, 3.15, 0]} scale={[1, 0.65, 1]}>
        <sphereGeometry args={[1.15, 48, 24, 0, TAU, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dcd4be" roughness={0.72} metalness={0.06} />
      </mesh>

      {/* spire + tip that lights at night */}
      <mesh position={[0, 4.95, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 2.1, 12]} />
        <meshStandardMaterial color="#bfb69c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 6.03, 0]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshBasicMaterial ref={tipMatRef} color={CHAMPAGNE} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */
export default function TowerScene({
  fontsReady,
  night,
  onSelect,
  onHoverChange,
  onHoverMove,
}) {
  const scrollRef = useRef({ y: 0, p: 0, spin: 0.6, lastY: 0 });
  const nightRef = useRef({ mix: 0, target: 0 });
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    nightRef.current.target = night ? 1 : 0;
  }, [night]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const dy = y - scrollRef.current.lastY;
      scrollRef.current.lastY = y;
      scrollRef.current.y = y;
      scrollRef.current.p = p;
      // scroll energy spins the tower — 1:1 with scroll feel
      scrollRef.current.spin += Math.abs(dy) * 0.0011;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // mouse parallax — ignored for touch pointers, so mobile stays calm
  useEffect(() => {
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      mouseRef.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="absolute inset-0 select-none">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, -1.5, 13], fov: 40 }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={["#e6dcc4", 18, 42]} />
        <NightDriver nightRef={nightRef} />
        <Atmosphere nightRef={nightRef} />
        <SkyDome nightRef={nightRef} />
        <Stars nightRef={nightRef} />
        <Clouds nightRef={nightRef} />
        <CameraRig scrollRef={scrollRef} mouseRef={mouseRef} />
        <Tower
          fontsReady={fontsReady}
          nightRef={nightRef}
          onSelect={onSelect}
          onHoverChange={onHoverChange}
          onHoverMove={onHoverMove}
          scrollRef={scrollRef}
        />
      </Canvas>
    </div>
  );
}
