// Botón «Aa» que alterna la tipografía de un campo entre Press Start 2P (activado, relleno) y Geist (más clara, solo marco).
export default function BotonFuente({ clara, onAlternar, className = '' }: { clara: boolean; onAlternar: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onAlternar}
      aria-pressed={!clara}
      aria-label="Usar tipografía pixel en el campo"
      title={clara ? 'Cambiar a la tipografía pixel (Press Start 2P)' : 'Cambiar a la tipografía clara (Geist)'}
      className={`border border-texto/80 px-2 leading-5 text-texto hover:text-acento-claro aria-pressed:bg-texto aria-pressed:text-fondo aria-pressed:hover:text-fondo ${className}`}
    >
      <span aria-hidden="true" className={clara ? 'font-sans text-sm font-medium' : 'font-pixel text-[11px]'}>Aa</span>
    </button>
  );
}
