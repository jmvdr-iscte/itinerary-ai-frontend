<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// Animation & state
const isInView = ref(false);
const isHovered = ref(false);
const isHoveredRoadTrip = ref(false);

// API loading & response state (Product)
const isLoading = ref(false);
const apiCallSuccessful = ref(false);

// API loading & response state (Transaction Count) - NEW
const isLoadingCount = ref(false);
const transactionCount = ref<number | null>(null); // Store the count, null initially

// Product data
const productData = ref({
  uid: '',
  value: 10000, // Default/fallback value
  currency: 'USD', // Default/fallback currency
  name: 'Custom Itinerary',
  symbol: 'USD' // Default/fallback symbol
});

// Fetch pricing & product data
const fetchProductData = async () => {
  isLoading.value = true;
  apiCallSuccessful.value = false;
  try {
    const response = await fetch('https://api.tripvibes.me/product'); // Example relative
    if (!response.ok)
     throw new Error(`Product API error: ${response.status}`);

    const data = await response.json();
    if (!data?.uid || typeof data.value !== 'number' || !data.currency) {
      throw new Error('Invalid product data structure received: ' + JSON.stringify(data));
    }

    productData.value = data;
    apiCallSuccessful.value = true;
  } catch (error) {
    console.error('❌ Error fetching product:');
    // Reset product data to defaults on error
    productData.value = {
      uid: '',
      value: 10000,
      currency: 'USD',
      name: 'Custom Itinerary (Error Loading)',
      symbol: 'USD'
    };
  } finally {
    isLoading.value = false;
  }
};

// Fetch transaction count
const fetchTransactionCount = async () => {
  isLoadingCount.value = true;
  transactionCount.value = null; // Reset before fetching
  try {
    // Adjust endpoint as needed (relative or absolute)
    // const response = await fetch('http://localhost/transactions/count'); // Example absolute
    const response = await fetch('https://api.tripvibes.me/transactions/count'); // Example relative
    if (!response.ok) {
      throw new Error(`Count API error: ${response.status}`);
    }
    const data = await response.json();

    // API returns {"count":"{number}"} - parse the string count
    if (data && typeof data.count === 'string' && !isNaN(parseInt(data.count, 10))) {
       const countValue = parseInt(data.count, 10);
       transactionCount.value = countValue;
    } else if (data && typeof data.count === 'number') {
       // Handle case where count might already be a number
       transactionCount.value = data.count;
    } else {
       throw new Error('Invalid count data structure received: ' + JSON.stringify(data));
    }
  } catch (error) {
    console.error('❌ Error fetching transaction count:');
    transactionCount.value = null; // Set to null on error to show fallback text
  } finally {
    isLoadingCount.value = false;
  }
};

// Format price display
const formatPrice = (value: number, currency: string) => {
  // ... null checks ...
  return new Intl.NumberFormat('en-US', { // Or 'de-DE', etc.
    style: 'currency',
    currency: currency, // <--- Uses the currency string passed in
    minimumFractionDigits: 2, // Use 2 for cents
    maximumFractionDigits: 2  // Use 2 for cents
  }).format(value / 100);
};

// Router navigation
const router = useRouter();
const navigateToQuestionnaire = () => {
  // Only navigate if product data is loaded successfully
  if (!apiCallSuccessful.value || isLoading.value || !productData.value.uid) {
    console.warn('⛔ Navigation prevented: product data invalid, missing UID, or still loading');
    return;
  }

  router.push({
    path: '/questionnaire', // Ensure this route exists
    query: {
      productUid: productData.value.uid,
      price: productData.value.value,
      currency: productData.value.currency,
      symbol: productData.value.symbol
    }
  });
};

// Button disabled logic
const isGetItineraryDisabled = computed(() =>
  // Disable if product is loading OR if the API call failed (no valid UID)
  isLoading.value || !apiCallSuccessful.value || !productData.value.uid
);

// Intersection Observer setup
onMounted(() => {
  // Fetch data when component mounts
  fetchProductData();
  fetchTransactionCount();

  // Set up observer for animations
  const showcaseSection = document.getElementById('get-started');
  if (showcaseSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        isInView.value = true;
        observer.unobserve(showcaseSection); // Stop observing once in view
      }
    }, { threshold: 0.2 }); // Trigger when 20% is visible
    observer.observe(showcaseSection);
  } else {
    console.warn('⚠️ #get-started element not found for Intersection Observer');
    // Fallback? Maybe set isInView true immediately or after short delay
    // isInView.value = true;
  }
});

// Hover control
const setHovered = (product: 'tripflow' | 'roadtrip', value: boolean) => {
  if (product === 'tripflow') {
    isHovered.value = value;
  } else {
    isHoveredRoadTrip.value = value;
  }
};

// Feature descriptions
const tripFlowFeatures = [
  "Personalized travel plans based on your preferences",
  "Optimized routes with Google Maps integration",
  "Instant delivery to your email",
  "24/7 customer support via email",
  "Seamless booking for attractions and activities"
];

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
                  src="https://images.tripvibes.me/stripe-icon.svg" alt="Stripe"
                  class="h-5 w-auto"
                  aria-hidden="true"
                />
              <span>supported by Stripe</span>
            </div>
          </div>
          <p class="text-center text-white/70 mt-6 flex items-center justify-center text-sm min-h-[20px]">
            <span class="relative flex h-3 w-3 mr-2 flex-shrink-0">
                <span v-if="!isLoadingCount && transactionCount !== null" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span v-if="isLoadingCount" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3"
                      :class="{
                        'bg-green-500': !isLoadingCount && transactionCount !== null,
                        'bg-yellow-500': isLoadingCount,
                        'bg-red-500': !isLoadingCount && transactionCount === null
                      }">
                </span>
            </span>
            <!-- <span v-if="isLoadingCount" class="opacity-75 italic">Loading purchase data...</span>
            <span v-else-if="transactionCount !== null && transactionCount >= 0">
                {{ transactionCount }} traveler{{ transactionCount === 1 ? '' : 's' }} purchased in the last 24 hours
            </span>
            <span v-else class="opacity-75">Purchase data unavailable</span> -->
          </p>
        </div>

        <div class="w-full lg:w-1/2 transform transition-all duration-700 ease-out delay-100"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'">
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
            <div class="mt-6 min-h-[4rem] flex items-end">
              <div v-if="isLoading" class="w-full text-center text-gray-400 animate-pulse py-4">
                Loading price info...
              </div>
              <div v-else-if="apiCallSuccessful" class="flex items-end w-full flex-wrap">
                  <span class="text-5xl font-extrabold text-white mr-2">
                      {{ formatPrice(1500, productData.currency) }} </span>
                  <span class="text-gray-400 text-lg self-end pb-1 mr-3">/ trip</span>
                  <span class="ml-4 bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs font-semibold self-end pb-1">PRE-ORDER</span>
              </div>
              <div v-else class="w-full text-center text-red-400 py-4">
                   Price info unavailable.
              </div>
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
              Not Available
            </button>
            <div class="flex justify-center items-center mt-6 text-sm text-gray-400 space-x-1.5">
                <img
                  src="https://images.tripvibes.me/stripe-icon.svg" alt="Stripe"
                  class="h-5 w-auto"
                  aria-hidden="true"
                />
              <span>supported by Stripe</span>
            </div>
          </div>
           </div>

      </div>
    </div>
  </section>
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
  0% { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(100%) skewX(-20deg); }
}

.shine-effect {
  transform: translateX(-100%) skewX(-20deg);
  animation: shine 4s cubic-bezier(0.7, 0, 0.3, 1) infinite;
  animation-play-state: paused;
  opacity: 0.6;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

div:hover > .shine-effect {
  animation-play-state: running;
}

.grayscale {
  filter: grayscale(0.8);
}

button:disabled {
  /* Tailwind classes handle most styling */
}
</style>
