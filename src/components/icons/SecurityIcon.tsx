import { IconBase, type IconProps } from "./_base";

export function SecurityIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.2 19 6v6.2c0 4.2-3 7-7 8.6-4-1.6-7-4.4-7-8.6V6z" />
      <path d="M12 3.4v17.2" opacity="0.35" />
      <path d="M8.6 11.8l2.4 2.4 4.4-4.8" />
    </IconBase>
  );
}
