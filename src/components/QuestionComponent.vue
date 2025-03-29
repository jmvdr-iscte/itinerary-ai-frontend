<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  question: string;
  icon: string;
  options: Record<string, string>;
  currentStep: number;
  totalSteps: number;
}>();

const emit = defineEmits<{
  (e: 'select', option: string, category: string): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}>();

// Get option icon based on category
const getOptionIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    'ADVENTURE': '🧗',
    'CULTURE': '🏛️',
    'LOVE': '❤️',
    'RELAX': '🏖️',
    'NIGHTLIFE': '🍸',
    'WINE': '🍷',
    'FAMILY': '👪',
    'SHOPPING': '🛒',
    'SPORTS': '🚵',
    'NATURE': '🌲',
    'BUSINESS': '💼',
    'FOOD': '🍽️',
    'RELIGION': '🕌',
  };

  return iconMap[category] || '✨';
};

const handleSelect = (option: string, category: string) => {
  emit('select', option, category);
};

const handleNext = () => {
  emit('next');
};

const handlePrev = () => {
  emit('prev');
};
</script>

<template>
  <div class="question-component">
    <div class="flex items-center justify-center mb-6">
      <div class="w-16 h-16 flex items-center justify-center bg-[#8B5CF6]/20 rounded-full border border-[#8B5CF6]/30 animate-pulse-slow">
        <span class="text-4xl">{{ icon }}</span>
      </div>
    </div>

    <h3 class="text-2xl font-semibold text-white text-center mb-8">
      {{ question }}
    </h3>

    <div class="space-y-4">
      <button
        v-for="(category, option) in options"
        :key="option"
        @click="handleSelect(option, category)"
        class="option-button group"
      >
        <span class="flex items-center">
          <span class="mr-3 text-xl opacity-70 group-hover:opacity-100 transition-opacity">{{ getOptionIcon(category) }}</span>
          {{ option }}
        </span>
        <span class="text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>
    </div>

    <!-- Navigation Buttons -->
    <div class="mt-8 flex justify-between">
      <button
        v-if="currentStep > 0"
        @click="handlePrev"
        class="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>
      <div v-else></div>

      <div class="hidden sm:flex space-x-1">
        <span
          v-for="index in totalSteps"
          :key="index-1"
          :class="[
            'w-2 h-2 rounded-full',
            index-1 === currentStep ? 'bg-[#8B5CF6]' : 'bg-gray-600'
          ]"
        ></span>
      </div>

      <button
        v-if="currentStep < totalSteps - 1"
        @click="handleNext"
        class="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        Skip
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      <div v-else></div>
    </div>
  </div>
</template>

<style scoped>
.question-component {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Mobile-specific styles */
@media (max-width: 640px) {
  .option-button {
    @apply py-3 px-4 text-base;
  }

  h3 {
    @apply text-xl mb-6;
  }
}

/* Tablet-specific styles */
@media (min-width: 641px) and (max-width: 1023px) {
  .option-button {
    @apply py-3.5 px-5 text-lg;
  }
}
</style>
