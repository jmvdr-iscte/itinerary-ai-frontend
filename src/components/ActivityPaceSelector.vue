<script setup lang="ts">
import { ref, computed } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectedPace = ref(props.modelValue || 'MODERATE');

// Update the model value when the pace changes
const updateValue = (pace: string) => {
  selectedPace.value = pace;
  emit('update:modelValue', pace);
};

// Computed properties for dynamic styling and content
const paceInfo = computed(() => {
  switch (selectedPace.value) {
    case 'SLOW':
      return {
        icon: '🐢',
        title: 'Relaxed Pace',
        description: 'Take it easy with fewer activities and more time to enjoy each location.',
        energy: 33
      };
    case 'MODERATE':
      return {
        icon: '🚶',
        title: 'Balanced Pace',
        description: 'A comfortable mix of activities with time to experience each destination.',
        energy: 66
      };
    case 'FAST':
      return {
        icon: '🏃',
        title: 'Active Pace',
        description: 'Pack in more sights and experiences with an energetic schedule.',
        energy: 100
      };
    default:
      return {
        icon: '🚶',
        title: 'Balanced Pace',
        description: 'A comfortable mix of activities with time to experience each destination.',
        energy: 66
      };
  }
});

// Animation state
const isAnimating = ref(false);

// Trigger animation when changing pace
const triggerAnimation = (pace: string) => {
  if (pace === selectedPace.value) return;

  isAnimating.value = true;
  updateValue(pace);

  setTimeout(() => {
    isAnimating.value = false;
  }, 600);
};
</script>

<template>
  <div class="form-group">
    <label class="block text-gray-300 font-medium mb-2">Activity Pace</label>

    <!-- Pace Selector Cards -->
    <div class="grid grid-cols-3 gap-3">
      <button
        type="button"
        @click="triggerAnimation('SLOW')"
        class="pace-card"
        :class="{ 'active': selectedPace === 'SLOW' }"
        aria-label="Select slow pace"
      >
        <div class="text-2xl">🐢</div>
        <div class="text-sm font-medium mt-1">Slow</div>
      </button>

      <button
        type="button"
        @click="triggerAnimation('MODERATE')"
        class="pace-card"
        :class="{ 'active': selectedPace === 'MODERATE' }"
        aria-label="Select moderate pace"
      >
        <div class="text-2xl">🚶</div>
        <div class="text-sm font-medium mt-1">Moderate</div>
      </button>

      <button
        type="button"
        @click="triggerAnimation('FAST')"
        class="pace-card"
        :class="{ 'active': selectedPace === 'FAST' }"
        aria-label="Select fast pace"
      >
        <div class="text-2xl">🏃</div>
        <div class="text-sm font-medium mt-1">Fast</div>
      </button>
    </div>

    <!-- Interactive Visualization -->
    <div class="mt-4 p-4 rounded-xl bg-[#1E293B] border border-gray-700 overflow-hidden">
      <!-- Pace Icon and Title -->
      <div class="flex items-center">
        <div
          class="text-3xl mr-3"
          :class="{ 'animate-bounce': isAnimating }"
        >
          {{ paceInfo.icon }}
        </div>
        <div>
          <h3 class="font-bold text-white">{{ paceInfo.title }}</h3>
          <p class="text-sm text-gray-300">{{ paceInfo.description }}</p>
        </div>
      </div>

      <!-- Energy Meter -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>Relaxed</span>
          <span>Active</span>
        </div>
        <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            :style="{ width: `${paceInfo.energy}%` }"
          ></div>
        </div>
      </div>

      <!-- Daily Activity Preview -->
      <div class="mt-4 grid grid-cols-1 gap-2">
        <div class="flex items-center text-sm">
          <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span v-if="selectedPace === 'SLOW'">2-3 activities per day</span>
          <span v-else-if="selectedPace === 'MODERATE'">3-4 activities per day</span>
          <span v-else>4-6 activities per day</span>
        </div>

        <div class="flex items-center text-sm">
          <div class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span v-if="selectedPace === 'SLOW'">Perfect for relaxation and deep exploration</span>
          <span v-else-if="selectedPace === 'MODERATE'">Balanced for most travelers</span>
          <span v-else>Ideal for energetic travelers who want to see it all</span>
        </div>
      </div>
    </div>
    <p id="address-hint" class="text-xs text-gray-400 mb-2">
      <span class="text-purple-400">*</span> Choose how active you want your itinerary to be

    </p>
  </div>
</template>

<style scoped>
.pace-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #1E293B;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.pace-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  border-color: #4B5563;
}

.pace-card.active {
  background-color: #2D3748;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: bounce 0.6s ease;
}
</style>
