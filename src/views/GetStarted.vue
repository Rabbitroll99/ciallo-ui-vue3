<script setup>
import { onMounted } from 'vue'
// 导入开始使用的Markdown文档
import GetStarted from '../markdown/get-started.md'
// 导入代码高亮工具
import { highlightCode } from '../utils/highlight'

// 组件挂载后应用代码高亮
onMounted(() => {
  highlightCode()
})
</script>

<template>
  <!-- 渲染开始使用文档 -->
  <GetStarted />
</template>

<style>
/* Markdown内容样式 */
.markdown-body {
  padding: 16px;
}
</style>
