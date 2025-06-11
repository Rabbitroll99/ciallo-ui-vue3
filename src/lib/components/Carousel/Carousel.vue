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
import type { CarouselProps, CarouselEmits } from "../../types/carousel";

// 组件属性定义，提供合理的默认值
const props = withDefaults(defineProps<CarouselProps>(), {
    autoplay: false,          // 默认不自动播放（常规模式）
    interval: 3000,           // 自动播放间隔（毫秒）
    showIndicators: true,     // 是否显示指示器
    showNavigation: true,     // 是否显示左右切换按钮
    navigationMode: 'hover',  // 导航按钮显示模式：hover（悬停显示）| always（始终显示）
    type: 'default',          // 走马灯类型：default（默认模式）| card（卡片模式）
    cardWidth: '300px',       // 卡片宽度（仅在卡片模式下生效）
    cardScale: 0.8,           // 非激活卡片的缩放比例（仅在卡片模式下生效）
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
 * 获取卡片的CSS类名
 * @param index 卡片索引
 */
const getCardClasses = (index: number): Record<string, boolean> => {
    if (props.type !== 'card') return {};

    const diff = index - currentIndex.value;
    const total = props.images.length;

    // 处理循环位置
    const normalizedDiff = diff > total / 2 ? diff - total : diff < -total / 2 ? diff + total : diff;

    return {
        'ciallo-carousel-card-active': index === currentIndex.value,
        'ciallo-carousel-card-prev': normalizedDiff === -1,
        'ciallo-carousel-card-next': normalizedDiff === 1,
        'ciallo-carousel-card-hidden': Math.abs(normalizedDiff) > 1
    };
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
    const scale = isActive ? 1 : props.cardScale;

    // 获取图片信息
    const cardWidthNum = parseInt(props.cardWidth) || 300;
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

    let spacingMultiplier = 0.6; // 默认间距系数

    if (orientation === 'landscape') {
        // 横板图片始终使用大间距
        spacingMultiplier = 1.1;
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
            // 被放大的竖版/正方形图片使用接近横版的大间距
            spacingMultiplier = 1.05;
        } else {
            // 保持默认尺寸时使用紧凑间距
            spacingMultiplier = 0.6;
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
        const scaleFactor = 1.8; // 放大系数，让横板图片更大
        dynamicWidth = `${cardWidthNum * scaleFactor}px`;
        const calculatedHeight = (cardWidthNum * scaleFactor) / actualAspectRatio;
        dynamicHeight = `${calculatedHeight}px`;
    } else if (orientation === 'portrait') {
        // 竖板图片：智能尺寸调整，避免连续竖版图片中出现大小不一
        const hasAdjacentLandscape = prevOrientation === 'landscape' || nextOrientation === 'landscape';

        const prevPortraitEnlarged = prevOrientation === 'portrait' && checkEnlargedAdjacent(prevImageIndex);
        const nextPortraitEnlarged = nextOrientation === 'portrait' && checkEnlargedAdjacent(nextImageIndex);

        // 决策逻辑：如果自己与横板相邻，或者相邻的竖版图片被放大了，都使用放大尺寸
        if (hasAdjacentLandscape || prevPortraitEnlarged || nextPortraitEnlarged) {
            // 使用放大尺寸保持视觉连续性
            const adjustedWidth = cardWidthNum * 1.3;
            dynamicWidth = `${adjustedWidth}px`;
            dynamicHeight = '85%';
        } else {
            // 全部是小图片时保持默认尺寸
            dynamicHeight = '80%';
            dynamicWidth = props.cardWidth;
        }
    } else if (orientation === 'square') {
        // 正方形图片：智能调整，保持与相邻图片的视觉连续性
        const hasAdjacentLandscape = prevOrientation === 'landscape' || nextOrientation === 'landscape';

        // 检查相邻的正方形图片是否被放大
        const prevSquareEnlarged = prevOrientation === 'square' && checkEnlargedAdjacent(prevImageIndex);
        const nextSquareEnlarged = nextOrientation === 'square' && checkEnlargedAdjacent(nextImageIndex);

        // 检查相邻的竖版图片是否被放大
        const prevPortraitEnlarged = prevOrientation === 'portrait' && checkEnlargedAdjacent(prevImageIndex);
        const nextPortraitEnlarged = nextOrientation === 'portrait' && checkEnlargedAdjacent(nextImageIndex);

        // 如果相邻有被放大的图片，也进行相应调整
        if (hasAdjacentLandscape || prevSquareEnlarged || nextSquareEnlarged ||
            prevPortraitEnlarged || nextPortraitEnlarged) {
            // 与放大图片相邻时增大尺寸
            const adjustedSize = cardWidthNum * 1.2;
            dynamicHeight = `${adjustedSize}px`;
            dynamicWidth = `${adjustedSize}px`;
        } else {
            // 保持默认正方形比例
            dynamicHeight = props.cardWidth;
            dynamicWidth = props.cardWidth;
        }
    }

    return {
        transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
        zIndex: zIndex.toString(),
        width: dynamicWidth,
        height: dynamicHeight
    };
};

/**
 * 判断卡片是否可见
 * @param index 卡片索引
 */
const isCardVisible = (index: number): boolean => {
    if (props.type !== 'card') return index === currentIndex.value;

    const diff = index - currentIndex.value;
    const total = props.images.length;
    const normalizedDiff = diff > total / 2 ? diff - total : diff < -total / 2 ? diff + total : diff;

    return Math.abs(normalizedDiff) <= 1;
};

/**
 * 处理卡片点击事件
 * @param index 点击的卡片索引
 */
const handleCardClick = (index: number): void => {
    if (props.type === 'card' && index !== currentIndex.value) {
        goToSlide(index);
    }
};

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
@use "../../tokens/colors.scss" as *;
@use "../../tokens/size.scss" as *;
@use "../../tokens/css-vars.scss" as *;

// === 轮播图基础样式 ===
.ciallo-carousel {
    position: relative;
    width: 100%;
    height: 400px; // 固定一个合适的高度
    overflow: hidden;
    border-radius: $border-radius-lg;
    box-shadow: theme-var(box-shadow-base);
    background: theme-var(background-color);

    // 触摸优化
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;

    // 卡片模式特殊样式
    &.ciallo-carousel-card {
        overflow: visible; // 卡片模式需要显示溢出的卡片
        background: transparent; // 卡片模式不需要背景
        box-shadow: none; // 卡片模式不需要整体阴影
        border-radius: 0; // 卡片模式不需要圆角

        // 确保卡片模式下的容器有足够空间
        .ciallo-carousel-container {
            overflow: visible;
        }

        // 默认模式的样式在卡片模式下不适用
        .ciallo-carousel-item:not(.ciallo-carousel-card-item) {
            display: none;
        }
    }

    // === 图片容器样式 ===
    .ciallo-carousel-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        // 卡片模式容器
        &.ciallo-carousel-container-card {
            perspective: 1200px; // 3D 透视效果
            perspective-origin: center center;
        }
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
        background: linear-gradient(135deg,
                theme-var(background-color-light) 0%,
                theme-var(background-color) 100%); // 添加渐变背景
        transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);

        // 当前激活项
        &.ciallo-carousel-active {
            opacity: 1;
        }

        img {
            // 智能尺寸策略：既要充分利用空间，又要保持比例
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;

            // 对于小图片，确保至少占据合理的显示空间
            // 使用 clamp 函数实现更智能的尺寸控制
            min-width: clamp(300px, 60%, 100%); // 最小300px，理想60%，最大100%
            min-height: clamp(200px, 50%, 100%); // 最小200px，理想50%，最大100%

            object-fit: contain; // 保持完整显示，不裁剪
            object-position: center;
            display: block;
            pointer-events: none; // 防止拖拽
        }
    }

    // === 卡片模式样式 ===
    .ciallo-carousel-card-item {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300px; // 默认卡片宽度，会被内联样式覆盖
        height: 80%;
        opacity: 1; // 卡片模式下所有卡片都可见
        transform-origin: center center;
        transform: translate(-50%, -50%); // 默认居中，会被内联样式覆盖
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        cursor: pointer;
        border-radius: $border-radius-lg;
        box-shadow: theme-var(box-shadow-base);
        background: theme-var(background-color);
        overflow: hidden;

        // 激活状态卡片
        &.ciallo-carousel-card-active {
            cursor: default;
            box-shadow: theme-var(box-shadow-lg);
        }

        // 前一个卡片
        &.ciallo-carousel-card-prev {
            opacity: 0.7;
        }

        // 下一个卡片
        &.ciallo-carousel-card-next {
            opacity: 0.7;
        }

        // 隐藏的卡片
        &.ciallo-carousel-card-hidden {
            opacity: 0;
            pointer-events: none;
        }

        // 悬停效果（仅对非激活卡片）
        &:not(.ciallo-carousel-card-active):hover {
            opacity: 0.9;
            box-shadow: theme-var(box-shadow-lg);
        }

        // 卡片模式下的图片样式 - 动态适应卡片尺寸，完整显示
        img {
            // 基础样式：完整显示图片内容
            width: 100%;
            height: 100%;
            min-width: unset;
            min-height: unset;
            object-position: center;
            display: block;

            // 默认使用contain模式：确保图片完整显示
            object-fit: contain;

            // 横板图片：卡片高度已动态调整，图片完整显示无白边
            &.landscape {
                width: 100%;
                height: 100%;
                object-fit: contain; // 完整显示，因为卡片高度已适应图片比例
                object-position: center;
            }

            // 竖板图片：填满卡片，可能有上下轻微裁剪
            &.portrait {
                width: 100%;
                height: 100%;
                object-fit: cover; // 填满卡片宽度
                object-position: center;
            }

            // 正方形图片：完整填满正方形卡片
            &.square {
                width: 100%;
                height: 100%;
                object-fit: contain; // 完整显示
                object-position: center;
            }
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

    // 卡片模式下的导航按钮位置调整
    &.ciallo-carousel-card {
        .ciallo-carousel-nav-prev {
            left: $spacing-xl;
        }

        .ciallo-carousel-nav-next {
            right: $spacing-xl;
        }
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
        height: 250px; // 小屏幕固定高度
        border-radius: $border-radius-base;

        // 小屏幕下调整图片最小尺寸
        .ciallo-carousel-item img {
            min-width: clamp(200px, 70%, 100%); // 小屏幕下降低最小宽度要求
            min-height: clamp(150px, 60%, 100%); // 小屏幕下降低最小高度要求
        }

        // 小屏幕下的卡片样式调整
        .ciallo-carousel-card-item {
            width: 200px; // 小屏幕下的卡片宽度
            height: 70%;
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

// 中等屏幕适配
@media (min-width: 769px) and (max-width: 1199px) {
    .ciallo-carousel {
        height: 350px; // 中等屏幕高度

        .ciallo-carousel-card-item {
            width: 250px; // 中等屏幕下的卡片宽度
        }
    }
}

// 大屏幕优化
@media (min-width: 1200px) {
    .ciallo-carousel {
        height: 450px; // 大屏幕高度

        .ciallo-carousel-card-item {
            width: 350px; // 大屏幕下的卡片宽度
        }
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
</style>