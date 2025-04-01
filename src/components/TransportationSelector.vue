<script setup lang="ts">
import { defineProps, defineEmits, getCurrentInstance, computed } from 'vue';

const props = defineProps<{
  // Defensively allow null/undefined from parent, although parent should ideally always provide an array
  modelValue: string[] | null | undefined;
  options: Array<{ value: string; label: string; icon: string }>;
  label?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const instance = getCurrentInstance();
const _uid = instance?.uid;

// Create a computed property that ALWAYS returns a valid array,
// guarding against null/undefined props.modelValue from the parent.
const currentSelection = computed<string[]>(() => {
  // If props.modelValue is an array, use it, otherwise default to an empty array.
  return Array.isArray(props.modelValue) ? props.modelValue : [];
});

const toggleOption = (optionValue: string) => {
  // 1. Use the safe 'currentSelection' computed property as the base.
  const baseArray = currentSelection.value;
  // 2. Create a new array copy to avoid mutating the computed result directly.
  const newValueArray = [...baseArray];

  const index = newValueArray.indexOf(optionValue);

  if (index === -1) {
    newValueArray.push(optionValue); // Add
  } else {
    newValueArray.splice(index, 1); // Remove
  }

  // 3. Log *before* emitting.
  console.log(`TransportationSelector: Emitting update:modelValue - ${JSON.stringify(newValueArray)}`);

  // 4. Emit the new array.
  emit('update:modelValue', newValueArray);
};

// Check selection based on the safe 'currentSelection' computed property.
const isSelected = (optionValue: string): boolean => {
  return currentSelection.value.includes(optionValue);
};
</script>

<template>
  <div>
    <label
      v-if="props.label"
      :id="`transport-label-${_uid}`"
      class="block text-sm font-medium text-gray-300 mb-2"
    >
      {{ props.label }}
       <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div
      role="group"
      :aria-labelledby="`transport-label-${_uid}`"
      class="flex flex-wrap gap-2"
    >
      <button
        type="button"
        v-for="option in options"
        :key="option.value"
        role="checkbox"
        :aria-checked="isSelected(option.value)"
        @click="toggleOption(option.value)"
        :class="[
          'inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150 ease-in-out', // Base pill shape/style
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900', // Standard focus
          isSelected(option.value) // Use isSelected based on computed prop
            ? 'bg-purple-600 border-transparent text-white hover:bg-purple-700 shadow-md shadow-purple-900/30' // Selected style
            : 'bg-slate-700/60 border-slate-600 text-gray-300 hover:bg-slate-600/80 hover:border-slate-500 hover:text-gray-100' // Unselected style
        ]"
      >
        <span class="text-lg mr-1.5 -ml-1" aria-hidden="true">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
        <span v-if="isSelected(option.value)" class="sr-only">(selected)</span>
      </button>
    </div>

     <p class="mt-1.5 text-xs text-gray-400">
       Select one or more preferred methods of transportation.
    </p>
  </div>
</template>

<style scoped>
/* Keep button font size consistent */
button {
    font-size: inherit;
}
</style>
