<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const minValue = props.min || 1;
const maxValue = props.max || 10;

const increment = () => {
  if (props.modelValue < maxValue) {
    emit('update:modelValue', props.modelValue + 1);
  }
};

const decrement = () => {
  if (props.modelValue > minValue) {
    emit('update:modelValue', props.modelValue - 1);
  }
};

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value);

  if (!isNaN(value)) {
    if (value < minValue) {
      emit('update:modelValue', minValue);
    } else if (value > maxValue) {
      emit('update:modelValue', maxValue);
    } else {
      emit('update:modelValue', value);
    }
  }
};
</script>

<template>
  <div class="number-input">
    <label class="block text-gray-300 font-medium mb-2">Number of People</label>
    <div class="flex items-center">
      <button
        type="button"
        @click="decrement"
        class="bg-[#0F1629] p-3 rounded-l-xl border border-gray-700 text-gray-300 hover:bg-[#1A2333] focus:outline-none transition-all"
        :disabled="modelValue <= minValue"
        :class="{'opacity-50 cursor-not-allowed': modelValue <= minValue}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <div class="relative flex-grow">
        <input
          :value="modelValue"
          @input="updateValue"
          type="number"
          :min="minValue"
          :max="maxValue"
          class="w-full p-4 text-center bg-[#0F1629] text-white border-t border-b border-gray-700 focus:outline-none"
        >
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <button
        type="button"
        @click="increment"
        class="bg-[#0F1629] p-3 rounded-r-xl border border-gray-700 text-gray-300 hover:bg-[#1A2333] focus:outline-none transition-all"
        :disabled="modelValue >= maxValue"
        :class="{'opacity-50 cursor-not-allowed': modelValue >= maxValue}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Hide number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* Add subtle animation on button press */
button:active:not(:disabled) {
  transform: scale(0.95);
}
</style>
