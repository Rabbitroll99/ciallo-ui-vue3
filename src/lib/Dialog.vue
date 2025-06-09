<template>
  <template v-if="visible">
    <Teleport to="body">
      <div class="ciallo-dialog-overlay" @click="onClickOverlay"></div>
      <div class="ciallo-dialog-wrapper">
        <div class="ciallo-dialog">
          <header>
            <slot name="title" />
            <span @click="close" class="ciallo-dialog-close"></span>
          </header>
          <main>
            <slot name="content" />
          </main>
          <footer>
            <Button level="main" @click="ok">OK</Button>
            <Button @click="cancel">Cancel</Button>
          </footer>
        </div>
      </div>
    </Teleport>
  </template>
</template>

<script lang="ts">
import Button from "./Button.vue";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true,
    },
    ok: {
      type: Function,
    },
    cancel: {
      type: Function,
    },
  },
  components: {
    Button,
  },
  setup(props, context) {
    const close = () => {
      context.emit("update:visible", false);
    };
    const onClickOverlay = () => {
      if (props.closeOnClickOverlay) {
        close();
      }
    };
    const ok = () => {
      if (props.ok?.() !== false) {
        close();
      }
    };
    const cancel = () => {
      props.cancel?.();
      close();
    };
    return {
      close,
      onClickOverlay,
      ok,
      cancel,
    };
  },
};
</script>

<style lang="scss">
@use "sass:color";
$radius: 4px;
$border-color: #d9d9d9;
$background-color: white;
$overlay-color: rgba(0, 0, 0, 0.5);

.ciallo-dialog {
  &-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: $overlay-color;
    z-index: 1000;
  }

  &-wrapper {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
  }

  & {
    background: $background-color;
    border-radius: $radius;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 15em;
    max-width: 90%;
    width: 420px;
  }

  >header {
    padding: 16px 24px;
    border-bottom: 1px solid $border-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }

  >main {
    padding: 24px;
    font-size: 14px;
    line-height: 1.5715;
    color: rgba(0, 0, 0, 0.65);
  }

  >footer {
    border-top: 1px solid $border-color;
    padding: 10px 24px;
    text-align: right;

    .ciallo-button+.ciallo-button {
      margin-left: 8px;
    }
  }

  &-close {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.45);
    transition: color 0.3s;

    &:hover {
      color: rgba(0, 0, 0, 0.75);
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      height: 1px;
      background: currentColor;
      width: 100%;
      top: 50%;
      left: 50%;
    }

    &::before {
      transform: translate(-50%, -50%) rotate(-45deg);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }
}
</style>
