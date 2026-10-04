/**
 * AKKI TALKS kit v2 — characters, poses, bubbles, scene compositor, fx, props.
 *
 *   import { Scene, Characters, Zoro, Nami, POSES, SpeechBubble, Flash } from "../kit2";
 *
 *   <Scene plate="tavern2" light="warm" dof={0.6} push={[1, 1.06]}>
 *     <HandDrawn hold={2} grain={0.4} boil={0.7}>
 *       <Characters>
 *         <Boss z={0} pose={POSES.stand} face="grin" x={1500} y={700} s={0.6} />
 *         <Zoro z={2} pose={walkCycle(frame / 24)} face="calm" x={600} y={980} s={0.65} />
 *       </Characters>
 *     </HandDrawn>
 *     <Characters><SpeechBubble x={900} y={250} tail={[740, 430]} text="Sunset. Or it doubles." at={12} /></Characters>
 *   </Scene>
 */
export * from "./draw";
export * from "./pose";
export * from "./figure";
export * from "./cast";
export * from "./bubble";
export * from "./scene";
export * from "./fx";
export * from "./props";
export { Kit2ArtSheet, Kit2Sample } from "./ArtSheet";
