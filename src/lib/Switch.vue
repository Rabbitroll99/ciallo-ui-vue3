<template>
  <button class="ciallo-switch" @click="toggle" :class="{ 'ciallo-checked': value, 'ciallo-disabled': disabled }">
    <span> </span>
  </button>
  <div>{{ value }}</div>
</template>

<script setup lang="ts">
const props = defineProps({
  value: Boolean,
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value']);

const toggle = () => {
  if (props.disabled) return;
  emit("update:value", !props.value);
};
</script>

<style lang="scss">
@use "sass:math";
$h: 22px;
$h2: $h - 4px;

.ciallo-switch {
  height: $h;
  width: $h * 2;
  border: none;
  background: #bfbfbf;
  border-radius: math.div($h, 2);
  position: relative;
  cursor: pointer;

  >span {
    position: absolute;
    top: 2px;
    left: 2px;
    height: $h2;
    width: $h2;
    background: white;
    border-radius: math.div($h2, 2);
    transition: all 250ms;
  }

  &.ciallo-checked {
    background: #1890ff;

    >span {
      left: calc(100% - #{$h2} - 2px);
    }
  }

  &:focus {
    outline: none;
  }

  &:active {
    >span {
      width: $h2 + 4px;
    }
  }

  &.ciallo-checked:active {
    >span {
      width: $h2 + 4px;
      margin-left: -4px;
    }
  }

  &.ciallo-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
