import { IconBase, type IconProps } from "./_base";

export function CampusEventsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 9h18" />
      <path d="M7.5 5V3.4M16.5 5V3.4" />
      <rect x="6.2" y="11.4" width="2.6" height="3" />
      <rect x="10.7" y="11.4" width="2.6" height="3" />
      <rect x="15.2" y="11.4" width="2.6" height="3" />
      <path d="M5 17h14" opacity="0.55" />
      <circle cx="9" cy="17" r="0.7" />
    </IconBase>
  );
}
