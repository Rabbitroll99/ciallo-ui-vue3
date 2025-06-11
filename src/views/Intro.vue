<script setup>
import { onMounted } from 'vue'
// 导入项目介绍的Markdown文档
import Intro from '../markdown/intro.md'
// 导入代码高亮工具
import { highlightCode } from '../utils/highlight'

// 组件挂载后应用代码高亮
onMounted(() => {
  highlightCode()
})
</script>

<template>
  <!-- 渲染项目介绍文档 -->
  <Intro />
</template>

<style>
/* Markdown内容样式 */
.markdown-body {
  padding: 16px;
}
</style>
