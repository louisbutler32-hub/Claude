import React from "react";
import * as THREE from "three";
import { canvasTex, hash } from "./kit";
import { mat, ball } from "./rig";

/**
 * The sets: an outdoor arena (court, two hoops, stands, light banks, a city
 * skyline beyond), the jungle, and the small props (trophies, a height ruler,
 * the scoreboard). Court is the real size: 28.65 m x 15.24 m, the main hoop at
 * the -z end.
 */

export const COURT = { len: 28.65, wid: 15.24 };
export const RIM = { y: 3.05, z: -(COURT.len / 2 - 1.6) };
export const BRAND = "JUNGLE CLASSIC";
const PAINT = "#2c49b5", APRON = "#1b2a6e", LINE = "#ffffff", WOOD = [206, 160, 104];

const PX = 54; // canvas pixels per metre
const courtTex = () => canvasTex("court", 19 * PX, 32 * PX, (g) => {
  const w = 19 * PX, h = 32 * PX, ox = ((19 - COURT.wid) / 2) * PX, oy = ((32 - COURT.len) / 2) * PX, cw = COURT.wid * PX, ch = COURT.len * PX;
  g.fillStyle = APRON; g.fillRect(0, 0, w, h);
  // planks run the length of the court
  for (let x = 0; x < cw; x += 7) {
    const k = 0.9 + hash(x) * 0.16;
    g.fillStyle = `rgb(${WOOD[0] * k},${WOOD[1] * k},${WOOD[2] * k})`; g.fillRect(ox + x, oy, 7, ch);
    for (let y = 0; y < ch; y += 90 + hash(x, 3) * 60) { g.fillStyle = "rgba(90,50,20,0.25)"; g.fillRect(ox + x, oy + y, 7, 1.5); }
  }
  const M = (m: number) => m * PX;
  g.lineWidth = 4; g.strokeStyle = LINE;
  const end = (dir: 1 | -1) => {
    const by = dir === -1 ? oy : oy + ch; // baseline y
    const s = dir === -1 ? 1 : -1; // into the court
    const cx = w / 2, hoopY = by + s * M(1.6);
    // the paint
    g.fillStyle = PAINT; g.fillRect(cx - M(2.44), Math.min(by, by + s * M(5.8)), M(4.88), M(5.8));
    g.strokeRect(cx - M(2.44), Math.min(by, by + s * M(5.8)), M(4.88), M(5.8));
    g.beginPath(); g.arc(cx, by + s * M(5.8), M(1.8), 0, Math.PI * 2); g.stroke();
    // the three-point line
    const corner = M(COURT.wid / 2 - 0.91);
    const cut = M(4.27);
    g.beginPath(); g.moveTo(cx - corner, by); g.lineTo(cx - corner, by + s * cut); g.stroke();
    g.beginPath(); g.moveTo(cx + corner, by); g.lineTo(cx + corner, by + s * cut); g.stroke();
    const a0 = Math.acos(corner / M(7.24));
    g.beginPath();
    if (dir === -1) g.arc(cx, hoopY, M(7.24), a0, Math.PI - a0); else g.arc(cx, hoopY, M(7.24), Math.PI + a0, -a0);
    g.stroke();
  };
  end(-1); end(1);
  g.strokeRect(ox, oy, cw, ch);
  g.beginPath(); g.moveTo(ox, h / 2); g.lineTo(ox + cw, h / 2); g.stroke();
  // centre logo
  g.fillStyle = "#f6c21c"; g.beginPath(); g.arc(w / 2, h / 2, M(1.83), 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = PAINT; g.beginPath(); g.arc(w / 2, h / 2, M(1.3), 0, Math.PI * 2); g.fill();
  g.save(); g.translate(w / 2, h / 2); g.rotate(Math.PI / 2);
  g.fillStyle = "#f6c21c"; g.font = "400 66px Anton"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1V1", 0, 4);
  g.restore();
  // apron lettering, read from the sidelines
  g.fillStyle = "#f6c21c"; g.font = "800 40px Montserrat"; g.textAlign = "center"; g.textBaseline = "middle";
  [ox / 2, w - ox / 2].forEach((x, i) => { g.save(); g.translate(x, h / 2); g.rotate(i === 0 ? -Math.PI / 2 : Math.PI / 2); g.fillText(`${BRAND}  •  ${BRAND}  •  ${BRAND}`, 0, 0); g.restore(); });
});

export const Court: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[19, 32]} />
      <meshStandardMaterial map={courtTex()} roughness={0.55} metalness={0.05} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#5b6470" roughness={1} />
    </mesh>
  </group>
);

const boardTex = () => canvasTex("backboard", 256, 150, (g) => {
  g.fillStyle = "rgba(255,255,255,0.85)"; g.fillRect(0, 0, 256, 150);
  g.strokeStyle = "#d43a2a"; g.lineWidth = 10; g.strokeRect(5, 5, 246, 140);
  g.lineWidth = 7; g.strokeRect(128 - 42, 150 - 30 - 64, 84, 64);
});

/** one hoop; dir -1 is the main (−z) end. `sway` swings the net, `bend` pulls the rim down after a dunk */
export const Hoop: React.FC<{ dir?: 1 | -1; sway?: number; bend?: number; shake?: number }> = ({ dir = -1, sway = 0, bend = 0, shake = 0 }) => {
  const z = (COURT.len / 2 - 1.2) * dir, rimZ = -RIM.z * dir;
  const back = dir; // + away from court
  const pad = mat("#203a9a", { rough: 0.9 }), steel = mat("#c9ccd2", { rough: 0.35, metal: 0.6 }), dark = mat("#20242c", { rough: 0.6 });
  return (
    <group position={[shake * 0.03, 0, 0]}>
      {/* stanchion */}
      <mesh position={[0, 0.55, z + back * 2.6]}><boxGeometry args={[1.3, 1.1, 1.6]} /><primitive object={pad} attach="material" /></mesh>
      <mesh position={[0, 2.3, z + back * 2.5]}><boxGeometry args={[0.28, 2.6, 0.28]} /><primitive object={dark} attach="material" /></mesh>
      <mesh position={[0, 3.55, z + back * 1.3]} rotation={[back * 0.32, 0, 0]}><boxGeometry args={[0.2, 0.2, 2.7]} /><primitive object={dark} attach="material" /></mesh>
      {/* backboard */}
      <mesh position={[0, 3.435, z]} rotation={[0, dir === 1 ? Math.PI : 0, 0]}>
        <planeGeometry args={[1.83, 1.07]} />
        <meshStandardMaterial map={boardTex()} transparent roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* rim + net */}
      <group position={[0, RIM.y, rimZ]} rotation={[bend * 0.4 * -dir, 0, 0]}>
        <mesh position={[0, 0, back * 0.2]}><boxGeometry args={[0.06, 0.04, 0.3]} /><primitive object={steel} attach="material" /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2286, 0.018, 6, 20]} /><meshStandardMaterial color="#e2502a" roughness={0.4} metalness={0.4} /></mesh>
        <mesh position={[Math.sin(sway) * 0.03, -0.22, Math.cos(sway * 1.3) * 0.02]} rotation={[sway * 0.15, 0, sway * 0.1]}>
          <cylinderGeometry args={[0.225, 0.15, 0.42, 12, 3, true]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
};

const crowdTex = () => canvasTex("crowd", 512, 512, (g) => {
  g.fillStyle = "#1b1c2c"; g.fillRect(0, 0, 512, 512);
  const shirts = ["#e43b3b", "#f6c21c", "#3a7be0", "#ffffff", "#4b2a85", "#2fb36b", "#ff8a2a", "#e85aa8", "#7fd3ff", "#202020"];
  const skins = ["#f1c6a0", "#c98d63", "#8a5a3c", "#5a3a28", "#e8b48a"];
  for (let row = 0; row < 16; row++) {
    g.fillStyle = row % 2 ? "#26283c" : "#2c2f46"; g.fillRect(0, row * 32 + 22, 512, 10);
    for (let i = 0; i < 40; i++) {
      if (hash(row, i) < 0.12) continue;
      const x = i * 12.8 + hash(i, row) * 3, y = row * 32 + 4;
      g.fillStyle = shirts[Math.floor(hash(row * 7, i * 3) * shirts.length)]; g.fillRect(x, y + 8, 9, 12);
      g.fillStyle = skins[Math.floor(hash(row * 3, i * 7) * skins.length)]; g.fillRect(x + 2, y + 1, 6, 7);
    }
  }
}, { repeat: [10, 3] });

const ledTex = (msg: string) => canvasTex(`led-${msg}`, 2048, 64, (g) => {
  g.fillStyle = "#0a1236"; g.fillRect(0, 0, 2048, 64);
  g.font = "800 42px Montserrat"; g.textBaseline = "middle"; g.fillStyle = "#ffd21c";
  let x = 10; let i = 0;
  while (x < 2048) { const s = i % 2 ? "ONE-ON-ONE" : msg; g.fillStyle = i % 2 ? "#ffffff" : "#ffd21c"; g.fillText(s, x, 34); x += g.measureText(s).width + 50; i++; }
}, { repeat: [3, 1] });

/** stands on all four sides, LED boards in front, light banks above */
export const Stands: React.FC = () => {
  const crowd = crowdTex(), led = ledTex(BRAND);
  const slope = (len: number) => (
    <group>
      <mesh position={[0, 7.6, -8.9]} rotation={[-0.95, 0, 0]}>
        <planeGeometry args={[len, 22]} />
        <meshStandardMaterial map={crowd} roughness={1} />
      </mesh>
      <mesh position={[0, 0.6, 0.15]}><boxGeometry args={[len, 1.2, 0.3]} /><meshStandardMaterial map={led} emissive="#ffffff" emissiveMap={led} emissiveIntensity={0.55} /></mesh>
    </group>
  );
  return (
    <group>
      {/* sides (facing the court), then the two ends */}
      <group position={[-9.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>{slope(70)}</group>
      <group position={[9.8, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>{slope(70)}</group>
      <group position={[0, 0, -17.6]}>{slope(60)}</group>
      <group position={[0, 0, 17.6]} rotation={[0, Math.PI, 0]}>{slope(60)}</group>
      {/* light banks */}
      {[[-26, -30], [26, -30], [-26, 30], [26, 30], [-30, 0], [30, 0]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, Math.atan2(-x, -z), 0]}>
          <mesh position={[0, 12, 0]}><boxGeometry args={[0.4, 24, 0.4]} /><meshStandardMaterial color="#3a3f4a" /></mesh>
          <mesh position={[0, 24.5, 0.3]}><boxGeometry args={[6, 2.2, 0.4]} /><meshStandardMaterial color="#ffffff" emissive="#fffbe8" emissiveIntensity={1.6} /></mesh>
        </group>
      ))}
    </group>
  );
};

const winTex = () => canvasTex("windows", 128, 256, (g) => {
  g.fillStyle = "#2b3040"; g.fillRect(0, 0, 128, 256);
  for (let y = 4; y < 256; y += 8) for (let x = 4; x < 128; x += 8) { const on = hash(x, y) > 0.45; g.fillStyle = on ? (hash(y, x) > 0.5 ? "#ffe9a8" : "#ffd27a") : "#3a4055"; g.fillRect(x, y, 4, 5); }
}, { pixel: true });

export const Skyline: React.FC = () => {
  const t = winTex();
  const towers = React.useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 2 + hash(i) * 0.1, r = 70 + hash(i, 1) * 50;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 22 + hash(i, 2) * 55, w: 7 + hash(i, 3) * 7 };
  }), []);
  return (
    <group>
      {towers.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} rotation={[0, hash(i, 5) * 3, 0]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial map={t} emissive="#ffffff" emissiveMap={t} emissiveIntensity={0.35} roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2, r = 50 + hash(i, 9) * 12;
        return <Tree key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} s={1.6 + hash(i, 4)} />;
      })}
    </group>
  );
};

export const Tree: React.FC<{ position: [number, number, number]; s?: number; color?: string }> = ({ position, s = 1, color = "#2f7a3a" }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.25, 0.35, 2, 6]} /><primitive object={mat("#5a3a22")} attach="material" /></mesh>
    {[0, 1, 2].map((k) => <mesh key={k} position={[0, 2.6 + k * 1.5, 0]}><coneGeometry args={[2.4 - k * 0.6, 2.8, 7]} /><primitive object={mat(color)} attach="material" /></mesh>)}
  </group>
);

const skyTex = (top: string, mid: string, bottom: string) => canvasTex(`sky-${top}-${mid}-${bottom}`, 16, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, top); gr.addColorStop(0.45, mid); gr.addColorStop(0.55, bottom); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512);
});
export const Sky: React.FC<{ top?: string; mid?: string; bottom?: string }> = ({ top = "#4f8fd8", mid = "#b9d8f2", bottom = "#d9e8f3" }) => (
  <mesh>
    <sphereGeometry args={[400, 24, 16]} />
    <meshBasicMaterial map={skyTex(top, mid, bottom)} side={THREE.BackSide} fog={false} depthWrite={false} />
  </mesh>
);

export const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#dfefff", "#7a6a55", 1.25]} />
    <directionalLight position={[18, 40, 22]} intensity={2.2} color="#fff4e0" />
    <directionalLight position={[-20, 25, -10]} intensity={0.7} color="#cfe0ff" />
  </>
);

/** the full outdoor arena */
export const Arena: React.FC<{ sway?: number; bend?: number; hoopShake?: number; score?: Score; children?: React.ReactNode }> = ({ sway = 0, bend = 0, hoopShake = 0, score, children }) => (
  <>
    <Sky />
    <fog attach="fog" args={["#c8dcee", 70, 260]} />
    <Lights />
    <Court />
    <Hoop dir={-1} sway={sway} bend={bend} shake={hoopShake} />
    <Hoop dir={1} />
    <Stands />
    <Skyline />
    <Scoreboard3D position={[0, 13.5, -24]} score={score} />
    {children}
  </>
);

/* ------------------------------------------------------------------ scoreboard */

export type Score = { label: string; a: number; b: number };
export const START_SCORE: Score = { label: "ONE-ON-ONE", a: 0, b: 0 };

export const scoreTex = (s: Score) => canvasTex(`score-${s.label}-${s.a}-${s.b}`, 800, 520, (g) => {
  g.fillStyle = "#0f1a3c"; g.fillRect(0, 0, 800, 520);
  g.fillStyle = "#1f3f9e"; g.fillRect(0, 0, 800, 100);
  g.strokeStyle = "#5aa0ff"; g.lineWidth = 8; g.strokeRect(4, 4, 792, 512);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#ffd21c"; g.font = "800 62px Montserrat"; g.fillText(s.label, 400, 54);
  g.fillStyle = "#ffffff"; g.font = "800 52px Montserrat"; g.fillText("LEBRON", 200, 160); g.fillText("GORILLA", 600, 160);
  g.fillStyle = "#5aa0ff"; g.fillRect(396, 130, 8, 340);
  g.fillStyle = "#ffd21c"; g.font = "400 270px Anton"; g.fillText(String(s.a), 200, 340); g.fillText(String(s.b), 600, 340);
});

export const Scoreboard3D: React.FC<{ position: [number, number, number]; rotY?: number; score?: Score }> = ({ position, rotY = 0, score }) => {
  const s = score ?? START_SCORE;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 5, -0.2]}><boxGeometry args={[0.3, 10, 0.3]} /><meshStandardMaterial color="#2a2f3a" /></mesh>
      <mesh position={[0, 0, -0.25]}><boxGeometry args={[8.6, 5.8, 0.3]} /><meshStandardMaterial color="#141820" /></mesh>
      <mesh><planeGeometry args={[8, 5.2]} /><meshStandardMaterial map={scoreTex(s)} emissive="#ffffff" emissiveMap={scoreTex(s)} emissiveIntensity={0.6} roughness={0.6} /></mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ props */

const cupGeo = (() => {
  let g: THREE.LatheGeometry | null = null;
  return () => g ?? (g = new THREE.LatheGeometry([[0, 0], [0.16, 0], [0.16, 0.05], [0.05, 0.08], [0.04, 0.2], [0.08, 0.25], [0.2, 0.32], [0.24, 0.55], [0.22, 0.56]].map(([x, y]) => new THREE.Vector2(x, y)), 14));
})();
export const Trophy: React.FC<{ position: [number, number, number]; s?: number }> = ({ position, s = 1 }) => {
  const gold = mat("#f2c230", { rough: 0.25, metal: 0.85 });
  return (
    <group position={position} scale={s}>
      <mesh geometry={cupGeo()} material={gold} />
      {[-1, 1].map((k) => <mesh key={k} position={[k * 0.25, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.07, 0.018, 6, 12, Math.PI]} /><primitive object={gold} attach="material" /></mesh>)}
    </group>
  );
};

export const Podium: React.FC<{ position: [number, number, number]; w?: number; h?: number; color?: string }> = ({ position, w = 3.2, h = 1, color = "#15161c" }) => (
  <group position={position}>
    <mesh position={[0, h / 2, 0]}><boxGeometry args={[w, h, 1.1]} /><primitive object={mat(color, { rough: 0.4 })} attach="material" /></mesh>
    <mesh position={[0, h + 0.01, 0]}><boxGeometry args={[w + 0.05, 0.04, 1.15]} /><primitive object={mat("#f2c230", { rough: 0.3, metal: 0.8 })} attach="material" /></mesh>
  </group>
);

const rulerTex = () => canvasTex("ruler", 64, 1024, (g) => {
  g.fillStyle = "#f4f4f4"; g.fillRect(0, 0, 64, 1024);
  g.fillStyle = "#1a1a1a";
  for (let i = 0; i <= 96; i++) { const y = 1024 - (i / 96) * 1024; const len = i % 12 === 0 ? 48 : i % 6 === 0 ? 32 : 18; g.fillRect(0, y - 2, len, 4); }
});
/** an 8-ft height ruler with a marker bar at `mark` metres */
export const Ruler: React.FC<{ position: [number, number, number]; mark: number; grow?: number }> = ({ position, mark, grow = 1 }) => (
  <group position={position}>
    <mesh position={[0, 1.22, 0]}><boxGeometry args={[0.16, 2.44, 0.06]} /><meshStandardMaterial map={rulerTex()} roughness={0.6} /></mesh>
    <mesh position={[-0.2, mark * grow, 0.02]}><boxGeometry args={[0.7, 0.05, 0.08]} /><meshStandardMaterial color="#ffd21c" emissive="#ffd21c" emissiveIntensity={0.5} /></mesh>
  </group>
);

/** a soft dark contact shadow under a character */
export const Blob: React.FC<{ x: number; z: number; r?: number; o?: number }> = ({ x, z, r = 0.55, o = 0.35 }) => (
  <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[r, 20]} />
    <meshBasicMaterial color="#000000" transparent opacity={o} depthWrite={false} />
  </mesh>
);

/* ------------------------------------------------------------------ the jungle */

const groundTex = () => canvasTex("jground", 256, 256, (g) => {
  for (let y = 0; y < 256; y += 8) for (let x = 0; x < 256; x += 8) { const k = hash(x, y); g.fillStyle = k > 0.7 ? "#5d4a2c" : k > 0.35 ? "#3f6a2c" : "#4d7d34"; g.fillRect(x, y, 8, 8); }
}, { repeat: [40, 40], pixel: true });

export const Jungle: React.FC = () => {
  const trees = React.useMemo(() => Array.from({ length: 70 }, (_, i) => {
    const a = hash(i, 11) * Math.PI * 2, r = 9 + hash(i, 12) * 45;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r - 6, s: 1.2 + hash(i, 13) * 1.4, c: hash(i, 14) > 0.5 ? "#2d6e34" : "#3d8a3a" };
  }), []);
  const bushes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: (hash(i, 21) - 0.5) * 30, z: -2 - hash(i, 22) * 26, s: 0.5 + hash(i, 23) * 0.9 })), []);
  return (
    <>
      <Sky top="#6aa6d8" mid="#cfe6d8" bottom="#b9d6b0" />
      <fog attach="fog" args={["#b5d1b0", 18, 85]} />
      <hemisphereLight args={["#e8f6ff", "#4a5a2a", 1.3]} />
      <directionalLight position={[10, 30, 15]} intensity={2.0} color="#fff2d0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[300, 300]} /><meshStandardMaterial map={groundTex()} roughness={1} /></mesh>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 2.5, 0]}><cylinderGeometry args={[0.25, 0.4, 5, 6]} /><primitive object={mat("#5a4028")} attach="material" /></mesh>
          {[0, 1, 2, 3].map((k) => <mesh key={k} position={[Math.sin(k * 2.1) * 1, 5 + k * 0.5, Math.cos(k * 2.1) * 1]} scale={[1.6, 0.8, 1.6]} geometry={ball(1.2, 7, 5)} material={mat(t.c, { rough: 1 })} />)}
        </group>
      ))}
      {bushes.map((b, i) => <mesh key={i} position={[b.x, b.s * 0.4, b.z]} scale={[b.s * 1.4, b.s * 0.8, b.s * 1.2]} geometry={ball(0.8, 7, 5)} material={mat(i % 2 ? "#4f9a3c" : "#3a7d33", { rough: 1 })} />)}
      {[[-3, -4], [3.5, -6], [-5, -9]].map(([x, z], i) => <mesh key={i} position={[x, 0.3, z]} scale={[1.2, 0.7, 1]} geometry={ball(0.7, 6, 4)} material={mat("#7d7a72", { rough: 1 })} />)}
    </>
  );
};
