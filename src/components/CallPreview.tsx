import type { CSSProperties, ReactNode } from 'react';
import './CallPreview.css';

export const PEOPLE = { SC: '#f5f5f5', JD: '#f5a524', JG: '#7dd3fc', SR: '#fb7185' };

const SCISSORS = 'M54 -17 L69 -25 M54 -11 L69 -3';
const PAPER = 'M54 -19 L66 -26 M54 -15 L69 -17 M54 -11 L68 -8 M49 -20 L52 -27';
const TILES: [number, number][] = [[0, 0], [244, 0], [0, 144], [244, 144]];

/* ---------- Accesorios (coords locales de la cabeza: centro 118,52 r24) ---------- */
const Eyes = ({ x1 = 120, x2 = 132, y = 50 }: { x1?: number; x2?: number; y?: number }) => (
  <>
    <circle className="dot" cx={x1} cy={y} r="2.4" />
    <circle className="dot" cx={x2} cy={y} r="2.4" />
  </>
);

export const Glasses = () => (
  <>
    {/* patilla + puente recto */}
    <path className="ln thin" d="M111 45 L95 43 M124 45 H127.5" />
    {/* lentes: borde superior recto, esquinas inferiores redondeadas */}
    <path className="ln solid thin" d="M111 44 H124 V48 Q124 53 119.5 53 H115.5 Q111 53 111 48 Z" />
    <path className="ln solid thin" d="M127.5 44 H140 V48 Q140 53 135.5 53 H132 Q127.5 53 127.5 48 Z" />
    {/* reflejo */}
    <path className="ln glint" d="M114 50 L117.5 46.5 M130.5 50 L134 46.5" />
  </>
);

export const Cap = () => (
  <>
    <path className="ln solid" d="M94.3 44 A25 25 0 0 1 141.7 44 Z" />
    <path className="ln" d="M141.7 44 Q154 42.5 165 47" />
    <path className="ln thin" d="M118 27 V44" />
    <circle className="dot" cx="118" cy="27" r="2.5" />
    <Eyes />
  </>
);

export const Hat = () => (
  <>
    <ellipse className="ln solid" cx="118" cy="32" rx="34" ry="5" />
    <path className="ln solid" d="M101 32 L104 12 Q118 7 132 12 L135 32 Z" />
    <path className="ln thin" d="M102.5 25 H133.5" />
    <Eyes />
  </>
);

export const Headset = () => (
  <>
    <path className="ln" d="M91 52 A27 27 0 0 1 145 52" />
    <path className="ln thin" d="M145 60 Q146 72 132 70" />
    <circle className="dot" cx="131" cy="70" r="3" />
    <rect className="ln solid" x="86" y="44" width="10" height="17" rx="4" />
    <rect className="ln solid" x="140" y="44" width="10" height="17" rx="4" />
    <Eyes x1={118} x2={130} />
  </>
);

/* ---------- Stickman ---------- */
interface StickProps {
  color: string;
  x?: number;
  y?: number;
  mirror?: boolean;
  delay?: number;
  face: ReactNode;
  children: ReactNode;
}

function Stick({ color, x = 0, y = 0, mirror, delay = 0, face, children }: StickProps) {
  const t = mirror ? `translate(${x + 236} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={t} style={{ '--c': color } as CSSProperties}>
      <g className="head" style={{ animationDelay: `${delay}s` }}>
        <circle className="ln" cx="118" cy="52" r="24" />
        {face}
      </g>
      <path className="ln" d="M118 76 V140 M118 92 L94 140" />
      <g transform="translate(118 92)">{children}</g>
    </g>
  );
}

const ThrowArm = ({ cls }: { cls: string }) => (
  <g className={cls}>
    <path className="ln" d="M0 0 L40 -30" />
  </g>
);

const RpsArm = ({ round1, round2 }: { round1: string; round2: string }) => (
  <g className="arm-rps">
    <path className="ln" d="M0 0 L40 -12" />
    <circle className="ln" cx="47" cy="-14" r="7" />
    <path className="ln r1" d={round1} />
    <path className="ln r2" d={round2} />
  </g>
);

const Label = ({ x, y, name }: { x: number; y: number; name: keyof typeof PEOPLE }) => (
  <g style={{ '--c': PEOPLE[name] } as CSSProperties}>
    <rect className="pill" x={x} y={y} width="30" height="18" rx="9" />
    <text className="name" x={x + 15} y={y + 13} textAnchor="middle">{name}</text>
  </g>
);

// Demo visual: NO está basada en la vista real de una Sala; solo ilustra la idea (ver README).
export default function CallPreview() {
  return (
    <svg
      className="synk-call"
      viewBox="0 0 480 324"
      role="img"
      aria-label="Llamada con cuatro participantes: SC y JD se lanzan una pelota, JG y SR juegan piedra, papel o tijera"
    >
      <defs>
        <clipPath id="synk-call-tiles">
          {TILES.map(([x, y]) => (
            <rect key={`c${x}-${y}`} x={x} y={y} width="236" height="136" rx="12" />
          ))}
        </clipPath>
      </defs>

      {TILES.map(([x, y]) => (
        <rect key={`b${x}-${y}`} className="tile-bg" x={x} y={y} width="236" height="136" rx="12" />
      ))}

      <g clipPath="url(#synk-call-tiles)">
        <Stick color={PEOPLE.SC} face={<Glasses />}>
          <ThrowArm cls="arm-a" />
        </Stick>
        <Stick color={PEOPLE.JD} x={244} mirror delay={-0.7} face={<Cap />}>
          <ThrowArm cls="arm-b" />
        </Stick>
        <Stick color={PEOPLE.JG} y={144} delay={-1.2} face={<Hat />}>
          <RpsArm round1={SCISSORS} round2={PAPER} />
        </Stick>
        <Stick color={PEOPLE.SR} x={244} y={144} mirror delay={-0.3} face={<Headset />}>
          <RpsArm round1={PAPER} round2={SCISSORS} />
        </Stick>
      </g>

      {TILES.map(([x, y], i) => (
        <rect
          key={`t${x}-${y}`}
          className={`tile-border ${i === 2 ? 'win-c' : i === 3 ? 'win-d' : ''}`}
          x={x + 0.5} y={y + 0.5} width="235" height="135" rx="12"
        />
      ))}

      <Label x={8} y={110} name="SC" />
      <Label x={252} y={110} name="JD" />
      <Label x={8} y={254} name="JG" />
      <Label x={252} y={254} name="SR" />

      {/* Movidos para no chocar con el sombrero y el headset */}
      <text className="plus plus-c" x="156" y="186" style={{ '--c': PEOPLE.JG } as CSSProperties}>+1</text>
      <text className="plus plus-d" x="306" y="186" style={{ '--c': PEOPLE.SR } as CSSProperties}>+1</text>

      <g className="ball-x" style={{ '--c': '#f5f5f5' } as CSSProperties}>
        <g className="ball-y">
          <circle className="ln" cx="160" cy="52" r="8" style={{ strokeWidth: 2.5 }} />
          <path className="ln" d="M155 47 Q159 52 155 57 M165 47 Q161 52 165 57" style={{ strokeWidth: 1.5 }} />
        </g>
      </g>

      {/* Controles */}
      <g transform="translate(162 304)">
        <circle className="btn" r="14" />
        <rect className="ico" x="-3" y="-8" width="6" height="10" rx="3" />
        <path className="ico" d="M-6 0 A6 6 0 0 0 6 0 M0 6 V9" />
      </g>
      <g transform="translate(198 304)">
        <circle className="btn" r="14" />
        <rect className="ico" x="-8" y="-5" width="11" height="10" rx="2" />
        <path className="ico" d="M3 -2 L8 -5 V5 L3 2 Z" />
      </g>
      <g transform="translate(234 304)">
        <circle className="btn" r="14" />
        <rect className="ico" x="-8" y="-6" width="16" height="11" rx="1.5" />
        <path className="ico" d="M0 2 V-3 M-2.5 -0.5 L0 -3 L2.5 -0.5" />
      </g>
      <g transform="translate(270 304)">
        <circle className="btn" r="14" />
        <path className="ico" d="M-7 -6 H7 A2 2 0 0 1 9 -4 V3 A2 2 0 0 1 7 5 H-1 L-5 8 V5 H-7 A2 2 0 0 1 -9 3 V-4 A2 2 0 0 1 -7 -6 Z" />
        <circle className="notif" cx="9" cy="-9" r="3.5" />
      </g>
      <g transform="translate(312 304)">
        <rect className="hangup" x="-20" y="-14" width="40" height="28" rx="14" />
        <path fill="#fff" d="M-8 2 C-4 -3 4 -3 8 2 L6.5 4.5 L3.5 3.5 V1.5 C1.5 0.8 -1.5 0.8 -3.5 1.5 V3.5 L-6.5 4.5 Z" />
      </g>
    </svg>
  );
}
