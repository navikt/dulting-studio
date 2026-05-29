import { redirect } from "next/navigation";

/**
 * AID-presentasjonen vises nå i prosjektrom.
 * Denne ruten redirecter til prosjektoversikten.
 */
export default function AidPresentasjonPage() {
  redirect("/projects");
}
