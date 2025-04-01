<script setup lang="ts">
// Original script imports + getCurrentInstance
import { ref, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue';
import { defineProps, defineEmits } from 'vue';

// --- ADDED Props ---
const props = defineProps<{
  modelValue: string;
  apiKey?: string;
  label?: string; // Added
  placeholder?: string; // Added
  required?: boolean; // Added
}>();
// --- END ADDED Props ---

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'location-selected', location: { address: string, lat: number, lng: number }): void;
}>();

// --- ADDED UID ---
const instance = getCurrentInstance();
const _uid = instance?.uid;
// --- END ADDED UID ---

// --- Original Refs and Logic (Kept As Is, added types) ---
const destination = ref(props.modelValue);
const inputElement = ref<HTMLInputElement | null>(null); // Added type hint
const isLoading = ref(false);
const errorMessage = ref('');
const selectedLocation = ref<{ address: string, lat: number, lng: number } | null>(null); // Added type hint
const placesAutocomplete = ref<google.maps.places.Autocomplete | null>(null); // Added type hint

// Watch for external changes to modelValue (Original Logic)
watch(() => props.modelValue, (newValue) => {
  if (newValue !== destination.value) {
    destination.value = newValue;
  }
});

// Update the model value when the destination changes (Original Logic)
const updateValue = () => {
  emit('update:modelValue', destination.value);
};

// Initialize Places Autocomplete (Original Logic)
const initPlacesAutocomplete = () => {
  // Using optional chaining for safety based on original logic
  if (!window.google?.maps?.places || !inputElement.value) {
    console.warn("DestinationInput: Prerequisites not met for initPlacesAutocomplete");
    return;
  }
  if (placesAutocomplete.value) return; // Prevent re-init

  try {
    placesAutocomplete.value = new window.google.maps.places.Autocomplete(inputElement.value, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['(regions)'],
    });

    placesAutocomplete.value.addListener('place_changed', () => {
      if (!placesAutocomplete.value) return;
      const place = placesAutocomplete.value.getPlace();
      if (!place.geometry?.location) { console.error('No geometry for this place'); return; }

      const formattedAddress = place.formatted_address ?? ''; // Fallback to empty string
      destination.value = formattedAddress;
      selectedLocation.value = {
        address: formattedAddress,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      updateValue();
      emit('location-selected', selectedLocation.value);
      errorMessage.value = ''; // Clear error on success
    });
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
    errorMessage.value = "Failed to initialize search."; // Set error message
  }
};

// Load Google Maps API script (Original Logic)
const loadGoogleMapsAPI = () => {
  if (window.google?.maps?.places) { return Promise.resolve(); }

  return new Promise<void>((resolve, reject) => { // Added Promise<void> type
    isLoading.value = true;
    errorMessage.value = '';

    // Re-check inside promise
     if (window.google?.maps?.places) { isLoading.value = false; resolve(); return; }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogleMaps);
          isLoading.value = false;
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    const apiKey = props.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => { isLoading.value = false; resolve(); };
    script.onerror = () => { isLoading.value = false; errorMessage.value = 'Failed to load Google Maps API. Please check connection/key.'; reject(new Error('Failed to load Google Maps API')); };
    document.head.appendChild(script);
  });
};

// Original onMounted (Keep As Is)
onMounted(async () => {
  try {
    await loadGoogleMapsAPI();
    // Original logic inits immediately after load resolves
    initPlacesAutocomplete();
  } catch (error) {
    console.error('Error loading Google Maps API:', error);
    if (!errorMessage.value) { errorMessage.value = "Failed to initialize."; }
  }
});

// Original onUnmounted (Keep As Is, added optional chaining)
onUnmounted(() => {
  if (placesAutocomplete.value) {
    window.google?.maps?.event.clearInstanceListeners(placesAutocomplete.value);
  }
});
// --- End Original Logic ---

</script>

<template>
  <div> <label
      v-if="props.label"
      :for="`destination-input-${_uid}`"
      class="block text-sm font-medium text-gray-300 mb-1.5"
    >
      {{ props.label || 'Destination' }} <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </span>

      <input
        :id="`destination-input-${_uid}`"
        ref="inputElement"
        v-model="destination"
        @input="updateValue"
        type="text"
        :placeholder="props.placeholder || 'Where do you want to go?'"
        class="component-input pl-10" :disabled="isLoading" :required="props.required"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `destination-error-${_uid}` : `destination-hint-${_uid}`"
        aria-label="Destination input"
        autocomplete="off"
      />
    </div>

    <div v-if="isLoading" class="flex items-center justify-start mt-2 text-sm text-gray-400" aria-live="polite">
      <div class="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2"></div>
      Loading...
    </div>

    <div v-if="errorMessage && !isLoading" :id="`destination-error-${_uid}`" class="mt-1.5 flex items-start text-sm text-red-400" role="alert" aria-live="assertive">
       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
       </svg>
       <span>{{ errorMessage }}</span>
       </div>

    <p v-if="!errorMessage && !isLoading" :id="`destination-hint-${_uid}`" class="mt-1 text-xs text-gray-400">
       Enter a city, state, or country. For example: "New York, NY" or "Tokyo, Japan".
   </p>

  </div>
</template>

<style scoped>
/* --- ADDED Standard Input Style --- */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out;
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
}
.component-input:disabled {
    @apply opacity-60 cursor-not-allowed bg-white/10;
}
.component-input::placeholder {
    @apply text-gray-500 opacity-100;
}
.component-input.pl-10 {
    padding-left: 2.5rem; /* 40px */
}
/* --- END ADDED Standard Input Style --- */

/* Original :deep styles */
:deep(.pac-container) {
  background-color: #1E293B;
  border: 1px solid #4B5563;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  font-family: inherit;
  z-index: 9999 !important;
}
:deep(.pac-item) { padding: 0.5rem; color: #E5E7EB; border-top: 1px solid #374151;}
:deep(.pac-item:first-child) { border-top: none; } /* Added */
:deep(.pac-item:hover), :deep(.pac-item-selected) { background-color: #374151; }
:deep(.pac-icon) { filter: invert(0.8); margin-right: 0.5rem; } /* Added margin */
:deep(.pac-item-query) { color: #F3F4F6; font-weight: 500; } /* Added font-weight */
:deep(.pac-matched) { color: #8B5CF6; font-weight: 600; } /* Added font-weight */

/* --- REMOVED Custom focus style --- */
/*
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}
*/
</style>
