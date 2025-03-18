<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

// Popular destinations for autocomplete
const popularDestinations = [
  'Paris, France',
  'Tokyo, Japan',
  'New York, USA',
  'Rome, Italy',
  'London, UK',
  'Barcelona, Spain',
  'Sydney, Australia',
  'Dubai, UAE',
  'Singapore',
  'Amsterdam, Netherlands'
];
</script>

<template>
  <div class="destination-input">
    <label class="block text-gray-300 font-medium mb-2">Destination</label>
    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </span>
      <input 
        :value="modelValue"
        @input="updateValue"
        type="text" 
        placeholder="Where do you want to go?"
        class="w-full pl-10 p-4 rounded-xl bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/50 focus:outline-none transition-all"
        list="destinations"
      >
      <datalist id="destinations">
        <option v-for="destination in popularDestinations" :key="destination" :value="destination"></option>
      </datalist>
    </div>
  </div>
</template>

<style scoped>
/* Style the datalist dropdown */
input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.5;
}
</style>
