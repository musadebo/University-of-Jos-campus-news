import { IconBase, type IconProps } from "./_base";

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="12" height="12" rx="1" />
      <path d="M7.2 10h5.6" opacity="0.6" />
      <path d="M16.4 16.4 20.5 20.5" />
    </IconBase>
  );
}
