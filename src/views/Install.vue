<script setup>
import { onMounted } from 'vue'
// 导入安装说明的Markdown文档
import Install from '../markdown/install.md'
// 导入代码高亮工具
import { highlightCode } from '../utils/highlight'

// 组件挂载后应用代码高亮
onMounted(() => {
  highlightCode()
})
</script>

<template>
  <!-- 渲染安装说明文档 -->
  <Install />
</template>

<style>
/* Markdown内容样式 */
.markdown-body {
  padding: 16px;
}
</style>
