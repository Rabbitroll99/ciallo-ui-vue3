<demo>
自动轮播模式
</demo>
<template>
    <div>
        <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
            自动轮播模式：自动切换图片，鼠标悬停时暂停轮播并显示切换按钮
        </p>
        <Carousel :images="images" :autoplay="true" :interval="3000" :show-indicators="true" :show-navigation="true"
            :navigation-mode="'hover'" />
    </div>
</template>

<script lang="ts">
import { Carousel } from "../lib/index";

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