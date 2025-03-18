<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  currentStep: number;
  totalSteps: number;
  percentage: number;
}>();

const emit = defineEmits<{
  (e: 'update', step: number): void;
}>();

const goToStep = (step: number) => {
  if (step >= 0 && step < props.totalSteps) {
    emit('update', step);
  }
};
</script>

<template>
  <div class="progress-indicator">
    <!-- Linear Progress Bar -->
    <div class="mt-6 progress-bar">
      <div 
        class="progress-bar-fill"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
    
    <!-- Step Indicators -->
    <div class="flex justify-between text-xs text-white/60 mt-1">
      <span>Start</span>
      <span>Question {{ currentStep + 1 }} of {{ totalSteps }}</span>
      <span>Finish</span>
    </div>
    
    <!-- Interactive Step Dots (Desktop/Tablet) -->
    <div class="hidden sm:flex justify-center space-x-2 mt-4">
      <button 
        v-for="index in totalSteps" 
        :key="index-1"
        @click="goToStep(index-1)"
        :class="[
          'w-3 h-3 rounded-full transition-all',
          index-1 === currentStep 
            ? 'bg-[#8B5CF6] scale-110' 
            : index-1 < currentStep 
              ? 'bg-[#8B5CF6]/50 hover:bg-[#8B5CF6]/70' 
              : 'bg-gray-600 hover:bg-gray-500'
        ]"
        :title="`Go to question ${index}`"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  @apply w-full bg-[#0F1629]/50 h-2 rounded-full overflow-hidden;
}

.progress-bar-fill {
  @apply h-full bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] transition-all duration-500 ease-out;
}

/* Add subtle pulse animation to current step dot */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1); }
}

.scale-110 {
  animation: pulse-dot 2s ease-in-out infinite;
}
</style>
