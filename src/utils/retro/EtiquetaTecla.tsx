// Etiqueta del atajo de una opción, en morado y tipografía pixel: «[1]», «[2]»… o «[TAB]» cuando no hay número y a esa opción
// se llega recorriendo con la tecla Tab. Es decorativa (aria-hidden): el atajo real se declara en el control (aria-keyshortcuts).
export default function EtiquetaTecla({ tecla, className = '' }: { tecla: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`font-pixel text-[11px] leading-5 text-acento-claro ${className}`}>
      [{tecla}]
    </span>
  );
}
