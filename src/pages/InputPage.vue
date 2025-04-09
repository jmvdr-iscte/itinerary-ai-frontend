<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

// --- Import your custom components ---
// Ensure these paths are correct for your project structure
import DestinationInput from "@/components/DestinationInput.vue";
import TransportationSelector from "@/components/TransportationSelector.vue";
import NumberInput from "@/components/NumberInput.vue";
import DateTimeInput from "@/components/DateTimeInput.vue";
import EmailPopup from "@/components/EmailPopup.vue";
import PaymentMethodsPopup from "@/components/PaymentMethodsPopup.vue";
import GoogleMapsOriginInput from "@/components/GoogleMapsOriginInput.vue";
import BudgetInput from "@/components/BudgetInput.vue";
import ActivityPaceSelector from "@/components/ActivityPaceSelector.vue";
import MustSeeAttractions from "@/components/MustSeeAttractions.vue";

// --- Import base CSS (includes Tailwind) ---
import '@/assets/main.css'; // Make sure this contains Tailwind directives and any base styles

// --- State and Logic ---
// Get route to access query parameters
const route = useRoute();

// Product data from route query parameters
const productData = ref({
  uid: '',
  value: 0,
  currency: 'USD',
  symbol: '$'
});

// Form data - using refs for reactivity
const formData = ref({
  categories: [] as string[], // Explicitly type as string array
  destination: "",
  numberOfPeople: 1,
  origin: "",
  originLocation: null as any, // Consider defining a type for location object
  fromDate: "",
  toDate: "",
  transportation: [] as string[], // Explicitly type as string array
  budget: 0,
  activityPace: "MODERATE", // Default value
  mustSeeAttractions: [] as string[], // Explicitly type as string array
  email: ""
});

// UI state - using refs for reactivity
const uiState = ref({
  showEmailPopup: false,
  showPaymentMethodsPopup: false,
  selectedPaymentMethod: "credit_card", // Default value
  isLoading: true,
  showError: false,
  errorMessage: "",
  windowWidth: window.innerWidth
});

// Computed properties
const isMobile = computed(() => uiState.value.windowWidth < 768);

// Form validation computed property
const isFormValid = computed(() => {
  const { destination, origin, fromDate, toDate, transportation } = formData.value;
  // Add more checks if needed (e.g., numberOfPeople > 0)
  return !!destination && !!origin && !!fromDate && !!toDate && transportation.length > 0;
});

// Format price for display (ensure this logic matches your price format)
const formattedPrice = computed(() => {
  if (!productData.value.value || !productData.value.currency) return '';

  const formatter = new Intl.NumberFormat('en-US', { // Or locale as needed
    style: 'currency',
    currency: productData.value.currency,
    minimumFractionDigits: 0, // Adjust if you need cents
    maximumFractionDigits: 0  // Adjust if you need cents
  });

  // Assuming price might be in cents, adjust if it's already in full units
  const isInCents = productData.value.value >= 100 && String(productData.value.value).length >= 3;
  const valueInFullUnits = isInCents ? productData.value.value / 100 : productData.value.value;

  return formatter.format(valueInFullUnits);
});

// Google Maps API Key from environment variables
const googleMapsApiKey = import.meta.env.VITE_Maps_API_KEY;
if (!googleMapsApiKey) {
  console.warn("Google Maps API Key (VITE_Maps_API_KEY) is missing!");
  // Optionally handle this case, maybe disable map features
}

// Transportation options (can be moved to a separate config file if large)
const transportationOptions = [
  { value: "WALK", label: "Walking", icon: "🚶" },
  { value: "CAR", label: "Car", icon: "🚗" },
  { value: "BIKE", label: "Bicycle", icon: "🚲" },
  { value: "PUBLIC_TRANSPORT", label: "Public Transport", icon: "🚆" }
];

// Lifecycle hooks
onMounted(() => {
  // Add resize listener
  window.addEventListener('resize', handleResize);

  // Fix for mobile viewport height issues on mount
  updateViewportHeight();

  // Get product data from route query parameters
  if (route.query.productUid) {
    productData.value.uid = route.query.productUid as string;
  }
  if (route.query.price) {
    // Use parseFloat for potentially non-integer prices if needed
    productData.value.value = parseInt(route.query.price as string, 10);
  }
  if (route.query.currency) {
    productData.value.currency = route.query.currency as string;
  }
  if (route.query.symbol) {
    productData.value.symbol = route.query.symbol as string;
  }
  console.log('Product data received:', productData.value);

  // Get categories from route query parameters
  if (route.query.categories) {
    const categoriesParam = route.query.categories as string;
    formData.value.categories = categoriesParam.split(',').map(cat => cat.trim()).filter(cat => cat); // Trim whitespace and filter empty strings
    console.log('Categories received:', formData.value.categories);
  }

  // Simulate initial loading state (replace with actual data fetching if needed)
  const loadingTimeout = setTimeout(() => {
    uiState.value.isLoading = false;
  }, 800); // Adjust duration as needed

  // Cleanup function for onUnmounted
  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(loadingTimeout); // Clear timeout if component unmounts before it fires
  };
});

// --- Methods ---
function handleResize() {
  uiState.value.windowWidth = window.innerWidth;
  updateViewportHeight(); // Also update viewport height on resize
}

// Function to calculate and set CSS variable for viewport height
function updateViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Handler for GoogleMapsOriginInput selection
function handleLocationSelected(location: any) { // Replace 'any' with a specific type if available
  console.log('Location selected:', location);
  formData.value.originLocation = location; // Store the whole location object if needed
  formData.value.origin = location.address; // Update the origin string for display/submission
}

// Popup handlers
function openEmailPopup() {
  if (!isFormValid.value) {
      console.warn("Form is invalid, cannot proceed to email popup.");
      // Optionally show a message to the user
      return;
  }
  uiState.value.showEmailPopup = true;
}

function closeEmailPopup() {
  uiState.value.showEmailPopup = false;
}

function openPaymentMethodsPopup() {
  // Close email popup first
  uiState.value.showEmailPopup = false;
  // Potentially validate email format here before opening payment
  if (formData.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      uiState.value.showPaymentMethodsPopup = true;
  } else {
      // Handle invalid email case if needed after submission from EmailPopup
      console.warn("Email might be invalid or missing.");
      // Re-open email popup or show an error within it
      uiState.value.showEmailPopup = true; // Re-open if needed
  }
}

function closePaymentMethodsPopup() {
  uiState.value.showPaymentMethodsPopup = false;
}

// Handler for email submission (triggers payment popup)
function submitEmail() {
  // Email validation is good practice here or within the EmailPopup component
  console.log("Email submitted:", formData.value.email);
  openPaymentMethodsPopup();
}

// Handler for errors emitted from PaymentMethodsPopup
function handlePaymentError(message: string) {
  uiState.value.errorMessage = message || "An unexpected payment error occurred.";
  uiState.value.showError = true;
  uiState.value.showPaymentMethodsPopup = false; // Close payment popup on error
}

// Function to gather all trip data for submission/payment
function getTripData() {
  // Ensure data structure matches what your backend/payment processor expects
  return {
    // Product Info
    productUid: productData.value.uid,
    price: productData.value.value,
    currency: productData.value.currency,
    categories: formData.value.categories,

    // Trip Details
    destination: formData.value.destination,
    number_of_people: formData.value.numberOfPeople,
    origin: formData.value.origin,
    origin_location: formData.value.originLocation, // May include lat/lng etc.
    from: formData.value.fromDate,
    to: formData.value.toDate,
    transportation: formData.value.transportation,
    budget: formData.value.budget > 0 ? formData.value.budget : undefined, // Send budget only if set
    activity_pace: formData.value.activityPace,
    must_see_attractions: formData.value.mustSeeAttractions,

    // User Info
    email: formData.value.email
  };
}

// Handler for final payment method submission
function submitPaymentMethod() {
  console.log("Selected payment method:", uiState.value.selectedPaymentMethod);
  console.log("Final trip data for submission:", getTripData());
  // --- ADD YOUR PAYMENT PROCESSING LOGIC HERE ---
  // This function would likely call your backend API with getTripData()
  // and the selected payment method/token from PaymentMethodsPopup
  closePaymentMethodsPopup();
  // Potentially show a success message or redirect
}
</script>

<template>
  <div class="min-h-screen-safe bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-gray-200 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full font-sans antialiased overflow-x-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full filter blur-3xl animate-float opacity-70"></div>
      <div class="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s; animation-duration: 7s; opacity: 70;"></div>
      <div class="absolute top-1/3 right-1/4 w-56 h-56 bg-sky-600/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 2s; animation-duration: 8s; opacity: 70;"></div>
    </div>

    <div class="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center relative z-10 py-8">
      <div v-if="uiState.isLoading" class="glassmorphic-card p-8 flex flex-col items-center justify-center space-y-4">
        <div class="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-300">Loading your trip planner...</p>
      </div>

      <div v-else-if="uiState.showError" class="glassmorphic-card p-8 flex flex-col items-center justify-center space-y-5 text-center">
         <div class="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center border border-red-500/50 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white">Oops! Something went wrong.</h3>
        <p class="text-gray-300 max-w-md">{{ uiState.errorMessage }}</p>
        <button
          @click="uiState.showError = false; uiState.isLoading = false;"
          class="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Try Again
        </button>
      </div>

      <div v-else class="glassmorphic-card w-full animate-fadeIn overflow-hidden">
        <div class="card-header p-6 md:p-8 border-b border-white/10">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-2 tracking-tight">Plan Your Dream Trip</h2>
          <p class="text-center text-gray-300 text-sm md:text-base">Fill in the details below to create your perfect itinerary</p>
        </div>

        <div class="p-6 md:p-8">
          <form @submit.prevent="openEmailPopup" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 form-container">

            <div class="space-y-6 flex flex-col">
              <DestinationInput
                  v-model="formData.destination"
                  :api-key="googleMapsApiKey"
                  label="Where are you going?"
                  placeholder="e.g., Paris, France"
                  required
              />

              <GoogleMapsOriginInput
                v-model="formData.origin"
                :api-key="googleMapsApiKey"
                @location-selected="handleLocationSelected"
                label="Where did you find accommodation?"
                placeholder="e.g., 123 St. Tripflow, US"
                required
              />

              <NumberInput
                  v-model="formData.numberOfPeople"
                  label="Number of People"
                  :min="1"
                  :max="10"
                  required
              />

              <BudgetInput
                  v-model="formData.budget"
                  label="Estimated Budget"
                  :min="0"
                  :max="1000000"
                  :currencySymbol="productData.symbol" />

              <MustSeeAttractions
                v-model="formData.mustSeeAttractions"
                :api-key="googleMapsApiKey"
                :destination="formData.destination"
                label="Must-See Attractions"
                placeholder="Add attractions one by one"
              />
            </div>

            <div class="space-y-6 flex flex-col">
              <TransportationSelector
                  v-model="formData.transportation"
                  :options="transportationOptions"
                  label="Preferred Transportation"
                  required
              />

              <DateTimeInput
                  v-model="formData.fromDate"
                  label="Start Date"
                  required
              />
              <DateTimeInput
                  v-model="formData.toDate"
                  label="End Date"
                  :minDate="formData.fromDate"
                  required
              />

              <ActivityPaceSelector
                  v-model="formData.activityPace"
                  label="Activity Pace"
              />
            </div>

            <div class="md:col-span-2 mt-6">
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                :disabled="!isFormValid"
                aria-label="Continue to next step"
              >
                <span class="mr-2">Continue</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <EmailPopup
      v-model="formData.email"
      v-model:show="uiState.showEmailPopup"
      @submit="submitEmail"
      @cancel="closeEmailPopup"
    />

    <PaymentMethodsPopup
      v-model:selectedMethod="uiState.selectedPaymentMethod"
      v-model:show="uiState.showPaymentMethodsPopup"
      :tripData="getTripData()"
      @submit="submitPaymentMethod"
      @cancel="closePaymentMethodsPopup"
      @error="handlePaymentError"
    />
  </div>
</template>

<style scoped>
/* Base font and smoothing (consider adding 'Inter' via font import in main.css or index.html) */
.font-sans {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}
.antialiased {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Glassmorphic Card Style */
.glassmorphic-card {
  background: rgba(30, 41, 59, 0.6); /* bg-slate-800 with opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem; /* 16px rounded-xl */
  border: 1px solid rgba(255, 255, 255, 0.1); /* border-white/10 */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2); /* shadow-xl */
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

/* Use CSS variables for viewport height to fix mobile issues */
.min-h-screen-safe {
  min-height: 100vh; /* Fallback */
  min-height: calc(var(--vh, 1vh) * 100);
}

/* == Recommendation for Child Component Styling == */
/* Apply consistent styling *within* your child components. */
/* Example target classes you might use inside them: */

/*
LABEL STYLES (e.g., apply to <label> elements in child components)
.component-label {
  @apply block text-sm font-medium text-gray-300 mb-1.5;
}

INPUT FIELD STYLES (e.g., apply to <input>, <textarea> in child components)
.component-input {
  @apply w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200;
}

SELECT / CUSTOM CONTROL STYLES (e.g., for TransportationSelector, ActivityPaceSelector)
Style the buttons or dropdown elements with similar bg/border/focus states.
Consider using Headless UI for accessible primitives you can style with Tailwind.
*/

</style>

<style>
/* Define --vh variable globally (e.g., in this non-scoped block, or main.js/App.vue) */
/* This helps with mobile browser viewport height consistency */
:root {
  --vh: 1vh;
}
</style>
