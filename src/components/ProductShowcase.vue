<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'; // <-- Import computed
import { useRouter } from 'vue-router'; // <-- Import useRouter

// Animation states
const isInView = ref(false);
const isHovered = ref(false);
const isHoveredRoadTrip = ref(false);

// API call state
const isLoading = ref(false); // <-- Add loading state
const apiCallSuccessful = ref(false); // <-- Add success state

// Product data from API
const productData = ref({
  uid: '',
  value: 10000, // Default/fallback value
  currency: 'USD', // Default/fallback currency
  name: 'Custom Itinerary'
});

// Fetch product data from API
const fetchProductData = async () => {
  isLoading.value = true; // <-- Start loading
  apiCallSuccessful.value = false; // Reset success state
  try {
    // IMPORTANT: Replace 'http://localhost/product' with your actual API endpoint
    const response = await fetch('http://localhost/product');
    if (!response.ok) {
        // Optionally read error details from response if API provides them
        // const errorData = await response.json().catch(() => null);
        // console.error('API Error Response:', errorData);
        throw new Error(`Failed to fetch product data. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.uid || typeof data.value === 'undefined' || !data.currency) {
        throw new Error('Invalid product data received from API');
    }
    productData.value = data;
    apiCallSuccessful.value = true; // <-- Set success state
    console.log('Product data fetched:', data);
  } catch (error) {
    console.error('Error fetching product data:', error);
    // Keep apiCallSuccessful.value as false
    // Optionally, set default/fallback values or show an error message
    productData.value = { // Reset to defaults or specific error state
        uid: '',
        value: 10000,
        currency: 'USD',
        name: 'Custom Itinerary (Error Loading)'
    };
  } finally {
    isLoading.value = false; // <-- Stop loading regardless of outcome
  }
};

// Format price based on currency
const formatPrice = (value, currency) => {
  if (typeof value !== 'number' || !currency) return '$--.--'; // Handle invalid data
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0, // Keep cents handling as before
    maximumFractionDigits: 0
  });
  return formatter.format(value / 100); // Assuming value is in cents
};

// Use Vue Router instance
const router = useRouter();

// Navigate to questionnaire with product data
const navigateToQuestionnaire = () => {
  // Check if the API call was successful before navigating
  if (!apiCallSuccessful.value || isLoading.value) {
    console.warn('Navigation blocked: API data not loaded successfully.');
    return; // Prevent navigation
  }

  // Programmatic navigation using router.push
  router.push({
    path: '/questionnaire', // Ensure this is your correct questionnaire route path
    query: {
      productUid: productData.value.uid,
      price: productData.value.value,
      currency: productData.value.currency
    }
  });
};

// Computed property to determine if the button should be disabled
const isGetItineraryDisabled = computed(() => {
    return isLoading.value || !apiCallSuccessful.value;
});

// Intersection observer to trigger animations when section is in view
onMounted(() => {
  // Fetch product data when component mounts
  fetchProductData();

  // Ensure the target element exists before observing
  const showcaseSection = document.getElementById('get-started');
  if (showcaseSection) {
    const observer = new IntersectionObserver((entries) => {
      // Check if the entry is intersecting
      if (entries[0]?.isIntersecting) {
        isInView.value = true;
        observer.unobserve(showcaseSection); // Use unobserve instead of disconnect if observing single element
        // observer.disconnect(); // Use disconnect if observing multiple elements with the same observer
      }
    }, { threshold: 0.2 }); // Trigger when 20% of the element is visible

    observer.observe(showcaseSection);
  } else {
    console.warn('Element with ID "get-started" not found for IntersectionObserver.');
    // Fallback if observer fails - maybe set isInView true after a short delay?
    // setTimeout(() => { isInView.value = true; }, 500);
  }
});

// Toggle hover state
const setHovered = (product: 'tripflow' | 'roadtrip', value: boolean) => {
  if (product === 'tripflow') {
    isHovered.value = value;
  } else {
    isHoveredRoadTrip.value = value;
  }
};

// Features list for Trip Flow AI
const tripFlowFeatures = [
  "Personalized travel plans based on your preferences",
  "Optimized routes with Google Maps integration",
  "Instant delivery to your email",
  "24/7 customer support via chat",
];

// Features list for Road Trip AI (coming soon)
const roadTripFeatures = [
  "Specialized road trip routes and attractions",
  "Gas station and rest stop planning",
  "Food and lodging recommendations",
  "Scenic detours and photo opportunities",
  "Weather-aware planning for all seasons",
  "Downloadable offline maps"
];
</script>

<template>
  <section
    id="get-started"
    class="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-[#2D1B69] via-[#512D6D] to-[#8B5CF6]"
  >
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-70"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-70"></div>
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div class="absolute top-1/3 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-float"></div>
      <div class="absolute top-2/3 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-1/4 left-1/3 w-4 h-4 bg-white/10 rounded-full animate-float" style="animation-delay: 2s;"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="flex flex-col lg:flex-row items-stretch gap-10 md:gap-16">

        <div class="w-full lg:w-1/2 transform transition-all duration-700 ease-out"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'">

          <div
            class="bg-gray-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-500/20 relative overflow-hidden transition-all duration-300 grayscale h-full flex flex-col"
            :class="{ 'transform scale-[1.02] shadow-gray-500/20': isHoveredRoadTrip }"
            @mouseenter="setHovered('roadtrip', true)"
            @mouseleave="setHovered('roadtrip', false)"
          >
            <div class="absolute -top-1 -right-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-2xl shadow-lg transform rotate-0">
              COMING SOON
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shine-effect"></div>

            <h3 class="text-3xl font-bold text-white">Personalized Roadtrip</h3>
            <p class="text-gray-400 mt-2">Create your perfect road adventure.</p>
            <div class="flex items-end mt-6">
              <span class="text-5xl font-extrabold text-white">$15</span>
              <span class="text-gray-400 text-lg ml-2">/ trip</span>
              <span class="ml-4 bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs font-semibold">PRE-ORDER</span>
            </div>
            <div class="my-6 h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"></div>
            <ul class="space-y-4 text-gray-300">
              <li v-for="(feature, index) in roadTripFeatures" :key="index" class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <div class="flex-grow"></div>
            <button
              class="block w-full mt-8 text-center bg-gray-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all cursor-not-allowed opacity-80"
              disabled
            >
              Join Waitlist
            </button>

            <div class="flex justify-center items-center mt-6 space-x-2">
                <span class="text-sm text-gray-400 mr-1">Secure Payments:</span> <img src="https://js.stripe.com/v3/fingerprinted/img/visa-2055f7d85aac6a706583a0001f99d717.svg" alt="Visa" class="h-5 opacity-60">
                <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-8b1a1702415134b00f813fb62fa47e0e.svg" alt="Mastercard" class="h-5 opacity-60">
                <img src="https://js.stripe.com/v3/fingerprinted/img/amex-c6ea0750d9f85947b80b4b2ff7f78e21.svg" alt="American Express" class="h-5 opacity-60">
                </div>
            </div> <p class="text-center text-white/70 mt-6 flex items-center justify-center text-sm">
            <span class="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            <span>124 people on the waitlist</span>
          </p>
        </div> <div class="w-full lg:w-1/2 transform transition-all duration-700 ease-out delay-100"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'">
          <div
            class="bg-[#1E293B]/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-purple-500/20 relative overflow-hidden transition-all duration-300 h-full flex flex-col"
            :class="{ 'transform scale-[1.02] shadow-purple-500/20': isHovered }"
            @mouseenter="setHovered('tripflow', true)"
            @mouseleave="setHovered('tripflow', false)"
          >
            <div class="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-2xl shadow-lg transform rotate-0">
              MOST POPULAR
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shine-effect"></div>

            <h3 class="text-3xl font-bold text-white">Personalized Itinerary</h3>
            <p class="text-gray-400 mt-2">Create your perfect itinerary in seconds.</p>
            <div class="mt-6 min-h-[4rem] flex items-end">
              <div v-if="isLoading" class="w-full text-center text-gray-400 animate-pulse py-4">
                Loading price...
              </div>
              <div v-else-if="apiCallSuccessful" class="flex items-end w-full flex-wrap">
                <span class="text-5xl font-extrabold text-white mr-2">{{ formatPrice(productData.value, productData.currency) }}</span>
                <span class="text-gray-400 text-lg self-end pb-1 mr-3">/ trip</span>
                <span class="line-through text-gray-500 self-end pb-1 mr-2">$19.99</span>
                <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold self-end pb-1">50% OFF</span>
              </div>
              <div v-else class="w-full text-center text-red-400 py-4">
                 Price unavailable. Please try again later.
              </div>
            </div>
            <div class="my-6 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            <ul class="space-y-4 text-gray-300">
              <li v-for="(feature, index) in tripFlowFeatures" :key="index" class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <div class="flex-grow"></div>
            <button
              @click="navigateToQuestionnaire"
              :disabled="isGetItineraryDisabled"
              :class="[
                'block w-full mt-8 text-center px-6 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out',
                isGetItineraryDisabled
                  ? 'bg-gray-600 text-gray-400 opacity-70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.03]'
              ]"
            >
              {{ isLoading ? 'Loading...' : (apiCallSuccessful ? 'Get Your Itinerary' : 'Service Unavailable') }}
            </button>
            <div class="flex justify-center items-center mt-6 text-sm text-gray-400 space-x-1.5">
                <img
                  src="/src/assets/payment_methods/stripe-icon.svg" alt="Stripe"
                  class="h-5 w-auto"
                  aria-hidden="true"
                />
              <span>supported by Stripe</span>
            </div>

          </div><p class="text-center text-white/70 mt-6 flex items-center justify-center text-sm">
            <span class="relative flex h-3 w-3 mr-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span>12 travelers purchased in the last 24 hours</span>
          </p>
        </div> </div> </div> </section>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

@keyframes shine {
  0% { transform: translateX(-100%) skewX(-20deg); } /* Added skew */
  /* 50% { transform: translateX(0%) skewX(-20deg); } */ /* Optional midpoint */
  100% { transform: translateX(100%) skewX(-20deg); }
}

.shine-effect {
  transform: translateX(-100%) skewX(-20deg); /* Initial state */
  animation: shine 4s cubic-bezier(0.7, 0, 0.3, 1) infinite; /* Smoother bezier, adjust duration */
  animation-play-state: paused;
  opacity: 0.6; /* Slightly more subtle shine */
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 50%, /* Reduced intensity */
    rgba(255, 255, 255, 0) 100%
  );
}

/* Apply hover effect directly to the parent card */
.group:hover .shine-effect, /* If using group hover */
div:hover > .shine-effect { /* If shine is direct child */
  animation-play-state: running;
}

/* Animation delays (kept for potential future use, but using ease-out on main transition) */
/* .delay-100 { transition-delay: 100ms; } */
/* .delay-200 { transition-delay: 200ms; } */
/* .delay-300 { transition-delay: 300ms; } */

/* Grayscale effect for coming soon product */
.grayscale {
  filter: grayscale(0.8);
}

/* Ensure disabled button styles are explicit if needed */
button:disabled {
  /* Tailwind classes handle most, but good for overrides */
  /* Example: border-color: theme('colors.gray.500'); */
}
</style>
