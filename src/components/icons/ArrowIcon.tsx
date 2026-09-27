import { IconBase, type IconProps } from "./_base";

export function ArrowIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12h15" />
      <path d="M13.6 6.6 20 12l-6.4 5.4" />
    </IconBase>
  );
}
