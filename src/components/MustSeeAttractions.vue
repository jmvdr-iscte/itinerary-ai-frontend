<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string[];
  apiKey?: string;
  destination?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const attractions = ref<{address: string, name: string}[]>(
  props.modelValue?.map(address => ({ address, name: extractNameFromAddress(address) })) ||
  [{ address: '', name: '' }]
);

const isLoading = ref(false);
const errorMessage = ref('');
const placesAutocompletes = ref<any[]>([]);
const inputElements = ref<HTMLInputElement[]>([]);
const isApiLoaded = ref(false);
const isExpanded = ref(false);
const apiLoadAttempted = ref(false);

// Computed property to determine if component should be visible
const isVisible = computed(() => {
  return !!props.destination && props.destination.trim() !== '';
});

// Extract a name from an address (e.g., "Eiffel Tower, Paris" -> "Eiffel Tower")
function extractNameFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  return parts[0].trim();
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && JSON.stringify(newValue) !== JSON.stringify(attractions.value.map(a => a.address).filter(Boolean))) {
    attractions.value = newValue.map(address => ({
      address,
      name: extractNameFromAddress(address)
    }));
  }
});

// Watch for changes to destination to update autocomplete restrictions
watch(() => props.destination, (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    // Reset attractions if destination changes significantly
    if (oldValue && oldValue !== newValue) {
      attractions.value = [{ address: '', name: '' }];
      updateValue();
    }

    // Initialize or reinitialize autocompletes with new destination bias
    if (isApiLoaded.value) {
      nextTick(() => {
        initPlacesAutocompletes();
      });
    } else if (!apiLoadAttempted.value) {
      // Try to load API if not already loaded and not attempted
      apiLoadAttempted.value = true;
      loadGoogleMapsAPI().then(() => {
        nextTick(() => {
          initPlacesAutocompletes();
        });
      }).catch(error => {
        console.error('Failed to load Google Maps API:', error);
        errorMessage.value = 'Failed to load Google Maps API. Please try refreshing the page.';
        isLoading.value = false;
      });
    }
  }
});

// Update the model value when attractions change
const updateValue = () => {
  const validAttractions = attractions.value
    .map(a => a.address)
    .filter(Boolean);

  emit('update:modelValue', validAttractions);
};

// Add a new attraction input field
const addAttraction = () => {
  if (attractions.value.length < 10) {
    attractions.value.push({ address: '', name: '' });

    // Initialize autocomplete for the new field after DOM update
    nextTick(() => {
      if (isApiLoaded.value && inputElements.value.length === attractions.value.length) {
        initPlacesAutocomplete(inputElements.value[attractions.value.length - 1], attractions.value.length - 1);
      }
    });
  }
};

// Remove an attraction
const removeAttraction = (index: number) => {
  // Clean up autocomplete
  if (placesAutocompletes.value[index]) {
    try {
      window.google?.maps?.event.clearInstanceListeners(placesAutocompletes.value[index]);
    } catch (error) {
      console.error('Error clearing autocomplete listeners:', error);
    }
    placesAutocompletes.value[index] = null;
  }

  attractions.value.splice(index, 1);
  placesAutocompletes.value.splice(index, 1);

  // Ensure we always have at least one input
  if (attractions.value.length === 0) {
    attractions.value.push({ address: '', name: '' });
    nextTick(() => {
      if (isApiLoaded.value && inputElements.value.length > 0) {
        initPlacesAutocomplete(inputElements.value[0], 0);
      }
    });
  }

  updateValue();
};

// Initialize Places Autocomplete for a specific input
const initPlacesAutocomplete = (inputElement: HTMLInputElement, index: number) => {
  if (!window.google || !window.google.maps || !window.google.maps.places || !inputElement) {
    console.log('Google Maps API not fully loaded or input element not available');
    return;
  }

  try {
    // Clean up existing autocomplete if any
    if (placesAutocompletes.value[index]) {
      window.google.maps.event.clearInstanceListeners(placesAutocompletes.value[index]);
    }

    // Fix: Use only one type instead of mixing multiple types
    // According to the error: "establishment cannot be mixed with other types"
    const options: any = {
      // Use only 'establishment' which is the most general type
      types: ['establishment'],
      fields: ['name', 'formatted_address', 'place_id', 'geometry']
    };

    // If destination is provided, use it to restrict results
    if (props.destination) {
      // Set the placeholder to guide users
      inputElement.setAttribute('placeholder', `Enter attraction in ${props.destination}`);

      // Try to restrict results to the destination area if possible
      try {
        // Create a session token for better billing
        const sessionToken = new window.google.maps.places.AutocompleteSessionToken();
        options.sessionToken = sessionToken;
      } catch (error) {
        console.error('Error creating session token:', error);
      }
    }

    placesAutocompletes.value[index] = new window.google.maps.places.Autocomplete(inputElement, options);

    // Update attraction when a place is selected
    placesAutocompletes.value[index].addListener('place_changed', () => {
      const place = placesAutocompletes.value[index].getPlace();

      if (!place.geometry) {
        console.error('No geometry for this place');
        return;
      }

      // Update the attraction
      attractions.value[index] = {
        address: place.formatted_address || place.name,
        name: place.name
      };

      updateValue();

      // Add another field if this is the last one and we have fewer than 3
      if (index === attractions.value.length - 1 && attractions.value.length < 3) {
        addAttraction();
      }
    });
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
    errorMessage.value = 'Error initializing attraction search.';
    isLoading.value = false;
  }
};

// Initialize all Places Autocompletes
const initPlacesAutocompletes = () => {
  // Make sure we have input elements before trying to initialize
  if (!inputElements.value || inputElements.value.length === 0) {
    console.log('No input elements available yet');
    return;
  }

  inputElements.value.forEach((element, index) => {
    if (element) {
      initPlacesAutocomplete(element, index);
    }
  });

  // Ensure loading state is turned off
  isLoading.value = false;
};

// Check if Google Maps API is already loaded
const isGoogleMapsLoaded = () => {
  return window.google && window.google.maps && window.google.maps.places;
};

// Load Google Maps API script
const loadGoogleMapsAPI = () => {
  // If API is already loaded, just return resolved promise
  if (isGoogleMapsLoaded()) {
    isApiLoaded.value = true;
    isLoading.value = false;
    return Promise.resolve();
  }

  // Set loading state
  isLoading.value = true;

  return new Promise<void>((resolve, reject) => {
    // Check if the script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      // Script tag exists but API not ready yet, wait for it
      console.log('Google Maps script tag exists, waiting for it to load');

      // Set a timeout to avoid infinite waiting
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        isLoading.value = false;
        reject(new Error('Google Maps API loading timeout'));
      }, 10000); // 10 second timeout

      const checkInterval = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          isApiLoaded.value = true;
          isLoading.value = false;
          resolve();
        }
      }, 100);

      return;
    }

    console.log('Creating Google Maps script tag');

    // Create script element
    const script = document.createElement('script');
    const apiKey = props.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('No Google Maps API key provided');
      isLoading.value = false;
      reject(new Error('No Google Maps API key provided'));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded');
      // Just because script is loaded doesn't mean API is ready
      const checkApiReady = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkApiReady);
          isApiLoaded.value = true;
          isLoading.value = false;
          resolve();
        }
      }, 100);

      // Set a timeout to avoid infinite waiting
      setTimeout(() => {
        clearInterval(checkApiReady);
        if (!isGoogleMapsLoaded()) {
          isLoading.value = false;
          reject(new Error('Google Maps API not available after script load'));
        }
      }, 5000);
    };

    script.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
      isLoading.value = false;
      errorMessage.value = 'Failed to load Google Maps API. Please check your internet connection.';
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

// Toggle expanded state
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;

  // If expanding and autocomplete not initialized, try to initialize
  if (isExpanded.value && isApiLoaded.value && props.destination) {
    nextTick(() => {
      initPlacesAutocompletes();
    });
  }
};

// Retry loading the API
const retryApiLoad = () => {
  errorMessage.value = '';
  apiLoadAttempted.value = false;

  if (props.destination) {
    loadGoogleMapsAPI()
      .then(() => {
        console.log('Google Maps API loaded successfully on retry');
        nextTick(() => {
          initPlacesAutocompletes();
        });
      })
      .catch(error => {
        console.error('Failed to load Google Maps API on retry:', error);
        errorMessage.value = 'Failed to load Google Maps API. Please try refreshing the page.';
        isLoading.value = false;
      });
  }
};

// Handle manual input without autocomplete
const handleManualInput = (index: number) => {
  // If user types and presses enter, accept the manual input
  if (attractions.value[index].address.trim()) {
    // If no name is extracted, use the address as name
    if (!attractions.value[index].name) {
      attractions.value[index].name = extractNameFromAddress(attractions.value[index].address);
    }

    updateValue();

    // Add another field if this is the last one and we have fewer than 3
    if (index === attractions.value.length - 1 && attractions.value.length < 3) {
      addAttraction();
    }
  }
};

onMounted(() => {
  console.log('MustSeeAttractions component mounted');

  // Only try to load API if destination is provided
  if (props.destination) {
    console.log('Destination provided, loading Google Maps API');
    apiLoadAttempted.value = true;
    loadGoogleMapsAPI()
      .then(() => {
        console.log('Google Maps API loaded successfully');
        nextTick(() => {
          initPlacesAutocompletes();
        });
      })
      .catch(error => {
        console.error('Failed to load Google Maps API:', error);
        errorMessage.value = 'Failed to load Google Maps API. Please try refreshing the page.';
        isLoading.value = false;
      });
  } else {
    console.log('No destination provided, skipping Google Maps API load');
    isLoading.value = false;
  }
});

onUnmounted(() => {
  console.log('MustSeeAttractions component unmounted');

  // Clean up event listeners
  placesAutocompletes.value.forEach(autocomplete => {
    if (autocomplete) {
      try {
        window.google?.maps?.event.clearInstanceListeners(autocomplete);
      } catch (error) {
        console.error('Error clearing autocomplete listeners during unmount:', error);
      }
    }
  });
});

// TypeScript declarations
declare global {
  interface Window {
    google: any;
    googleMapsCheckInterval: number;
  }
}
</script>

<template>
  <div v-if="isVisible" class="form-group">
    <div class="flex justify-between items-center mb-2">
      <div>
        <label class="block text-gray-300 font-medium mb-2">Must-See Attractions</label>
        <p class="text-xs text-gray-400">Add up to 3 attractions you don't want to miss (Optional)</p>
      </div>
      <button
        type="button"
        @click="toggleExpanded"
        class="text-sm text-purple-400 hover:text-purple-300 flex items-center"
      >
        {{ isExpanded ? 'Hide' : 'Show' }}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" :class="{ 'rotate-180': isExpanded }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div v-if="isExpanded" class="space-y-3 animate-expand-vertical">
      <div v-for="(attraction, index) in attractions" :key="index" class="relative">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </span>
          <input
            :ref="el => { if (el) inputElements[index] = el }"
            v-model="attraction.address"
            @input="updateValue"
            @keydown.enter="handleManualInput(index)"
            type="text"
            :placeholder="`Enter attraction in ${destination || 'your destination'}`"
            class="w-full pl-10 pr-10 p-3 rounded-xl bg-[#1E293B] text-white border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 transition"
            :disabled="isLoading"
          >
          <button
            v-if="attractions.length > 1"
            type="button"
            @click="removeAttraction(index)"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-400 transition-colors"
            title="Remove attraction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add button -->
      <div v-if="attractions.length < 3" class="flex justify-center">
        <button
          type="button"
          @click="addAttraction"
          class="flex items-center px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add another attraction
        </button>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="mt-2 text-center py-2" aria-live="polite">
        <div class="inline-block w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-2 text-sm text-gray-300">Loading...</span>
      </div>

      <!-- Error message with retry button -->
      <div v-if="errorMessage" class="mt-2 text-red-400 text-sm" role="alert" aria-live="assertive">
        {{ errorMessage }}
        <button
          @click="retryApiLoad"
          class="ml-2 text-purple-400 hover:text-purple-300 underline"
        >
          Retry
        </button>
        <p class="mt-1 text-gray-300 text-xs">
          You can still type attractions manually and press Enter to add them.
        </p>
      </div>

      <!-- Tips -->
      <div class="mt-2 p-3 rounded-xl bg-[#1E293B] border border-gray-700">
        <div class="flex items-start">
          <div class="text-yellow-400 mr-2 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-xs text-gray-300">
            <p class="font-medium text-gray-200 mb-1">Tips for better results:</p>
            <ul class="list-disc list-inside space-y-1 text-gray-300">
              <li>Include specific landmarks or attractions</li>
              <li>Add the city name for better accuracy</li>
              <li>These attractions will be prioritized in your itinerary</li>
              <li>Press Enter to manually add an attraction if autocomplete doesn't show what you want</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Collapsed preview -->
    <div v-if="!isExpanded && attractions.some(a => a.address)" class="p-3 rounded-xl bg-[#1E293B] border border-gray-700">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(attraction, index) in attractions.filter(a => a.address)"
          :key="index"
          class="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-sm flex items-center"
        >
          <span class="text-white">{{ attraction.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation for expanding section */
@keyframes expandVertical {
  from { max-height: 0; opacity: 0; }
  to { max-height: 800px; opacity: 1; }
}

.animate-expand-vertical {
  animation: expandVertical 0.3s ease-out forwards;
  overflow: hidden;
}

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
</style>
