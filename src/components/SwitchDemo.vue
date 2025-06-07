<template>
  <div>
    <h1>Switch 组件示例</h1>
    <div class="demo">
      <h2>常规用法</h2>
      <div class="demo-component">
        <component :is="Switch1Demo" />
      </div>
      <div class="demo-actions">
        <Button @click="toggleCode(1)">查看代码</Button>
      </div>
      <div class="demo-code" v-if="showCode1">
        <pre v-html="Prism.highlight(sourceCode1, Prism.languages.html, 'html')"/>
      </div>
    </div>
    <div class="demo">
      <h2>支持 disabled</h2>
      <div class="demo-component">
        <component :is="Switch2Demo" />
      </div>
      <div class="demo-actions">
        <Button @click="toggleCode(2)">查看代码</Button>
      </div>
      <div class="demo-code" v-if="showCode2">
        <pre v-html="Prism.highlight(sourceCode2, Prism.languages.html, 'html')"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Button from "../lib/Button.vue";
import { ref } from "vue";
import Switch1Demo from "./Switch1.demo.vue";
import Switch2Demo from "./Switch2.demo.vue";
import "prismjs";
import "prismjs/themes/prism.css";
const Prism = (window as any).Prism;

export default {
  components: { Button },
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