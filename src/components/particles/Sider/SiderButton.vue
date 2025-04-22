<script setup lang="ts">

const props = defineProps({
    url: {
        type: String,
        required: true
    }
})

</script>

<template>
    <div class="sider__button">
        <RouterLink :to="url" class="sider__link">
            <slot></slot>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
    .sider__link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        flex-direction: column;
        text-decoration: none;

        p {
            margin: 0;
            font-size: 8px;
        }
    }
</style>