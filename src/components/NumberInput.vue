<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch, getCurrentInstance } from 'vue';

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  label?: string; // Added label prop
  placeholder?: string; // Added placeholder prop
  required?: boolean; // Added required prop (though maybe less relevant for number)
  step?: number; // Optional step for increment/decrement
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void; // Allow emitting null if empty
}>();

// Get unique component instance ID for aria attributes
const instance = getCurrentInstance();
const _uid = instance?.uid;

const stepValue = props.step || 1;
const minValue = props.min ?? 1; // Default min to 1 if not provided
const maxValue = computed(() => props.max ?? 99); // Default max reasonable if not provided

// Use a ref for the internal input value to handle temporary states/validation
const internalValue = ref<string>(props.modelValue.toString());

// Sync internal value when the external modelValue changes
watch(() => props.modelValue, (newValue) => {
  // Avoid updating if the input is currently focused and being edited,
  // unless the external value is drastically different (e.g., reset).
  // For simplicity here, we update directly. Consider focus state if needed.
    if (newValue === null || newValue === undefined) {
        internalValue.value = '';
    } else if (parseInt(internalValue.value, 10) !== newValue) {
         internalValue.value = newValue.toString();
    }
}, { immediate: true }); // Run immediately to set initial value

const increment = () => {
  let currentValue = props.modelValue ?? minValue; // Start from min if null
  let newValue = currentValue + stepValue;
  if (newValue > maxValue.value) {
    newValue = maxValue.value;
  }
  internalValue.value = newValue.toString(); // Update internal display
  emit('update:modelValue', newValue);
};

const decrement = () => {
  let currentValue = props.modelValue ?? minValue; // Start from min if null
  let newValue = currentValue - stepValue;
  if (newValue < minValue) {
    newValue = minValue;
  }
  internalValue.value = newValue.toString(); // Update internal display
  emit('update:modelValue', newValue);
};

// Handle direct input in the text field
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  // Remove non-digit characters
  value = value.replace(/\D/g, '');

  if (value === '') {
    internalValue.value = '';
    emit('update:modelValue', null); // Emit null for empty input
    return;
  }

  let numericValue = parseInt(value, 10); // **FIXED: Use radix 10**

  if (!isNaN(numericValue)) {
    // Enforce min/max constraints
    if (numericValue < minValue) {
      numericValue = minValue;
      // Optionally force update input visual if needed, but v-model should handle it
      // target.value = numericValue.toString();
    } else if (numericValue > maxValue.value) {
      numericValue = maxValue.value;
      // Force update input visual immediately for max constraint
      target.value = numericValue.toString();
    }

    internalValue.value = numericValue.toString();
    // Emit only if the numeric value is different from the current modelValue
    if (props.modelValue !== numericValue) {
       emit('update:modelValue', numericValue);
    }
  } else {
    // If somehow parsing fails after filtering, reset to previous valid state or min
    const fallbackValue = props.modelValue ?? minValue;
    internalValue.value = fallbackValue.toString();
    if(target.value !== internalValue.value) { // Avoid infinite loop if already correct
        target.value = internalValue.value;
    }
     if (props.modelValue !== fallbackValue) {
         emit('update:modelValue', fallbackValue);
     }
  }
};

// Handle blur to finalize value and potentially reset if invalid
const handleBlur = (event: FocusEvent) => {
    const target = event.target as HTMLInputElement;
    let value = internalValue.value;

    if (value === '') {
         emit('update:modelValue', null); // Ensure null is emitted if left empty
         return;
    }

    let numericValue = parseInt(value, 10);

    if (isNaN(numericValue) || numericValue < minValue) {
        numericValue = minValue;
    } else if (numericValue > maxValue.value) {
        numericValue = maxValue.value;
    }

    internalValue.value = numericValue.toString();
    target.value = internalValue.value; // Ensure input shows the validated value

    if (props.modelValue !== numericValue) {
         emit('update:modelValue', numericValue);
    }
};


const isDecrementDisabled = computed(() => (props.modelValue ?? minValue) <= minValue);
const isIncrementDisabled = computed(() => (props.modelValue ?? minValue) >= maxValue.value);

</script>

<template>
  <div>
    <label v-if="props.label" :for="`number-input-${_uid}`" class="block text-sm font-medium text-gray-300 mb-1.5">
      {{ props.label }}
      <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div class="relative">
      <button
        type="button"
        @click="decrement"
        :disabled="isDecrementDisabled"
        class="absolute inset-y-0 left-0 z-10 flex items-center justify-center px-3 text-gray-400 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
        :class="{ 'hover:bg-white/5': !isDecrementDisabled }"
        title="Decrement"
        :aria-controls="`number-input-${_uid}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <input
        :id="`number-input-${_uid}`"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        v-model="internalValue"
        @input="handleInput"
        @blur="handleBlur"
        :min="minValue"
        :max="maxValue.value"
        :placeholder="props.placeholder || '1'"
        class="component-input text-center px-12" :required="props.required"
        aria-label="Number input"
      />

      <button
        type="button"
        @click="increment"
        :disabled="isIncrementDisabled"
        class="absolute inset-y-0 right-0 z-10 flex items-center justify-center px-3 text-gray-400 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
        :class="{ 'hover:bg-white/5': !isIncrementDisabled }"
        title="Increment"
        :aria-controls="`number-input-${_uid}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <p class="mt-1 text-xs text-gray-400">
       Min: {{ minValue }}, Max: {{ maxValue }}
    </p>
  </div>
</template>

<style scoped>
/* Base Input Style (matches other components) */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out; /* Adjusted placeholder color */
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
}
.component-input:disabled {
    @apply opacity-60 cursor-not-allowed bg-white/10;
}
/* Center text and add padding for internal buttons */
.component-input.text-center {
    text-align: center;
}
.component-input.px-12 {
    padding-left: 3rem; /* 48px */
    padding-right: 3rem; /* 48px */
}

/* Remove arrows from input type=number if you were to use it */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}

/* Add subtle animation on button press */
button:active:not(:disabled) {
  transform: scale(0.95);
  transition: transform 0.1s ease-out;
}
</style>s
