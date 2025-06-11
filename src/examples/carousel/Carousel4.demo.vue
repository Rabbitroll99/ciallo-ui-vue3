<demo>
卡片化模式
</demo>
<template>
    <div>
        <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
            卡片化模式：多张卡片同时显示，中心卡片高亮，支持点击切换。<br />
        </p>
        <Carousel :images="images" :autoplay="false" :show-indicators="true" :show-navigation="true"
            :navigation-mode="'hover'" type="card" card-width="240px" :card-scale="0.8" />
    </div>
</template>

<script lang="ts">
import { Carousel } from "../../lib/index";

const images = [
    {
        src: '/img/Rotating-demo-image1.png',
        alt: '图片1'
    },
    {
        src: '/img/Rotating-demo-image2.png',
        alt: '图片2'
    },
    {
        src: '/img/Rotating-demo-image3.png',
        alt: '图片3'
    },
    {
        src: '/img/Rotating-demo-image4.png',
        alt: '图片4'
    },
    {
        src: '/img/Rotating-demo-image5.png',
        alt: '图片5'
    },
    {
        src: '/img/Rotating-demo-image6.png',
        alt: '图片6'
    },
    {
        src: '/img/Rotating-demo-image7.png',
        alt: '图片7'
    }
]

export default {
    components: {
        Carousel
    },
    setup() {
        return { images }
    }
}
</script>