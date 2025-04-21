<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps<{
  question: string;
  icon: string;
  options: Record<string, string>;
  currentStep: number;
  totalSteps: number;
  multiple?: boolean;
  selectedAnswer?: string | string[];
}>();

const emit = defineEmits<{
  (e: 'select', option: string, category: string): void;
  (e: 'next'): void; 
  (e: 'prev'): void;
}>();

// Determines if a given option text is currently selected
const isSelected = computed(() => (optionText: string): boolean => {
  const { multiple, selectedAnswer } = props;
  if (!selectedAnswer) {
    return false; // Nothing selected yet
  }
  if (multiple) {
    // Multi-choice: Check if optionText is in the selectedAnswer array
    return Array.isArray(selectedAnswer) && selectedAnswer.includes(optionText);
  } else {
    // Single-choice: Check if optionText matches the selectedAnswer string
    return typeof selectedAnswer === 'string' && selectedAnswer === optionText;
  }
});

// Determines if the "Next" or "Finish" button (for multi-choice) should be disabled
const isNextDisabled = computed((): boolean => {
  // Only relevant for multiple choice questions or the finish button
  if (!props.multiple && props.currentStep !== props.totalSteps - 1) return false;
  // Disable if no answer is selected yet (selectedAnswer is undefined, null, or an empty array)
  return !props.selectedAnswer || (Array.isArray(props.selectedAnswer) && props.selectedAnswer.length === 0);
});

// --- Methods (Kept from updated logic) ---

// Gets the display icon for an option based on its category value
const getOptionIcon = (categoryValue: string): string => {
  const iconMap: Record<string, string> = {
    'ADVENTURE': '🧗', 'CULTURE': '🏛️', 'LOVE': '❤️', 'RELAX': '🏖️',
    'NIGHTLIFE': '🍸', 'WINE': '🍷', 'FAMILY': '👪', 'SHOPPING': '🛒',
    'SPORTS': '🚵', 'NATURE': '🌲', 'BUSINESS': '💼', 'FOOD': '🍽️',
    'RELIGION': '🕌',
  };
  return iconMap[categoryValue] || '✨';
};

// Handles the click on an option button
const handleSelect = (optionText: string, categoryValue: string) => {
  // Emit the selected option text and its category value to the parent
  emit('select', optionText, categoryValue);
};

// Handles the click on the "Next", "Skip", or "Finish" button
const handleNext = () => {
  emit('next');
};

// Handles the click on the "Previous" button
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
        v-for="(categoryValue, optionText) in options"
        :key="optionText"
        @click="handleSelect(optionText, categoryValue)"
        :class="[
            'option-button group w-full', // Base classes from original
            isSelected(optionText) ? 'option-button-selected' : 'bg-white/5 hover:bg-white/10' // Add selection state class dynamically
        ]"
        role="button"
        :aria-pressed="isSelected(optionText)"
      >
        <span class="flex items-center justify-between">
            <span class="flex items-center">
                <span class="mr-3 text-xl opacity-70 group-hover:opacity-100 transition-opacity">{{ getOptionIcon(categoryValue) }}</span>
                {{ optionText }}
            </span>
            <span :class="['text-[#8B5CF6] transition-opacity', isSelected(optionText) ? 'opacity-100' : 'opacity-0']">
                 <svg v-if="isSelected(optionText)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                 </svg>
                 <div v-else class="h-5 w-5"></div>
            </span>
        </span>
      </button>
    </div>

    <div class="mt-8 flex justify-between items-center">
      <button
        v-if="currentStep > 0"
        @click="handlePrev"
        class="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
        aria-label="Previous question"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>
      <div v-else class="w-28"></div>

      <button
        v-if="multiple && currentStep < totalSteps - 1"
        @click="handleNext"
        :disabled="isNextDisabled"
        :class="[
            'flex items-center transition-colors focus:outline-none',
             isNextDisabled
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white'
        ]"
        aria-label="Next question"
       >
        Next
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
           <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
         </svg>
      </button>
      <button
        v-else-if="!multiple && currentStep < totalSteps - 1"
        @click="handleNext"
        class="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
        aria-label="Skip question"
       >
        Skip
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
           <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
         </svg>
      </button>
      <button
          v-else-if="currentStep === totalSteps - 1"
          @click="handleNext"
           :disabled="isNextDisabled"
           :class="[
            'flex items-center transition-colors focus:outline-none',
             isNextDisabled
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-green-400 hover:text-green-300'
           ]"
          aria-label="Finish questionnaire"
        >
        Finish
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
      </button>
       <div v-else class="w-28"></div>
    </div>
  </div>
</template>

<style scoped>
/* Styles exactly as you provided initially */
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

/* Original Option button base style */
.option-button {
    @apply flex items-center justify-between p-4 rounded-lg border border-transparent text-white text-lg;
    transition: background-color 0.2s ease, border-color 0.2s ease;
}
/* Added style for selected state - adjust as needed */
.option-button-selected {
    @apply border-[#8B5CF6]/80 bg-[#8B5CF6]/20; /* Example: purple border and light purple bg */
}

/* Mobile-specific styles from original */
@media (max-width: 640px) {
  .option-button {
    @apply py-3 px-4 text-base; /* Keep original mobile padding/text */
  }

  h3 {
    @apply text-xl mb-6; /* Keep original mobile heading style */
  }
}

/* Tablet-specific styles from original */
@media (min-width: 641px) and (max-width: 1023px) {
  .option-button {
    @apply py-3.5 px-5 text-lg; /* Keep original tablet padding/text */
  }
}
</style>