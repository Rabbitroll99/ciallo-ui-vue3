<template>
  <div>
    <h1>Switch 组件示例</h1>
    <Demo :component="Switch1Demo" />
    <Demo :component="Switch2Demo" />
  </div>
</template>

<script lang="ts">
import Button from "../lib/Button.vue";
import { ref } from "vue";
import Switch1Demo from "./Switch1.demo.vue";
import Switch2Demo from "./Switch2.demo.vue";
import "prismjs";
import "prismjs/themes/prism.css";
import Demo from "./Demo.vue";
const Prism = (window as any).Prism;

export default {
  components: { Button, Demo },
  setup() {
    const bool = ref(false);
    const showCode1 = ref(false);
    const showCode2 = ref(false);
    const sourceCode1 = ref('');
    const sourceCode2 = ref('');

    const toggleCode = (index: number) => {
      if (index === 1) {
        showCode1.value = !showCode1.value;
        if (showCode1.value && !sourceCode1.value) {
          sourceCode1.value = Switch1Demo.__sourceCode || '暂无源代码';
        }
      } else {
        showCode2.value = !showCode2.value;
        if (showCode2.value && !sourceCode2.value) {
          sourceCode2.value = Switch2Demo.__sourceCode || '暂无源代码';
        }
      }
    };

    return { 
      bool, 
      showCode1, 
      showCode2, 
      sourceCode1, 
      sourceCode2,
      toggleCode,
      Switch1Demo,
      Switch2Demo,
      Prism,
      Demo
    };
  },
};
</script>

<style lang="scss" scoped>
$border-color: #d9d9d9;

.demo {
  border: 1px solid $border-color;
  margin: 16px 0 32px;

  >h2 {
    font-size: 20px;
    padding: 8px 16px;
    border-bottom: 1px solid $border-color;
  }

  &-component {
    padding: 16px;
  }

  &-actions {
    padding: 8px 16px;
    border-top: 1px dashed $border-color;
  }

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