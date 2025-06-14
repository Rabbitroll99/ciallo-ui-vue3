<template>
    <!-- 
        轮播图组件
        支持触摸滑动、自动播放、指示器和渐变切换
        遵循无障碍访问标准
        支持两种模式：常规模式（悬停显示切换按钮）和自动轮播模式
        支持卡片化模式：多卡片同时显示，中心卡片高亮
    -->
    <div class="ciallo-carousel" :class="carouselClasses" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
        @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @dragstart.prevent>
        <!-- 图片容器 -->
        <div class="ciallo-carousel-container" :class="{ 'ciallo-carousel-container-card': props.type === 'card' }">
            <!-- 默认模式 -->
            <template v-if="props.type === 'default'">
                <div v-for="(image, index) in props.images" :key="index" class="ciallo-carousel-item"
                    :class="{ 'ciallo-carousel-active': index === currentIndex }" :aria-hidden="index !== currentIndex">
                    <img :src="image.src" :alt="image.alt || `轮播图 ${index + 1}`" draggable="false" />
                </div>
            </template>

            <!-- 卡片模式 -->
            <template v-else-if="props.type === 'card'">
                <div v-for="(image, index) in props.images" :key="index"
                    class="ciallo-carousel-item ciallo-carousel-card-item" :class="getCardClasses(index)"
                    :style="getCardStyle(index)" @click="handleCardClick(index)" :aria-hidden="!isCardVisible(index)">
                    <img :src="image.src" :alt="image.alt || `轮播图 ${index + 1}`" :class="getImageClasses(index)"
                        @load="(event) => handleImageLoad(event, index)" draggable="false" />
                </div>
            </template>
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
import type { CarouselImage, CarouselNavigationMode, CarouselType } from "../../types/carousel";

// 组件属性定义，提供合理的默认值
const props = defineProps({
    images: {
        type: Array as () => CarouselImage[],
        required: true
    },
    autoplay: {
        type: Boolean,
        default: false
    },
    interval: {
        type: Number,
        default: 3000
    },
    showIndicators: {
        type: Boolean,
        default: true
    },
    showNavigation: {
        type: Boolean,
        default: true
    },
    navigationMode: {
        type: String as () => CarouselNavigationMode,
        default: 'hover'
    },
    type: {
        type: String as () => CarouselType,
        default: 'default'
    },
    cardWidth: {
        type: String,
        default: '300px'
    },
    cardScale: {
        type: Number,
        default: 0.8
    }
});

// 事件发射器
const emit = defineEmits(['change', 'update:current']);

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
const minSwipeDistance = ref(50) // 最小滑动距离

// 图片宽高比状态
const imageOrientations = ref<Record<number, 'landscape' | 'portrait' | 'square'>>({}) // 存储每张图片的方向
const imageAspectRatios = ref<Record<number, number>>({}) // 存储每张图片的实际宽高比

// ===== 计算属性 =====

const carouselClasses = computed(() => ({
    'ciallo-carousel-auto': props.autoplay,
    'ciallo-carousel-manual': !props.autoplay,
    'ciallo-carousel-nav-hover': props.navigationMode === 'hover',
    'ciallo-carousel-nav-always': props.navigationMode === 'always',
    'ciallo-carousel-card': props.type === 'card'
}));

// ===== 卡片模式相关方法 =====

/**
 * 处理图片加载事件，检测图片宽高比
 * @param event 图片加载事件
 * @param index 图片索引
 */
const handleImageLoad = (event: Event, index: number): void => {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    const { naturalWidth, naturalHeight } = img;
    const aspectRatio = naturalWidth / naturalHeight;

    // 存储实际宽高比
    imageAspectRatios.value[index] = aspectRatio;

    // 定义宽高比阈值
    const landscapeThreshold = 1.2; // 宽高比大于1.2视为横板
    const portraitThreshold = 0.8;  // 宽高比小于0.8视为竖板

    if (aspectRatio > landscapeThreshold) {
        imageOrientations.value[index] = 'landscape';
    } else if (aspectRatio < portraitThreshold) {
        imageOrientations.value[index] = 'portrait';
    } else {
        imageOrientations.value[index] = 'square';
    }
};

/**
 * 获取图片的CSS类名（包含方向类）
 * @param index 图片索引
 */
const getImageClasses = (index: number): string[] => {
    const classes: string[] = [];
    const orientation = imageOrientations.value[index];

    if (orientation) {
        classes.push(orientation);
    }

    return classes;
};

/**
 * 获取卡片样式类
 * @param index 卡片索引
 */
const getCardClasses = (index: number): Record<string, boolean> => {
    if (props.type !== 'card') return {};

    const diff = index - currentIndex.value;
    const total = props.images.length;

    // 处理循环位置（考虑循环轮播的情况）
    const normalizedDiff = diff > total / 2 ? diff - total : diff < -total / 2 ? diff + total : diff;

    // 移动端检测
    const isMobile = window.innerWidth <= 768;
    // 移动端显示逻辑略有不同，扩大可见卡片的范围
    const visibilityThreshold = isMobile ? 2 : 1;

    return {
        'ciallo-carousel-card-active': normalizedDiff === 0,
        'ciallo-carousel-card-prev': normalizedDiff === -1,
        'ciallo-carousel-card-next': normalizedDiff === 1,
        // 移动端下，把第二张前后卡片也显示出来，但设置更低的透明度
        'ciallo-carousel-card-prev-2': isMobile && normalizedDiff === -2,
        'ciallo-carousel-card-next-2': isMobile && normalizedDiff === 2,
        'ciallo-carousel-card-hidden': Math.abs(normalizedDiff) > visibilityThreshold
    };
};

/**
 * 判断卡片是否可见
 * @param index 卡片索引
 */
const isCardVisible = (index: number): boolean => {
    if (props.type !== 'card') return false;

    const diff = index - currentIndex.value;
    const total = props.images.length;

    // 处理循环位置
    const normalizedDiff = diff > total / 2 ? diff - total : diff < -total / 2 ? diff + total : diff;

    // 移动端显示更多卡片
    const isMobile = window.innerWidth <= 768;
    const visibilityThreshold = isMobile ? 2 : 1;

    return Math.abs(normalizedDiff) <= visibilityThreshold;
};

/**
 * 获取卡片的内联样式
 * @param index 卡片索引
 */
const getCardStyle = (index: number): Record<string, string> => {
    if (props.type !== 'card') return {};

    const diff = index - currentIndex.value;
    const total = props.images.length;

    // 处理循环位置
    const normalizedDiff = diff > total / 2 ? diff - total : diff < -total / 2 ? diff + total : diff;

    const isActive = index === currentIndex.value;
    // 检测是否为移动端，移动端使用较大的缩放比例使卡片更小
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    // 添加对中等宽度屏幕的检测，特别是900px左右的屏幕
    const isMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isNarrowMedium = window.innerWidth > 768 && window.innerWidth <= 900;

    // 移动端使用更大的卡片缩放差异，使非活动卡片更小
    const scale = isActive ? 1 : (isSmallMobile ? props.cardScale * 0.9 : (isMobile ? props.cardScale * 0.95 : props.cardScale));

    // 获取图片信息
    let cardWidthNum = parseInt(props.cardWidth) || 300;
    // 移动端对卡片宽度进行调整
    if (isMobile) {
        cardWidthNum = isSmallMobile ? 150 : 180;
    } else if (isMediumScreen) {
        // 中等屏幕宽度调整
        cardWidthNum = isNarrowMedium ? 220 : 250;
    }
    const orientation = imageOrientations.value[index];

    // 智能计算卡片间距：考虑当前图片相邻的实际图片类型
    const prevImageIndex = (index - 1 + total) % total;
    const nextImageIndex = (index + 1) % total;
    const prevOrientation = imageOrientations.value[prevImageIndex];
    const nextOrientation = imageOrientations.value[nextImageIndex];

    // 检查指定图片是否会被放大（用于判断相邻图片的影响）
    const checkEnlargedAdjacent = (imgIndex: number) => {
        const prevIndex = (imgIndex - 1 + total) % total;
        const nextIndex = (imgIndex + 1) % total;
        const prevImgOrientation = imageOrientations.value[prevIndex];
        const nextImgOrientation = imageOrientations.value[nextIndex];
        return prevImgOrientation === 'landscape' || nextImgOrientation === 'landscape';
    };

    // 移动端使用较小的间距系数
    let spacingMultiplier = isMobile ? 0.4 : 0.6; // 默认间距系数

    // 900px左右屏幕的特殊处理
    if (isNarrowMedium) {
        spacingMultiplier = 0.5; // 在900px左右使用更紧凑的间距
    }

    if (orientation === 'landscape') {
        spacingMultiplier = isMobile ? 0.8 : (isNarrowMedium ? 0.9 : 1.1);
    } else if (orientation === 'portrait' || orientation === 'square') {
        // 预先计算当前图片是否会被放大（复用后面的逻辑）
        const hasAdjacentLandscape = prevOrientation === 'landscape' || nextOrientation === 'landscape';
        const prevPortraitEnlarged = prevOrientation === 'portrait' && checkEnlargedAdjacent(prevImageIndex);
        const nextPortraitEnlarged = nextOrientation === 'portrait' && checkEnlargedAdjacent(nextImageIndex);
        const prevSquareEnlarged = prevOrientation === 'square' && checkEnlargedAdjacent(prevImageIndex);
        const nextSquareEnlarged = nextOrientation === 'square' && checkEnlargedAdjacent(nextImageIndex);

        const currentWillBeEnlarged = hasAdjacentLandscape || prevPortraitEnlarged || nextPortraitEnlarged ||
            prevSquareEnlarged || nextSquareEnlarged;

        if (currentWillBeEnlarged) {
            // 被放大的竖版/正方形图片使用接近横版的大间距，移动端使用较小值
            spacingMultiplier = isMobile ? 0.75 : (isNarrowMedium ? 0.85 : 1.05);
        } else {
            // 保持默认尺寸时使用紧凑间距，移动端更紧凑
            spacingMultiplier = isMobile ? 0.3 : (isNarrowMedium ? 0.45 : 0.6);
        }
    }

    const cardSpacing = cardWidthNum * spacingMultiplier;
    const translateX = normalizedDiff * cardSpacing;

    const zIndex = isActive ? 10 : Math.abs(normalizedDiff) === 1 ? 5 : 1;

    // 根据图片方向和实际宽高比动态调整卡片尺寸
    const actualAspectRatio = imageAspectRatios.value[index];
    let dynamicHeight = '80%'; // 默认高度
    let dynamicWidth = props.cardWidth; // 默认宽度

    if (orientation === 'landscape' && actualAspectRatio) {
        // 横板图片：增大显示尺寸，让图片更醒目
        const scaleFactor = isNarrowMedium ? 1.6 : 1.8; // 900px左右的屏幕使用稍小的放大系数
        dynamicWidth = `${cardWidthNum * scaleFactor}px`;
        const calculatedHeight = (cardWidthNum * scaleFactor) / actualAspectRatio;
        dynamicHeight = `${calculatedHeight}px`;
    } else if (orientation === 'portrait') {
        // 竖板图片：智能尺寸调整，避免连续竖版图片中出现大小不一
        const hasAdjacentLandscape = prevOrientation === 'landscape' || nextOrientation === 'landscape';
        const prevPortraitEnlarged = prevOrientation === 'portrait' && checkEnlargedAdjacent(prevImageIndex);
        const nextPortraitEnlarged = nextOrientation === 'portrait' && checkEnlargedAdjacent(nextImageIndex);
        const shouldEnlarge = hasAdjacentLandscape || prevPortraitEnlarged || nextPortraitEnlarged;

        if (shouldEnlarge && actualAspectRatio) {
            // 如果相邻图片中有横板，适当放大竖版图片
            // 在900px左右屏幕上，对竖版卡片使用更保守的放大系数
            const scaleFactor = isNarrowMedium ? 1.1 : 1.3;
            dynamicWidth = `${cardWidthNum * scaleFactor}px`;
            // 保持宽高比
            const calculatedHeight = (cardWidthNum * scaleFactor) / actualAspectRatio;
            dynamicHeight = `${calculatedHeight}px`;
        } else if (actualAspectRatio) {
            // 标准尺寸，但保持宽高比
            dynamicWidth = `${cardWidthNum}px`;
            const calculatedHeight = cardWidthNum / actualAspectRatio;
            // 在900px左右屏幕上，限制竖版卡片的最大高度，避免过高
            if (isNarrowMedium && calculatedHeight > cardWidthNum * 1.5) {
                dynamicHeight = `${cardWidthNum * 1.5}px`;
            } else {
                dynamicHeight = `${calculatedHeight}px`;
            }
        }
    } else if (orientation === 'square') {
        // 正方形图片：智能尺寸调整
        const hasAdjacentLandscape = prevOrientation === 'landscape' || nextOrientation === 'landscape';
        const prevSquareEnlarged = prevOrientation === 'square' && checkEnlargedAdjacent(prevImageIndex);
        const nextSquareEnlarged = nextOrientation === 'square' && checkEnlargedAdjacent(nextImageIndex);
        const shouldEnlarge = hasAdjacentLandscape || prevSquareEnlarged || nextSquareEnlarged;

        if (shouldEnlarge) {
            // 如果相邻图片中有横板，适当放大正方形图片
            const scaleFactor = isNarrowMedium ? 1.1 : 1.2;
            dynamicWidth = `${cardWidthNum * scaleFactor}px`;
            dynamicHeight = `${cardWidthNum * scaleFactor}px`;
        } else {
            // 标准尺寸
            dynamicWidth = `${cardWidthNum}px`;
            dynamicHeight = `${cardWidthNum}px`;
        }
    }

    return {
        transform: `translateX(${translateX}px) scale(${scale})`,
        width: dynamicWidth,
        height: dynamicHeight,
        zIndex: String(zIndex)
    };
};

/**
 * 处理卡片点击事件
 * @param index 卡片索引
 */
const handleCardClick = (index: number): void => {
    // 仅当点击的不是当前激活的卡片时才切换
    if (index !== currentIndex.value) {
        goToSlide(index);
    }
};

// ===== 滑动控制方法 =====

/**
 * 切换到上一张图片
 */
const prevSlide = (): void => {
    const totalImages = props.images.length;
    if (totalImages <= 1) return;

    currentIndex.value = (currentIndex.value - 1 + totalImages) % totalImages;
    emitChangeEvent();
};

/**
 * 切换到下一张图片
 */
const nextSlide = (): void => {
    const totalImages = props.images.length;
    if (totalImages <= 1) return;

    currentIndex.value = (currentIndex.value + 1) % totalImages;
    emitChangeEvent();
};

/**
 * 切换到指定索引的图片
 * @param index 目标索引
 */
const goToSlide = (index: number): void => {
    if (index === currentIndex.value || index < 0 || index >= props.images.length) return;

    currentIndex.value = index;
    emitChangeEvent();
};

/**
 * 发送切换事件
 */
const emitChangeEvent = (): void => {
    emit('change', currentIndex.value);
    emit('update:current', currentIndex.value);
};

// ===== 自动播放控制 =====

/**
 * 开始自动播放
 */
const startAutoplay = (): void => {
    if (!props.autoplay) return;

    // 清除现有计时器
    stopAutoplay();

    // 设置新计时器
    timer.value = setTimeout(() => {
        nextSlide();
        startAutoplay(); // 递归调用，保持自动播放
    }, props.interval);
};

/**
 * 停止自动播放
 */
const stopAutoplay = (): void => {
    if (timer.value) {
        clearTimeout(timer.value);
        timer.value = null;
    }
};

// ===== 鼠标事件处理 =====

/**
 * 鼠标进入轮播图
 */
const handleMouseEnter = (): void => {
    // 自动播放模式下，鼠标进入暂停播放
    if (props.autoplay) {
        stopAutoplay();
    }

    // 显示导航按钮（对应hover模式）
    if (props.navigationMode === 'hover') {
        navVisible.value = true;
    }
};

/**
 * 鼠标离开轮播图
 */
const handleMouseLeave = (): void => {
    // 自动播放模式下，鼠标离开继续播放
    if (props.autoplay) {
        startAutoplay();
    }

    // 隐藏导航按钮（对应hover模式）
    if (props.navigationMode === 'hover') {
        navVisible.value = false;
    }
};

// ===== 触摸事件处理 =====

/**
 * 触摸开始事件
 * @param event 触摸事件
 */
const handleTouchStart = (event: TouchEvent): void => {
    // 自动播放模式下，暂停播放
    if (props.autoplay) {
        stopAutoplay();
    }

    const touch = event.touches[0];
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
    touchEndX.value = touch.clientX; // 初始化结束位置为开始位置
    touchEndY.value = touch.clientY;
    isSwiping.value = true;

    // 阻止页面滚动，仅当水平滑动距离大于垂直滑动时
    event.preventDefault();
};

/**
 * 触摸移动事件
 * @param event 触摸事件
 */
const handleTouchMove = (event: TouchEvent): void => {
    if (!isSwiping.value) return;

    const touch = event.touches[0];
    touchEndX.value = touch.clientX;
    touchEndY.value = touch.clientY;

    // 计算水平和垂直方向的滑动距离
    const deltaX = touchEndX.value - touchStartX.value;
    const deltaY = touchEndY.value - touchStartY.value;

    // 如果水平滑动距离大于垂直滑动距离，阻止页面滚动
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault();
    }
};

/**
 * 触摸结束事件
 */
const handleTouchEnd = (): void => {
    if (!isSwiping.value) return;

    // 计算水平和垂直方向的滑动距离
    const deltaX = touchEndX.value - touchStartX.value;
    const deltaY = touchEndY.value - touchStartY.value;

    // 如果水平滑动距离大于垂直滑动距离且大于最小滑动距离，则认为是有效的水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance.value) {
        if (deltaX > 0) {
            // 向右滑动，切换到上一张
            prevSlide();
        } else {
            // 向左滑动，切换到下一张
            nextSlide();
        }
    }

    // 重置触摸状态
    isSwiping.value = false;

    // 自动播放模式下，触摸结束后继续播放
    if (props.autoplay) {
        startAutoplay();
    }
};

// ===== 生命周期钩子 =====

onMounted(() => {
    // 检测是否为移动设备，为移动端设置更小的滑动阈值
    if (window.innerWidth <= 768) {
        minSwipeDistance.value = 30; // 移动端使用更小的滑动阈值
    }

    // 自动播放模式下，组件挂载后开始播放
    if (props.autoplay) {
        startAutoplay();
    }

    // 总是显示模式下，导航按钮始终可见
    if (props.navigationMode === 'always') {
        navVisible.value = true;
    }
});

onUnmounted(() => {
    // 组件卸载时，清理计时器
    stopAutoplay();
    // 移除resize事件监听
    window.removeEventListener('resize', () => { });
});

// 检测设备方向变化，更新布局
window.addEventListener('resize', () => {
    // 如果是卡片模式，当设备方向变化时重新计算布局
    if (props.type === 'card') {
        // 简单延迟确保DOM已更新
        setTimeout(() => {
            // 重置滑动阈值
            if (window.innerWidth <= 768) {
                minSwipeDistance.value = 30;
            } else {
                minSwipeDistance.value = 50;
            }
        }, 300);
    }
});
</script>

<style lang="scss">
/* 导入设计令牌和混合函数 */
@use "../../tokens/colors.scss" as *;
@use "../../tokens/size.scss" as *;
@use "../../tokens/css-vars.scss" as *;

/* === 轮播图基础样式 === */
.ciallo-carousel {
    /* 基础布局 */
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: $border-radius-lg;
    user-select: none;
    touch-action: pan-y;
    contain: layout paint style;

    /* 容器基础样式 */
    &-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: theme-var(background-color-dark);
    }

    /* === 轮播图项目样式 === */
    &-item {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;

        /* 活动项目 */
        &.ciallo-carousel-active {
            opacity: 1;
            z-index: 1;
            pointer-events: auto;
        }

        /* 图片样式 */
        img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
            user-select: none;
            border-radius: $border-radius-base;
        }
    }

    /* === 卡片模式样式 === */
    &-container-card {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        perspective: 1200px;
        overflow: visible;
        touch-action: pan-y pinch-zoom;
        /* 优化触摸体验 */
    }

    &-card-item {
        position: absolute;
        width: 300px;
        height: 80%;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: $border-radius-lg;
        overflow: hidden;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        opacity: 0;
        cursor: pointer;
        backface-visibility: hidden;
        will-change: transform;
        transform-origin: center center;
        pointer-events: none;

        /* 活动卡片 */
        &.ciallo-carousel-card-active {
            z-index: 10;
            opacity: 1;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            pointer-events: auto;
        }

        /* 前一张卡片 */
        &.ciallo-carousel-card-prev {
            z-index: 5;
            opacity: 0.7;
            pointer-events: auto;
        }

        /* 后一张卡片 */
        &.ciallo-carousel-card-next {
            z-index: 5;
            opacity: 0.7;
            pointer-events: auto;
        }

        /* 移动端额外显示的卡片 */
        &.ciallo-carousel-card-prev-2 {
            z-index: 2;
            opacity: 0.4;
            pointer-events: auto;
        }

        &.ciallo-carousel-card-next-2 {
            z-index: 2;
            opacity: 0.4;
            pointer-events: auto;
        }

        /* 隐藏卡片 */
        &.ciallo-carousel-card-hidden {
            opacity: 0;
            z-index: 1;
            pointer-events: none;
        }

        /* 卡片图片样式 */
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: $border-radius-base;

            /* 基于图片方向的样式优化 */
            &.landscape {
                object-fit: cover;
            }

            &.portrait {
                object-fit: contain;
            }

            &.square {
                object-fit: cover;
            }
        }
    }

    /* === 导航按钮样式 === */
    .ciallo-carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 5;
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.4);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        /* 悬停效果 */
        &:hover {
            background: rgba(0, 0, 0, 0.6);
            transform: translateY(-50%) scale(1.05);
        }

        /* 焦点效果 */
        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* 活动效果 */
        &:active {
            transform: translateY(-50%) scale(0.95);
        }

        /* 显示状态 */
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

    /* 卡片模式下的导航按钮位置调整 */
    &.ciallo-carousel-card {
        .ciallo-carousel-nav-prev {
            left: $spacing-xl;
        }

        .ciallo-carousel-nav-next {
            right: $spacing-xl;
        }
    }

    /* === 指示器样式 === */
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

        /* 焦点状态 */
        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
        }

        /* 激活状态 */
        &.ciallo-carousel-indicator-active {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.2);
        }

        /* 悬停状态 */
        &:hover:not(.ciallo-carousel-indicator-active) {
            background: rgba(255, 255, 255, 0.7);
            transform: scale(1.1);
        }
    }

    /* === 组件模式样式 === */

    /* 始终显示导航按钮模式 */
    &.ciallo-carousel-nav-always .ciallo-carousel-nav {
        opacity: 1;
        visibility: visible;
    }

    /* 悬停显示导航按钮模式的动画增强 */
    &.ciallo-carousel-nav-hover:hover .ciallo-carousel-nav {
        opacity: 1;
        visibility: visible;
    }
}

/* === 响应式设计 === */

/* 小屏幕适配 */
@media (max-width: 768px) {
    .ciallo-carousel {
        height: 250px;
        /* 小屏幕固定高度 */
        border-radius: $border-radius-base;
        touch-action: pan-y;
        /* 移动端优化滑动体验 */

        /* 小屏幕下调整图片最小尺寸 */
        .ciallo-carousel-item img {
            min-width: clamp(200px, 70%, 100%);
            /* 小屏幕下降低最小宽度要求 */
            min-height: clamp(150px, 60%, 100%);
            /* 小屏幕下降低最小高度要求 */
        }

        /* 小屏幕下的卡片样式调整 */
        .ciallo-carousel-card-item {
            width: 180px;
            /* 调整小屏幕下的卡片宽度，更小以适应移动端 */
            height: 70%;
            transform-origin: center center;
            /* 确保变换原点居中 */
            transition: all 0.4s ease-out;
            /* 移动端使用更快的过渡效果 */

            /* 移动端卡片边缘处理 */
            &.ciallo-carousel-card-prev,
            &.ciallo-carousel-card-next {
                opacity: 0.65;
                /* 降低相邻卡片的不透明度 */
            }

            &.ciallo-carousel-card-prev-2,
            &.ciallo-carousel-card-next-2 {
                opacity: 0.35;
                /* 降低第二相邻卡片的不透明度 */
            }
        }

        /* 卡片模式下的容器调整 */
        .ciallo-carousel-container-card {
            overflow: hidden;
            /* 移动端卡片模式隐藏溢出部分 */
            padding: 0 $spacing-xs;
            /* 增加一些内边距 */
        }

        /* 卡片图片样式移动端优化 */
        .ciallo-carousel-card-item img {
            object-position: center;
            /* 确保图片居中对齐 */
        }

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

        &.ciallo-carousel-card {
            .ciallo-carousel-nav-prev {
                left: $spacing-md;
            }

            .ciallo-carousel-nav-next {
                right: $spacing-md;
            }
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

/* 极小屏幕适配 - 添加对更小屏幕的支持 */
@media (max-width: 480px) {
    .ciallo-carousel {
        height: 220px;
        /* 进一步降低极小屏幕高度 */

        .ciallo-carousel-card-item {
            width: 150px;
            /* 更小的卡片宽度 */
            height: 75%;
            /* 稍微增加高度比例 */
        }

        &.ciallo-carousel-card {
            .ciallo-carousel-nav-prev {
                left: $spacing-sm;
            }

            .ciallo-carousel-nav-next {
                right: $spacing-sm;
            }
        }
    }
}

/* 中等屏幕适配 */
@media (min-width: 769px) and (max-width: 1199px) {
    .ciallo-carousel {
        height: 350px;
        /* 中等屏幕高度 */

        .ciallo-carousel-card-item {
            width: 250px;
            /* 中等屏幕下的卡片宽度 */
        }
    }
}

/* 添加对900px左右屏幕的特殊处理 */
@media (min-width: 769px) and (max-width: 900px) {
    .ciallo-carousel {
        height: 320px;
        /* 调整900px左右屏幕的高度 */

        .ciallo-carousel-card-item {
            width: 220px;
            /* 调整900px左右屏幕的卡片宽度 */
            height: 75%;
            /* 调整高度比例，避免竖版卡片过高 */

            /* 调整卡片图片在900px宽度下的显示 */
            img.portrait {
                object-fit: cover;
                /* 在较窄的中等屏幕上使用cover而非contain，避免过高 */
                object-position: center;
            }

            /* 竖版卡片在此宽度下的特殊处理 */
            &.portrait {
                max-height: 300px;
                /* 限制最大高度 */
            }
        }

        /* 调整卡片容器样式 */
        .ciallo-carousel-container-card {
            overflow: hidden;
            /* 隐藏溢出部分，防止竖版卡片太高导致的布局问题 */
        }
    }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
    .ciallo-carousel {
        height: 450px;
        /* 大屏幕高度 */

        .ciallo-carousel-card-item {
            width: 350px;
            /* 大屏幕下的卡片宽度 */
        }
    }
}

/* === 无障碍访问优化 === */

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
    .ciallo-carousel-indicator {
        border: 1px solid rgba(255, 255, 255, 0.8);

        &.ciallo-carousel-indicator-active {
            background: white;
            border-color: white;
        }
    }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
    .ciallo-carousel-item {
        transition: none;
    }

    .ciallo-carousel-card-item {
        transition: none;
    }

    .ciallo-carousel-indicator {
        transition: none;
    }

    .ciallo-carousel-nav {
        transition: none;
    }
}

/* 强制颜色模式支持 */
@media (forced-colors: active) {
    .ciallo-carousel-indicator {
        border: 1px solid ButtonText;
        background: ButtonFace;

        &.ciallo-carousel-indicator-active {
            border: 2px solid Highlight;
            background: Highlight;
        }
    }

    .ciallo-carousel-nav {
        border: 1px solid ButtonText;
        background: ButtonFace;
        color: ButtonText;
    }
}

/* 横屏模式的移动设备优化 */
@media (max-width: 1024px) and (orientation: landscape) {
    .ciallo-carousel {
        height: 200px;
        /* 横屏模式下降低高度 */

        .ciallo-carousel-card-item {
            width: 200px;
            /* 横屏模式适当增加宽度 */
            height: 85%;
            /* 增加高度占比 */
        }

        &.ciallo-carousel-card {
            .ciallo-carousel-nav-prev {
                left: $spacing-md;
            }

            .ciallo-carousel-nav-next {
                right: $spacing-md;
            }
        }

        .ciallo-carousel-indicators {
            bottom: $spacing-xs;
            /* 减小底部边距 */
        }
    }
}
</style>