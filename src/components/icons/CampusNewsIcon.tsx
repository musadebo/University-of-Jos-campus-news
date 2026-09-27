import { IconBase, type IconProps } from "./_base";

export function CampusNewsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <rect x="6" y="7.5" width="7.5" height="5" />
      <path d="M15.5 7.6h2.8M15.5 10.2h2.8M15.5 12.8h2.8" />
      <path d="M6 15.4h12M6 17.4h8" opacity="0.6" />
    </IconBase>
  );
}
