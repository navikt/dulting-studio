import { redirect } from "next/navigation";

// Den bare /brukerreise-ruten er ikke lenger en inngang (toppnav + forside peker
// på de konkrete sporene). Send videre til arbeidsgiver-reisen så ingen lander
// på den løse referansevisningen ved et uhell.
export default function BrukerreisePage() {
  redirect("/brukerreise/leder");
}
