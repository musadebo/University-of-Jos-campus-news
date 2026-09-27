import { IconBase, type IconProps } from "./_base";

export function ScheduleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9.5" cy="12" r="6.5" />
      <path d="M9.5 8.4V12l2.6 1.6" />
      <path d="M18 8.6H22M18 12h3M18 15.4h4" opacity="0.7" />
    </IconBase>
  );
}
