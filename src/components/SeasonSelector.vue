<script setup lang="ts">
import { defineProps, defineEmits, getCurrentInstance } from 'vue';

const props = defineProps<{
  // modelValue should be the single selected string value, or potentially null/empty string if nothing is selected
  modelValue: string; // Keep as string
  options: Array<{ value: string; label: string; icon: string }>;
  label?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  // Correctly define the emit signature to return a single string
  (e: 'update:modelValue', value: string): void;
}>();

const instance = getCurrentInstance();
const _uid = instance?.uid;

// Remove the 'currentSelection' computed property, it's not needed for single select.
// The source of truth is props.modelValue directly.

// Renamed function for clarity - handles selecting a single option
const selectOption = (optionValue: string) => {
  // Standard radio button behavior: clicking always selects the option.
  // Only emit if the value is different to potentially prevent unnecessary updates.
  if (props.modelValue !== optionValue) {
    emit('update:modelValue', optionValue);
  }
  // If you wanted to allow DESELECTING by clicking the selected item again:
  // else {
  //   emit('update:modelValue', ''); // Or null, depends on how you want to represent 'no selection'
  // }
};

// Check selection by comparing directly against the string modelValue
const isSelected = (optionValue: string): boolean => {
  return props.modelValue === optionValue;
};
</script>

<template>
  <div>
    <label
      v-if="props.label"
      :id="`radiolabel-${_uid}`" class="block text-sm font-medium text-gray-300 mb-2"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div
      role="radiogroup" :aria-labelledby="`radiolabel-${_uid}`"
      class="flex flex-wrap gap-2"
    >
      <button
        type="button"
        v-for="option in options"
        :key="option.value"
        role="radio" :aria-checked="isSelected(option.value)" @click="selectOption(option.value)" :class="[
          'inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900',
          isSelected(option.value) // Uses the updated isSelected check
            ? 'bg-purple-600 border-transparent text-white hover:bg-purple-700 shadow-md shadow-purple-900/30' // Selected style
            : 'bg-slate-700/60 border-slate-600 text-gray-300 hover:bg-slate-600/80 hover:border-slate-500 hover:text-gray-100' // Unselected style
        ]"
      >
        <span class="text-lg mr-1.5 -ml-1" aria-hidden="true">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
        </button>
    </div>

    <p class="mt-1.5 text-xs text-gray-400">
       Select the season.
    </p>
    
    <p v-if="false" class="mt-1.5 text-xs text-gray-400">
       Select the season.
    </p>
  </div>
</template>

<style scoped>
/* Keep button font size consistent */
button {
    font-size: inherit;
}
</style>