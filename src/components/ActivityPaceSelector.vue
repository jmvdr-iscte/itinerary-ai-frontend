<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'; // Added getCurrentInstance
import { defineProps, defineEmits } from 'vue';

// Get unique component instance ID for aria attributes
const instance = getCurrentInstance();
const _uid = instance?.uid;

const props = defineProps<{
  modelValue: string;
  label?: string;      // Added label prop
  required?: boolean;  // Added required prop
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// --- State ---
// Initialize with modelValue or default to 'MODERATE'
const selectedPace = ref(props.modelValue || 'MODERATE');
const isAnimating = ref(false); // Animation state

// --- Computed Properties ---
// Computed properties for dynamic styling and content based on selectedPace
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
    default: // Fallback to MODERATE
      return {
        icon: '🚶',
        title: 'Balanced Pace',
        description: 'A comfortable mix of activities with time to experience each destination.',
        energy: 66
      };
  }
});

// --- Methods ---
// Update the model value when the pace changes
const updateValue = (pace: string) => {
  selectedPace.value = pace;
  emit('update:modelValue', pace);
};

// Trigger animation when changing pace
const triggerAnimation = (pace: string) => {
  if (pace === selectedPace.value) return; // Don't re-trigger if already selected

  isAnimating.value = true;
  updateValue(pace);

  // Reset animation state after duration
  setTimeout(() => {
    isAnimating.value = false;
  }, 600); // Match animation duration
};

// Ensure initial emit if modelValue was initially undefined/null but defaulted
if (props.modelValue !== selectedPace.value) {
  emit('update:modelValue', selectedPace.value);
}

</script>

<template>
  <div class="form-group">
    <label
      v-if="props.label"
      :id="`activity-pace-label-${_uid}`"
      class="block text-gray-300 font-medium mb-2"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-red-400"> *</span>
    </label>

    <div
      class="grid grid-cols-3 gap-3"
      role="radiogroup"
      :aria-labelledby="props.label ? `activity-pace-label-${_uid}` : undefined"
      :aria-describedby="`pace-hint-${_uid}`"
      :aria-required="props.required ? 'true' : undefined"
    >
      <button
        type="button"
        @click="triggerAnimation('SLOW')"
        class="pace-card"
        :class="{ 'active': selectedPace === 'SLOW' }"
        role="radio"
        :aria-checked="selectedPace === 'SLOW'"
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
        role="radio"
        :aria-checked="selectedPace === 'MODERATE'"
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
        role="radio"
        :aria-checked="selectedPace === 'FAST'"
        aria-label="Select fast pace"
      >
        <div class="text-2xl">🏃</div>
        <div class="text-sm font-medium mt-1">Fast</div>
      </button>
    </div>

    <div class="mt-4 p-4 rounded-xl bg-[#1E293B] border border-gray-700 overflow-hidden">
      <div class="flex items-center">
        <div
          class="text-3xl mr-3 transition-transform duration-600 ease-in-out"
          :class="{ 'animate-bounce': isAnimating }"
        >
          {{ paceInfo.icon }}
        </div>
        <div>
          <h3 class="font-bold text-white">{{ paceInfo.title }}</h3>
          <p class="text-sm text-gray-300">{{ paceInfo.description }}</p>
        </div>
      </div>

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

      <div class="mt-4 grid grid-cols-1 gap-2">
        <div class="flex items-center text-sm">
          <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mr-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span v-if="selectedPace === 'SLOW'">Approx. 2-3 activities per day</span>
          <span v-else-if="selectedPace === 'MODERATE'">Approx. 3-4 activities per day</span>
          <span v-else>Approx. 4-6+ activities per day</span>
        </div>

        <div class="flex items-center text-sm">
          <div class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span v-if="selectedPace === 'SLOW'">Ideal for relaxation and deep exploration</span>
          <span v-else-if="selectedPace === 'MODERATE'">Great balance for most travelers</span>
          <span v-else>Suits energetic travelers wanting to maximize sights</span>
        </div>
      </div>
    </div>

    <p :id="`pace-hint-${_uid}`" class="text-xs text-gray-400 mt-2 mb-2"> Choose how active you want your itinerary to be
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
  background-color: #1E293B; /* bg-slate-800 */
  border: 1px solid #374151; /* border-gray-700 */
  border-radius: 0.75rem; /* rounded-xl */
  transition: all 0.2s ease;
  cursor: pointer;
  color: #E2E8F0; /* text-slate-200 */
}

.pace-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15); /* shadow-lg like purple */
  border-color: #4B5563; /* border-gray-600 */
}

.pace-card.active {
  background-color: #2D3748; /* bg-slate-700 */
  border-color: #8B5CF6; /* border-purple-500 */
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3); /* ring-2 ring-purple-500/30 */
  color: #FFFFFF; /* text-white */
}

/* Keep focus styles minimal if using active state visually */
.pace-card:focus-visible {
   outline: 2px solid #8B5CF6; /* purple-500 */
   outline-offset: 2px;
}


@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); } /* Slightly enhance bounce */
}

.animate-bounce {
  animation: bounce 0.6s ease;
}

/* Ensure icons inside flex divs don't shrink */
.flex-shrink-0 {
    flex-shrink: 0;
}
</style>