<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue';
import { defineProps, defineEmits } from 'vue';

// Props and Emits remain the same
const props = defineProps<{
  modelValue: string[];
  apiKey?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxDestinations?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const instance = getCurrentInstance();
const _uid = instance?.uid;
const MAX_DESTINATIONS = props.maxDestinations || 5;

// Refs remain mostly the same
const currentInput = ref('');
const selectedDestinations = ref<string[]>([...props.modelValue]);
const inputElement = ref<HTMLInputElement | null>(null);
const isLoading = ref(false);
const errorMessage = ref('');
const placesAutocomplete = ref<google.maps.places.Autocomplete | null>(null);

// --- NEW Ref ---
// Stores the ISO 3166-1 Alpha-2 country code of the first selected destination
const firstCountryCode = ref<string | null>(null);
// --- END NEW Ref ---


// Computed properties remain the same
const canAddMore = computed(() => selectedDestinations.value.length < MAX_DESTINATIONS);
const inputPlaceholder = computed(() => {
    if (!canAddMore.value) {
        return `Maximum ${MAX_DESTINATIONS} destinations reached`;
    }
    // --- Optionally modify placeholder when restricted ---
    if (firstCountryCode.value) {
         return `Add a destination within ${firstCountryCode.value.toUpperCase()}...`;
    }
    return props.placeholder || 'Add a destination...';
});

// Watcher remains the same
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(selectedDestinations.value)) {
      selectedDestinations.value = [...newValue];
      // --- ADDED: Re-evaluate restriction if modelValue changes externally ---
      if (selectedDestinations.value.length === 0) {
          clearCountryRestriction();
      }
      // Note: Determining the country code *from strings alone* externally is hard.
      // This assumes the first item added *internally* sets the rule.
  }
}, { deep: true });


// --- MODIFIED LOGIC ---

// Function to extract country code from place details
const getCountryCodeFromPlace = (place: google.maps.places.PlaceResult): string | null => {
    if (!place.address_components) {
        console.warn('Address components not available for place:', place.name);
        return null;
    }
    const countryComponent = place.address_components.find(component =>
        component.types.includes('country')
    );
    // Return the short_name (e.g., 'US', 'PT', 'GB')
    return countryComponent?.short_name?.toLowerCase() ?? null; // Use lowercase as recommended
};

// Function to apply country restriction to Autocomplete
const applyCountryRestriction = (countryCode: string | null) => {
    if (!placesAutocomplete.value) return;

    if (countryCode) {
        console.log(`Applying country restriction: ${countryCode}`);
        placesAutocomplete.value.setComponentRestrictions({ country: countryCode });
    } else {
        console.log('Clearing country restriction');
        // Set to null or undefined to clear restrictions
        placesAutocomplete.value.setComponentRestrictions(null);
    }
};

// Function to clear restriction state
const clearCountryRestriction = () => {
     if (firstCountryCode.value !== null) { // Only clear if previously set
        firstCountryCode.value = null;
        applyCountryRestriction(null);
     }
};


// --- MODIFIED: addDestination ---
const addDestination = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !canAddMore.value) {
        console.warn('Cannot add place: No geometry or limit reached.');
        currentInput.value = '';
        return;
    }

    const newAddress = place.formatted_address ?? place.name ?? 'Unknown Address';

    // --- Country Restriction Logic ---
    let currentCountryCode: string | null = null;
    if (selectedDestinations.value.length === 0 && !firstCountryCode.value) {
        // This is the FIRST destination being added
        currentCountryCode = getCountryCodeFromPlace(place);
        if (currentCountryCode) {
            firstCountryCode.value = currentCountryCode; // Store the country code
            applyCountryRestriction(firstCountryCode.value); // Apply restriction for next searches
        } else {
            console.warn("Could not determine country code for the first destination. No restriction applied.");
             // Decide behaviour: prevent adding? or add without restriction?
             // Let's allow adding but warn.
        }
    }
    // --- End Country Restriction Logic ---


    // Prevent duplicates (remains the same)
    if (!selectedDestinations.value.includes(newAddress)) {
        selectedDestinations.value.push(newAddress);
        emit('update:modelValue', selectedDestinations.value);
        currentInput.value = '';
        errorMessage.value = '';
    } else {
        errorMessage.value = 'Destination already added.';
        currentInput.value = '';
    }

    inputElement.value?.focus();
};

// --- MODIFIED: removeDestination ---
const removeDestination = (index: number) => {
  selectedDestinations.value.splice(index, 1);
  emit('update:modelValue', selectedDestinations.value);
  errorMessage.value = '';

  // --- Check if we need to clear the restriction ---
  if (selectedDestinations.value.length === 0) {
      clearCountryRestriction();
  }
};

const initPlacesAutocomplete = () => {
  if (!window.google?.maps?.places || !inputElement.value) {
    console.warn("DestinationInput: Prerequisites not met for initPlacesAutocomplete");
    return;
  }
  if (placesAutocomplete.value) return;

  try {
    placesAutocomplete.value = new window.google.maps.places.Autocomplete(inputElement.value, {
      // --- ADDED 'address_components' to fields ---
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      types: ['(regions)'], // Keep as regions or change to geocode if more appropriate
      // --- Initial restriction is null (no restriction) ---
      componentRestrictions: firstCountryCode.value ? { country: firstCountryCode.value } : undefined
    });

    placesAutocomplete.value.addListener('place_changed', () => {
      if (!placesAutocomplete.value) return;
      const place = placesAutocomplete.value.getPlace();
      addDestination(place); // AddDestination now handles the restriction logic
    });
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
    errorMessage.value = "Failed to initialize search.";
  }
};

// Load Google Maps API script (Unchanged)
const loadGoogleMapsAPI = () => {
   if (window.google?.maps?.places) { return Promise.resolve(); }
   // ... (rest of the function is identical) ...
  return new Promise<void>((resolve, reject) => {
    isLoading.value = true;
    errorMessage.value = '';

     if (window.google?.maps?.places) { isLoading.value = false; resolve(); return; }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkInterval);
          isLoading.value = false;
          resolve();
        }
      }, 100);
       setTimeout(() => {
           if (!window.google?.maps?.places) {
               clearInterval(checkInterval);
               isLoading.value = false;
               errorMessage.value = 'Google Maps API loaded but Places library unavailable.';
               reject(new Error('Places library timeout'));
           }
       }, 10000);
      return;
    }

    const script = document.createElement('script');
    const apiKey = props.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
     if (!apiKey) {
         console.error("DestinationInput: Google Maps API key is missing.");
         errorMessage.value = "API key is missing.";
         isLoading.value = false;
         reject(new Error("API key missing"));
         return;
     }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps?.places) {
          isLoading.value = false;
          resolve();
      } else {
           const checkInterval = setInterval(() => {
                if (window.google?.maps?.places) {
                    clearInterval(checkInterval);
                    isLoading.value = false;
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                if (!window.google?.maps?.places) {
                    clearInterval(checkInterval);
                    isLoading.value = false;
                    errorMessage.value = 'Google Maps API loaded but Places library failed.';
                    reject(new Error('Places library failed post-load'));
                }
            }, 5000);
      }
    };
    script.onerror = (error) => {
        console.error("Error loading Google Maps script:", error);
        isLoading.value = false;
        errorMessage.value = 'Failed to load Google Maps API. Check connection/key.';
        reject(new Error('Failed to load Google Maps API'));
    };
    document.head.appendChild(script);
  });
};


// onMounted and onUnmounted (Unchanged)
onMounted(async () => {
  try {
    await loadGoogleMapsAPI();
    // --- Apply initial restriction if modelValue already has items ---
     if (selectedDestinations.value.length > 0) {
      
        console.warn("Initial modelValue provided. Country restriction will only apply after the *next* addition if starting from empty.");
        // If the list *becomes* empty via external update, watcher handles it.
     }
    initPlacesAutocomplete();
  } catch (error) {
    console.error('Error during component mount:', error);
    if (!errorMessage.value) {
        errorMessage.value = "Failed to initialize component.";
    }
  }
});

onUnmounted(() => {
  if (placesAutocomplete.value && window.google?.maps?.event) {
    window.google.maps.event.clearInstanceListeners(placesAutocomplete.value);
  }
});
// --- END MODIFIED LOGIC ---

</script>

<template>
  <div>
    <label
      v-if="props.label"
      :for="`destination-input-${_uid}`"
      class="block text-sm font-medium text-gray-300 mb-1.5"
    >
      {{ props.label || 'Destinations' }}
      <span v-if="props.required && selectedDestinations.length === 0" class="text-red-400">*</span>
      <span class="text-xs text-gray-400 ml-2">({{ selectedDestinations.length }}/{{ MAX_DESTINATIONS }})</span>
    </label>

    <div v-if="selectedDestinations.length > 0" class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="(address, index) in selectedDestinations"
        :key="`dest-${index}`"
        class="inline-flex items-center bg-gray-600 text-gray-100 text-sm font-medium px-3 py-1 rounded-full"
      >
        {{ address }}
        <button
          @click="removeDestination(index)"
          type="button"
          class="ml-1.5 flex-shrink-0 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-600 focus:ring-purple-500 rounded-full"
          :aria-label="`Remove ${address}`"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </span>
    </div>

    <div v-if="canAddMore || isLoading" class="relative">
       <span v-if="!isLoading" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
       </span>
       <input
         :id="`destination-input-${_uid}`"
         ref="inputElement"
         v-model="currentInput"
         type="text"
         :placeholder="inputPlaceholder"
         class="component-input pl-10"
         :disabled="isLoading || !canAddMore"
         :required="props.required && selectedDestinations.length === 0"
         :aria-invalid="!!errorMessage"
         :aria-describedby="errorMessage ? `destination-error-${_uid}` : (canAddMore ? `destination-hint-${_uid}` : undefined)"
         aria-label="Add destination input"
         autocomplete="off"
       />
     </div>

    <div v-if="isLoading" class="flex items-center justify-start mt-2 text-sm text-gray-400" aria-live="polite">
       <div class="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2"></div>
       Loading Maps...
     </div>
     <div v-if="errorMessage && !isLoading" :id="`destination-error-${_uid}`" class="mt-1.5 flex items-start text-sm text-red-400" role="alert" aria-live="assertive">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
       <span>{{ errorMessage }}</span>
    </div>
    <p v-if="!errorMessage && !isLoading && canAddMore" :id="`destination-hint-${_uid}`" class="mt-1 text-xs text-gray-400">
       Start typing a city, region, or country. After the first selection, suggestions will be limited to that country (up to {{ MAX_DESTINATIONS }} total).
    </p>
     <p v-if="!canAddMore && !isLoading && !errorMessage" class="mt-1 text-xs text-gray-400">
        Maximum number of destinations reached.
    </p>

  </div>
</template>

<style scoped>
/* Styles remain the same */
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

.inline-flex button {
    padding: 2px;
}

:deep(.pac-container) {
  background-color: #1E293B;
  border: 1px solid #4B5563;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  font-family: inherit;
  z-index: 9999 !important;
}
:deep(.pac-item) { padding: 0.6rem 0.75rem; color: #E5E7EB; border-top: 1px solid #374151; cursor: pointer; transition: background-color 0.15s ease-in-out; }
:deep(.pac-item:first-child) { border-top: none; }
:deep(.pac-item:hover) { background-color: #374151; }
:deep(.pac-item-selected) { background-color: #4B5563; }
:deep(.pac-icon) { filter: invert(0.8); margin-right: 0.75rem; vertical-align: middle; }
:deep(.pac-item-query) { color: #F3F4F6; font-size: 0.9rem; font-weight: 500; }
:deep(.pac-matched) { color: #A78BFA; font-weight: 600; }
:deep(.pac-item span:not(.pac-item-query):not(.pac-matched)) { color: #9CA3AF; font-size: 0.85rem; margin-left: 0.25rem; }
</style>