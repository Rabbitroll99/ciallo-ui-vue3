export interface TabsProps {
  // 当前选中的标签页标题
  selected?: string;

  // 标签页类型：line（线性）| card（卡片）
  type?: "line" | "card";

  // 标签页位置：top | bottom | left | right
  position?: "top" | "bottom" | "left" | "right";

  // 是否可关闭标签
  closable?: boolean;
}

export interface TabsEmits {
  (e: "update:selected", selected: string): void;
  (e: "tab-click", tabName: string): void;
  (e: "tab-remove", tabName: string): void;
}
