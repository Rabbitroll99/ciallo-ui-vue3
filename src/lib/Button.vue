<template>
  <button class="ciallo-button" :class="classes" :disabled="disabled">
    <span v-if="loading" class="ciallo-loadingIndicator"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  theme: {
    type: String,
    default: "button",
  },
  size: {
    type: String,
    default: "normal",
  },
  level: {
    type: String,
    default: "normal",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const { theme, size, level } = props;
const classes = computed(() => {
  return {
    [`ciallo-theme-${theme}`]: theme,
    [`ciallo-size-${size}`]: size,
    [`ciallo-level-${level}`]: level,
  };
});
</script>

<style lang="scss">
@use "sass:color";

$h: 32px;
$border-color: #d9d9d9;
$color: #333;
$blue: #40a9ff;
$radius: 4px;
$red: red;
$grey: grey;

.ciallo-button {
  box-sizing: border-box;
  height: $h;
  padding: 0 12px;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  background: white;
  color: $color;
  border: 1px solid $border-color;
  border-radius: $radius;
  box-shadow: 0 1px 0 color.adjust(black, $alpha: -0.95);
  transition: background 250ms;

  &+& {
    margin-left: 8px;
  }

  &:hover,
  &:focus {
    color: $blue;
    border-color: $blue;
  }

  &:focus {
    outline: none;
  }

  &::-moz-focus-inner {
    border: 0;
  }

  &.ciallo-theme-link {
    border-color: transparent;
    box-shadow: none;
    color: $blue;

    &:hover,
    &:focus {
      color: color.scale($blue, $lightness: 10%);
    }
  }

  &.ciallo-theme-text {
    border-color: transparent;
    box-shadow: none;
    color: inherit;

    &:hover,
    &:focus {
      background: color.adjust(white, $lightness: -5%);
    }
  }

  &.ciallo-size-big {
    font-size: 24px;
    height: 48px;
    padding: 0 16px;
  }

  &.ciallo-size-small {
    font-size: 12px;
    height: 20px;
    padding: 0 4px;
  }

  &.ciallo-theme-button {
    &.ciallo-level-main {
      background: $blue;
      color: white;
      border-color: $blue;

      &:hover,
      &:focus {
        background: color.adjust($blue, $lightness: -10%);
        border-color: color.adjust($blue, $lightness: -10%);
      }
    }

    &.ciallo-level-danger {
      background: $red;
      border-color: $red;
      color: white;

      &:hover,
      &:focus {
        background: color.adjust($red, $lightness: -10%);
        border-color: color.adjust($red, $lightness: -10%);
      }
    }
  }

  &.ciallo-theme-link {
    &.ciallo-level-danger {
      color: $red;

      &:hover,
      &:focus {
        color: color.adjust($red, $lightness: -10%);
      }
    }
  }

  &.ciallo-theme-text {
    &.ciallo-level-main {
      color: $blue;

      &:hover,
      &:focus {
        color: color.adjust($blue, $lightness: 10%);
      }
    }

    &.ciallo-level-danger {
      color: $red;

      &:hover,
      &:focus {
        color: color.adjust($red, $lightness: 10%);
      }
    }
  }

  &.ciallo-theme-button {
    &[disabled] {
      cursor: not-allowed;
      color: $grey;

      &:hover {
        border-color: $grey;
      }
    }
  }

  &.ciallo-theme-link,
  &.ciallo-theme-text {
    &[disabled] {
      cursor: not-allowed;
      color: $grey;
    }
  }

  >.ciallo-loadingIndicator {
    width: 14px;
    height: 14px;
    display: inline-block;
    margin-right: 4px;
    border-radius: 8px;
    border-color: $blue $blue $blue transparent;
    border-style: solid;
    border-width: 2px;
    animation: ciallo-spin 1s infinite linear;
  }
}

@keyframes ciallo-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
