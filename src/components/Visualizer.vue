<script setup lang="ts">

const props = defineProps<{
    mode: number;
    isAnimated?: boolean;
}>();
</script>

<template>
    <div class="visualizer">
        <div :class="`visualizer--${props.mode}`"
            v-if="props.mode == 1">
            <div class="vis">
                <svg class="vis__bg" xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"
                    fill="none">
                    <path
                        d="M231.309 231.309C161.705 300.913 68.8765 320.935 23.9707 276.029C-20.9352 231.123 -0.913343 138.295 68.6908 68.6908C138.295 -0.913329 231.123 -20.9352 276.029 23.9707C320.935 68.8765 300.913 161.705 231.309 231.309Z"
                        fill="var(--triary-color)" />
                </svg>
                <span class="vis__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                        fill="var(--background-color)">
                        <path
                            d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
                    </svg>
                </span>
            </div>
        </div>
    </div>

</template>

<style lang="scss" scoped>

.visualizer {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;


    &--1 {
        width: 100%;
        height: 100%;
        animation: little-move 10s ease infinite;

        .vis {
            position: relative;
            width: 100%;
            height: 100%;
            border: none;
            background: none;
            padding: 0;
        }

        .vis__bg {
            position: absolute;
            inset: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
            fill: var(--triary-color) !important;

            svg {
                width: 100%;
                height: 100%;
            }
        }

        .vis__icon {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
    }
}
</style>