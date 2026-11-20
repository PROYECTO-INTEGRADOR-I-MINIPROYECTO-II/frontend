import { useState } from 'react';
import { useFuenteCampos, type FuenteCampos } from './useFuenteCampos';

// Tipografía de una zona (un panel, un campo): la elegida en Ajustes hasta que se cambia con su botón «Aa», y solo para esa zona.
export function useFuentePropia(): [clara: boolean, alternar: () => void] {
  const porDefecto = useFuenteCampos();
  const [propia, setPropia] = useState<FuenteCampos | null>(null);
  const clara = (propia ?? porDefecto) === 'clara';
  return [clara, () => setPropia(clara ? 'pixel' : 'clara')];
}
