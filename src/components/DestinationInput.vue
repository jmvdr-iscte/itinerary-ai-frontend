<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string;
  apiKey?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'location-selected', location: { address: string, lat: number, lng: number }): void;
}>();

const destination = ref(props.modelValue);
const inputElement = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedLocation = ref(null);
const placesAutocomplete = ref(null);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== destination.value) {
    destination.value = newValue;
  }
});

// Update the model value when the destination changes
const updateValue = () => {
  emit('update:modelValue', destination.value);
};

// Initialize Places Autocomplete
const initPlacesAutocomplete = () => {
  if (!window.google || !window.google.maps || !window.google.maps.places || !inputElement.value) {
    return;
  }

  try {
    placesAutocomplete.value = new window.google.maps.places.Autocomplete(inputElement.value, {
      fields: ['formatted_address', 'geometry', 'name'] // Only request the fields we need
    });

    // Update when a place is selected
    placesAutocomplete.value.addListener('place_changed', () => {
      const place = placesAutocomplete.value.getPlace();

      if (!place.geometry) {
        console.error('No geometry for this place');
        return;
      }

      // Use Google's formatted address directly without any custom formatting
      const formattedAddress = place.formatted_address;

      // Update the destination
      destination.value = formattedAddress;
      selectedLocation.value = {
        address: formattedAddress,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      updateValue();
      emit('location-selected', selectedLocation.value);
    });
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
  }
};

// Load Google Maps API script
const loadGoogleMapsAPI = () => {
  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    isLoading.value = true;

    // Check if the script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      // Wait for the script to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogleMaps);
          isLoading.value = false;
          resolve();
        }
      }, 100);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    const apiKey = props.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoading.value = false;
      resolve();
    };

    script.onerror = () => {
      isLoading.value = false;
      errorMessage.value = 'Failed to load Google Maps API. Please check your internet connection.';
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

onMounted(async () => {
  try {
    await loadGoogleMapsAPI();
    initPlacesAutocomplete();
  } catch (error) {
    console.error('Error loading Google Maps API:', error);
  }
});

onUnmounted(() => {
  // Clean up event listeners
  if (placesAutocomplete.value) {
    window.google.maps.event.clearInstanceListeners(placesAutocomplete.value);
  }
});
</script>

<template>
  <div class="form-group">
    <label class="form-label">Destination</label>
    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </span>
      <input
        ref="inputElement"
        v-model="destination"
        @input="updateValue"
        type="text"
        placeholder="Where do you want to go?"
        class="w-full pl-10 p-3 rounded-xl bg-[#1E293B] text-white border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition"
        :disabled="isLoading"
      >
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="mt-2 text-center py-2">
      <div class="inline-block w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
      <span class="ml-2 text-sm text-gray-300">Loading...</span>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="mt-2 text-red-400 text-sm">
      {{ errorMessage }}
    </div>

    <p class="text-xs text-gray-400 mt-1">Enter any location (e.g., city, landmark, address)</p>
  </div>
</template>

<style scoped>
/* Custom styling for Google Maps autocomplete dropdown */
:deep(.pac-container) {
  background-color: #1E293B;
  border: 1px solid #4B5563;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  font-family: inherit;
  z-index: 9999 !important;
}

:deep(.pac-item) {
  padding: 0.5rem;
  color: #E5E7EB;
  border-top: 1px solid #374151;
}

:deep(.pac-item:hover), :deep(.pac-item-selected) {
  background-color: #374151;
}

:deep(.pac-icon) {
  filter: invert(0.8);
}

:deep(.pac-item-query) {
  color: #F3F4F6;
}

:deep(.pac-matched) {
  color: #8B5CF6;
}

/* Add subtle animation on focus */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}
</style>
