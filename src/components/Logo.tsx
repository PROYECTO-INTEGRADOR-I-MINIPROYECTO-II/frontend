import synkIcon from '../assets/synk-icon.png';

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-4 text-5xl font-semibold tracking-tight text-texto md:text-6xl">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-primario md:size-20">
        <img src={synkIcon} alt="" className="h-12 w-auto md:h-14" />
      </span>
      Synk
    </span>
  );
}
