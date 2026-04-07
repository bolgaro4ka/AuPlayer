<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean
  activeColor?: string
  inactiveColor?: string
  thumbColor?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeColor: '#6750A4',     // M3 primary
  inactiveColor: '#E7E0EC',   // M3 surface variant
  thumbColor: '#FFFFFF',
  disabled: false
})

const emit = defineEmits(['update:modelValue'])

const isChecked = computed(() => props.modelValue)

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div
    class="switch"
    :class="{ checked: isChecked, disabled: disabled }"
    @click="toggle"
    :style="{
      '--track-active': activeColor,
      '--track-inactive': inactiveColor,
      '--thumb-color': thumbColor
    }"
  >
    <div class="track"></div>
    <div class="thumb">
      <span class="ripple"></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.switch {
  position: relative;
  width: 52px;
  height: 32px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;

  .track {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 100px;
    background: var(--track-inactive);
    transition: background 0.25s ease;
  }

  .thumb {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--thumb-color);
    left: 4px;
    transition: transform 0.25s cubic-bezier(.4, 0, .2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    box-shadow:
      0 1px 2px rgba(0,0,0,0.3),
      0 1px 3px rgba(0,0,0,0.15);

    .ripple {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transform: scale(0);
    }
  }

  &.checked {
    .track {
      background: var(--track-active);
    }

    .thumb {
      transform: translateX(20px);
    }
  }

  &:active .ripple {
    animation: ripple 0.4s ease;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

@keyframes ripple {
  from {
    opacity: 0.2;
    transform: scale(0.5);
  }
  to {
    opacity: 0;
    transform: scale(1.8);
  }
}
</style>