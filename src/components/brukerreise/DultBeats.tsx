// To-beats-dult: et valgfritt «oppsett» (opt-in når planen lages) foran selve
// varselet, koblet med en liten tid-pil. Uten setup → bare NudgeCard, helt
// identisk med før (så steg 1–5 er uendret; kun evalueringssteget har to beats).
import type { Phase } from "./journey-data";
import { NudgeCard } from "./NudgeCard";

export function DultBeats({
  dult,
  time,
  date,
}: {
  dult: Phase["dult"];
  time?: string;
  /** Konkret tidspunkt for selve påminnelsen (beat 2), f.eks. «uke 12» — kortere
      og mer presist enn fase-etiketten i hjørnet. */
  date?: string;
}) {
  // opt-in-kort foran påminnelsen (arbeidsgiver, i planen)
  if (dult.setup) {
    return (
      <div className="br-beats">
        <NudgeCard nudge={dult.setup} time="i planen" />
        <span className="br-beats__link">↓ noen dager før evalueringen</span>
        <NudgeCard nudge={dult.nudge} time={date ?? time} />
      </div>
    );
  }
  // forklarende note der parten ikke selv setter opp varselet (sykmeldt)
  if (dult.setupNote) {
    return (
      <div className="br-beats">
        <p className="br-beats__note">{dult.setupNote}</p>
        <span className="br-beats__link">↓ noen dager før evalueringen</span>
        <NudgeCard nudge={dult.nudge} time={date ?? time} />
      </div>
    );
  }
  return <NudgeCard nudge={dult.nudge} time={time} />;
}
