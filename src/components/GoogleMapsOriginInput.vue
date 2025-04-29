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

// --- Icon Definitions (Plain Objects) ---
const standardIconDefinition = {
    url: "https://images.tripvibes.me/tripflow_icon_transparent.png",
    scaledSize: { width: 40, height: 40 },
    origin: { x: 0, y: 0 },
    anchor: { x: 20, y: 40 },
};
const hotelIconDefinition = {
   pathString: 'CIRCLE', // Using string placeholder for SymbolPath
   fillColor: '#a78bfa', // Lighter purple
   fillOpacity: 1,
   scale: 8,
   strokeColor: '#ffffff',
   strokeWeight: 1.5,
   anchor: { x: 0, y: 0 }, // Anchor for symbol (may need adjustment)
};

// Variables to hold the computed google.maps icon objects
let computedStandardIcon: any = null;
let computedHotelIcon: any = null;


// --- ADDED Dark Map Style ---
const mapDarkStyle: google.maps.MapTypeStyle[] = [ { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }], }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }], }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }], }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }], }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }], }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }], }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }], }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }], }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }], }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }], }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }], }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }], }, ];
// --- END Dark Map Style ---

// --- Original Watcher ---
watch(() => props.modelValue, (newValue) => {
  if (document.activeElement !== inputElement.value) {
      if (newValue !== address.value) {
        address.value = newValue;
        // Reset icon if model changes externally and map is initialized
        if (marker.value && computedStandardIcon) {
             marker.value.setIcon(computedStandardIcon);
        }
      }
  }
});
// --- End Original Watcher ---

// --- Original Methods ---
const updateValue = () => { emit('update:modelValue', address.value); };

const toggleMap = (event?: Event) => { // Make event optional
  if (event) { event.preventDefault(); }
  if (!isApiLoaded.value) { errorMessage.value = 'Google Maps is still loading. Please try again in a moment.'; errorType.value = 'api'; return; }
  showMap.value = !showMap.value;
  if (showMap.value && !mapInitialized.value) {
      // Ensure API is ready before calling initMap
      if (window.google?.maps) {
          nextTick(() => { initMap(); });
      } else {
          console.error("Cannot init map on toggle: Google Maps API not ready.");
          errorMessage.value = "Map is still loading...";
      }
  }
};

const initMap = () => {
  // Check API and map element
  if (!window.google?.maps || !mapElement.value) {
      console.error('Google Maps API not loaded or map element missing for initMap.');
      errorMessage.value = 'Google Maps could not be loaded. Please try again later.';
      errorType.value = 'api';
      return;
  }
  if (mapInitialized.value) return; // Prevent re-init

  try {
    // *** Compute google.maps Icon objects ***
    computedStandardIcon = {
        url: standardIconDefinition.url,
        scaledSize: new google.maps.Size(standardIconDefinition.scaledSize.width, standardIconDefinition.scaledSize.height),
        origin: new google.maps.Point(standardIconDefinition.origin.x, standardIconDefinition.origin.y),
        anchor: new google.maps.Point(standardIconDefinition.anchor.x, standardIconDefinition.anchor.y),
    };
    computedHotelIcon = {
        path: google.maps.SymbolPath.CIRCLE, // Use the enum now
        fillColor: hotelIconDefinition.fillColor,
        fillOpacity: hotelIconDefinition.fillOpacity,
        scale: hotelIconDefinition.scale,
        strokeColor: hotelIconDefinition.strokeColor,
        strokeWeight: hotelIconDefinition.strokeWeight,
        anchor: new google.maps.Point(hotelIconDefinition.anchor.x, hotelIconDefinition.anchor.y),
    };
    // Basic check if icons were created
    if (!computedStandardIcon || !computedHotelIcon) {
        throw new Error("Failed to create icon objects.");
    }

    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    const initialCenter = selectedLocation.value || defaultLocation;

    map.value = new window.google.maps.Map(mapElement.value, {
      center: initialCenter, zoom: 13, mapTypeControl: false,
      streetViewControl: false, fullscreenControl: false,
      styles: mapDarkStyle
    });

    // *** Use computed standard icon for initial marker ***
    marker.value = new window.google.maps.Marker({
        map: map.value,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        position: initialCenter,
        icon: computedStandardIcon // Use computed icon
    });

    // *** Modify dragend listener to use computed icon ***
    marker.value.addListener('dragend', () => {
      if (!marker.value || !computedStandardIcon) return; // Add check for computed icon
      const position = marker.value.getPosition();
       if (!position) return;

       // Reset icon to standard
       marker.value.setIcon(computedStandardIcon);

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
        } else { /* ... error handling ... */ }
      });
    });

    mapInitialized.value = true; // Set flag on successful initialization
    errorMessage.value = ''; errorType.value = ''; // Clear errors

  } catch (error: any) {
    console.error('Error initializing map:');
    errorMessage.value = `Unable to initialize the map: ${error.message || error}`;
    errorType.value = 'map';
    mapInitialized.value = false; // Reset flag on error
    // Reset computed icons on error?
    computedStandardIcon = null;
    computedHotelIcon = null;
  }
};

const initPlacesAutocomplete = () => {
  // Check API and input element
  if (!window.google?.maps?.places || !inputElement.value) {
      return;
  }
   if (placesAutocomplete.value) return; // Prevent re-init

  try {
    placesAutocomplete.value = new window.google.maps.places.Autocomplete(inputElement.value, {
      fields: ['formatted_address', 'geometry', 'name', 'types'] // *** ADDED 'types' field ***
    });

    placesAutocomplete.value.addListener('place_changed', () => {
      if (!placesAutocomplete.value) return;
      const place = placesAutocomplete.value.getPlace();

      // Handle cases where user hits Enter without selecting a suggestion, or suggestion has no geometry
      if (!place.geometry?.location) {
          console.warn('Place selected has no geometry or invalid:', place?.name);
          // Optionally try to geocode place.name here, or show error
          errorMessage.value = `Could not get location for "${place?.name || address.value}". Please select a valid suggestion.`;
          errorType.value = 'geocode';
          return; // Stop processing if no location
      }

      const formattedAddress = place.formatted_address ?? place.name ?? ''; // Added name fallback
      const location = place.geometry.location;

      // *** Determine which icon to use ***
      let iconToUse = computedStandardIcon; // Default to standard
      // Check if hotel icon is computed and if place type is lodging
      if (computedHotelIcon && place.types && place.types.includes('lodging')) {
          iconToUse = computedHotelIcon;
      } else {
          iconToUse = computedStandardIcon; // Reset to standard if not lodging
      }

      // Update state
      address.value = formattedAddress;
      selectedLocation.value = { address: formattedAddress, lat: location.lat(), lng: location.lng() };
      updateValue();
      emit('location-selected', selectedLocation.value);
      errorMessage.value = ''; // Clear error

      // Inner function to handle map update
      const updateMap = () => {
          // Ensure map/marker/icon are ready
          if (!mapInitialized.value || !map.value || !marker.value) {
               console.warn("updateMap called but map/marker not ready.");
               // Attempt to initialize map if needed, then try again
               if (!mapInitialized.value) {
                   initMap();
                   // Need to wait for initMap potentially
                   nextTick(() => {
                       if (mapInitialized.value && map.value && marker.value && iconToUse) {
                           map.value.setCenter(location);
                           map.value.setZoom(15); // Zoom in a bit on selection
                           marker.value.setPosition(location);
                           marker.value.setIcon(iconToUse); // Set icon
                       } else {
                            console.error("Map update failed after late init.");
                       }
                   });
               }
               return;
           }
           // If map is ready:
           if (iconToUse) { // Check if icon object is valid
                map.value.setCenter(location);
                map.value.setZoom(15);
                marker.value.setPosition(location);
                marker.value.setIcon(iconToUse); // *** Set the determined icon ***
           } else {
                console.error("Cannot set marker icon: Icon object is invalid.");
           }
      };


      // Show map if hidden, then update
      if (!showMap.value) {
        showMap.value = true;
         // Wait for map element to be visible in DOM
        nextTick(() => {
           updateMap(); // Will also handle initMap if needed
        });
      } else {
         // Map already showing, just update
         updateMap();
      }
    });
  } catch (error: any) {
    console.error('Error initializing Places Autocomplete:');
    errorMessage.value = `Error initializing address search: ${error.message || error}`;
    errorType.value = 'autocomplete';
  }
};

// --- API Loader (No changes needed from original functioning code) ---
const loadGoogleMapsAPI = () => {
  if (window.google?.maps?.places) { isApiLoaded.value = true; return Promise.resolve(); }

  return new Promise<void>((resolve, reject) => {
    isLoading.value = true; errorMessage.value = '';

     if (window.google?.maps?.places) { isLoading.value = false; isApiLoaded.value = true; resolve(); return; }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      // If script exists but API not ready, wait for it
      window.googleMapsCheckInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(window.googleMapsCheckInterval); window.googleMapsCheckInterval = undefined;
          isLoading.value = false; isApiLoaded.value = true; resolve();
        }
      }, 100); return;
    }

    const script = document.createElement('script');
    const apiKey = props.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    // Ensure API Key exists
     if (!apiKey) {
        errorMessage.value = 'API Key is missing. Cannot load Google Maps.';
        errorType.value = 'api';
        isLoading.value = false;
        console.error(errorMessage.value);
        return reject(new Error(errorMessage.value));
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`; // Added v=weekly for stability
    script.async = true; script.defer = true;
    script.onload = () => {
        isLoading.value = false;
        if(window.google?.maps?.places) {
            isApiLoaded.value = true;
            resolve();
        } else {
             console.error("Script loaded but google.maps not found!");
             errorMessage.value = 'Failed to initialize Google Maps after loading.';
             errorType.value = 'api';
             reject(new Error('Google Maps failed to initialize.'));
        }
    };
    script.onerror = (e) => {
        isLoading.value = false;
        errorMessage.value = 'Failed to load Google Maps API script. Check network/API key.';
        errorType.value = 'api';
        console.error("Maps API Load Error:");
        reject(new Error('Failed to load Google Maps API script.'));
     };
    document.head.appendChild(script);
  });
};

const openBrowserSettings = (event?: Event) => { /* ... (same as before) ... */ };

// --- Modified useCurrentLocation ---
const useCurrentLocation = (event?: Event) => {
   if (event) event.preventDefault();
   if (!navigator.geolocation) { errorMessage.value = 'Geolocation not supported.'; errorType.value = 'browser'; return; }
   // Check if API is ready before proceeding
   if (!isApiLoaded.value || !window.google?.maps) {
       errorMessage.value = 'Map is not ready yet. Please wait.';
       errorType.value = 'api';
       return;
   }

   isLoading.value = true; errorMessage.value = ''; errorType.value = '';
   navigator.geolocation.getCurrentPosition( (position) => {
       const location = { lat: position.coords.latitude, lng: position.coords.longitude };
       const geocoder = new window.google.maps.Geocoder();

       geocoder.geocode({ location }, (results, status) => {
           isLoading.value = false;
           if (status === 'OK' && results?.[0]) {
               const formattedAddress = results[0].formatted_address;
               address.value = formattedAddress;
               selectedLocation.value = { address: formattedAddress, lat: location.lat, lng: location.lng };
               updateValue();
               emit('location-selected', selectedLocation.value);
               errorMessage.value = '';

               // Function to update map
               const updateMapForCurrentLocation = () => {
                    // Check map/marker/icon readiness
                    if (!mapInitialized.value || !map.value || !marker.value || !computedStandardIcon) {
                         console.warn("Cannot update map for current location: Map/Marker/Icon not ready.");
                         // Attempt init if needed
                         if (!mapInitialized.value) {
                             initMap();
                              nextTick(() => { // Wait for potential init
                                   if (mapInitialized.value && map.value && marker.value && computedStandardIcon) {
                                       map.value.setCenter(location);
                                       map.value.setZoom(15);
                                       marker.value.setPosition(location);
                                       marker.value.setIcon(computedStandardIcon);
                                   }
                              });
                         }
                         return;
                     }
                     // If ready:
                     map.value.setCenter(location);
                     map.value.setZoom(15);
                     marker.value.setPosition(location);
                     marker.value.setIcon(computedStandardIcon); // *** Reset to standard icon ***
               }

               // Show/update map
               if (!showMap.value) {
                   showMap.value = true;
                   nextTick(() => { updateMapForCurrentLocation(); });
               } else {
                  updateMapForCurrentLocation();
               }
           } else {
               errorType.value = 'geocode';
               /* ... (geocode error handling) ... */
           }
       });
   }, (error) => {
       isLoading.value = false; errorType.value = 'permission';
       /* ... (geolocation error handling) ... */
   }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } );
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  try {
      // Ensure API Loads before attempting to init autocomplete
      await loadGoogleMapsAPI();
      if (isApiLoaded.value) {
         initPlacesAutocomplete();
      } else {
          // Error should be set by loadGoogleMapsAPI
          console.error("API failed to load in onMounted.");
      }
  }
  catch (error) {
    console.error('Error during onMounted setup:');
     if (!errorMessage.value) { // Set fallback error
        errorMessage.value = "Failed to initialize location component.";
        errorType.value = 'api';
    }
  }
});

onUnmounted(() => {
  if (placesAutocomplete.value) { window.google?.maps?.event.clearInstanceListeners(placesAutocomplete.value); }
  if (marker.value) { window.google?.maps?.event.clearInstanceListeners(marker.value); }
  // Don't necessarily clear map listeners unless specific ones were added
  // if (map.value) { window.google?.maps?.event.clearInstanceListeners(map.value); }
  if (window.googleMapsCheckInterval) { clearInterval(window.googleMapsCheckInterval); window.googleMapsCheckInterval = undefined; }
});
// --- End Original Methods ---

</script>

<template>
  <div> <label v-if="props.label" :for="`origin-input-${_uid}`" class="block text-sm font-medium text-gray-300 mb-1.5">
      {{ props.label || 'Location' }} <span v-if="props.required" class="text-red-400">*</span>
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
        :placeholder="props.placeholder || 'Enter address or search location'"
        class="component-input pl-10 pr-20"
        :disabled="isLoading || !isApiLoaded"
        :required="props.required"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `origin-error-${_uid}` : `origin-hint-${_uid}`"
        aria-label="Location address input"
        autocomplete="off"
      />

      <div class="absolute inset-y-0 right-0 flex items-center pr-1.5 space-x-1">
        <button type="button" @click="useCurrentLocation" class="p-1.5 text-gray-400 rounded-md hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50" title="Use current location" :disabled="isLoading || !isApiLoaded" aria-label="Use current location">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /> </svg>
        </button>
        <button type="button" @click="toggleMap" class="p-1.5 text-gray-400 rounded-md hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50" title="Toggle map view" :disabled="isLoading || !isApiLoaded" :aria-expanded="showMap" aria-controls="map-container" aria-label="Toggle map view">
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
       Enter address or place name.
    </p>

    <div
      v-show="showMap" id="map-container"
      class="mt-3 rounded-lg overflow-hidden border border-white/20" role="region"
      aria-label="Interactive map for origin location"
    >
      <div ref="mapElement" class="w-full h-48 sm:h-64 md:h-72 bg-slate-700"> </div>
      <div class="bg-slate-800/60 backdrop-blur-sm p-3 text-xs text-gray-300 border-t border-white/10">
          <p class="text-gray-400">Drag marker or search above. Icon changes for hotels selected via search.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- Standard Input Style --- */
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
.component-input.pl-10 { padding-left: 2.5rem; } /* 40px */
.component-input.pr-20 { padding-right: 5rem; } /* 80px */

/* --- Autocomplete Styles --- */
:deep(.pac-container) { background-color: #1E293B; border: 1px solid #4B5563; border-radius: 0.5rem; margin-top: 0.25rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); font-family: inherit; z-index: 9999 !important; }
:deep(.pac-item) { padding: 0.5rem; color: #E5E7EB; border-top: 1px solid #374151; cursor: pointer;} /* Added cursor pointer */
:deep(.pac-item:first-child) { border-top: none; }
:deep(.pac-item:hover), :deep(.pac-item-selected) { background-color: #374151; } /* Keep hover/selected same for now */
:deep(.pac-icon) { filter: invert(0.8); margin-right: 0.5rem; }
:deep(.pac-item-query) { color: #F3F4F6; font-weight: 500; }
:deep(.pac-matched) { color: #a78bfa; font-weight: 600; } /* Changed color slightly */

/* --- Map Control Styles --- */
:deep(.gm-style .gm-control-active .gm-control-background) { box-shadow: rgb(0 0 0 / 30%) 0px 1px 4px -1px; background-color: #4a5568; border: 1px solid #718096; }
:deep(.gm-style .gm-control-active span) { color: #e2e8f0; }
@media (pointer: coarse) {
  :deep(.gm-style-mtc button), :deep(.gm-style button) { min-height: 36px; min-width: 36px; }
  :deep(.gm-style-mtc) { margin: 10px !important; }
}
</style>