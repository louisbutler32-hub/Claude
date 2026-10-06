import { BodyPose } from "./people";
import POSES from "../../public/images/pins-people/poses.json";

/**
 * Photo bodies for PhotoPerson, cut by scripts/prep-people.py from AI-generated
 * full-body studio shots (TubeAI, made for this channel): the real head is
 * erased and its neck point recorded, so a comic head mounts in its place.
 */
type Raw = { file: string; w: number; h: number; neck: number[]; headW: number; turn: number; tilt: number };
const R = POSES as Record<string, Raw>;

export const BODY = Object.fromEntries(
  Object.entries(R).map(([id, p]) => [id, {
    src: "images/pins-people/" + p.file, w: p.w, h: p.h,
    neck: [p.neck[0], p.neck[1]] as [number, number], headW: p.headW, turn: p.turn, tilt: p.tilt,
  } satisfies BodyPose]),
) as Record<string, BodyPose>;
