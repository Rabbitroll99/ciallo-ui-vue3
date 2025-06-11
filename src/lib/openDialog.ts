import Dialog from "./Dialog.vue";
import { createApp, h } from "vue";

// 定义对话框选项的类型接口
interface DialogOptions {
  title?: any;
  content?: any;
  ok?: () => void;
  cancel?: () => void;
}

/**
 * 以编程方式打开对话框的工具函数
 * @param options 对话框配置选项
 * @param options.title 对话框标题内容
 * @param options.content 对话框主体内容
 * @param options.ok 确认按钮点击回调函数
 * @param options.cancel 取消按钮点击回调函数
 */
export const openDialog = (options: DialogOptions) => {
  const { title, content, ok, cancel } = options;

  // 创建挂载容器
  const div = document.createElement("div");
  document.body.appendChild(div);

  // 关闭对话框的函数
  const close = () => {
    app.unmount();
    div.remove();
  };

  // 创建Vue应用实例
  const app = createApp({
    render() {
      return h(
        Dialog,
        {
          visible: true,
          // 监听对话框关闭事件
          "onUpdate:visible": (newVisible: boolean) => {
            if (newVisible === false) {
              close();
            }
          },
          ok,
          cancel,
        },
        {
          // 传递插槽内容
          title,
          content,
        }
      );
    },
  });

  // 挂载应用到DOM
  app.mount(div);
};
