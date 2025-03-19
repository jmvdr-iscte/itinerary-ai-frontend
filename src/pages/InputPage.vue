<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import DestinationInput from "@/components/DestinationInput.vue";
import TransportationSelector from "@/components/TransportationSelector.vue";
import NumberInput from "@/components/NumberInput.vue";
import DateTimeInput from "@/components/DateTimeInput.vue";
import EmailPopup from "@/components/EmailPopup.vue";
import GoogleMapsOriginInput from "@/components/GoogleMapsOriginInput.vue";
import BudgetInput from "@/components/BudgetInput.vue";
import '@/assets/main.css';

const router = useRouter();
const categories = ref<string[]>([]);
const destination = ref("");
const numberOfPeople = ref(1);
const origin = ref("");
const originLocation = ref(null);
const fromDate = ref("");
const toDate = ref("");
const transportation = ref<string[]>([]);
const budget = ref<number | string>(""); // Added budget field
const showEmailPopup = ref(false);
const email = ref("");
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);
const isLoading = ref(true);

// Google Maps API Key - Replace with your actual API key
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const transportationOptions = [
  { value: "WALK", label: "Walking", icon: "🚶" },
  { value: "CAR", label: "Car", icon: "🚗" },
  { value: "BIKE", label: "Bicycle", icon: "🚲" },
  { value: "PUBLIC_TRANSPORT", label: "Public Transport", icon: "🚆" }
];

const isFormValid = computed(() => {
  return destination.value && origin.value && fromDate.value && toDate.value && transportation.value.length > 0;
});

onMounted(() => {
  window.addEventListener('resize', handleResize);

  // Fix for mobile viewport height issues
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // Simulate loading state
  setTimeout(() => {
    isLoading.value = false;
  }, 800);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;

  // Update vh variable when resizing
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const openEmailPopup = () => {
  showEmailPopup.value = true;
};

const closeEmailPopup = () => {
  showEmailPopup.value = false;
};

const handleLocationSelected = (location) => {
  originLocation.value = location;
  origin.value = location.address;
};

const submitForm = () => {
  const requestBody = {
    categories: categories.value,
    destination: destination.value,
    number_of_people: numberOfPeople.value,
    origin: origin.value,
    origin_location: originLocation.value,
    from: fromDate.value,
    to: toDate.value,
    transportation: transportation.value,
    budget: budget.value, // Added budget to the request body
    email: email.value,
  };
  console.log("Submitting: ", requestBody);
  router.push("/checkout");
};
</script>

<template>
  <div class="min-h-screen-safe bg-gradient-to-br from-[#0F1629] to-[#1A2333] text-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl animate-float"></div>
      <div class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>

    <div class="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center relative z-10">
      <!-- Loading State -->
      <div v-if="isLoading" class="card p-8 flex flex-col items-center justify-center space-y-4">
        <div class="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-300">Loading your trip planner...</p>
      </div>

      <!-- Main Card -->
      <div v-else class="card w-full animate-fadeIn">
        <!-- Header -->
        <div class="card-header">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-2">Plan Your Dream Trip</h2>
          <p class="text-center text-white/80 text-sm md:text-base">Fill in the details below to create your perfect itinerary</p>
        </div>

        <!-- Form Content -->
        <div class="p-6 md:p-8">
          <form @submit.prevent="openEmailPopup" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Destination -->
              <DestinationInput v-model="destination" />

              <!-- Origin with Google Maps -->
              <GoogleMapsOriginInput
                v-model="origin"
                :api-key="googleMapsApiKey"
                @location-selected="handleLocationSelected"
              />

              <!-- Number of People -->
              <NumberInput v-model="numberOfPeople" :min="1" :max="20" />

              <!-- Budget Input - Added to left column with min=0 and max=1,000,000 -->
              <BudgetInput v-model="budget" :min="0" :max="1000000" />
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Transportation -->
              <TransportationSelector v-model="transportation" :options="transportationOptions" />

              <!-- Date Range -->
              <DateTimeInput v-model="fromDate" label="Start Date" />
              <DateTimeInput v-model="toDate" label="End Date" />
            </div>

            <!-- Submit Button - Full Width -->
            <div class="md:col-span-2 mt-4">
              <button
                type="submit"
                class="w-full gradient-button p-4 rounded-xl flex justify-center items-center"
                :disabled="!isFormValid"
                :class="{'opacity-70 cursor-not-allowed': !isFormValid}"
              >
                <span class="mr-2">Continue to Payment</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Email Popup Component -->
    <EmailPopup
      v-model="email"
      v-model:show="showEmailPopup"
      @submit="submitForm"
      @cancel="closeEmailPopup"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Use CSS variables for viewport height to fix mobile issues */
.min-h-screen-safe {
  min-height: 100vh; /* Fallback */
  min-height: calc(var(--vh, 1vh) * 100);
}
</style>
