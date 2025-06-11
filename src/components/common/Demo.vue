<template>
  <div class="demo">
    <!-- 组件标题 -->
    <h2>{{ component.__sourceCodeTitle }}</h2>
    <!-- 组件演示区域 -->
    <div class="demo-component">
      <component :is="component" />
    </div>
    <!-- 操作按钮区域 -->
    <div class="demo-actions">
      <Button @click="hideCode" v-if="codeVisible">隐藏代码</Button>
      <Button @click="showCode" v-else>查看代码</Button>
    </div>
    <!-- 代码展示区域 -->
    <div class="demo-code" v-if="codeVisible">
      <pre class="language-html" v-html="html" />
    </div>
  </div>
</template>

<script lang="ts">
import Button from '../../lib/components/Button/Button.vue'
// 引入代码高亮库
import 'prismjs';
import 'prismjs/themes/prism.css'
import { computed, ref } from 'vue'

// 获取全局Prism对象
const Prism = (window as any).Prism

// 组件props类型定义
interface ComponentProps {
  __sourceCodeTitle?: string;
  __sourceCode?: string;
}

export default {
  components: { Button },
  props: {
    // 要展示的组件，包含源码信息
    component: {
      type: Object as () => ComponentProps,
      required: true
    }
  },
  setup(props) {
    // 计算高亮后的HTML代码
    const html = computed(() => {
      if (!props.component?.__sourceCode) return ''
      return Prism.highlight(props.component.__sourceCode, Prism.languages.html, 'html')
    })

    // 显示代码
    const showCode = () => codeVisible.value = true
    // 隐藏代码
    const hideCode = () => codeVisible.value = false
    // 代码可见状态
    const codeVisible = ref(false)

    return {
      Prism,
      html,
      codeVisible,
      showCode,
      hideCode,
    }
  }
}
</script>

<style lang="scss" scoped>
// 边框颜色变量
$border-color: #d9d9d9;

/* Demo容器样式 */
.demo {
  border: 1px solid $border-color;
  margin: 16px 0 32px;

  /* 标题样式 */
  >h2 {
    font-size: 20px;
    padding: 8px 16px;
    border-bottom: 1px solid $border-color;
  }

  /* 组件演示区域样式 */
  &-component {
    padding: 16px;
  }

  /* 操作按钮区域样式 */
  &-actions {
    padding: 8px 16px;
    border-top: 1px dashed $border-color;
  }

  /* 代码展示区域样式 */
  &-code {
    padding: 8px 16px;
    border-top: 1px dashed $border-color;

    >pre {
      line-height: 1.1;
      font-family: Consolas, 'Courier New', Courier, monospace;
      margin: 0;
    }
  }
}
</style>