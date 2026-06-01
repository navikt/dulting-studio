// To-beats-dult: et valgfritt «oppsett» (opt-in når planen lages) foran selve
// varselet, koblet med en liten tid-pil. Uten setup → bare NudgeCard, helt
// identisk med før (så steg 1–5 er uendret; kun evalueringssteget har to beats).
import type { Phase } from "./journey-data";
import { NudgeCard } from "./NudgeCard";

export function DultBeats({
  dult,
  time,
}: {
  dult: Phase["dult"];
  time?: string;
}) {
  if (!dult.setup) return <NudgeCard nudge={dult.nudge} time={time} />;
  return (
    <div className="br-beats">
      <NudgeCard nudge={dult.setup} time="ved planlegging" />
      <span className="br-beats__link">↓ noen dager før evalueringen</span>
      <NudgeCard nudge={dult.nudge} time={time} />
    </div>
  );
}
