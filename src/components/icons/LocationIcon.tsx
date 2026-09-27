import { IconBase, type IconProps } from "./_base";

export function LocationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s6.4-6.1 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 14.9 12 21 12 21z" />
      <rect x="9.6" y="8.2" width="4.8" height="4.8" />
      <path d="M12 8.2v4.8M9.6 10.6h4.8" opacity="0.55" />
    </IconBase>
  );
}
