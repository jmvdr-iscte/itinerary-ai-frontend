<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string;
  label: string;
  placeholder?: string;
  icon?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const minDate = ref('');
const maxDate = ref('');

onMounted(() => {
  // Set minimum date to today
  const today = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(today.getFullYear() + 2); // Allow booking up to 2 years in the future

  minDate.value = formatDateForInput(today);
  maxDate.value = formatDateForInput(maxFutureDate);
});

// Format date for datetime-local input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="date-time-input">
    <label class="block text-gray-300 font-medium mb-2">{{ label }}</label>
    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
      <input
        :value="modelValue"
        @input="updateValue"
        type="datetime-local"
        :min="minDate"
        :max="maxDate"
        :placeholder="placeholder || ''"
        class="w-full pl-10 p-4 rounded-xl bg-[#1E293B] text-white border border-gray-700 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/50 focus:outline-none transition-all"
      >
    </div>
    <p class="text-xs text-gray-400 mt-1">
      <span class="text-purple-400">*</span> Including specific time improves AI recommendations
    </p>
  </div>
</template>

<style scoped>
/* Custom styling for datetime inputs */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.5;
  cursor: pointer;
}

input[type="datetime-local"]:focus::-webkit-calendar-picker-indicator {
  opacity: 0.8;
}

/* Add subtle animation on focus */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}
</style>
