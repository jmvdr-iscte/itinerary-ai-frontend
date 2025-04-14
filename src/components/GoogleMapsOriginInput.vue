<script setup lang="ts">
// Original script imports + getCurrentInstance
import { ref, onMounted, onUnmounted, watch, nextTick, getCurrentInstance } from 'vue';
import { defineProps, defineEmits } from 'vue';

// Original global declaration
declare global {
  interface Window {
    google: any;
    googleMapsCheckInterval?: number | undefined; // Make optional/undefined
  }
}

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

// --- Original Refs and Logic (Keep As Is, add types where simple) ---
const address = ref(props.modelValue);
const showMap = ref(false);
const mapInitialized = ref(false);
const placesAutocomplete = ref<google.maps.places.Autocomplete | null>(null); // Added type
const map = ref<google.maps.Map | null>(null); // Added type
const marker = ref<google.maps.Marker | null>(null); // Added type
const mapElement = ref<HTMLElement | null>(null); // Added type
const inputElement = ref<HTMLInputElement | null>(null); // Added type
const isLoading = ref(false);
const errorMessage = ref('');
const errorType = ref('');
const selectedLocation = ref<{ address: string, lat: number, lng: number } | null>(null); // Added type
const isApiLoaded = ref(false);
// --- End Original Refs ---

// --- ADDED Dark Map Style ---
const mapDarkStyle: google.maps.MapTypeStyle[] = [ { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }], }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }], }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }], }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }], }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }], }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }], }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }], }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }], }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }], }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }], }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }], }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }], }, ];
// --- END Dark Map Style ---

// --- Original Watcher (Keep As Is) ---
watch(() => props.modelValue, (newValue) => {
  // Added focus check to prevent disruption
  if (document.activeElement !== inputElement.value) {
      if (newValue !== address.value) {
        address.value = newValue;
      }
  }
});
// --- End Original Watcher ---

// --- Original Methods (Keep As Is, except initMap styles) ---
const updateValue = () => { emit('update:modelValue', address.value); };

const toggleMap = (event?: Event) => { // Make event optional
  if (event) { event.preventDefault(); }
  // Original logic kept
  if (!isApiLoaded.value) { errorMessage.value = 'Google Maps is still loading. Please try again in a moment.'; errorType.value = 'api'; return; }
  showMap.value = !showMap.value;
  if (showMap.value && !mapInitialized.value) { nextTick(() => { initMap(); }); }
};

const initMap = () => {
  // Original checks kept, added optional chaining
  if (!window.google?.maps || !mapElement.value) { console.error('Google Maps API not loaded or map element missing'); errorMessage.value = 'Google Maps could not be loaded. Please try again later.'; errorType.value = 'api'; return; }
  if (mapInitialized.value) return; // Prevent re-init

  try {
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    const initialCenter = selectedLocation.value || defaultLocation;

    map.value = new window.google.maps.Map(mapElement.value, {
      center: initialCenter, zoom: 13, mapTypeControl: false,
      streetViewControl: false, fullscreenControl: false,
      styles: mapDarkStyle // *** COSMETIC CHANGE: Apply dark style ***
    });

    const customIcon = { url: "https://images.tripvibes.me/tripflow_icon_transparent.png", scaledSize: new google.maps.Size(40, 40), origin: new google.maps.Point(0, 0), anchor: new google.maps.Point(20, 40), };
    marker.value = new window.google.maps.Marker({ map: map.value, draggable: true, animation: window.google.maps.Animation.DROP, position: initialCenter, icon: customIcon });

    // Original listener logic kept
    marker.value.addListener('dragend', () => {
      if (!marker.value) return;
      const position = marker.value.getPosition();
       if (!position) return;
      const geocoder = new window.google.maps.Geocoder();
      isLoading.value = true; // Indicate loading
      geocoder.geocode({ location: { lat: position.lat(), lng: position.lng() } }, (results, status) => {
        isLoading.value = false; // Stop loading
        if (status === 'OK' && results?.[0]) {
          address.value = results[0].formatted_address;
          selectedLocation.value = { address: results[0].formatted_address, lat: position.lat(), lng: position.lng() };
          updateValue();
          emit('location-selected', selectedLocation.value);
          errorMessage.value = ''; // Clear error
        } else {
            errorType.value = 'geocode';
            switch(status) {
                case 'ZERO_RESULTS': errorMessage.value = 'No address found for this location. Try a different area.'; break;
                case 'OVER_QUERY_LIMIT': errorMessage.value = 'Too many requests. Please try again later.'; break;
                case 'REQUEST_DENIED': errorMessage.value = 'Location request was denied. Check API key permissions.'; break;
                case 'INVALID_REQUEST': errorMessage.value = 'Invalid location request.'; break;
                default: errorMessage.value = 'Could not find address for this location.';
            }
            errorMessage.value += ' You can still type an address manually.';
        }
      });
    });

    mapInitialized.value = true;
    errorMessage.value = ''; errorType.value = ''; // Clear errors
  } catch (error) {
    console.error('Error initializing map:', error);
    errorMessage.value = 'Unable to initialize the map.'; errorType.value = 'map';
    mapInitialized.value = false; // Reset flag
  }
};

const initPlacesAutocomplete = () => {
  // Original checks kept, added optional chaining
  if (!window.google?.maps?.places || !inputElement.value) { return; }
   if (placesAutocomplete.value) return; // Prevent re-init

  try {
    placesAutocomplete.value = new window.google.maps.places.Autocomplete(inputElement.value, {
      types: ['address'], fields: ['formatted_address', 'geometry']
    });

    // Original listener logic kept
    placesAutocomplete.value.addListener('place_changed', () => {
      if (!placesAutocomplete.value) return;
      const place = placesAutocomplete.value.getPlace();
      if (!place.geometry?.location) { console.error('No geometry'); return; }

      const formattedAddress = place.formatted_address ?? ''; // Use empty string fallback
      address.value = formattedAddress;
      selectedLocation.value = { address: formattedAddress, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      updateValue();
      emit('location-selected', selectedLocation.value);
      errorMessage.value = ''; // Clear error

      if (mapInitialized.value && map.value && marker.value) {
        map.value.setCenter(place.geometry.location);
        marker.value.setPosition(place.geometry.location);
      }
      if (!showMap.value) {
        showMap.value = true;
        if (!mapInitialized.value) {
          nextTick(() => {
            initMap();
            nextTick(() => { // Original nested nextTick
              if (marker.value && place.geometry?.location && map.value) {
                marker.value.setPosition(place.geometry.location);
                map.value.setCenter(place.geometry.location);
              }
            });
          });
        }
      }
    });
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error);
    errorMessage.value = 'Error initializing address search.'; errorType.value = 'autocomplete';
  }
};

const loadGoogleMapsAPI = () => { // Original simple loader logic kept
  if (window.google?.maps?.places) { isApiLoaded.value = true; return Promise.resolve(); }

  return new Promise<void>((resolve, reject) => { // Added Promise<void>
    isLoading.value = true; errorMessage.value = '';

    // Re-check inside promise
     if (window.google?.maps?.places) { isLoading.value = false; isApiLoaded.value = true; resolve(); return; }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      window.googleMapsCheckInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(window.googleMapsCheckInterval); window.googleMapsCheckInterval = undefined;
          isLoading.value = false; isApiLoaded.value = true; resolve();
        }
      }, 100); return;
    }

    const script = document.createElement('script');
    // Original logic assumes key exists here
    const apiKey = props.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true; script.defer = true;
    script.onload = () => { isLoading.value = false; isApiLoaded.value = true; resolve(); };
    script.onerror = () => { isLoading.value = false; errorMessage.value = 'Failed to load Google Maps API.'; errorType.value = 'api'; reject(new Error('Failed to load Google Maps API')); };
    document.head.appendChild(script);
  });
};

const openBrowserSettings = (event?: Event) => { // Original logic kept
   if (event) event.preventDefault();
   const isChrome = navigator.userAgent.indexOf("Chrome") > -1; const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
   if (isChrome) { errorMessage.value = 'In Chrome: Click lock icon > Site settings > Location.'; }
   else if (isFirefox) { errorMessage.value = 'In Firefox: Click shield icon > Protections > Permissions > Location.'; }
   else { errorMessage.value = 'Please check browser settings for location access.'; }
};

const useCurrentLocation = (event?: Event) => { // Original logic kept
   if (event) event.preventDefault();
   if (!navigator.geolocation) { errorMessage.value = 'Geolocation not supported.'; errorType.value = 'browser'; return; }
   isLoading.value = true; errorMessage.value = ''; errorType.value = '';
   navigator.geolocation.getCurrentPosition( (position) => { const location = { lat: position.coords.latitude, lng: position.coords.longitude }; if (window.google?.maps) { const geocoder = new window.google.maps.Geocoder(); geocoder.geocode({ location }, (results, status) => { isLoading.value = false; if (status === 'OK' && results?.[0]) { address.value = results[0].formatted_address; selectedLocation.value = { address: results[0].formatted_address, lat: location.lat, lng: location.lng }; updateValue(); emit('location-selected', selectedLocation.value); errorMessage.value = ''; if (mapInitialized.value && map.value && marker.value) { map.value.setCenter(location); marker.value.setPosition(location); } if (!showMap.value) { showMap.value = true; if (!mapInitialized.value) { nextTick(() => { if(mapElement.value) initMap(); nextTick(() => { if (marker.value && map.value) { marker.value.setPosition(location); map.value.setCenter(location); } }); }); } } } else { errorType.value = 'geocode'; switch(status) { case 'ZERO_RESULTS': errorMessage.value = 'No address found.'; break; case 'OVER_QUERY_LIMIT': errorMessage.value = 'Too many requests.'; break; case 'REQUEST_DENIED': errorMessage.value = 'Location request denied.'; break; case 'INVALID_REQUEST': errorMessage.value = 'Invalid location request.'; break; default: errorMessage.value = 'Could not find address.'; } } }); } else { isLoading.value = false; errorMessage.value = 'Google Maps API not loaded.'; errorType.value = 'api'; } }, (error) => { isLoading.value = false; errorType.value = 'permission'; switch(error.code) { case error.PERMISSION_DENIED: errorMessage.value = 'Location permission denied.'; break; case error.POSITION_UNAVAILABLE: errorMessage.value = 'Location info unavailable.'; break; case error.TIMEOUT: errorMessage.value = 'Location request timed out.'; break; default: errorMessage.value = 'Unknown location error.'; break; } }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } );
};

// Original onMounted/onUnmounted kept
onMounted(async () => {
  try { await loadGoogleMapsAPI(); initPlacesAutocomplete(); }
  catch (error) { console.error('Error loading Google Maps API:', error); }
});
onUnmounted(() => {
  if (placesAutocomplete.value) { window.google?.maps?.event.clearInstanceListeners(placesAutocomplete.value); }
  if (marker.value) { window.google?.maps?.event.clearInstanceListeners(marker.value); }
  if (map.value) { window.google?.maps?.event.clearInstanceListeners(map.value); }
  if (window.googleMapsCheckInterval) { clearInterval(window.googleMapsCheckInterval); window.googleMapsCheckInterval = undefined; }
});
// --- End Original Methods ---

</script>

<template>
  <div> <label v-if="props.label" :for="`origin-input-${_uid}`" class="block text-sm font-medium text-gray-300 mb-1.5">
      {{ props.label || 'Starting Point' }} <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div class="relative">
       <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
         </svg>
      </span>

      <input
        :id="`origin-input-${_uid}`"
        ref="inputElement"
        v-model="address"
        @input="updateValue"
        type="text"
        :placeholder="props.placeholder || 'Enter address or search'"
        class="component-input pl-10 pr-20" :disabled="isLoading" :required="props.required"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `origin-error-${_uid}` : `origin-hint-${_uid}`"
        aria-label="Origin address input"
        autocomplete="off"
      />

      <div class="absolute inset-y-0 right-0 flex items-center pr-1.5 space-x-1">
        <button
          type="button"
          @click="useCurrentLocation"
          class="p-1.5 text-gray-400 rounded-md hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50"
          title="Use current location"
          :disabled="isLoading || !isApiLoaded" aria-label="Use current location"
        >
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /> </svg>
        </button>
        <button
          type="button"
          @click="toggleMap"
          class="p-1.5 text-gray-400 rounded-md hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50"
          title="Toggle map view"
           :disabled="isLoading || !isApiLoaded" :aria-expanded="showMap"
          aria-controls="map-container"
          aria-label="Toggle map view"
        >
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v1.5a1.5 1.5 0 01-1.5 1.5h-1.062a6.007 6.007 0 01-1.888-1.114l-6.5-4.667v-1.598l5.57-.93a1.5 1.5 0 01.93.31z" clip-rule="evenodd" /> </svg>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-start mt-2 text-sm text-gray-400" aria-live="polite">
      <div class="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2"></div>
      Loading...
    </div>

    <div v-if="errorMessage && !isLoading" :id="`origin-error-${_uid}`" class="mt-1.5 flex items-start text-sm text-red-400" role="alert" aria-live="assertive">
       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
       </svg>
       <span>
        {{ errorMessage }}
         <button v-if="errorType === 'permission'" @click="openBrowserSettings" class="ml-1 text-purple-400 hover:text-purple-300 underline focus:outline-none focus:ring-1 focus:ring-purple-500 rounded" type="button"> Update Permissions </button>
         </span>
    </div>

    <p v-if="!errorMessage && !isLoading" :id="`origin-hint-${_uid}`" class="mt-1 text-xs text-gray-400">
       Enter your hotel/Airbnb address or a nearby location.
    </p>

    <div
      v-show="showMap" id="map-container"
      class="mt-3 rounded-lg overflow-hidden border border-white/20" role="region"
      aria-label="Interactive map for origin location"
    >
      <div ref="mapElement" class="w-full h-48 sm:h-64 md:h-72 bg-slate-700"> </div>
      <div class="bg-slate-800/60 backdrop-blur-sm p-3 text-xs text-gray-300 border-t border-white/10"> <p class="mb-1 font-medium"><strong>Privacy Tip:</strong> For privacy reasons, you can select a nearby location instead of your exact address.</p>
        <p class="text-gray-400">Drag the marker to adjust your location or search for a different address above.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- ADDED Standard Input Style --- */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out;
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
   color-scheme: dark; /* Hint for browser styling */
}
.component-input:disabled {
    @apply opacity-60 cursor-not-allowed bg-white/10;
}
.component-input::placeholder {
    @apply text-gray-500 opacity-100;
}
/* Adjust padding for icon and buttons */
/* NOTE: Using pl-10 (original) and pr-20 (previous attempt) based on visual need */
.component-input.pl-10 { padding-left: 2.5rem; } /* 40px */
.component-input.pr-20 { padding-right: 5rem; } /* 80px */
/* --- END Standard Input Style --- */


/* Original :deep styles for Autocomplete */
:deep(.pac-container) { background-color: #1E293B; border: 1px solid #4B5563; border-radius: 0.5rem; margin-top: 0.25rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); font-family: inherit; z-index: 9999 !important; }
:deep(.pac-item) { padding: 0.5rem; color: #E5E7EB; border-top: 1px solid #374151; }
:deep(.pac-item:first-child) { border-top: none; } /* Added */
:deep(.pac-item:hover), :deep(.pac-item-selected) { background-color: #374151; }
:deep(.pac-icon) { filter: invert(0.8); margin-right: 0.5rem; } /* Added margin */
:deep(.pac-item-query) { color: #F3F4F6; font-weight: 500; } /* Added font-weight */
:deep(.pac-matched) { color: #8B5CF6; font-weight: 600; } /* Added font-weight */


/* --- REMOVED Map Animation --- */
/* @keyframes expandVertical { ... } */
/* .animate-expand-vertical { ... } */

/* --- REMOVED Custom focus style --- */
/* input:focus { ... } */


/* Original Touch / Map Control Styles */
:deep(.gm-style .gm-control-active .gm-control-background) { box-shadow: rgb(0 0 0 / 30%) 0px 1px 4px -1px; background-color: #4a5568; border: 1px solid #718096; }
:deep(.gm-style .gm-control-active span) { color: #e2e8f0; }
@media (pointer: coarse) {
  :deep(.gm-style-mtc button), :deep(.gm-style button) { min-height: 36px; min-width: 36px; }
  :deep(.gm-style-mtc) { margin: 10px !important; }
}
</style>
