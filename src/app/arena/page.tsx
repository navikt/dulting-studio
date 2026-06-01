import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { ArenaView } from "@/components/arena/ArenaView";

/** Piksel-arkadefont — bevisst utenfor Aksel, bare for denne tullete siden. */
const arcade = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-arena",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brukerreise Battle — NudgeLab vs Hovmester",
  description: "En tullete arkade-intro. Trykk START for å gå inn i studio.",
};

/**
 * Ulenket easter-egg-rute (/arena): en fighting-game-VS-skjerm som intro.
 * Dekker hele viewporten over AppShell (fixed) og lenker START → forsiden.
 */
export default function ArenaPage() {
  return (
    <div className={arcade.variable}>
      <ArenaView />
    </div>
  );
}
