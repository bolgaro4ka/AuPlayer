<script setup lang="ts">
import { type PropType } from 'vue';

const props = defineProps({
    sType: {
        type: String as PropType<'checkbox' | 'slider'>,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    currentValue: {
        type: [String, Boolean, Number] as PropType<string | boolean | number>,
        required: true
    },
    minValue: {
        type: Number,
        required: false
    },
    maxValue: {
        type: Number,
        required: false
    }
})

const emits = defineEmits(['changeCheckbox', 'changeSlider']);

</script>

<template>
    <div class="param">
        <div class="param__text">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
            <div v-if="props?.sType === 'slider'" class="param__slider">
                <input type="range" :min="minValue" :max="maxValue" :value="currentValue"
                    @input="emits('changeSlider', ($event.target as HTMLInputElement).value)">
                <p>{{ currentValue }}</p>
            </div>
        </div>
        <div v-if="props?.sType === 'checkbox'" class="param__checkbox">
            <input type="checkbox" :checked="Boolean(currentValue)" @change="emits('changeCheckbox', ($event.target as HTMLInputElement).checked)">
        </div>
    </div>
</template>

<style lang="scss" scoped>
.param {
    width: 100%;
    border-top: 1px solid #555;
    border-bottom: 1px solid #555;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0px 10px;
}
</style>