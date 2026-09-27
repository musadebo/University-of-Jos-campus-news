import { IconBase, type IconProps } from "./_base";

export function RegistrationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M8 6v12" strokeDasharray="1.5 2" />
      <path d="M11.5 10.5h6M11.5 13.5h3.5" />
      <path d="M4.6 11.2l1.4 1.4 2-2.6" />
    </IconBase>
  );
}
