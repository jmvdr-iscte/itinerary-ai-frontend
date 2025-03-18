<script setup lang="ts">
import { ref, computed } from 'vue';
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
        :placeholder="placeholder || ''"
        class="w-full pl-10 p-4 rounded-xl bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/50 focus:outline-none transition-all"
      >
    </div>
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
