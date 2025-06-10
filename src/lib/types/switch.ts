export interface SwitchProps {
  value: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "normal" | "large";
  ariaLabel?: string;
}

export interface SwitchEmits {
  (e: "update:value", value: boolean): void;
  (e: "change", value: boolean): void;
}
