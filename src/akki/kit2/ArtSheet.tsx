import React from "react";
import { AbsoluteFill, getInputProps } from "remotion";
import { INK, loadAkkiFonts } from "../common";
import { HandDrawn } from "../../minecraft/handdrawn";
import { Akainu, BigPigBen, Boss, BossHead, Dino, Kizaru, Kuzan, Luffy, Marine, Nami, NamiHead, Sanji, SeaKing, Zoro, ZoroHead } from "./cast";
import { P, Part, smooth } from "./draw";
import { POSES, pose, Pose, runCycle, walkCycle } from "./pose";
import { Characters, Scene } from "./scene";
import { Caption, SpeechBubble, Sfx } from "./bubble";
import { Flash } from "./fx";
import { Receipt, SunTimer } from "./props";

/**
 * The kit-v2 art sheet (1920×1080, one frame): every character standing on
 * the tavern plate, a row of four poses for Zoro, Nami and the Boss, the
 * expression sets, bubbles in use, a Flash inset and a real sample shot.
 */

const Label: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 20 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill="#fff" stroke={INK} strokeWidth={size * 0.22} paintOrder="stroke" strokeLinejoin="round">{text}</text>
);

/** Zoro bent double, pulled along by the ear (head at the puller's hand) */
export const DRAGGED: Pose = pose({
  turn: 1, head: [322, -650], tilt: 34, neck: [270, -598],
  shL: [180, -560], elL: [130, -430], haL: [70, -330], hL: "relax", backL: true,
  shR: [330, -580], elR: [370, -450], haR: [330, -330], hR: "relax",
  hipL: [-30, -440], knL: [-120, -240], ftL: [-170, -8], fdL: 1,
  hipR: [60, -440], knR: [-20, -240], ftR: [-70, -10], fdR: 1, legRBack: true,
});

/** the sample shot: Boss behind the bar, Nami dragging a drained Zoro in by the ear */
export const Kit2Sample: React.FC<{ frame?: number }> = ({ frame = 30 }) => {
  loadAkkiFonts();
  const counter: P[] = [[1040, 760], [1920, 640], [1920, 1080], [1040, 1080]];
  return (
    <Scene plate="tavern2" light="dawn" dof={0.7} vignette={0.6} fit={{ zoom: 1.08, x: -40 }}>
      <HandDrawn hold={2} grain={0.4} boil={0.7}>
        <Characters>
          <Boss z={0} pose={pose({ ...POSES.stand, shR: [100, -784], elR: [210, -700], haR: [250, -820], hR: "open", turn: -0.5 })} face="grin" x={1540} y={930} s={0.62} shadow={false} />
          <g>
            <Part d={smooth(counter, true, 0.2)} fill="#9a5a2e" shade="#6a3a18" lw={6} sh={[-10, -8]}>
              <path d="M1040,760 L1920,640" stroke="#c98a4a" strokeWidth={26} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${1040 + i * 60},${1080} L${1920},${720 + i * 70}`} stroke="#6a3a18" strokeWidth={3} opacity={0.5} />)}
            </Part>
            <Receipt x={1420} y={700} value={300000000} s={0.5} rot={-8} unroll={0.5} />
          </g>
          <Zoro z={3} pose={DRAGGED} face="drained" drained x={380} y={985} s={0.62} />
          <Nami z={2} pose={POSES.drag} face="cold" x={700} y={985} s={0.62} />
          <SunTimer x={210} y={330} s={0.46} t={0.05} />
        </Characters>
      </HandDrawn>
      <Characters>
        <SpeechBubble x={1010} y={300} tail={[770, 430]} text="Sunset. Or it doubles." at={0} frame={frame} />
        <SpeechBubble x={330} y={330} tail={[560, 590]} text="WHAT?!" variant="shout" at={0} frame={frame} fill="#fff3a0" />
        <SpeechBubble x={1640} y={170} tail={[1560, 390]} text="Business!" variant="think" at={0} frame={frame} />
      </Characters>
    </Scene>
  );
};

/** debug view: walk + run cycles and the remaining poses, for checking motion */
const Kit2Cycles: React.FC = () => {
  loadAkkiFonts();
  return (
    <Scene plate="tavern2" light="warm" dof={0.6}>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
      <Characters>
        {Array.from({ length: 8 }, (_, i) => <Zoro key={`w${i}`} pose={walkCycle(i / 8)} face="calm" x={110 + i * 230} y={330} s={0.3} />)}
        {Array.from({ length: 8 }, (_, i) => <Nami key={`r${i}`} pose={runCycle(i / 8)} face="furious" x={110 + i * 230} y={660} s={0.3} />)}
        <Boss pose={POSES.drag} face="yell" x={200} y={1000} s={0.3} />
        <Luffy pose={POSES.sit} face="stuffed" x={520} y={1000} s={0.3} />
        <Zoro pose={POSES.collapse} face="drained" drained x={900} y={1000} s={0.3} />
        <Sanji pose={POSES.celebrate} face="heart" x={1250} y={1000} s={0.3} />
        <Akainu pose={POSES.lunge} face="angry" x={1600} y={1000} s={0.3} />
      </Characters>
    </Scene>
  );
};

export const Kit2ArtSheet: React.FC = () => {
  loadAkkiFonts();
  const view = (getInputProps() as { view?: string }).view;
  if (view === "sample") return <Kit2Sample frame={30} />;
  if (view === "cycles") return <Kit2Cycles />;
  const row1: { el: React.ReactNode; label: string; x: number }[] = [
    { label: "ZORO", x: 90, el: <Zoro pose={POSES.stand} face="calm" x={90} y={330} s={0.3} /> },
    { label: "NAMI", x: 210, el: <Nami pose={POSES.stand} face="sweet" x={210} y={330} s={0.3} /> },
    { label: "THE BOSS", x: 330, el: <Boss pose={POSES.stand} face="grin" x={330} y={330} s={0.3} /> },
    { label: "LUFFY", x: 450, el: <Luffy pose={POSES.stand} face="grin" x={450} y={330} s={0.3} /> },
    { label: "SANJI", x: 570, el: <Sanji pose={pose({ ...POSES.stand, hL: "pocket", hR: "pocket" })} face="calm" x={570} y={330} s={0.3} /> },
    { label: "AKAINU", x: 700, el: <Akainu pose={POSES.armsFolded} face="stern" x={700} y={330} s={0.33} /> },
    { label: "KUZAN", x: 830, el: <Kuzan pose={pose({ ...POSES.stand, hL: "pocket", hR: "pocket" })} face="sleepy" x={830} y={330} s={0.33} /> },
    { label: "KIZARU", x: 960, el: <Kizaru pose={POSES.shrug} face="smirk" x={960} y={330} s={0.33} /> },
    { label: "MARINE", x: 1090, el: <Marine pose={pose({ ...POSES.stand, elR: [210, -800], haR: [92, -920], hR: "flat" })} face="salute" x={1090} y={330} s={0.3} /> },
    { label: "BIG PIG BEN", x: 1200, el: <BigPigBen pose={POSES.stand} face="scared" x={1200} y={330} s={0.16} /> },
    { label: "SEA KING", x: 1400, el: <SeaKing x={1470} y={330} s={0.24} jaw={30} /> },
    { label: "T-REX", x: 1720, el: <Dino x={1660} y={330} s={0.24} jaw={25} /> },
  ];
  const row2: { el: React.ReactNode; label: string; x: number }[] = [
    { label: "walk 1", x: 80, el: <Zoro pose={POSES.walk1} face="calm" x={80} y={640} s={0.27} /> },
    { label: "point / shout", x: 200, el: <Zoro pose={POSES.point} face="shout" x={170} y={640} s={0.27} /> },
    { label: "lunge", x: 360, el: <Zoro pose={POSES.lunge} face="narrow" x={360} y={640} s={0.27} /> },
    { label: "cower / terror", x: 520, el: <Zoro pose={POSES.cower} face="terror" x={520} y={640} s={0.27} /> },
    { label: "walk 3", x: 660, el: <Nami pose={POSES.walk3} face="sweet" x={660} y={640} s={0.27} /> },
    { label: "folded / cold", x: 770, el: <Nami pose={POSES.armsFolded} face="cold" x={770} y={640} s={0.27} /> },
    { label: "point / furious", x: 900, el: <Nami pose={POSES.point} face="furious" x={870} y={640} s={0.27} /> },
    { label: "celebrate / money", x: 1040, el: <Nami pose={POSES.celebrate} face="money" x={1040} y={640} s={0.27} /> },
    { label: "run 1 / shock", x: 1180, el: <Boss pose={POSES.run1} face="shock" x={1170} y={640} s={0.27} /> },
    { label: "shrug / blank", x: 1320, el: <Boss pose={POSES.shrug} face="blank" x={1320} y={640} s={0.27} /> },
    { label: "sit / smug", x: 1460, el: <Boss pose={POSES.sit} face="smug" x={1440} y={640} s={0.27} /> },
    { label: "collapse / sob", x: 1640, el: <Boss pose={POSES.collapse} face="sob" x={1640} y={640} s={0.27} /> },
    { label: "walk 2", x: 1800, el: <Zoro pose={POSES.walk2} face="smirk" x={1800} y={640} s={0.27} flipX /> },
  ];
  const faces: { el: React.ReactNode; label: string }[] = [
    ...(["calm", "smirk", "narrow", "shout", "terror"] as const).map((f) => ({ label: f, el: <ZoroHead face={f} lw={4.5} /> })),
    { label: "drained", el: <ZoroHead face="drained" drained lw={4.5} ink="#5a5e68" /> },
    ...(["sweet", "cold", "furious", "money"] as const).map((f) => ({ label: f, el: <NamiHead face={f} lw={4.5} /> })),
    ...(["grin", "blank", "shock", "smug", "sob"] as const).map((f) => ({ label: f, el: <BossHead face={f} lw={4.5} /> })),
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#222" }}>
      <Scene plate="tavern2" light="warm" dof={0.6} vignette={0.5}>
        <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.45))" }} />
        <Characters>
          <text x={1850} y={34} textAnchor="end" fontFamily="Poppins Black" fontSize={26} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">KIT v2 · cast</text>
          {row1.map((r) => <g key={r.label}>{r.el}<Label x={r.x} y={362} text={r.label} /></g>)}
          {row2.map((r) => <g key={r.label}>{r.el}<Label x={r.x} y={672} text={r.label} size={16} /></g>)}
          <Sfx x={1870} y={470} text="!!" size={70} at={0} frame={10} burst rot={10} />
          <Sfx x={1870} y={560} text="?" size={60} color="#8fd4ff" at={0} frame={10} rot={-10} />
          {/* expression strip */}
          <text x={700} y={1030 - 90} fontFamily="Poppins Black" fontSize={18} fill="#fff" stroke={INK} strokeWidth={4} paintOrder="stroke">expressions</text>
          {faces.map((f, i) => <g key={i} transform={`translate(${740 + i * 78},${1000}) scale(0.42)`}>{f.el}<Label x={0} y={120} text={f.label} size={28} /></g>)}
          {/* bubbles in use */}
          <SpeechBubble x={1180} y={760} tail={[1080, 880]} text="Ten percent. The contract." at={0} frame={10} size={34} maxW={300} />
          <SpeechBubble x={1560} y={760} tail={[1480, 880]} text="psst… 10% commission" variant="whisper" at={0} frame={10} size={28} maxW={300} />
          <SpeechBubble x={1800} y={860} tail={[1700, 920]} text="Business!" variant="think" at={0} frame={10} size={28} />
          <Caption text="SPEECH · WHISPER · THINK" y={690} size={22} cx={1500} />
        </Characters>
        {/* Flash inset */}
        <div style={{ position: "absolute", left: 700, top: 700, width: 300, height: 169, overflow: "hidden", border: `4px solid ${INK}`, borderRadius: 8 }}>
          <div style={{ width: 1920, height: 1080, transform: "scale(0.15625)", transformOrigin: "top left" }}>
            <Flash at={0} frames={1} frame={0} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 710, top: 876, fontFamily: "Poppins Black", fontSize: 18, color: "#fff", WebkitTextStroke: `4px ${INK}`, paintOrder: "stroke" }}>Flash (impact frame)</div>
        {/* sample frame panel */}
        <div style={{ position: "absolute", left: 30, top: 700, width: 640, height: 360, overflow: "hidden", border: `4px solid ${INK}`, borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <div style={{ width: 1920, height: 1080, transform: "scale(0.33333)", transformOrigin: "top left" }}>
            <Kit2Sample frame={30} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 40, top: 1036, fontFamily: "Poppins Black", fontSize: 18, color: "#fff", WebkitTextStroke: `4px ${INK}`, paintOrder: "stroke" }}>sample shot · Kit2Sample (HandDrawn on the character layer)</div>
      </Scene>
    </AbsoluteFill>
  );
};
