import { MessageSquare, MonitorUp, Mic, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const tiles = [
  { initials: 'AG', color: 'bg-primario' },
  { initials: 'JD', color: 'bg-acento' },
  { initials: 'SC', color: 'bg-primario-hover' },
  { initials: 'JG', color: 'bg-texto-secundario' },
];

const features = [
  { icon: Video, title: 'Video y audio', text: 'Véanse y escúchense con baja latencia. Apaga tu cámara o micrófono cuando quieras.' },
  { icon: MessageSquare, title: 'Chat con historial', text: 'Los mensajes se guardan: si te desconectas, no pierdes el contexto.' },
  { icon: MonitorUp, title: 'Compartir pantalla', text: 'Muestra tus apuntes o un PDF a toda la Sala con un clic.' },
];

export default function Inicio() {
  useDocumentTitle('Inicio');

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="inline-block rounded-full bg-primario-suave px-3 py-1 text-sm text-primario-hover">
            Salas de estudio en tiempo real
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">Estudia en grupo, en sincronía.</h1>
          <p className="mt-4 max-w-lg text-texto-secundario">
            Crea una Sala, comparte su ID con tu grupo y estudien con video, chat y pantalla compartida, todo desde el
            navegador.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/registro" className="btn-primario">Crear cuenta gratis</Link>
            <Link to="/login" className="btn-secundario">Ya tengo cuenta</Link>
          </div>
        </div>

        <div aria-hidden="true" className="rounded-3xl bg-texto p-4 text-white">
          <p className="mb-3 font-semibold">Sala · Cálculo II — Parcial 2</p>
          <div className="grid grid-cols-2 gap-3">
            {tiles.map((t) => (
              <div key={t.initials} className={`grid h-28 place-items-center rounded-xl font-mono text-2xl font-semibold ${t.color}`}>
                {t.initials}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-3">
            {[Mic, Video, MonitorUp, MessageSquare].map((Icon, i) => (
              <span key={i} className="grid size-11 place-items-center rounded-full bg-texto-secundario">
                <Icon />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Qué puedes hacer en Synk" className="mt-14 grid gap-5 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-superficie p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primario-suave text-primario">
              <Icon aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-2xl font-medium">{title}</h2>
            <p className="mt-2 text-texto-secundario">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
