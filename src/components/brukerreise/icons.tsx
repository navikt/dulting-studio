// Ikon-mapping for brukerreisen.
import {
  BellIcon,
  CalendarIcon,
  ChatIcon,
  EnvelopeClosedIcon,
  PaperplaneIcon,
  TasklistIcon,
} from "@navikt/aksel-icons";
import type { ChannelKey, IconKey } from "./journey-data";

const iconMap = {
  envelope: EnvelopeClosedIcon,
  bell: BellIcon,
  checklist: TasklistIcon,
  chat: ChatIcon,
  share: PaperplaneIcon,
  calendar: CalendarIcon,
} as const;

export function PhaseIcon({
  icon,
  ...props
}: { icon: IconKey } & React.ComponentProps<typeof BellIcon>) {
  const Cmp = iconMap[icon];
  return <Cmp aria-hidden {...props} />;
}

const channelIcon: Record<ChannelKey, IconKey> = {
  msag: "bell",
  dsm: "checklist",
  plan: "chat",
  epost: "envelope",
  nav: "share",
};

export function ChannelIcon({
  channel,
  ...props
}: { channel: ChannelKey } & React.ComponentProps<typeof BellIcon>) {
  return <PhaseIcon icon={channelIcon[channel]} {...props} />;
}
