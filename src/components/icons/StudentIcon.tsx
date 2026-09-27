import { IconBase, type IconProps } from "./_base";

export function StudentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M7.6 17.4a4.9 4.9 0 0 1 8.8 0" />
      <path d="M3.5 7h3M17.5 17h3" opacity="0.5" />
    </IconBase>
  );
}
