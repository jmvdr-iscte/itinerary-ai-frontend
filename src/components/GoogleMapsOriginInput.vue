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

const address = ref(props.modelValue);
const showMap = ref(false);
const mapInitialized = ref(false);
const placesAutocomplete = ref(null);
const map = ref(null);
const marker = ref(null);
const mapElement = ref(null);
const inputElement = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedLocation = ref(null);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== address.value) {
    address.value = newValue;
  }
});

// Update the model value when the address changes
const updateValue = () => {
  emit('update:modelValue', address.value);
};

// Toggle map visibility
const toggleMap = () => {
  showMap.value = !showMap.value;

  // Initialize map if it's not already initialized and we're showing it
  if (showMap.value && !mapInitialized.value) {
    initMap();
  }
};

// Initialize Google Maps and Places Autocomplete
const initMap = () => {
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded');
    errorMessage.value = 'Google Maps could not be loaded. Please try again later.';
    return;
  }

  try {
    // Create map centered on a default location (can be adjusted based on user's location)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City

    map.value = new window.google.maps.Map(mapElement.value, {
      center: defaultLocation,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry",
          "stylers": [{ "color": "#242f3e" }]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [{ "color": "#242f3e" }, { "lightness": 10 }]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#746855" }, { "lightness": 40 }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#17263c" }]
        }
      ]
    });

    // Create a marker for the selected location
    marker.value = new window.google.maps.Marker({
      map: map.value,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      position: defaultLocation
    });

    // Update address when marker is dragged
    marker.value.addListener('dragend', () => {
      const position = marker.value.getPosition();
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: { lat: position.lat(), lng: position.lng() } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          address.value = results[0].formatted_address;
          selectedLocation.value = {
            address: results[0].formatted_address,
            lat: position.lat(),
            lng: position.lng()
          };
          updateValue();
          emit('location-selected', selectedLocation.value);
        }
      });
    });

    mapInitialized.value = true;
    errorMessage.value = '';
  } catch (error) {
    console.error('Error initializing map:', error);
    errorMessage.value = 'Error initializing map. Please try again later.';
  }
};

// Initialize Places Autocomplete
const initPlacesAutocomplete = () => {
  if (!window.google || !window.google.maps || !window.google.maps.places || !inputElement.value) {
    return;
  }

  try {
    placesAutocomplete.value = new window.google.maps.places.Autocomplete(inputElement.value, {
      types: ['address'],
      fields: ['formatted_address', 'geometry']
    });

    // Update map and marker when a place is selected
    placesAutocomplete.value.addListener('place_changed', () => {
      const place = placesAutocomplete.value.getPlace();

      if (!place.geometry) {
        console.error('No geometry for this place');
        return;
      }

      // Update the address
      address.value = place.formatted_address;
      selectedLocation.value = {
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      updateValue();
      emit('location-selected', selectedLocation.value);

      // Update the map if it's initialized
      if (mapInitialized.value && map.value && marker.value) {
        map.value.setCenter(place.geometry.location);
        marker.value.setPosition(place.geometry.location);
      }

      // Show the map if it's not already visible
      if (!showMap.value) {
        showMap.value = true;
        // Initialize map if needed
        if (!mapInitialized.value) {
          initMap();
          // Set marker position after map is initialized
          setTimeout(() => {
            if (marker.value && place.geometry) {
              marker.value.setPosition(place.geometry.location);
              map.value.setCenter(place.geometry.location);
            }
          }, 300);
        }
      }
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

// Use current location
const useCurrentLocation = () => {
  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by your browser.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Reverse geocode to get address
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
          isLoading.value = false;

          if (status === 'OK' && results[0]) {
            address.value = results[0].formatted_address;
            selectedLocation.value = {
              address: results[0].formatted_address,
              lat: location.lat,
              lng: location.lng
            };
            updateValue();
            emit('location-selected', selectedLocation.value);

            // Update map if it's initialized
            if (mapInitialized.value && map.value && marker.value) {
              map.value.setCenter(location);
              marker.value.setPosition(location);
            }

            // Show map if not already visible
            if (!showMap.value) {
              showMap.value = true;
              if (!mapInitialized.value) {
                initMap();
                // Set marker position after map is initialized
                setTimeout(() => {
                  if (marker.value) {
                    marker.value.setPosition(location);
                    map.value.setCenter(location);
                  }
                }, 300);
              }
            }
          } else {
            errorMessage.value = 'Could not find address for this location.';
          }
        });
      } else {
        isLoading.value = false;
        errorMessage.value = 'Google Maps API not loaded.';
      }
    },
    (error) => {
      isLoading.value = false;
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage.value = 'Location permission denied.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage.value = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage.value = 'Location request timed out.';
          break;
        default:
          errorMessage.value = 'An unknown error occurred.';
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
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

  if (marker.value) {
    window.google.maps.event.clearInstanceListeners(marker.value);
  }
});
</script>

<template>
  <div class="origin-input">
    <label class="form-label">Origin</label>
    <p class="text-sm text-gray-400 mb-2">Enter your hotel/Airbnb address or a nearby location</p>

    <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </span>
      <input
        ref="inputElement"
        v-model="address"
        @input="updateValue"
        type="text"
        placeholder="Enter your address or search for a location"
        class="form-input pr-20"
        :disabled="isLoading"
      >
      <div class="absolute inset-y-0 right-0 flex items-center">
        <button
          type="button"
          @click="useCurrentLocation"
          class="flex items-center px-2 text-gray-400 hover:text-[#8B5CF6] transition-colors"
          title="Use current location"
          :disabled="isLoading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v10.764a1 1 0 01-1.447.894L15 18M5 18l-4.553-2.276A1 1 0 010 14.618V3.382a1 1 0 011.447-.894L5 4m0 14V4m6 14V4m0 0L5 4" />
          </svg>
        </button>
        <button
          type="button"
          @click="toggleMap"
          class="flex items-center pr-3 text-gray-400 hover:text-[#8B5CF6] transition-colors"
          title="Toggle map view"
          :disabled="isLoading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
      </div>
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

    <!-- Map container -->
    <div
      v-if="showMap"
      class="mt-3 rounded-xl overflow-hidden border border-gray-700 transition-all"
      :class="{'animate-expand-vertical': showMap}"
    >
      <div ref="mapElement" class="w-full h-64"></div>
      <div class="bg-[#0F1629] p-3 text-xs text-gray-400">
        <p class="mb-1"><strong>Privacy Tip:</strong> For privacy reasons, you can select a nearby location instead of your exact address.</p>
        <p>Drag the marker to adjust your location or search for a different address above.</p>
      </div>
    </div>
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

/* Animation for map container */
@keyframes expandVertical {
  from { max-height: 0; opacity: 0; }
  to { max-height: 500px; opacity: 1; }
}

.animate-expand-vertical {
  animation: expandVertical 0.3s ease-out forwards;
}
</style>
