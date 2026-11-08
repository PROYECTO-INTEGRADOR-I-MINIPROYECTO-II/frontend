// Texto clicable con la ondulación por letra (saltos cortos «por pasos») y una línea inferior que hace de subrayado.
// El texto visible se oculta al lector de pantalla y se reemplaza por una versión sin partir en letras.
// `claseLetra` permite colorear letras sueltas (p. ej. «Google»). Respeta «Pausar animaciones» (index.css).
export default function TextoOndulante({
  texto,
  claseLetra,
  linea = true,
  className = '',
}: {
  texto: string;
  claseLetra?: (indice: number) => string | undefined;
  // false: sin subrayado propio (p. ej. una palabra dentro de otro texto que ya lo lleva).
  linea?: boolean;
  className?: string;
}) {
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span
        aria-hidden="true"
        className={`${linea ? 'relative inline-flex pb-[3px] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current' : 'inline-flex'} ${className}`}
      >
        {[...texto].map((c, i) => (
          <span
            key={i}
            className={`inline-block whitespace-pre motion-safe:animate-letra ${claseLetra?.(i) ?? ''}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {c}
          </span>
        ))}
      </span>
    </>
  );
}
