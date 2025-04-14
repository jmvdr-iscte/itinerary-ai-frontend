<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

// --- Define Props ---
// Uses defineProps for type safety and v-model compatibility
const props = defineProps<{
  modelValue: string; // Required for v-model
  label?: string;
  placeholder?: string;
  maxLength?: number;
  id?: string; // Optional custom ID
}>();

// --- Define Emits ---
// Defines the event emitted for v-model updates
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// --- Component Logic ---
// Get unique ID for accessibility if no ID prop is provided
const instance = getCurrentInstance();
const uid = instance?.uid;
const inputId = computed(() => props.id || `ideal-trip-description-${uid}`);

// Compute character count
const characterCount = computed(() => props.modelValue?.length || 0);

const effectiveMaxLength = computed(() => props.maxLength ?? 256);

// Handle input event to emit update for v-model
// Using computed setter for v-model would also work, but direct emit is fine here.
function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

</script>

<template>
  <div>
    <label
      v-if="props.label"
      :for="inputId"
      class="block text-sm font-medium text-gray-300 mb-1.5"
    >
      {{ props.label }} <span class="text-gray-400 font-normal">(Optional)</span>
    </label>

    <textarea
      :id="inputId"
      :value="props.modelValue"  
      @input="onInput"           
      :maxlength="effectiveMaxLength"
      :placeholder="props.placeholder || 'Tell us about your perfect getaway... activities, vibe, interests'"
      rows="4"
      class="component-input"
      :aria-label="props.label || 'Describe your ideal trip (Optional)'"
      :aria-describedby="`${inputId}-counter`" 
    ></textarea>

    <p
      :id="`${inputId}-counter`"
      class="mt-1.5 text-xs text-gray-400 text-right"
      aria-live="polite" 
    >
      {{ characterCount }} / {{ effectiveMaxLength }} characters
    </p>
  </div>
</template>

<style scoped>
/* Scoped styles ensure they only apply to this component */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out leading-relaxed; /* Added leading-relaxed */
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
  @apply disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-white/10;
}
.component-input::placeholder {
  @apply text-gray-500 opacity-100;
}
</style>