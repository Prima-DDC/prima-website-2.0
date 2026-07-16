import {
  Building2,
  FileSearch,
  Globe2,
  GraduationCap,
  Landmark,
  Microscope,
  Mountain,
  Network,
  Radio,
  SearchCheck,
  ShieldCheck,
  Umbrella,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Building2,
  FileSearch,
  Globe2,
  GraduationCap,
  Landmark,
  Microscope,
  Mountain,
  Network,
  Radio,
  SearchCheck,
  ShieldCheck,
  Umbrella,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? ShieldCheck;
  return <Icon className={className} aria-hidden />;
}
