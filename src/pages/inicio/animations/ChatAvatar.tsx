import type { CSSProperties } from 'react';
import { Cap, Glasses, Hat, Headset, PEOPLE } from './CallPreview';

export type Persona = keyof typeof PEOPLE;

const FACES: Record<Persona, () => React.JSX.Element> = {
  SC: Glasses,
  JD: Cap,
  JG: Hat,
  SR: Headset,
};

// Foto de perfil de los personajes: su cabeza con el accesorio que llevan en la llamada.
export function PersonaAvatar({ who }: { who: Persona }) {
  const Face = FACES[who];
  return (
    <svg
      className="synk-avatar size-10 shrink-0 rounded-full bg-fondo ring-2 ring-texto"
      viewBox="86 10 64 64"
      aria-hidden="true"
      style={{ '--c': PEOPLE[who] } as CSSProperties}
    >
      <circle className="ln" cx="118" cy="52" r="24" />
      <Face />
    </svg>
  );
}

// Doodle genérico para quien escribe en la demo (sin foto de perfil configurada).
export function DoodleAvatar() {
  return (
    <svg
      className="synk-avatar size-10 shrink-0 rounded-full bg-fondo ring-2 ring-texto"
      viewBox="86 10 64 64"
      aria-hidden="true"
      style={{ '--c': '#a1a1aa' } as CSSProperties}
    >
      <circle className="ln" cx="118" cy="52" r="24" />
      <circle className="dot" cx="110" cy="48" r="2.4" />
      <circle className="dot" cx="126" cy="48" r="2.4" />
      <path className="ln thin" d="M108 60 Q118 68 128 60" />
    </svg>
  );
}
