import React from "react";
import { INK } from "../common";
import { P, Part, smooth, tube } from "./characters";
import { Curls, curlyMop, G } from "../guest";

/**
 * The reaction close-ups. The joke of the Regular is that every cut-back to
 * him is drawn in a different style: a heavily wrinkled "realistic" deadpan,
 * a round-faced chibi, a gaunt long-faced tired man. Zoro gets a bust (smug,
 * then drained of colour) and an extreme close-up when he's furious.
 * All coordinates are absolute 1080×1920 frame space unless noted.
 */

const SK = G.skin.base, SKS = G.skin.shade, SKD = "#b87a58";
const HAIR = G.hair;
const TEE = G.tee, TEES = G.teeS;
const ln = (d: string, w = 4, c = INK) => <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

/* ------------------------------ the wrinkled deadpan ------------------------------ */

export const RegularWrinkled: React.FC = () => {
  const lw = 5;
  return (
    <g>
      {/* T-shirt */}
      <Part d={smooth([[-60, 1560], [180, 1450], [400, 1440], [540, 1500], [690, 1440], [900, 1450], [1140, 1560], [1140, 2000], [-60, 2000]])} fill={TEE} shade={TEES} lw={lw} sh={[-30, -10]}>
        {ln("M120,1700 Q260,1640 360,1720", 3, TEES)}
        {ln("M740,1700 Q860,1650 980,1720", 3, TEES)}
        <path d="M-60,1840 Q300,1760 560,1880 L560,2000 L-60,2000Z" fill={TEES} opacity={0.5} />
      </Part>
      {/* neck */}
      <Part d={smooth([[380, 1200], [700, 1200], [690, 1470], [540, 1530], [390, 1470]])} fill={SK} shade={SKS} lw={lw} sh={[-40, 0]}>
        <path d="M380,1200 L700,1200 L690,1330 Q540,1420 390,1330Z" fill={SKS} />
        {ln("M450,1440 Q540,1470 630,1440", 3)}
      </Part>
      {ln("M380,1470 Q540,1560 700,1470", lw + 2)}
      {/* bun + hair mass */}

      {/* ears */}
      <Part d={smooth([[245, 900], [205, 880], [185, 960], [200, 1060], [250, 1090]])} fill={SK} shade={SKS} lw={lw} />
      <Part d={smooth([[835, 900], [875, 880], [895, 960], [880, 1060], [830, 1090]])} fill={SK} shade={SKS} lw={lw} sh={[-14, 0]} />
      {ln("M215,930 Q205,990 235,1050", 3)}
      {ln("M865,930 Q875,990 845,1050", 3)}
      {/* face */}
      <Part d={smooth([[250, 690], [232, 850], [246, 1010], [286, 1160], [380, 1290], [470, 1352], [540, 1368], [612, 1352], [702, 1290], [792, 1160], [832, 1010], [846, 850], [826, 690], [700, 630], [540, 615], [380, 630]])} fill={SK} shade={SKS} lw={lw} sh={[-60, -20]}>
        {/* hard shadows: under the hairline, eye sockets, under the nose */}
        <path d="M240,690 Q540,640 840,690 L840,760 Q540,720 240,760Z" fill={SKS} />
        <path d="M290,900 Q390,880 480,915 Q470,990 390,1000 Q310,985 290,900Z" fill={SKS} opacity={0.9} />
        <path d="M590,915 Q680,880 780,900 Q760,985 680,1000 Q600,990 590,915Z" fill={SKS} opacity={0.9} />
        <path d="M460,1140 Q540,1175 630,1140 L620,1170 Q540,1200 470,1170Z" fill={SKD} />
        <path d="M455,1290 Q540,1310 625,1290 Q600,1330 540,1335 Q480,1330 455,1290Z" fill={SKS} />
      </Part>
      {/* hairline fringe */}
      <Curls m={curlyMop(540, 740, 330, 250, 680, 900, 64, 3)} lw={lw} markW={6} />
      {/* forehead wrinkles */}
      {ln("M330,760 Q380,745 430,765 T540,760 T650,765 T750,758", 3.4)}
      {ln("M350,795 Q400,782 450,800 T560,796 T680,800 T740,792", 3)}
      {ln("M390,828 Q440,816 500,832", 2.6)}
      {ln("M590,830 Q650,818 700,830", 2.6)}
      {/* heavy brows, raised at the centre */}
      <path d="M282,895 Q320,850 400,845 Q460,846 492,870 Q470,885 400,878 Q330,880 290,905Z" fill={HAIR} stroke={INK} strokeWidth={3} />
      <path d="M798,895 Q760,850 680,845 Q620,846 588,870 Q610,885 680,878 Q750,880 790,905Z" fill={HAIR} stroke={INK} strokeWidth={3} />
      {/* heavy-lidded eyes */}
      {[[390, 952, 1], [690, 952, -1]].map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${k},1)`}>
          <path d="M-62,4 Q-20,-12 50,-2 Q30,22 -10,22 Q-46,20 -62,4Z" fill="#fbf4ea" stroke={INK} strokeWidth={3.4} />
          <circle cx={4} cy={9} r={13} fill="#2a1e18" />
          <circle cx={0} cy={5} r={3} fill="#fff" />
          <path d="M-66,4 Q-30,-14 20,-12 Q44,-8 56,0 Q30,-2 -10,0 Q-40,2 -66,4Z" fill={SKS} stroke={INK} strokeWidth={4} />
          {ln("M-66,4 Q-20,-16 56,-2", 7)}
          {ln("M-54,-24 Q-10,-38 40,-24", 3)}
          {ln("M-50,34 Q-10,46 36,30", 3)}
          {ln("M-40,50 Q0,62 30,48", 2.4)}
          {ln("M-72,10 l-18,-6 M-72,18 l-18,6", 2.4)}
        </g>
      ))}
      {/* nose */}
      {ln("M515,930 Q505,1010 490,1080", 3.4)}
      <path d="M470,1090 Q440,1120 462,1146 Q500,1160 540,1150 Q580,1160 618,1146 Q640,1120 610,1090" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={500} cy={1140} rx={14} ry={7} fill={INK} />
      <ellipse cx={580} cy={1140} rx={14} ry={7} fill={INK} />
      {ln("M540,1150 Q540,1180 540,1200", 2.4)}
      {/* nasolabial folds, cheek lines */}
      {ln("M445,1080 Q400,1160 420,1260", 4)}
      {ln("M635,1080 Q680,1160 660,1260", 4)}
      {ln("M330,1050 Q350,1110 330,1170", 3)}
      {ln("M750,1050 Q730,1110 750,1170", 3)}
      {ln("M310,1010 Q340,1030 360,1070", 2.4)}
      {ln("M770,1010 Q740,1030 720,1070", 2.4)}
      {/* thick downturned lips */}
      <path d="M452,1250 Q500,1230 540,1238 Q580,1230 628,1250 Q590,1262 540,1258 Q490,1262 452,1250Z" fill="#c9806a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M465,1256 Q540,1300 615,1256 Q590,1280 540,1284 Q490,1280 465,1256Z" fill="#b8705a" stroke={INK} strokeWidth={3.4} />
      {ln("M440,1262 l-14,12 M640,1262 l14,12", 3.4)}
      {ln("M500,1318 Q540,1330 580,1318", 2.6)}
      {ln("M380,1250 Q400,1300 440,1330", 2.6)}
      {ln("M700,1250 Q680,1300 640,1330", 2.6)}
    </g>
  );
};

/* ------------------------------------ the chibi ------------------------------------ */

export const RegularChibi: React.FC = () => {
  const lw = 6;
  return (
    <g>
      {/* body */}
      <Part d={tube([[262, 1420], [246, 1700], [240, 2000]], [46, 44, 44])} fill={SK} shade={SKS} lw={lw} />
      <Part d={tube([[818, 1420], [834, 1700], [840, 2000]], [46, 44, 44])} fill={SK} shade={SKS} lw={lw} />
      <Part d={smooth([[240, 1330], [380, 1200], [540, 1180], [700, 1200], [840, 1330], [890, 1570], [790, 1600], [770, 2000], [310, 2000], [290, 1600], [190, 1570]])} fill={TEE} shade={TEES} lw={lw} sh={[-26, -10]}>
        {ln("M300,1580 Q300,1460 330,1380", 3, TEES)}
        {ln("M780,1580 Q780,1460 750,1380", 3, TEES)}
        {ln("M440,1560 Q520,1540 580,1570", 3, TEES)}
      </Part>
      <Part d={smooth([[470, 1060], [610, 1060], [622, 1200], [540, 1230], [458, 1200]])} fill={SK} shade={SKS} lw={lw} sh={[0, 0]}>
        <path d="M450,1060 L630,1060 L630,1140 Q540,1170 450,1140Z" fill={SKS} />
      </Part>
      {ln("M440,1196 Q540,1250 640,1196", lw)}
      {/* big round head */}

      <Part d={smooth([[262, 640], [222, 630], [214, 730], [262, 800]])} fill={SK} shade={SKS} lw={lw} />
      <Part d={smooth([[818, 640], [858, 630], [866, 730], [818, 800]])} fill={SK} shade={SKS} lw={lw} />
      <Part d={smooth([[262, 470], [254, 700], [292, 890], [400, 1030], [540, 1074], [680, 1030], [788, 890], [826, 700], [818, 470], [540, 420]])} fill={SK} shade={SKS} lw={lw} sh={[-24, -10]}>
        {/* the dread shadow across the upper face */}
        <path d="M240,470 L840,470 L840,780 Q540,750 240,790Z" fill="#cf9b70" />
        <path d="M250,760 Q540,730 830,750 L830,800 Q540,780 250,820Z" fill="#e8a888" opacity={0.5} />
      </Part>
      <Curls m={curlyMop(540, 480, 310, 250, 480, 650, 62, 9)} lw={lw} markW={6} />
      {/* brows */}
      <path d="M350,600 Q420,560 490,590 L486,612 Q420,590 356,622Z" fill={HAIR} />
      <path d="M730,600 Q660,560 590,590 L594,612 Q660,590 724,622Z" fill={HAIR} />
      {/* flat white eyes with tiny pupils, heavy lids */}
      {[[420, 686], [660, 686]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x - 74},${y - 26} L${x + 74},${y - 26} Q${x + 70},${y + 24} ${x},${y + 26} Q${x - 70},${y + 24} ${x - 74},${y - 26}Z`} fill="#fff" stroke={INK} strokeWidth={4} />
          <circle cx={x + (i ? -6 : 6)} cy={y + 2} r={12} fill="#6a4228" stroke={INK} strokeWidth={2} />
          <circle cx={x + (i ? -6 : 6)} cy={y + 2} r={5} fill={INK} />
          {ln(`M${x - 84},${y - 28} L${x + 84},${y - 28}`, 9)}
        </g>
      ))}
      {ln("M540,760 l-8,40 l14,4", 3)}
      {/* little open smile */}
      <path d="M500,900 Q540,928 580,900 Q560,920 540,922 Q520,920 500,900Z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {ln("M510,906 L570,906", 2)}
    </g>
  );
};

/* ------------------------------------ the gaunt ------------------------------------ */

export const RegularGaunt: React.FC = () => {
  const lw = 5;
  return (
    <g>
      <Part d={smooth([[-60, 1240], [200, 1110], [330, 1100], [440, 1150], [600, 1100], [760, 1120], [980, 1240], [1100, 1500], [1120, 2000], [-80, 2000], [-60, 1500]])} fill={TEE} shade={TEES} lw={lw} sh={[-30, -6]}>
        {ln("M160,1400 Q200,1500 180,1640", 3, TEES)}
        {ln("M820,1360 Q860,1480 840,1620", 3, TEES)}
      </Part>
      <Part d={smooth([[370, 920], [500, 920], [520, 1120], [440, 1170], [360, 1120]])} fill={SK} shade={SKS} lw={lw} sh={[-20, 0]}>
        <path d="M360,920 L520,920 L520,1000 Q440,1050 360,1000Z" fill={SKS} />
      </Part>
      {ln("M340,1110 Q440,1190 560,1120", lw + 1)}
      {/* hair: flat black helmet with a tiny knot */}

      <Part d={smooth([[270, 600], [240, 620], [250, 700], [280, 720]])} fill={SK} shade={SKS} lw={lw} />
      <Part d={smooth([[602, 600], [632, 620], [622, 700], [592, 720]])} fill={SK} shade={SKS} lw={lw} />
      {/* long face, hollow cheeks */}
      <Part d={smooth([[272, 470], [262, 620], [278, 760], [320, 880], [380, 950], [436, 970], [492, 950], [552, 880], [592, 760], [606, 620], [598, 470], [440, 440]])} fill={SK} shade={SKS} lw={lw} sh={[-24, -6]}>
        <path d="M290,720 Q320,800 360,840 Q330,760 330,700Z" fill={SKS} />
        <path d="M582,720 Q552,800 512,840 Q542,760 542,700Z" fill={SKS} />
      </Part>
      <Curls m={curlyMop(436, 490, 185, 160, 475, 590, 38, 5)} lw={lw} markW={4} />
      {/* tired half-closed eyes, bags */}
      {[[372, 630, 1], [508, 630, -1]].map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${k},1)`}>
          <path d="M-36,0 Q0,-6 34,0 Q20,12 0,12 Q-24,12 -36,0Z" fill="#fff" stroke={INK} strokeWidth={2.6} />
          <circle cx={2} cy={5} r={6} fill={INK} />
          {ln("M-40,0 Q0,-8 38,-1", 5)}
          {ln("M-34,22 Q0,30 30,20", 2.4)}
          {ln("M-30,-22 Q0,-30 30,-22", 4.6)}
        </g>
      ))}
      {ln("M436,640 Q430,720 420,770 Q436,786 456,776", 3)}
      {/* wide flat mouth, big lips */}
      <path d="M352,852 Q440,836 528,852 Q440,866 352,852Z" fill="#d2505a" stroke={INK} strokeWidth={3.4} />
      <path d="M362,856 Q440,904 518,856 Q440,872 362,856Z" fill="#b83a48" stroke={INK} strokeWidth={3.4} />
      {ln("M398,920 Q440,930 482,920", 2.4)}
    </g>
  );
};

/* ------------------------------------ Zoro, big ------------------------------------ */

const ZSK0 = "#eab886", ZSKS0 = "#bf8256", ZHAIR0 = "#8fe07a", ZHAIRS0 = "#58a84c";

/** Zoro's head and shoulders in a local space: eye line at y=0, face ≈ 300 wide. expr: smug | rage */
export const ZoroBig: React.FC<{ expr: "smug" | "rage"; lw?: number; bw?: boolean }> = ({ expr, lw = 5, bw = false }) => {
  const rage = expr === "rage";
  // the realisation: drained to line art — white skin, grey hair and robe
  const ZSK = bw ? "#f4f4f4" : ZSK0, ZSKS = bw ? "#bdbdbd" : ZSKS0, ZHAIR = bw ? "#5c5c5c" : ZHAIR0, ZHAIRS = bw ? "#3a3a3a" : ZHAIRS0;
  const ROBE = bw ? "#8a8a8a" : "#2f6a3a", ROBES = bw ? "#5a5a5a" : "#1c4426";
  return (
    <g>
      {/* robe + chest */}
      <Part d={smooth([[-420, 330], [-200, 250], [-90, 230], [120, 230], [260, 250], [470, 360], [520, 900], [-470, 900]])} fill={ROBE} shade={ROBES} lw={lw} sh={[-24, -6]} />
      <Part d={smooth([[-150, 250], [-60, 220], [110, 220], [200, 260], [120, 520], [30, 760], [-40, 520]], true, 0.7)} fill={ZSK} shade={ZSKS} lw={lw}>
        {ln("M-120,400 Q-40,440 10,420", 4)}
        {ln("M180,380 Q100,440 40,420", 4)}
        {ln("M10,430 L20,560", 3)}
        {/* stitched chest scar */}
        {ln("M-140,330 L170,560", 6, "#8a4a2a")}
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => {
          const x = -140 + 310 * t, y = 330 + 230 * t;
          return <path key={t} d={`M${x - 12},${y + 14}L${x + 12},${y - 14}`} stroke="#8a4a2a" strokeWidth={3.4} />;
        })}
      </Part>
      {ln("M-150,250 L30,780", lw + 1)}
      {ln("M200,260 L40,760", lw + 1)}
      {/* neck */}
      <Part d={smooth([[-80, 120], [110, 120], [130, 270], [10, 300], [-100, 260]])} fill={ZSK} shade={ZSKS} lw={lw} sh={[-30, 0]}>
        <path d="M-90,120 L120,120 L120,190 Q10,240 -90,180Z" fill={ZSKS} />
      </Part>
      {/* ear + earrings (viewer's right) */}
      <Part d={smooth([[140, -40], [178, -60], [196, -10], [184, 50], [150, 70]])} fill={ZSK} shade={ZSKS} lw={lw} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${164 + i * 9},${66 + i * 3})`}>
          <path d="M0,0 L0,14 Q-9,28 0,40 Q9,28 0,14" fill="#f2c230" stroke={INK} strokeWidth={2.6} />
        </g>
      ))}
      {/* face */}
      <Part d={smooth([[-128, -130], [-138, -30], [-130, 50], [-104, 120], [-62, 182], [-18, 214], [14, 216], [60, 186], [124, 110], [148, 20], [152, -60], [150, -140], [10, -170]])} fill={ZSK} shade={ZSKS} lw={lw} sh={[-34, -10]}>
        <path d="M60,186 Q130,100 150,10 L170,10 L170,230 L40,230Z" fill={ZSKS} />
        {rage && <><path d="M-150,-170 L170,-170 L170,30 L120,10 L90,40 L50,14 L10,44 L-30,16 L-70,40 L-100,12 L-150,30Z" fill={ZSKS} opacity={0.7} /><path d="M-150,-170 L170,-170 L170,-60 Q10,-30 -150,-60Z" fill="#9a5e3a" opacity={0.7} /></>}
      </Part>
      {/* hair */}
      <Part d={"M-150,-40 L-160,-120 L-190,-150 L-150,-170 L-180,-220 L-120,-215 L-130,-270 L-70,-240 L-60,-300 L-10,-255 L20,-310 L50,-250 L100,-290 L110,-235 L170,-250 L160,-190 L210,-180 L170,-140 L185,-90 L150,-60 L130,-110 L110,-80 L90,-130 L60,-90 L40,-140 L10,-95 L-20,-140 L-40,-90 L-70,-135 L-90,-90 L-110,-120 L-128,-60Z"} fill={ZHAIR} shade={ZHAIRS} lw={lw} sh={[-14, -10]} />
      {ln("M-60,-200 L-40,-160 M20,-220 L30,-170 M90,-200 L80,-160", 3, ZHAIRS)}
      {rage ? (
        <>
          {/* furrowed V brows, squeezed eyes */}
          <path d="M-140,-70 Q-80,-62 -14,-28 L-20,-12 Q-80,-40 -140,-50Z" fill={INK} />
          <path d="M150,-74 Q90,-64 24,-28 L30,-12 Q90,-42 150,-52Z" fill={INK} />
          {ln("M-122,-10 Q-80,-24 -30,-2", 7)}
          {ln("M-110,6 Q-70,4 -40,10", 3)}
          {ln("M136,-12 Q90,-26 40,-2", 7)}
          {ln("M124,6 Q86,4 50,10", 3)}
          {ln("M-12,-50 L-4,-20 M12,-52 L6,-20", 3)}
          {/* scar over the left eye */}
          {ln("M-88,-96 L-60,60", 5, "#8a3a2a")}
          {ln("M6,-6 Q24,50 40,80 Q24,96 4,90", 4)}
          {ln("M-60,90 L-90,40 M90,90 L120,40", 3)}
          {/* pouting frown */}
          <path d="M-46,140 Q0,118 52,136 Q10,132 -46,140Z" fill={INK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {ln("M-20,168 Q6,160 30,166", 3)}
          {ln("M-120,60 Q-110,100 -96,120 M136,60 Q126,100 110,124", 3)}
          {ln("M-30,-80 Q-10,-60 -18,-40 M40,-82 Q20,-62 26,-40", 3)}
        </>
      ) : (
        <>
          <path d="M-136,-64 Q-80,-74 -24,-58 L-26,-46 Q-80,-58 -134,-48Z" fill={INK} />
          <path d="M150,-74 Q90,-78 26,-58 L28,-44 Q90,-60 148,-56Z" fill={INK} />
          {/* open eye (viewer's left) with the scar through it */}
          <path d="M-120,-10 Q-80,-34 -32,-14 Q-46,8 -80,8 Q-108,6 -120,-10Z" fill="#fff" stroke={INK} strokeWidth={3} />
          <circle cx={-66} cy={-10} r={11} fill={INK} />
          <circle cx={-70} cy={-14} r={3} fill="#fff" />
          {ln("M-124,-10 Q-80,-40 -28,-14", 7)}
          {ln("M-88,-96 L-62,60", 5, "#8a3a2a")}
          {ln("M-104,-60 L-90,-36 M-76,20 L-62,38", 3, "#8a3a2a")}
          {/* the smug wink */}
          {ln("M34,-14 Q80,-2 130,-20", 7)}
          {ln("M40,-6 L28,4", 3)}
          {ln("M6,-6 Q24,50 34,80 Q20,94 2,88", 4)}
          {/* smirk */}
          {ln("M-50,128 Q0,140 40,124 Q56,116 64,100", 5)}
        </>
      )}
    </g>
  );
};
