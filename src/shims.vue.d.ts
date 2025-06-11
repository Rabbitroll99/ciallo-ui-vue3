// Vue单文件组件的TypeScript类型声明
// 告诉TypeScript如何处理.vue文件的导入
declare module "*.vue" {
  import { ComponentOptions } from "vue";
  const componentOptions: ComponentOptions;
  export default componentOptions;
}
