<template>
    <div>
        <div>Carousel 轮播图</div>
        <Demo :component="Carousel1Demo" />
        <Demo :component="Carousel2Demo" />
        <Demo :component="Carousel3Demo" />
    </div>
</template>

<script lang="ts">
import Demo from "./Demo.vue";
import Carousel1Demo from "./Carousel1.demo.vue";
import Carousel2Demo from "./Carousel2.demo.vue";
import Carousel3Demo from "./Carousel3.demo.vue";

export default {
    components: { Demo },
    setup() {
        return {
            Carousel1Demo: Carousel1Demo as any,
            Carousel2Demo: Carousel2Demo as any,
            Carousel3Demo: Carousel3Demo as any
        };
    },
};
</script>

<style scoped>
.carousel-demo {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

h3 {
    margin-bottom: 10px;
    color: #333;
}

p {
    margin-bottom: 20px;
    color: #666;
    font-size: 14px;
}
</style>