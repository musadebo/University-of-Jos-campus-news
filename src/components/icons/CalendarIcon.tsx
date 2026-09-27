import { IconBase, type IconProps } from "./_base";

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17" />
      <path d="M8 5.5V3.5M16 5.5V3.5" />
      <path d="M7 13h3v3H7z" />
      <path d="M13 13.6h4M13 16.2h2.5" opacity="0.7" />
    </IconBase>
  );
}
