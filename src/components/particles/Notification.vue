<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

const prog: Ref<HTMLDivElement | undefined> = ref();

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    destroyTime: {
        type: Number,
        required: false,
        default: 3000
    }
})

const emits = defineEmits(['close'])

let timeInterval: number = 0;

onMounted(() => {
    let time = 0
    timeInterval = setInterval(() => {
        (prog.value as HTMLDivElement).style.width = `calc(80vw - (${(time / props.destroyTime) * 80}vw))`
        time += 10
        if (time === props.destroyTime) {
            emits('close')
            clearInterval(timeInterval)
        }
    }, 10)
})

onUnmounted(() => {
    clearInterval(timeInterval)
})




</script>

<template>
    <div class="notif">
        <div class="notif__container">
            <div class="notif__content">
                <h2 class="notif__title">{{ props.message }}</h2>
                <p class="notif__description">{{ props?.description }}</p>
            </div>
            <div class="notif__progress">
                <div class="notif__active" ref="prog"></div>
            </div>
        </div>
    </div>

</template>

<style lang="scss" scoped>
.notif {
    position: fixed;
    z-index: 999;
    left: 0;
    top: 60dvh;
    width: 100vw;
    text-align: center;
    color: var(--on-primary-color);
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    
}

.notif__container {
    width: 80vw;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 10px 20px;
    border-radius: 15px;
    background-color: var(--primary-color);
}

.notif__content {
    display: flex;
    flex-direction: column;
    
    gap: 10px;
    width: 80vw;
}

.notif__active {
    background-color: var(--on-primary-color);
    height: 10px;
}

.notif__title {
    font-size: 20px;
    margin: 0;
    color: var(--on-primary-color);
}
</style>