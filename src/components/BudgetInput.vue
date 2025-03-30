<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue: number | string;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void;
}>();

// Default min to 0 and max to 1,000,000 if not provided
const effectiveMin = props.min !== undefined ? props.min : 0;
const effectiveMax = props.max !== undefined ? props.max : 1000000;

const localValue = ref(props.modelValue || '');
const inputRef = ref<HTMLInputElement | null>(null);

// Format number with commas for display
const formatNumber = (value: number | string): string => {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

// Validate value on mount
onMounted(() => {
  if (localValue.value !== '') {
    const numValue = parseFloat(String(localValue.value));
    if (!isNaN(numValue) && numValue > effectiveMax) {
      localValue.value = effectiveMax;
      emit('update:modelValue', effectiveMax);
    }
  }
});

// Prevent keydown events that would result in invalid input
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const selectionStart = target.selectionStart || 0;
  const selectionEnd = target.selectionEnd || 0;
  const key = event.key;

  // Allow navigation keys, delete, backspace, tab, etc.
  if (event.ctrlKey || event.metaKey ||
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
       'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End'].includes(key)) {
    return;
  }

  // Only allow digits and decimal point
  if (!/^\d$/.test(key) && key !== '.') {
    event.preventDefault();
    return;
  }

  // Prevent multiple decimal points
  if (key === '.' && value.includes('.')) {
    event.preventDefault();
    return;
  }

  // Calculate what the new value would be after this keypress
  const newValue = value.slice(0, selectionStart) + key + value.slice(selectionEnd);

  // Check if adding this digit would exceed max length
  const parts = newValue.split('.');
  if (parts[0] && parts[0].length > 7) {
    event.preventDefault();
    return;
  }

  // Check if the new value would exceed the maximum
  const numValue = parseFloat(newValue);
  if (!isNaN(numValue) && numValue > effectiveMax) {
    event.preventDefault();
    return;
  }
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  // Remove non-numeric characters except decimal point
  value = value.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit integer part to 7 digits (1,000,000 has 7 digits)
  if (parts[0] && parts[0].length > 7) {
    parts[0] = parts[0].substring(0, 7);
    value = parts.join('.');
  }

  // Immediately check if value exceeds max while typing
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    // Apply min/max constraints in real-time
    if (numValue < effectiveMin) {
      numValue = effectiveMin;
      value = String(effectiveMin);
    }
    if (numValue > effectiveMax) {
      numValue = effectiveMax;
      value = String(effectiveMax);
    }
  }

  // Update the input field directly to enforce max limit during typing
  if (target.value !== value) {
    target.value = value;
  }

  localValue.value = value;
  emit('update:modelValue', value === '' ? '' : numValue || value);
};
</script>

<template>
  <div class="form-group">
    <label class="block text-gray-300 font-medium mb-2">Budget</label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-400">$</span>
      </div>
      <input
        ref="inputRef"
        type="text"
        :value="localValue"
        @input="handleInput"
        @keydown="handleKeyDown"
        maxlength="9"
        placeholder="Enter your budget"
        class="form-input pl-8 w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition"
      />
    </div>
      <p class="text-xs text-gray-400 mb-2">
        <span class="text-purple-400">*</span> Enter your maximum budget for this trip (max: $1,000,000)
      </p>
  </div>
</template>
