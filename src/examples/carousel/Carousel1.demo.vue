<demo>
常规模式
</demo>
<template>
    <div>
        <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
            常规模式：鼠标悬停时显示左右切换按钮，不会自动轮播
        </p>
        <Carousel :images="images" :autoplay="false" :show-indicators="true" :show-navigation="true"
            :navigation-mode="'hover'" />
    </div>
</template>

<script lang="ts">
import { Carousel } from "../../lib/index";

const images = [
    {
        src: './img/Rotating-demo-image1.png',
        alt: '图片1'
    },
    {
        src: './img/Rotating-demo-image2.png',
        alt: '图片2'
    },
    {
        src: './img/Rotating-demo-image3.png',
        alt: '图片3'
    },
    {
        src: './img/Rotating-demo-image4.png',
        alt: '图片4'
    },
    {
        src: './img/Rotating-demo-image5.png',
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