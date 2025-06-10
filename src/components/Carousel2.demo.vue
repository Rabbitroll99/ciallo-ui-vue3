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

// 演示图片数据
const images = [
    {
        src: 'https://img-baofun.zhhainiao.com/fs/ca94f013cb2ee5e85bd3201cbc954044.jpg',
        alt: '图片'
    },
    {
        src: 'https://ts1.tc.mm.bing.net/th/id/R-C.d49a84d2cf5e8163534a02673eb6eae1?rik=qmZg17k1NnEm%2bg&riu=http%3a%2f%2fimgs.aixifan.com%2flive%2f1483601967895%2f1483601967895.jpg&ehk=DfugbSXrRhAgHKvaMlLyd8ib%2fT1G%2bFqBPfcwPdeGrNw%3d&risl=&pid=ImgRaw&r=0',
        alt: '图片'
    },
    {
        src: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.uOYMtlen-45JpWAhOzpsTQHaEK?w=333&h=187&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
        alt: '图片'
    },
    {
        src: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.JuivzpTp1H_MrWVQZ087SAHaEo?w=256&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
        alt: '图片'
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