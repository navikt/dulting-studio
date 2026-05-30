import type { Metadata } from "next";
import { SykmeldtInterventionMapView } from "@/components/SykmeldtReferenceViews";

export const metadata: Metadata = {
  title: "Tiltakskart for den sykmeldte — dulting-studio",
  description:
    "Bearbeidede dulting-tiltak for den sykmeldte, koblet til barriere, motivasjon og måletegn.",
};

export default function SykmeldtTiltakskartPage() {
  return <SykmeldtInterventionMapView />;
}
