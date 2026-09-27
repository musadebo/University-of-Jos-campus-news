import { IconBase, type IconProps } from "./_base";

export function OrganizerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 8.5h18" />
      <rect x="5.6" y="11" width="5.4" height="6.4" />
      <path d="M13.4 11.6h5M13.4 14h5M13.4 16.4h3" />
    </IconBase>
  );
}
