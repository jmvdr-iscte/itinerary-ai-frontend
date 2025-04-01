<script setup lang="ts">
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string; // Expected format: "YYYY-MM-DDTHH:mm"
  label: string;
  placeholder?: string;
  required?: boolean; // Added
  minDate?: string; // Added prop for min date constraint (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  maxDate?: string; // Added prop for max date constraint (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Get unique component instance ID for aria attributes
const instance = getCurrentInstance();
const _uid = instance?.uid;

// --- Date/Time Formatting and Constraints ---

// Helper to format Date object or string into "YYYY-MM-DDTHH:mm" for input attributes
const formatDateForInputAttribute = (date: Date | string | undefined | null): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  // Check if date is valid before formatting
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  // Use 00:00 if only date part is provided for min, 23:59 for max
  // Or use actual time if full datetime string is provided
  let hours = String(d.getHours()).padStart(2, '0');
  let minutes = String(d.getMinutes()).padStart(2, '0');

   // Basic check if the input string included time - adjust logic if needed
   if (typeof date === 'string' && !date.includes('T')) {
       // If it's likely just a date string, adjust time based on min/max context
       // This logic might need refinement based on how min/max props are used.
       // Defaulting to 00:00 for now. Add logic if end-of-day needed for max.
       hours = '00';
       minutes = '00';
   }


  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Compute the effective min date/time attribute value
const minDateTime = computed(() => {
  if (props.minDate) {
    return formatDateForInputAttribute(props.minDate);
  }
  // Default to current date and time if no minDate prop
  return formatDateForInputAttribute(new Date());
});

// Compute the effective max date/time attribute value
const maxDateTime = computed(() => {
  if (props.maxDate) {
    return formatDateForInputAttribute(props.maxDate);
  }
  // Default to 5 years in the future if no maxDate prop
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5);
  // Set time to end of day for max date if only date was provided? Optional.
  // maxFutureDate.setHours(23, 59, 59, 999);
  return formatDateForInputAttribute(maxFutureDate);
});


// Update function remains simple for native input
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

// Add a ref for the input element itself
const inputElement = ref<HTMLInputElement | null>(null);

// Sync input value if modelValue changes externally
// Needed because native date inputs don't always react perfectly
watch(() => props.modelValue, (newValue) => {
    if (inputElement.value && inputElement.value.value !== newValue) {
        inputElement.value.value = newValue || '';
    }
});

// Set initial value on mount if needed (v-model usually handles this)
// onMounted(() => {
//   if (inputElement.value && props.modelValue) {
//     inputElement.value.value = props.modelValue;
//   }
// });

</script>

<template>
  <div>
    <label
      v-if="props.label"
      :for="`datetime-input-${_uid}`"
      class="block text-sm font-medium text-gray-300 mb-1.5"
    >
      {{ props.label }}
       <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>

      <input
        :id="`datetime-input-${_uid}`"
        ref="inputElement"
        type="datetime-local"
        :value="modelValue" @input="updateValue" :min="minDateTime"
        :max="maxDateTime"
        :placeholder="props.placeholder || 'Select date and time'"
        class="component-input pl-10 appearance-none" :required="props.required"
        :aria-describedby="`datetime-hint-${_uid}`"
        aria-label="Date and time selection"
      />
      </div>

    <p :id="`datetime-hint-${_uid}`" class="mt-1 text-xs text-gray-400">
      Select the date and time.
    </p>
  </div>
</template>

<style scoped>
/* Standard Input Style */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out;
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
   /* Ensure text color applies to the date input value */
   color-scheme: dark; /* Hint for browser styling of native elements */
}
/* Add specific styling for placeholder in date/time input if needed */
.component-input::placeholder {
    @apply text-gray-500 opacity-100; /* Ensure placeholder is visible */
}
/* Style for the displayed date/time value */
.component-input {
    color: theme('colors.gray.200'); /* Or text-gray-100, text-white etc. */
}
/* Add left padding for icon */
.component-input.pl-10 {
    padding-left: 2.5rem; /* 40px */
}

/* Custom styling for the native datetime-local picker indicator in WebKit browsers */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8) brightness(1) contrast(0.9); /* Adjust filter for better visibility on dark bg */
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
  margin-right: 0.25rem; /* Add some space if needed */
}

input[type="datetime-local"]:hover::-webkit-calendar-picker-indicator {
  opacity: 0.8;
}
input[type="datetime-local"]:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
}

/* REMOVED custom focus transform/shadow style */
/* input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
} */
</style>
