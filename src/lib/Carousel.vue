<template>
    <!-- 
        轮播图组件
        支持触摸滑动、自动播放、指示器和渐变切换
        遵循无障碍访问标准
        支持两种模式：常规模式（悬停显示切换按钮）和自动轮播模式
    -->
    <div class="ciallo-carousel" :class="carouselClasses" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
        @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @dragstart.prevent>
        <!-- 图片容器 -->
        <div class="ciallo-carousel-container">
            <div v-for="(image, index) in props.images" :key="index" class="ciallo-carousel-item"
                :class="{ 'ciallo-carousel-active': index === currentIndex }" :aria-hidden="index !== currentIndex">
                <img :src="image.src" :alt="image.alt || `轮播图 ${index + 1}`" draggable="false" />
            </div>
        </div>

        <!-- 左右切换按钮 -->
        <template v-if="props.showNavigation && props.images.length > 1">
            <button class="ciallo-carousel-nav ciallo-carousel-nav-prev"
                :class="{ 'ciallo-carousel-nav-visible': navVisible }" @click="prevSlide" :aria-label="'切换到上一张图片'"
                type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 16.58L10.83 12l4.58-4.58L14 6l-6 6 6 6 1.41-1.42z" />
                </svg>
            </button>
            <button class="ciallo-carousel-nav ciallo-carousel-nav-next"
                :class="{ 'ciallo-carousel-nav-visible': navVisible }" @click="nextSlide" :aria-label="'切换到下一张图片'"
                type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.58L13.17 12L8.59 7.42L10 6l6 6-6 6-1.41-1.42z" />
                </svg>
            </button>
        </template>

        <!-- 指示器 -->
        <div class="ciallo-carousel-indicators" v-if="props.showIndicators && props.images.length > 1" role="tablist">
            <button v-for="(_, index) in props.images" :key="index" class="ciallo-carousel-indicator"
                :class="{ 'ciallo-carousel-indicator-active': index === currentIndex }" @click="goToSlide(index)"
                :aria-label="`切换到第 ${index + 1} 张图片`" role="tab" :aria-selected="index === currentIndex"></button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { CarouselProps, CarouselEmits } from "./types/carousel";

// 组件属性定义，提供合理的默认值
const props = withDefaults(defineProps<CarouselProps>(), {
    autoplay: false,          // 默认不自动播放（常规模式）
    interval: 3000,           // 自动播放间隔（毫秒）
    showIndicators: true,     // 是否显示指示器
    showNavigation: true,     // 是否显示左右切换按钮
    navigationMode: 'hover',  // 导航按钮显示模式：hover（悬停显示）| always（始终显示）
})

// 事件发射器
const emit = defineEmits<CarouselEmits>();

// ===== 响应式数据 =====

const currentIndex = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)
const navVisible = ref(false) // 控制导航按钮显示

// 触摸相关状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const isSwiping = ref(false)
const minSwipeDistance = 50 // 最小滑动距离

// ===== 计算属性 =====

const carouselClasses = computed(() => ({
    'ciallo-carousel-auto': props.autoplay,
    'ciallo-carousel-manual': !props.autoplay,
    'ciallo-carousel-nav-hover': props.navigationMode === 'hover',
    'ciallo-carousel-nav-always': props.navigationMode === 'always'
}));

// ===== 核心方法 =====

/**
 * 切换到指定幻灯片
 * @param index 目标幻灯片索引
 */
const goToSlide = (index: number): void => {
    if (index >= 0 && index < props.images.length && index !== currentIndex.value) {
        currentIndex.value = index
        emit("change", index)
        emit("update:current", index)
    }
}

/**
 * 切换到下一张
 */
const nextSlide = (): void => {
    const nextIndex = (currentIndex.value + 1) % props.images.length
    goToSlide(nextIndex)
}

/**
 * 切换到上一张  
 */
const prevSlide = (): void => {
    const prevIndex = currentIndex.value === 0
        ? props.images.length - 1
        : currentIndex.value - 1
    goToSlide(prevIndex)
}

// ===== 鼠标事件处理 =====

/**
 * 处理鼠标进入事件
 */
const handleMouseEnter = (): void => {
    // 如果是自动播放模式，暂停播放
    if (props.autoplay) {
        pauseAutoplay()
    }

    // 如果导航模式是hover，显示导航按钮
    if (props.navigationMode === 'hover') {
        navVisible.value = true
    }
}

/**
 * 处理鼠标离开事件
 */
const handleMouseLeave = (): void => {
    // 如果是自动播放模式，恢复播放
    if (props.autoplay) {
        resumeAutoplay()
    }

    // 如果导航模式是hover，隐藏导航按钮
    if (props.navigationMode === 'hover') {
        navVisible.value = false
    }
}

// ===== 自动播放控制 =====

/**
 * 启动自动播放
 */
const startAutoplay = (): void => {
    if (props.autoplay && props.images.length > 1) {
        timer.value = setInterval(nextSlide, props.interval)
    }
}

/**
 * 暂停自动播放
 */
const pauseAutoplay = (): void => {
    if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
    }
}

/**
 * 恢复自动播放
 */
const resumeAutoplay = (): void => {
    if (props.autoplay) {
        startAutoplay()
    }
}

// ===== 触摸滑动处理 =====

/**
 * 处理触摸开始事件
 * @param event 触摸事件
 */
const handleTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    isSwiping.value = false

    // 暂停自动播放
    pauseAutoplay()
}

/**
 * 处理触摸移动事件
 * @param event 触摸事件
 */
const handleTouchMove = (event: TouchEvent): void => {
    if (!isSwiping.value) {
        const touch = event.touches[0]
        const deltaX = Math.abs(touch.clientX - touchStartX.value)
        const deltaY = Math.abs(touch.clientY - touchStartY.value)

        // 判断是否为水平滑动
        if (deltaX > deltaY && deltaX > 10) {
            isSwiping.value = true
            event.preventDefault() // 阻止页面滚动
        }
    } else {
        event.preventDefault()
    }
}

/**
 * 处理触摸结束事件
 * @param event 触摸事件
 */
const handleTouchEnd = (event: TouchEvent): void => {
    if (isSwiping.value) {
        const touch = event.changedTouches[0]
        touchEndX.value = touch.clientX
        touchEndY.value = touch.clientY

        const deltaX = touchEndX.value - touchStartX.value
        const deltaY = Math.abs(touchEndY.value - touchStartY.value)

        // 确保是水平滑动且距离足够
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
            if (deltaX > 0) {
                // 向右滑动，切换到上一张
                prevSlide()
            } else {
                // 向左滑动，切换到下一张
                nextSlide()
            }
        }
    }

    // 重置状态
    isSwiping.value = false

    // 恢复自动播放
    resumeAutoplay()
}

// ===== 生命周期 =====

onMounted(() => {
    // 根据导航模式初始化按钮显示状态
    if (props.navigationMode === 'always') {
        navVisible.value = true
    }

    // 启动自动播放
    startAutoplay()
})

onUnmounted(() => {
    pauseAutoplay()
})
</script>

<style lang="scss">
// 导入设计令牌和工具函数
@use "./tokens/colors.scss" as *;
@use "./tokens/size.scss" as *;
@use "./tokens/css-vars.scss" as *;

// === 轮播图基础样式 ===
.ciallo-carousel {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 200px;
    max-height: 60vh;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: $border-radius-lg;
    box-shadow: theme-var(box-shadow-base);
    background: theme-var(background-color);

    // 触摸优化
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;

    // === 图片容器样式 ===
    .ciallo-carousel-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ciallo-carousel-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);

        // 当前激活项
        &.ciallo-carousel-active {
            opacity: 1;
        }

        img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
            pointer-events: none; // 防止拖拽
        }
    }

    // === 导航按钮样式 ===
    .ciallo-carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(4px);

        // 悬停状态
        &:hover {
            background: rgba(0, 0, 0, 0.7);
            transform: translateY(-50%) scale(1.1);
        }

        // 焦点状态
        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
        }

        // 激活状态
        &:active {
            transform: translateY(-50%) scale(0.95);
        }

        // 显示状态
        &.ciallo-carousel-nav-visible {
            opacity: 1;
            visibility: visible;
        }

        svg {
            display: block;
            flex-shrink: 0;
        }
    }

    .ciallo-carousel-nav-prev {
        left: $spacing-md;
    }

    .ciallo-carousel-nav-next {
        right: $spacing-md;
    }

    // === 指示器样式 ===
    .ciallo-carousel-indicators {
        position: absolute;
        bottom: $spacing-md;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: $spacing-xs;
        z-index: 10;
        padding: $spacing-xs;
        border-radius: $border-radius-base;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
    }

    .ciallo-carousel-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        // 焦点状态
        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
        }

        // 激活状态
        &.ciallo-carousel-indicator-active {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.2);
        }

        // 悬停状态
        &:hover:not(.ciallo-carousel-indicator-active) {
            background: rgba(255, 255, 255, 0.7);
            transform: scale(1.1);
        }
    }

    // === 组件模式样式 ===

    // 始终显示导航按钮模式
    &.ciallo-carousel-nav-always .ciallo-carousel-nav {
        opacity: 1;
        visibility: visible;
    }

    // 悬停显示导航按钮模式的动画增强
    &.ciallo-carousel-nav-hover:hover .ciallo-carousel-nav {
        opacity: 1;
        visibility: visible;
    }
}

// === 响应式设计 ===

// 小屏幕适配
@media (max-width: 768px) {
    .ciallo-carousel {
        min-height: 150px;
        max-height: 50vh;
        border-radius: $border-radius-base;

        .ciallo-carousel-nav {
            width: 36px;
            height: 36px;

            svg {
                width: 18px;
                height: 18px;
            }
        }

        .ciallo-carousel-nav-prev {
            left: $spacing-sm;
        }

        .ciallo-carousel-nav-next {
            right: $spacing-sm;
        }

        .ciallo-carousel-indicators {
            bottom: $spacing-sm;
            gap: $spacing-xs;
            padding: $spacing-xs;
        }

        .ciallo-carousel-indicator {
            width: 8px;
            height: 8px;
        }
    }
}

// 大屏幕优化
@media (min-width: 1200px) {
    .ciallo-carousel {
        height: 400px;
    }
}

// === 无障碍访问优化 ===

// 高对比度模式支持
@media (prefers-contrast: high) {
    .ciallo-carousel-indicator {
        border: 1px solid rgba(255, 255, 255, 0.8);

        &.ciallo-carousel-indicator-active {
            background: white;
            border-color: white;
        }
    }
}

// 减少动画偏好支持
@media (prefers-reduced-motion: reduce) {
    .ciallo-carousel-item {
        transition: none;
    }

    .ciallo-carousel-indicator {
        transition: none;
    }

    .ciallo-carousel-nav {
        transition: none;
    }
}
</style>