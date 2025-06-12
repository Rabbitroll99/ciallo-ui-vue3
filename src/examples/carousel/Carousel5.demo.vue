<demo>
自动轮播卡片模式
</demo>
<template>
    <div>
        <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
            自动轮播卡片模式：卡片化展示，每3秒自动切换，鼠标悬停时暂停，导航按钮始终显示。<br />
        </p>
        <Carousel :images="images" :autoplay="true" :interval="3000" :show-indicators="true" :show-navigation="true"
            :navigation-mode="'always'" type="card" card-width="260px" :card-scale="0.75" />
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
    },
    {
        src: './img/Rotating-demo-image6.png',
        alt: '图片6'
    },
    {
        src: './img/Rotating-demo-image7.png',
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