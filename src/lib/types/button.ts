export type ButtonTheme = "button" | "link" | "text";
export type ButtonSize = "small" | "normal" | "big";
export type ButtonLevel = "normal" | "main" | "danger";

export interface ButtonProps {
  theme?: ButtonTheme;
  size?: ButtonSize;
  level?: ButtonLevel;
  disabled?: boolean;
  loading?: boolean;
}
