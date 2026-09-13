import React from "react";
import { Body, Face, Shine } from "../guess/art";
import type { GuessArt } from "../guess/types";

/**
 * The twelve vehicles.
 *
 * Same trick as every other subject: each one is drawn once, with a face
 * and details that vanish under the `sil` filter, so the shadow is
 * guaranteed to be the exact outline of the reveal.
 */

const OUT = "#2f3a4a";
const WIN = "#dff0f4";
const WIN_DK = "#b9d8de";

export const VehicleDefs: React.FC = () => (
  <defs>
    <radialGradient id="gCar" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#f4796d" />
      <stop offset="60%" stopColor="#ea5b52" />
      <stop offset="100%" stopColor="#cf443c" />
    </radialGradient>
    <radialGradient id="gBus" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#f9dc6a" />
      <stop offset="60%" stopColor="#f3c93f" />
      <stop offset="100%" stopColor="#dba822" />
    </radialGradient>
    <radialGradient id="gFire" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#f4796d" />
      <stop offset="60%" stopColor="#ea5b52" />
      <stop offset="100%" stopColor="#c73b33" />
    </radialGradient>
    <radialGradient id="gPolice" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#eef2f5" />
      <stop offset="60%" stopColor="#dbe3e8" />
      <stop offset="100%" stopColor="#c1ccd4" />
    </radialGradient>
    <radialGradient id="gTrain" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#5da0d6" />
      <stop offset="60%" stopColor="#3f83bd" />
      <stop offset="100%" stopColor="#2d6699" />
    </radialGradient>
    <radialGradient id="gPlane" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#f4f8fb" />
      <stop offset="60%" stopColor="#e2ebf1" />
      <stop offset="100%" stopColor="#c7d5de" />
    </radialGradient>
    <radialGradient id="gHeli" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#8fcf87" />
      <stop offset="60%" stopColor="#6bb862" />
      <stop offset="100%" stopColor="#4f9c47" />
    </radialGradient>
    <radialGradient id="gBoat" cx="0.36" cy="0.26" r="0.9">
      <stop offset="0%" stopColor="#fbfaf6" />
      <stop offset="60%" stopColor="#eee9dc" />
      <stop offset="100%" stopColor="#d7cfb8" />
    </radialGradient>
    <radialGradient id="gTractor" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#8fcf5f" />
      <stop offset="60%" stopColor="#6fb845" />
      <stop offset="100%" stopColor="#549a30" />
    </radialGradient>
    <radialGradient id="gDigger" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#f9dc6a" />
      <stop offset="60%" stopColor="#f0c33a" />
      <stop offset="100%" stopColor="#d6a51f" />
    </radialGradient>
    <radialGradient id="gMoto" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#5aa0c8" />
      <stop offset="60%" stopColor="#3d7fa6" />
      <stop offset="100%" stopColor="#2c6180" />
    </radialGradient>
    <radialGradient id="gBike" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#f4a05e" />
      <stop offset="60%" stopColor="#ea8a3c" />
      <stop offset="100%" stopColor="#cc6f28" />
    </radialGradient>
  </defs>
);

/** Rubber-black wheel with a hubcap, shared by every road vehicle. */
const Wheel: React.FC<{ x: number; y: number; r?: number; sil?: boolean }> = ({
  x,
  y,
  r = 30,
  sil,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#2c2c2c" />
    <circle r={r * 0.42} fill={sil ? "#2c2c2c" : "#cfd4d8"} />
  </g>
);

const Windshield: React.FC<{ d: string }> = ({ d }) => (
  <path d={d} fill={WIN} stroke={WIN_DK} strokeWidth={3} />
);

/* ------------------------------------------------------------------ */
/* 1. car                                                              */
/* ------------------------------------------------------------------ */
export const CarArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -108 20 q -6 -40 34 -46 l 18 -30 q 10 -14 30 -14 l 52 0 q 20 0 30 14 l 18 30
           q 40 6 34 46 q 2 26 -18 26 l -180 0 q -20 0 -18 -26 Z"
        fill="url(#gCar)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <Windshield d="M -46 -68 l 12 -32 q 4 -8 14 -8 l 40 0 q 10 0 14 8 l 12 32 q -46 12 -92 0 Z" />
      <Wheel x={-64} y={46} sil={sil} />
      <Wheel x={64} y={46} sil={sil} />
      {!sil ? (
        <>
          <rect x={-100} y={-6} width={34} height={22} rx={4} fill="#f6a05e" />
          <Shine cx={-40} cy={-6} rx={24} ry={12} rot={-8} o={0.35} />
          <Face cy={6} gap={30} blushGap={62} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 2. bus                                                              */
/* ------------------------------------------------------------------ */
export const BusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <rect x={-130} y={-58} width={260} height={104} rx={26} fill="url(#gBus)" stroke={OUT} strokeWidth={5} />
      {!sil ? (
        <g>
          {[-96, -50, -4, 42, 86].map((x) => (
            <rect key={x} x={x} y={-40} width={38} height={30} rx={7} fill={WIN} stroke={WIN_DK} strokeWidth={3} />
          ))}
        </g>
      ) : (
        <rect x={-108} y={-40} width={214} height={30} rx={10} fill="#2c2c2c" opacity={0} />
      )}
      <rect x={-130} y={20} width={260} height={14} fill="#e0902a" opacity={0.5} />
      <Wheel x={-76} y={48} sil={sil} />
      <Wheel x={76} y={48} sil={sil} />
      {!sil ? <Face cy={0} gap={0} blush={false} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 3. fire engine                                                      */
/* ------------------------------------------------------------------ */
export const FireEngineArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <rect x={-134} y={-44} width={268} height={90} rx={20} fill="url(#gFire)" stroke={OUT} strokeWidth={5} />
      <path
        d="M -134 -44 q 0 -40 40 -40 l 44 0 l 0 40 Z"
        fill="url(#gFire)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <Windshield d="M -110 -84 l 30 0 l 0 40 l -40 0 q -2 -28 10 -40 Z" />
      {!sil ? (
        <>
          <rect x={-40} y={-24} width={140} height={20} rx={4} fill="#f6d976" />
          <circle cx={70} cy={-6} r={16} fill="#f6d976" stroke="#c9a423" strokeWidth={3} />
          <circle cx={70} cy={-6} r={7} fill="#8a6a1a" />
        </>
      ) : null}
      <rect x={-134} y={2} width={268} height={10} fill="#8a1f18" opacity={0.5} />
      <Wheel x={-78} y={44} sil={sil} />
      <Wheel x={80} y={44} sil={sil} />
      {!sil ? <Face cy={-2} gap={22} eye={0.85} blushGap={44} blushY={12} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 4. police car                                                       */
/* ------------------------------------------------------------------ */
export const PoliceCarArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* boxy 4x4-style body — reads distinct from the car's rounded one */}
      <rect x={-104} y={-16} width={208} height={56} rx={14} fill="url(#gPolice)" stroke={OUT} strokeWidth={5} />
      <rect x={-78} y={-56} width={110} height={44} rx={12} fill="url(#gPolice)" stroke={OUT} strokeWidth={5} />
      <Windshield d="M -66 -50 l 8 -0 l 0 32 l -20 0 q -2 -20 12 -32 Z" />
      {!sil ? <rect x={-8} y={-52} width={70} height={26} rx={6} fill={WIN} stroke={WIN_DK} strokeWidth={3} /> : null}
      {!sil ? (
        <>
          <rect x={-30} y={-76} width={60} height={24} rx={6} fill="#eef2f5" stroke={OUT} strokeWidth={3} />
          <rect x={-30} y={-76} width={30} height={24} rx={6} fill="#3d6fd6" />
          <rect x={0} y={-76} width={30} height={24} rx={6} fill="#e0453d" />
          <rect x={-96} y={4} width={90} height={14} rx={4} fill="#2c3a4a" />
        </>
      ) : null}
      <Wheel x={-58} y={44} sil={sil} />
      <Wheel x={58} y={44} sil={sil} />
      {!sil ? <Face cy={8} gap={26} blushGap={54} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 5. train                                                            */
/* ------------------------------------------------------------------ */
export const TrainArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* boiler */}
      <rect x={-118} y={-30} width={140} height={60} rx={24} fill="url(#gTrain)" stroke={OUT} strokeWidth={5} />
      <circle cx={-118} cy={0} r={30} fill="url(#gTrain)" stroke={OUT} strokeWidth={5} />
      {/* cab */}
      <path
        d="M 22 -66 l 60 0 q 24 0 24 24 l 0 42 l -84 0 Z"
        fill="url(#gTrain)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <rect x={34} y={-56} width={38} height={30} rx={6} fill={WIN} stroke={WIN_DK} strokeWidth={3} /> : null}
      {/* funnel */}
      <path d="M -84 -30 l -16 0 q -8 0 -8 -14 l 0 -18 q 0 -8 8 -8 l 16 0 q 8 0 8 8 l 0 18 q 0 14 -8 14 Z" fill="url(#gTrain)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {/* buffer beam + wheels */}
      <rect x={-134} y={26} width={240} height={16} rx={6} fill="url(#gTrain)" stroke={OUT} strokeWidth={4} />
      <Wheel x={-96} y={58} r={24} sil={sil} />
      <Wheel x={-30} y={58} r={24} sil={sil} />
      <Wheel x={36} y={58} r={24} sil={sil} />
      {!sil ? <Face cy={0} gap={20} eye={0.85} blushGap={40} blushY={10} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 6. airplane                                                         */
/* ------------------------------------------------------------------ */
export const AirplaneArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="rotate(-4)">
      {/* fuselage, nose to tail in one clean silhouette */}
      <path
        d="M -150 6 Q -150 -22 -110 -22 L 60 -22 Q 108 -22 138 2 Q 108 26 60 26 L -110 26 Q -150 26 -150 6 Z"
        fill="url(#gPlane)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* wing */}
      <path d="M -30 -18 L 10 -84 L 46 -84 L 26 -18 Z" fill="url(#gPlane)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -20 22 L 6 62 L 34 62 L 18 22 Z" fill="url(#gPlane)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* tail fin */}
      <path d="M -128 -20 L -108 -60 L -84 -60 L -100 -20 Z" fill="url(#gPlane)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {!sil ? (
        <>
          <circle cx={-88} cy={2} r={14} fill={WIN} stroke={WIN_DK} strokeWidth={3} />
          <circle cx={-56} cy={2} r={14} fill={WIN} stroke={WIN_DK} strokeWidth={3} />
          <circle cx={-24} cy={2} r={14} fill={WIN} stroke={WIN_DK} strokeWidth={3} />
        </>
      ) : null}
      {!sil ? <Face cy={4} gap={0} blush={false} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 7. helicopter                                                       */
/* ------------------------------------------------------------------ */
export const HelicopterArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* main rotor, one continuous bar through the mast */}
      <line x1={-140} y1={-70} x2={140} y2={-70} stroke="#2c2c2c" strokeWidth={7} strokeLinecap="round" />
      <line x1={0} y1={-70} x2={0} y2={-48} stroke="#2c2c2c" strokeWidth={9} />
      {/* tail boom, drawn as part of the same body path so nothing floats */}
      <path
        d="M -20 -40 Q -80 -46 -80 -8 Q -80 30 -20 26
           L 56 26 Q 96 20 96 -8 Q 96 -34 56 -40 Z"
        fill="url(#gHeli)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M 96 -8 Q 130 -10 138 10 Q 116 18 96 8 Z" fill="url(#gHeli)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? <path d="M -58 -34 Q -10 -50 20 -30 L 16 4 L -46 4 Q -60 -12 -58 -34 Z" fill={WIN} stroke={WIN_DK} strokeWidth={3} /> : null}
      {/* tail rotor */}
      <line x1={130} y1={-2} x2={130} y2={22} stroke="#2c2c2c" strokeWidth={5} strokeLinecap="round" />
      {/* skids */}
      <path d="M -50 26 L -66 54 M 30 26 L 46 54" stroke="#2c2c2c" strokeWidth={7} strokeLinecap="round" />
      <path d="M -78 54 L 58 54" stroke="#2c2c2c" strokeWidth={7} strokeLinecap="round" />
      {!sil ? <Face cy={-14} gap={18} eye={0.8} blushGap={36} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 8. boat                                                             */
/* ------------------------------------------------------------------ */
export const BoatArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -110 20 q -14 44 20 46 l 178 0 q 34 -2 20 -46 Z"
        fill="url(#gBoat)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <rect x={-58} y={-28} width={80} height={48} rx={10} fill="#e0453d" stroke={OUT} strokeWidth={4} />
      {!sil ? <rect x={-46} y={-16} width={26} height={24} rx={5} fill={WIN} stroke={WIN_DK} strokeWidth={3} /> : null}
      <rect x={-6} y={-90} width={8} height={64} fill="#7a5a3a" />
      <path d="M 2 -88 l 60 22 l -60 14 Z" fill="#f4f8fb" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <g stroke="#c9bda0" strokeWidth={4} strokeLinecap="round" opacity={0.7}>
          <path d="M -80 34 q 20 8 40 0" />
          <path d="M 10 34 q 20 8 40 0" />
        </g>
      ) : null}
      {!sil ? <Face cy={-6} gap={20} eye={0.82} blushGap={40} blushY={10} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 9. tractor                                                          */
/* ------------------------------------------------------------------ */
export const TractorArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* hood and cab drawn as one connected silhouette */}
      <path
        d="M -110 40 L -110 4 Q -110 -16 -90 -16 L -6 -16 Q -6 -66 40 -66 L 62 -66
           Q 100 -66 100 -26 L 100 40 Z"
        fill="url(#gTractor)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <rect x={10} y={-52} width={42} height={38} rx={8} fill={WIN} stroke={WIN_DK} strokeWidth={3} /> : null}
      <rect x={-104} y={10} width={70} height={8} fill="#3f7a20" opacity={0.55} />
      {!sil ? <circle cx={-70} cy={-2} r={8} fill="#2c3a4a" /> : null}
      <Wheel x={-72} y={46} r={22} sil={sil} />
      <Wheel x={64} y={42} r={46} sil={sil} />
      {!sil ? <Face cy={-24} gap={16} eye={0.7} blushGap={32} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 10. digger                                                          */
/* ------------------------------------------------------------------ */
export const DiggerArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* tracked base */}
      <rect x={-96} y={38} width={192} height={26} rx={13} fill="#5a4a34" stroke={OUT} strokeWidth={5} />
      {!sil ? (
        <g fill="#3a2f22">
          <circle cx={-70} cy={51} r={7} /><circle cx={-34} cy={51} r={7} />
          <circle cx={2} cy={51} r={7} /><circle cx={38} cy={51} r={7} />
          <circle cx={68} cy={51} r={7} />
        </g>
      ) : null}
      {/* cab, sitting on the tracks */}
      <path
        d="M -50 40 L -50 -14 Q -50 -34 -30 -34 L 30 -34 Q 50 -34 50 -14 L 50 40 Z"
        fill="url(#gDigger)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <rect x={-34} y={-24} width={44} height={34} rx={8} fill={WIN} stroke={WIN_DK} strokeWidth={3} /> : null}
      {/* arm and bucket, one solid silhouette */}
      <path
        d="M 30 -18 Q 90 -30 108 -64 Q 118 -80 100 -86 Q 84 -90 76 -74
           Q 62 -46 22 -34 Z"
        fill="url(#gDigger)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M 96 -84 Q 128 -96 140 -74 Q 148 -58 130 -48 L 92 -60 Z"
        fill="url(#gDigger)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <Face cy={4} gap={16} eye={0.7} blushGap={32} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 11. motorcycle                                                      */
/* ------------------------------------------------------------------ */
export const MotorcycleArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* frame */}
      <g stroke="url(#gMoto)" strokeWidth={13} strokeLinecap="round" fill="none">
        <path d="M -56 40 L -6 4 L 40 4 L 58 40" />
        <path d="M -6 4 L 14 -30" />
      </g>
      {/* seat + tank, one solid shape so it doesn't vanish under the frame */}
      <path
        d="M -34 -6 Q -6 -22 26 -8 Q 40 -2 34 8 L -28 8 Q -40 4 -34 -6 Z"
        fill="url(#gMoto)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M 14 -30 Q 34 -40 46 -22 L 34 -14 Q 22 -24 14 -18 Z" fill="url(#gMoto)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <line x1={-56} y1={40} x2={-72} y2={16} stroke="#2c2c2c" strokeWidth={8} strokeLinecap="round" />
      <Wheel x={-56} y={46} r={34} sil={sil} />
      <Wheel x={58} y={46} r={34} sil={sil} />
      {!sil ? (
        <g transform="translate(0 -6)">
          <Face cy={0} gap={14} eye={0.55} blush={false} />
        </g>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 12. bicycle                                                         */
/* ------------------------------------------------------------------ */
export const BicycleArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <g stroke="url(#gBike)" strokeWidth={9} strokeLinecap="round" fill="none">
        <path d="M -60 40 L -10 -10 L 46 -10" />
        <path d="M -10 -10 L 20 40" />
        <path d="M -60 40 L 20 40" />
        <path d="M 46 -10 L 20 40" />
        <path d="M 46 -10 L 70 -10" />
      </g>
      <circle cx={70} cy={-16} r={10} fill="#ea8a3c" stroke={OUT} strokeWidth={3} />
      <circle cx={-10} cy={-10} r={6} fill="#7a5a3a" />
      <Wheel x={-60} y={40} r={40} sil={sil} />
      <Wheel x={20} y={40} r={40} sil={sil} />
      {!sil ? (<g transform="translate(30 -40)"><Face cy={0} gap={14} eye={0.55} blush={false} /></g>) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* registry                                                            */
/* ------------------------------------------------------------------ */

export const VEHICLE_ART: Record<string, GuessArt> = {
  car: CarArt,
  bus: BusArt,
  fireEngine: FireEngineArt,
  policeCar: PoliceCarArt,
  train: TrainArt,
  airplane: AirplaneArt,
  helicopter: HelicopterArt,
  boat: BoatArt,
  tractor: TractorArt,
  digger: DiggerArt,
  motorcycle: MotorcycleArt,
  bicycle: BicycleArt,
};

export const VEHICLE_NAME: Record<string, string> = {
  car: "Car",
  bus: "Bus",
  fireEngine: "Fire Engine",
  policeCar: "Police Car",
  train: "Train",
  airplane: "Airplane",
  helicopter: "Helicopter",
  boat: "Boat",
  tractor: "Tractor",
  digger: "Digger",
  motorcycle: "Motorcycle",
  bicycle: "Bicycle",
};

/** What each one sounds like — the payoff beat of every round. */
export const VEHICLE_SOUND: Record<string, string> = {
  car: "Vroom vroom!",
  bus: "Beep beep!",
  fireEngine: "Nee-naw nee-naw!",
  policeCar: "Woo-woo woo-woo!",
  train: "Choo choo!",
  airplane: "Whooosh!",
  helicopter: "Whirr whirr!",
  boat: "Toot toot!",
  tractor: "Chug chug chug!",
  digger: "Scoop, scoop!",
  motorcycle: "Vroom vroom!",
  bicycle: "Ring ring!",
};
