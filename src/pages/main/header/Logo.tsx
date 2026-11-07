import synkIcon from '../../../assets/synk-icon.png';

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-4 text-5xl font-semibold tracking-tight text-texto transition-colors duration-300 group-hover:text-acento group-focus-visible:text-acento md:text-6xl">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-primario transition-colors duration-300 group-hover:bg-acento group-focus-visible:bg-acento md:size-20">
        <img src={synkIcon} alt="" className="h-12 w-auto md:h-14" />
      </span>
      Synk
    </span>
  );
}
