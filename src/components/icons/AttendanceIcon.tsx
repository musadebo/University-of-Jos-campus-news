import { IconBase, type IconProps } from "./_base";

export function AttendanceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 7.5V4.5h3M20.5 7.5V4.5h-3M3.5 16.5v3h3M20.5 16.5v3h-3" />
      <circle cx="11" cy="10.4" r="2.3" />
      <path d="M7.4 16.2a3.9 3.9 0 0 1 7.2 0" />
      <path d="M15.8 13.2l1.3 1.3 2.4-2.8" />
    </IconBase>
  );
}
