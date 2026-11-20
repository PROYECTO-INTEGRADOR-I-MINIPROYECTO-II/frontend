// Texto cuyas letras pasan una a una, «por pasos», a un morado muy claro (casi blanco) y vuelven a su color: parece un brillo que lo recorre. Las palabras no se parten: el texto baja
// de línea entre palabras. El visible se oculta al lector de pantalla y se reemplaza por el texto entero. Respeta «Pausar animaciones»
// (pausa.css) y «reducir movimiento» (efectos.css): sin movimiento las letras quedan en su color.
const PASO_MS = 140;

export default function TextoBrillo({ texto, className = '' }: { texto: string; className?: string }) {
  const palabras = texto.split(/(\s+)/);
  const largo = [...texto].length;
  let i = 0;
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true" className={className} style={{ ['--ciclo' as string]: `${(largo + 8) * PASO_MS}ms` }}>
        {palabras.map((p, k) =>
          /^\s+$/.test(p) ? (
            ' '
          ) : (
            <span key={k} className="inline-block whitespace-nowrap">
              {[...p].map((c) => (
                <span key={i} className="brillo-letra inline-block" style={{ animationDelay: `${i++ * PASO_MS}ms` }}>
                  {c}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </>
  );
}
