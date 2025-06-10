export interface DialogProps {
  // 基础属性
  visible?: boolean;
  closeOnClickOverlay?: boolean;
  closeOnPressEscape?: boolean;

  // 内容属性
  title?: string;
  content?: string;

  // 按钮属性
  okText?: string;
  cancelText?: string;
  showFooter?: boolean;
  loading?: boolean;

  // 回调函数
  ok?: () => boolean | void | Promise<boolean | void>;
  cancel?: () => void;
}

export interface DialogEmits {
  (e: "update:visible", visible: boolean): void;
  (e: "close"): void;
  (e: "ok"): void;
  (e: "cancel"): void;
  (e: "error", error: any): void;
}
