<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const minValue = props.min || 1;
const maxValue = computed(() => Math.min(props.max ?? 20));

const tempValue = ref(props.modelValue.toString());

watch(() => props.modelValue, (newValue) => {
  tempValue.value = newValue.toString();
});

const increment = () => {
  if (props.modelValue < maxValue.value) {
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
  const value = target.value.trim();

  // Prevent non-numeric input
  if (!/^\d*$/.test(value)) {
    tempValue.value = props.modelValue.toString();
    return;
  }

  let numericValue = parseInt(value, 20);

  if (!isNaN(numericValue)) {
    // Enforce min and max constraints
    if (numericValue < minValue) {
      numericValue = minValue;
    } else if (numericValue > maxValue.value) {
      numericValue = maxValue.value;
    }

    tempValue.value = numericValue.toString();
    emit('update:modelValue', numericValue);
  } else {
    tempValue.value = "";
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
          v-model="tempValue"
          @input="updateValue"
          type="text"
          class="w-full p-4 text-center bg-[#0F1629] text-white border-t border-b border-gray-700 focus:outline-none"
        >
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
