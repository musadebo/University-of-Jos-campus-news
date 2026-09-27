import { IconBase, type IconProps } from "./_base";

export function NotificationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 16.5V11a4 4 0 0 1 8 0v5.5" />
      <path d="M6.4 16.5h11.2" />
      <path d="M10.6 19a1.6 1.6 0 0 0 2.8 0" />
      <path d="M12 7V5.4" />
      <circle cx="12" cy="12" r="9" opacity="0.28" strokeDasharray="2 4" />
    </IconBase>
  );
}
