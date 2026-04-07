<script setup lang="ts">
import GSwitch from '../GSwitch.vue';

interface Props {
  modelValue: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits(['update:modelValue'])

</script>

<template>
    <GSwitch
        :model-value="props.modelValue"
        active-color="var(--primary-color)"
        inactive-color="var(--surface-color)"
        thumb-color="var(--on-primary-color)"
        :disabled="props.disabled"
        @update:modelValue="emit('update:modelValue', $event)"
    />
</template>