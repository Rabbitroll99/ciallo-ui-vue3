<template>
  <div>
    <!-- 顶部导航和横幅区域 -->
    <div class="topnavAndBanner">
      <Topnav />
      <div class="banner">
        <h1>Ciallo(∠・ω< )⌒☆ UI</h1>
            <h2>一个基于Vue3的UI框架</h2>
            <p class="actions">
              <a href="https://github.com/Rabbitroll99/ciallo-ui-vue3">GitHub项目地址</a>
              <router-link to="/doc">开始</router-link>
            </p>
      </div>
    </div>
    <!-- 特性介绍区域 -->
    <div class="features">
      <ul>
        <li>
          <svg>
            <use xlink:href="#icon-Vue"></use>
          </svg>
          <h3>基于 Vue 3</h3>
          <p>本项目使用了 Vue 3 Composition API</p>
        </li>
        <li>
          <svg>
            <use xlink:href="#icon-typescript"></use>
          </svg>
          <h3>基于 TypeScript</h3>
          <p>源代码采用 TypeScript 书写</p>
        </li>
        <li>
          <svg>
            <use xlink:href="#icon-lights"></use>
          </svg>
          <h3>代码易读</h3>
          <p>所有组件拥有完整的使用文档及示例</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Topnav from "../components/Topnav.vue";

export default {
  components: {
    Topnav,
  },
};
</script>

<style lang="scss" scoped>
// 定义主题色变量
$green: #02bcb0;
$border-radius: 4px;
$color: #007974;

/* 顶部导航和横幅容器样式 */
.topnavAndBanner {
  background: linear-gradient(145deg,
      rgba(227, 255, 253, 1) 0%,
      rgba(183, 233, 230, 1) 100%);
  /* 使用椭圆裁剪路径创建波浪效果 */
  clip-path: ellipse(80% 60% at 50% 40%);
}

/* 特性介绍区域样式 */
.features {
  margin: 64px auto;
  padding: 0 16px;

  /* 中等屏幕适配：800px及以上 */
  @media (min-width: 800px) {
    width: 800px;

    >ul {
      justify-content: space-around;

      >li {
        width: 45%;
        flex: 0 0 45%;
      }
    }
  }

  /* 中大屏幕过渡：1100px及以上 */
  @media (min-width: 1100px) {
    width: 1000px;

    >ul {
      justify-content: space-between;

      >li {
        width: 31%;
        flex: 0 0 31%;
        max-width: 320px;
      }
    }
  }

  /* 大屏幕适配：1350px及以上 */
  @media (min-width: 1350px) {
    width: 1300px;
    max-width: 90%;

    >ul {
      justify-content: space-between;

      >li {
        width: 30%;
        flex: 0 0 30%;
        max-width: 380px;
      }
    }
  }

  >ul {
    display: flex;
    flex-wrap: wrap;

    /* 小屏幕时居中对齐 */
    @media (max-width: 799px) {
      justify-content: center;
    }

    >li {
      width: 400px;
      margin: 16px 0;
      /* 使用Grid布局排列图标和文字 */
      display: grid;
      justify-content: start;
      align-content: start;
      grid-template-areas:
        "icon title"
        "icon text";
      grid-template-columns: 80px 1fr;
      grid-template-rows: auto auto;
      gap: 0 16px;
      min-height: 120px;

      /* 小屏幕适配：480px以下 */
      @media (max-width: 480px) {
        width: 100%;
        max-width: 400px;
      }

      >svg {
        grid-area: icon;
        width: 64px;
        height: 64px;
      }

      >h3 {
        grid-area: title;
        font-size: 28px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        margin: 0 0 4px 0;
        line-height: 1.2;
      }

      >p {
        grid-area: text;
        margin: 8px 0 0 0;
        line-height: 1.5;
        min-height: 2.1em;
        display: flex;
        align-items: flex-start;
      }
    }
  }
}

/* 横幅区域样式 */
.banner {
  color: $color;
  padding: 100px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  /* 操作按钮样式 */
  >.actions {
    padding: 8px 0;

    a {
      margin: 0 8px;
      background: $green;
      color: white;
      display: inline-block;
      padding: 8px 24px;
      border-radius: $border-radius;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
