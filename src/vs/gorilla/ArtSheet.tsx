import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CamRig, H, useVsFonts, V, W } from "../kit";
import { Arena, Blob, Jungle, RIM } from "../arena";
import { Ball, Baller, Gorilla, Pose } from "../rig";

/** one view per frame, to check the models and sets before shots are cut */
const VIEWS: { cam: [V, V, number]; jungle?: boolean; lb?: Pose; go?: Pose; lbAt?: V; goAt?: V; lbYaw?: number; goYaw?: number }[] = [
  { cam: [[0, 4, 4], [0, 2.5, -10], 55], lbAt: [0, 0, -6], goAt: [1.2, 0, -8], lbYaw: 180, goYaw: 0 },
  { cam: [[0, 1.6, -3.2], [0, 1.4, -6], 45], lbAt: [0, 0, -6], lb: { face: "grin" } },
  { cam: [[0.6, 1.3, -5.6], [0, 1.1, -8], 45], goAt: [0, 0, -8], go: { face: "shout", shL: [100, 20], shR: [100, 20], elL: 90, elR: 90, lean: 0, hipL: [5, 8], hipR: [5, 8], knL: 8, knR: 8 } },
  { cam: [[6, 1.6, -7], [0, 1.1, -7], 50], lbAt: [0, 0, -6], goAt: [0, 0, -8.2], lbYaw: 180, goYaw: 0, go: { lean: 55, shL: [55, 10], shR: [55, 10], elL: 0, elR: 0, hipL: [45, 10], hipR: [45, 10], knL: 55, knR: 55, head: [-45, 0] }, lb: { lean: 18, shR: [40, 10], elR: 40, knL: 30, knR: 30, hipL: [25, 6], hipR: [25, 6] } },
  { cam: [[0, 1.5, 3], [0, 1, -2], 50], jungle: true, goAt: [0, 0, -2], go: { lean: 55, shL: [55, 10], shR: [55, 10], elL: 0, elR: 0, hipL: [45, 10], hipR: [45, 10], knL: 55, knR: 55, head: [-45, 0] } },
  { cam: [[-5, 8, 10], [0, 3, -12], 50], lbAt: [0, 0, -9], goAt: [1, 0, -10.5], lbYaw: 180, goYaw: 0 },
];

export const GorillaArtSheet: React.FC = () => {
  const f = useCurrentFrame();
  const ready = useVsFonts();
  const v = VIEWS[f % VIEWS.length];
  if (!ready) return null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }}>
        <CamRig pos={v.cam[0]} look={v.cam[1]} fov={v.cam[2]} />
        {v.jungle ? <Jungle /> : <Arena />}
        {v.lbAt && <><Baller position={v.lbAt} yaw={v.lbYaw ?? 0} pose={v.lb} holdR={<Ball position={[0, -0.08, 0.06]} />} /><Blob x={v.lbAt[0]} z={v.lbAt[2]} /></>}
        {v.goAt && <><Gorilla position={v.goAt} yaw={v.goYaw ?? 0} pose={v.go} /><Blob x={v.goAt[0]} z={v.goAt[2]} r={0.7} /></>}
        <mesh position={[0, RIM.y, RIM.z]} visible={false}><boxGeometry args={[0.1, 0.1, 0.1]} /></mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
