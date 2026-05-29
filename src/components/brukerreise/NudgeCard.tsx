// Nudge-kortet — «dultet» rendret som et varsel/oppgave-artefakt.
import { ArrowRightIcon } from "@navikt/aksel-icons";
import { ChannelIcon } from "./icons";
import { channels, type Nudge } from "./journey-data";

export function NudgeCard({ nudge, time }: { nudge: Nudge; time?: string }) {
  const ch = channels[nudge.channel];
  return (
    <div
      className="br-nudge"
      style={{ ["--chip-tint" as string]: `var(${ch.tint})` }}
    >
      <div className="br-nudge__head">
        <span className="br-nudge__app">
          <span className="br-nudge__appdot">
            <ChannelIcon channel={nudge.channel} fontSize="0.8rem" />
          </span>
          {ch.label}
        </span>
        <span className="br-nudge__now">{time ?? "nå"}</span>
      </div>
      <p className="br-nudge__title">{nudge.title}</p>
      <p className="br-nudge__body">{nudge.body}</p>
      <span className="br-nudge__cta">
        {nudge.cta}
        <ArrowRightIcon aria-hidden fontSize="0.9rem" />
      </span>
    </div>
  );
}
