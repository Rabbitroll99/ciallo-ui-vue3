# 开始使用

请先[安装](#/doc/install)本组件库。

## 完整引入

在 main.js 中写入以下内容：

```javascript
import { createApp } from 'vue'
import * as CialloUI from 'ciallo-ui-vue3'
import 'ciallo-ui-vue3/dist/style.css'
import App from './App.vue'

const app = createApp(App)

// 注册所有组件
Object.keys(CialloUI).forEach(key => {
  app.component(key, CialloUI[key])
})

app.mount('#app')
```

## 按需引入（推荐）

为了减小打包体积，推荐按需引入所需的组件：

```javascript
import { Button, Switch, Tabs, Tab, Dialog, Carousel } from 'ciallo-ui-vue3'
import 'ciallo-ui-vue3/dist/style.css'
```

## 使用示例

### Vue 3 Composition API

```vue
<template>
  <div>
    <!-- 按钮组件 -->
    <Button @click="handleClick">点击我</Button>
    <Button theme="link" size="small">链接按钮</Button>
    
    <!-- 开关组件 -->
    <Switch v-model:value="switchValue" />
    
    <!-- 标签页组件 -->
    <Tabs v-model:selected="selectedTab">
      <Tab title="选项1">内容1</Tab>
      <Tab title="选项2">内容2</Tab>
    </Tabs>
    
    <!-- 对话框 -->
    <Button @click="showDialog">打开对话框</Button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button, Switch, Tabs, Tab, openDialog } from 'ciallo-ui-vue3'

const switchValue = ref(false)
const selectedTab = ref('选项1')

const handleClick = () => {
  console.log('Button clicked!')
}

const showDialog = () => {
  openDialog({
    title: '提示',
    content: '这是一个对话框示例'
  })
}
</script>
```

### Vue 3 Options API

```vue
<template>
  <div>
    <Button @click="handleClick">按钮</Button>
    <Switch v-model:value="switchValue" />
  </div>
</template>

<script>
import { Button, Switch } from 'ciallo-ui-vue3'

export default {
  components: {
    Button,
    Switch
  },
  data() {
    return {
      switchValue: false
    }
  },
  methods: {
    handleClick() {
      console.log('Button clicked!')
    }
  }
}
</script>
```

## 全局配置

您可以在应用程序中设置全局配置：

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局配置示例
app.config.globalProperties.$CIALLO = {
  // 这里可以添加全局配置
}

app.mount('#app')
```

## TypeScript 支持

CialloUI 使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { ButtonProps, SwitchProps, TabsProps } from 'ciallo-ui-vue3'

// 使用类型定义
const buttonProps: ButtonProps = {
  theme: 'button',
  size: 'normal',
  level: 'main'
}
```

现在您可以开始使用 CialloUI 的各个组件了！查看左侧导航栏了解每个组件的详细用法。