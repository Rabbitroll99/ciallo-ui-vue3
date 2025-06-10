<template>
    <div :data-theme="theme" class="ciallo-theme-provider">
        <slot />
    </div>
</template>

<script setup lang="ts">
export type Theme = 'light' | 'dark';

interface ThemeProviderProps {
    theme?: Theme;
}

withDefaults(defineProps<ThemeProviderProps>(), {
    theme: 'light'
});
</script>

<style lang="scss">
.ciallo-theme-provider {
    color: var(--ciallo-text-color-primary);
    background-color: var(--ciallo-background-color);
}
</style>