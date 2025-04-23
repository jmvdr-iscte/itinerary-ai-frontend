<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import DestinationInput from "@/components/DestinationInput.vue";
import TransportationSelector from "@/components/TransportationSelector.vue";
import NumberInput from "@/components/NumberInput.vue";
import EmailPopup from "@/components/EmailPopup.vue";
import PaymentMethodsPopup from "@/components/PaymentMethodsPopup.vue";
import GoogleMapsOriginInput from "@/components/GoogleMapsOriginInput.vue";
import BudgetInput from "@/components/BudgetInput.vue";
import ActivityPaceSelector from "@/components/ActivityPaceSelector.vue";
import UserInput from "@/components/UserInput.vue";
import SeasonSelector from "@/components/SeasonSelector.vue";
import '@/assets/main.css'; // Make sure this contains Tailwind directives and any base styles

// --- State and Logic ---
const route = useRoute();

// Product data
const productData = ref({
  uid: '',
  value: 0,
  currency: 'USD',
  symbol: '$'
});

// Form data
const formData = ref({
  categories: [] as string[],
  destination: "",
  numberOfPeople: 1,
  numberOfDays: 1,
  origin: "",
  originLocation: "",
  transportation: [] as string[],
  budget: 0,
  activityPace: "MODERATE",
  season: "",
  userInput: "",
  email: ""
});

// UI State
const uiState = ref({
  showEmailPopup: false,
  showPaymentMethodsPopup: false,
  selectedPaymentMethod: "credit_card",
  isLoading: true,
  showError: false,
  errorMessage: "",
  windowWidth: window.innerWidth
});

// Stepper State
const currentStep = ref(1);
const totalSteps = 3; // 1: Details, 2: Preferences, 3: Review/Submit

// Computed properties
const isMobile = computed(() => uiState.value.windowWidth < 768);

// --- Step Validation ---
const isStep1Valid = computed(() => {
    const { destination, origin, numberOfDays, numberOfPeople, season } = formData.value;
    return !!destination && !!origin && numberOfDays > 0 && numberOfPeople > 0 && !!season;
});

const isStep2Valid = computed(() => {
    const { transportation, budget } = formData.value;
    // Budget, Pace, UserInput are often optional, adjust if needed
    return transportation.length > 0 && budget >= 0;
});

// Original validation for final submission trigger
const isFormValid = computed(() => {
  return isStep1Valid.value && isStep2Valid.value; // Ensure all previous steps are valid
});

// --- Options ---
const transportationOptions = [
  { value: "WALK", label: "Walking", icon: "🚶" },
  { value: "CAR", label: "Car", icon: "🚗" },
  { value: "BIKE", label: "Bicycle", icon: "🚲" },
  { value: "PUBLIC_TRANSPORT", label: "Public Transport", icon: "🚆" }
];

const seasonOptions = [
  { value: "WINTER", label: "Winter", icon: "❄️" },
  { value: "SPRING", label: "Spring", icon: "🌸" },
  { value: "SUMMER", label: "Summer", icon: "☀️" },
  { value: "AUTUMN", label: "Autumn", icon: "🍂" }
];

// --- Lifecycle Hooks ---
onMounted(() => {
  window.addEventListener('resize', handleResize);
  updateViewportHeight();

  // Fetch data from route
  if (route.query.productUid) productData.value.uid = route.query.productUid as string;
  if (route.query.price) productData.value.value = parseInt(route.query.price as string, 10);
  if (route.query.currency) productData.value.currency = route.query.currency as string;
  if (route.query.symbol) productData.value.symbol = route.query.symbol as string;
  if (route.query.categories) {
    const categoriesParam = route.query.categories as string;
    formData.value.categories = categoriesParam.split(',').map(cat => cat.trim()).filter(cat => cat);
  }

  const loadingTimeout = setTimeout(() => {
    uiState.value.isLoading = false;
  }, 800);

  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(loadingTimeout);
  };
});

// --- Methods ---
function handleResize() {
  uiState.value.windowWidth = window.innerWidth;
  updateViewportHeight();
}

function updateViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function handleLocationSelected(location: any) {
  formData.value.originLocation = location;
  formData.value.origin = location.address;
}

// --- Step Navigation ---
function nextStep() {
  if (currentStep.value === 1 && isStep1Valid.value && currentStep.value < totalSteps) {
      currentStep.value++;
  } else if (currentStep.value === 2 && isStep2Valid.value && currentStep.value < totalSteps) {
      currentStep.value++;
  }
  // If on last step, the specific submit button handles the action
}

function previousStep() {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
}

// --- Popup Handlers ---
function triggerFinalSubmit() {
  if (!isFormValid.value) {
      console.warn("Form is invalid, cannot proceed.");
      // Optional: Highlight missing fields or show specific errors
      return;
  }
  openEmailPopup();
}


function openEmailPopup() {
  uiState.value.showEmailPopup = true;
}

function closeEmailPopup() {
  uiState.value.showEmailPopup = false;
}

function openPaymentMethodsPopup() {
  uiState.value.showEmailPopup = false;
  if (formData.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      uiState.value.showPaymentMethodsPopup = true;
  } else {
      console.warn("Email might be invalid or missing.");
      uiState.value.showEmailPopup = true; // Re-open email popup
  }
}

function closePaymentMethodsPopup() {
  uiState.value.showPaymentMethodsPopup = false;
}

function submitEmail() {
  openPaymentMethodsPopup();
}

function handlePaymentError(message: string) {
  uiState.value.errorMessage = message || "An unexpected payment error occurred.";
  uiState.value.showError = true;
  uiState.value.showPaymentMethodsPopup = false;
}

function getTripData() {
  return {
    productUid: productData.value.uid,
    price: productData.value.value,
    currency: productData.value.currency,
    categories: formData.value.categories,
    destination: formData.value.destination,
    number_of_people: formData.value.numberOfPeople,
    origin: formData.value.origin,
    origin_location: formData.value.originLocation,
    transportation: formData.value.transportation,
    number_of_days: formData.value.numberOfDays,
    budget: formData.value.budget > 0 ? formData.value.budget : undefined,
    season: formData.value.season,
    user_input: formData.value.userInput,
    activity_pace: formData.value.activityPace,
    email: formData.value.email
  };
}

function submitPaymentMethod() {
  closePaymentMethodsPopup();
  // Handle successful payment navigation/confirmation here
  console.log("Payment Submitted (Placeholder)");
}

// Helper function for stepper classes
const getStepClass = (step: number) => {
  if (step < currentStep.value) return 'bg-purple-600 border-purple-500'; // Completed
  if (step === currentStep.value) return 'bg-indigo-600 border-indigo-400 ring-2 ring-indigo-300 ring-offset-2 ring-offset-slate-800'; // Active
  return 'bg-gray-600 border-gray-500'; // Pending
};
const getStepTextClass = (step: number) => {
  if (step <= currentStep.value) return 'text-white';
  return 'text-gray-400';
};
const getConnectorClass = (step: number) => {
  if (step < currentStep.value) return 'bg-purple-600'; // Completed connector
  return 'bg-gray-600'; // Pending connector
};

</script>

<template>
  <div class="min-h-screen-safe bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-gray-200 w-full font-sans antialiased overflow-x-hidden">

    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full filter blur-3xl animate-float opacity-60"></div>
      <div class="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-float opacity-60" style="animation-delay: 1s; animation-duration: 7s;"></div>
      <div class="absolute top-1/3 right-1/4 w-56 h-56 bg-sky-600/10 rounded-full filter blur-3xl animate-float opacity-60" style="animation-delay: 2s; animation-duration: 8s;"></div>
    </div>

    <div class="relative z-10 flex flex-col md:flex-row min-h-screen-safe w-full">

      <aside class="w-full md:w-1/3 lg:w-1/4 bg-slate-900/30 md:border-r border-white/10 p-6 md:p-8 flex flex-col space-y-6 md:h-screen-safe md:sticky md:top-0">
          <h1 class="text-2xl font-bold text-white mb-4">Trip Planner</h1>
          <div class="text-gray-400 text-sm space-y-2 flex-grow">
              <p class="font-semibold text-gray-300">Steps:</p>
              <ol class="list-decimal list-inside space-y-1">
                  <li :class="{'font-semibold text-indigo-300': currentStep === 1}">Trip Details</li>
                  <li :class="{'font-semibold text-indigo-300': currentStep === 2}">Your Preferences</li>
                  <li :class="{'font-semibold text-indigo-300': currentStep === 3}">Review & Confirm</li>
              </ol>
              <p class="pt-4">Fill in your trip information to generate a personalized itinerary.</p>
              </div>
      </aside>

      <main class="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center w-full md:max-h-screen-safe md:overflow-y-auto">

        <div class="w-full max-w-2xl mx-auto flex-grow flex flex-col justify-center py-8">

            <div v-if="uiState.isLoading" class="glassmorphic-card p-8 flex flex-col items-center justify-center space-y-4">
              <div class="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-gray-300">Loading your trip planner...</p>
            </div>

           <div v-else-if="uiState.showError" class="glassmorphic-card p-8 flex flex-col items-center justify-center space-y-5 text-center">
             <div class="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center border border-red-500/50 mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>
             </div>
             <h3 class="text-xl font-semibold text-white">Oops! Something went wrong.</h3>
             <p class="text-gray-300 max-w-md">{{ uiState.errorMessage }}</p>
             <button @click="uiState.showError = false; uiState.isLoading = false; currentStep = 1;" class="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"> Try Again </button>
           </div>

           <div v-else class="w-full animate-fadeIn">

             <div class="mb-8 px-2">
                <div class="flex items-center">
                  <template v-for="step in totalSteps" :key="step">
                    <div class="flex flex-col items-center">
                      <div
                        :class="getStepClass(step)"
                        class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300"
                      >
                        <span :class="getStepTextClass(step)">{{ step }}</span>
                      </div>
                       <span class="text-xs mt-1 w-20 text-center" :class="getStepTextClass(step)">
                          {{ step === 1 ? 'Details' : step === 2 ? 'Preferences' : 'Confirm' }}
                       </span>
                    </div>
                    <div
                      v-if="step < totalSteps"
                      :class="getConnectorClass(step)"
                      class="flex-1 h-1 transition-colors duration-300"
                    ></div>
                  </template>
                </div>
              </div>

             <div class="glassmorphic-card w-full overflow-hidden">
               <div class="card-header p-6 md:p-8 border-b border-white/10">
                 <h2 class="text-2xl md:text-3xl font-bold text-center text-white mb-1 tracking-tight">
                     {{ currentStep === 1 ? 'Trip Details' : currentStep === 2 ? 'Your Preferences' : 'Review & Confirm' }}
                 </h2>
                 <p class="text-center text-gray-300 text-sm md:text-base">
                     {{ currentStep === 1 ? 'Where and when are you travelling?' : currentStep === 2 ? 'Tell us how you like to travel.' : 'Almost there! Please review your details.' }}
                 </p>
               </div>

               <div class="p-6 md:p-8">
                  <form @submit.prevent="triggerFinalSubmit" class="space-y-7">

                    <div v-if="currentStep === 1" class="space-y-7 animate-fadeIn">
                      <DestinationInput
                          v-model="formData.destination"
                          label="Where are you going?"
                          placeholder="e.g., Paris, France"
                          required
                      />
                      <GoogleMapsOriginInput
                        v-model="formData.origin"
                        @location-selected="handleLocationSelected"
                        label="Where is your accommodation?"
                        placeholder="Hotel name, address, or area"
                        required
                      />
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                         <NumberInput
                            v-model="formData.numberOfDays"
                            label="For how many days?"
                            :min="1" :max="30"
                            required
                         />
                         <NumberInput
                            v-model="formData.numberOfPeople"
                            label="How many people?"
                            :min="1" :max="10"
                            required
                         />
                     
                      </div>
                      <SeasonSelector
                            v-model="formData.season"
                            :options="seasonOptions"
                            label="Preferred Season"
                            required
                        />
                    </div>

                    <div v-if="currentStep === 2" class="space-y-7 animate-fadeIn">
                       <TransportationSelector
                            v-model="formData.transportation"
                            :options="transportationOptions"
                            label="Preferred Transportation"
                            required
                        />
                       <BudgetInput
                            v-model="formData.budget"
                            label="What is your budget?"
                            :min="0" :max="1000000"
                            :currencySymbol="productData.symbol"
                            required
                        />
                       <ActivityPaceSelector
                            v-model="formData.activityPace"
                            label="What's your activity pace?"
                            required
                        />
                       <UserInput
                            v-model="formData.userInput"
                            label="Any specific interests?"
                            placeholder="e.g., museums, nightlife, hiking trails..."
                            :maxLength="256"
                        />
                    </div>

                    <div v-if="currentStep === 3" class="space-y-6 animate-fadeIn">

                        <div class="p-5 bg-slate-700/30 rounded-lg border border-white/10 space-y-4">
                            <h4 class="text-lg font-medium text-indigo-300 border-b border-white/10 pb-2 mb-4">Trip Summary</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Destination</span>
                                    <span class="text-gray-100 font-semibold">{{ formData.destination || 'N/A' }}</span>
                                </div>
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Accommodation Area</span>
                                    <span class="text-gray-100">{{ formData.origin || 'N/A' }}</span>
                                </div>
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Duration</span>
                                    <span class="text-gray-100">{{ formData.numberOfDays }} Day(s)</span>
                                </div>
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Number of People</span>
                                    <span class="text-gray-100">{{ formData.numberOfPeople }}</span>
                                </div>
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Season</span>
                                     <span class="text-gray-100 capitalize">{{ formData.season ? formData.season.toLowerCase() : 'N/A' }}</span>
                                </div>
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Transportation</span>
                                    <span class="text-gray-100 capitalize">{{ formData.transportation.length > 0 ? formData.transportation.map(t => t.toLowerCase().replace(/_/g, ' ')).join(', ') : 'N/A' }}</span>
                                </div>
                                <div v-if="formData.budget > 0">
                                    <span class="block font-medium text-gray-400 mb-0.5">Budget Indication</span>
                                    <span class="text-gray-100">{{ productData.symbol }}{{ formData.budget.toLocaleString() }}</span>
                                </div>
                                <div>
                                    <span class="block font-medium text-gray-400 mb-0.5">Activity Pace</span>
                                    <span class="text-gray-100 capitalize">{{ formData.activityPace.toLowerCase() }}</span>
                                </div>
                                <div v-if="formData.userInput" class="sm:col-span-2">
                                    <span class="block font-medium text-gray-400 mb-0.5">Interests / Tips</span>
                                    <p class="text-gray-200 bg-white/5 p-2 rounded border border-white/10 italic text-xs">"{{ formData.userInput }}"</p>
                                </div>
                            </div>
                        </div>
                        <p class="text-center text-gray-400 text-xs pt-1">If everything looks correct, click 'Continue' to enter your email and proceed.</p>
                    </div>

                    <div class="pt-5 flex justify-between items-center">
                      <button
                        type="button"
                        @click="previousStep"
                        v-if="currentStep > 1"
                        class="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        aria-label="Go to previous step"
                      >
                        Previous
                      </button>
                      <div v-else></div> <button
                        type="button"
                        @click="nextStep"
                        v-if="currentStep < totalSteps"
                        class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center"
                        :disabled="(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)"
                        aria-label="Continue to next step"
                       >
                        <span class="mr-2">Next</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /> </svg>
                      </button>

                      <button
                        type="submit"
                        v-if="currentStep === totalSteps"
                        class="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center"
                        :disabled="!isFormValid"
                        aria-label="Continue to final step"
                      >
                         <span class="mr-2">Continue</span>
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /> </svg>
                      </button>

                    </div>

                  </form>
               </div>
             </div>
           </div>
         </div>
      </main>

    </div>

    <EmailPopup v-model="formData.email" v-model:show="uiState.showEmailPopup" @submit="submitEmail" @cancel="closeEmailPopup" />
    <PaymentMethodsPopup v-model:selectedMethod="uiState.selectedPaymentMethod" v-model:show="uiState.showPaymentMethodsPopup" :tripData="getTripData()" @submit="submitPaymentMethod" @cancel="closePaymentMethodsPopup" @error="handlePaymentError" />

  </div>
</template>

<style scoped>
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
.md\:h-screen-safe {
    @media (min-width: 768px) {
        height: 100vh; /* Fallback */
        height: calc(var(--vh, 1vh) * 100);
    }
}
.md\:max-h-screen-safe {
     @media (min-width: 768px) {
        max-height: 100vh; /* Fallback */
        max-height: calc(var(--vh, 1vh) * 100);
    }
}


/* Scoped styles specific to this component */

/* Add any additional specific styles here if needed */

</style>

<style>
/* Global styles (if needed, or ensure they are in main.css) */
:root {
  --vh: 1vh;
}
/* Tailwind base/components/utilities should be imported in main.css */
</style>