<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Animation states
const isInView = ref(false);
const isHovered = ref(false);
const isHoveredRoadTrip = ref(false);

// Product data from API
const productData = ref({
  uid: '',
  value: 10000,
  currency: 'USD',
  name: 'Custom Itinerary'
});

// Fetch product data from API
const fetchProductData = async () => {
  try {
    const response = await fetch('http://localhost/product');
    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }
    const data = await response.json();
    productData.value = data;
    console.log('Product data fetched:', data);
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
};

// Format price based on currency
const formatPrice = (value, currency) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return formatter.format(value / 1000); // Assuming value is in cents
};

// Intersection observer to trigger animations when section is in view
onMounted(() => {
  // Fetch product data when component mounts
  fetchProductData();

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      isInView.value = true;
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  const showcaseSection = document.getElementById('get-started');
  if (showcaseSection) {
    observer.observe(showcaseSection);
  }
});

// Toggle hover state
const setHovered = (product, value) => {
  if (product === 'tripflow') {
    isHovered.value = value;
  } else {
    isHoveredRoadTrip.value = value;
  }
};

// Navigate to questionnaire with product data
const navigateToQuestionnaire = () => {
  // Using Vue Router programmatically
  return {
    path: '/questionnaire',
    query: {
      productUid: productData.value.uid,
      price: productData.value.value,
      currency: productData.value.currency
    }
  };
};

// Features list for Trip Flow AI
const tripFlowFeatures = [
  "Personalized travel plans based on your preferences",
  "Optimized routes with Google Maps integration",
  "Instant delivery to your email",
  "24/7 customer support via chat",
  "Free updates and adjustments",
  "Money-back guarantee"
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
    class="py-24 px-6 relative overflow-hidden"
  >
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#2D1B69] via-[#512D6D] to-[#8B5CF6] z-0"></div>

    <!-- Animated Background Elements -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <!-- Floating elements -->
      <div class="absolute top-1/3 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-float"></div>
      <div class="absolute top-2/3 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-1/4 left-1/3 w-4 h-4 bg-white/10 rounded-full animate-float" style="animation-delay: 2s;"></div>
    </div>

    <!-- Content Container -->
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="flex flex-col lg:flex-row items-stretch gap-16">
        <!-- Left Column: Product Info -->
        <div class="w-full lg:w-1/2 transform transition-all duration-700"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'">

          <!-- Road Trip AI Coming Soon Card -->
          <div
            class="bg-gray-800/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-500/20 relative overflow-hidden transition-all duration-300 grayscale"
            :class="{ 'transform scale-[1.02] shadow-gray-500/20': isHoveredRoadTrip }"
            @mouseenter="setHovered('roadtrip', true)"
            @mouseleave="setHovered('roadtrip', false)"
          >
            <!-- Coming Soon Badge -->
            <div class="absolute -top-1 -right-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg shadow-lg transform rotate-0">
              COMING SOON
            </div>

            <!-- Card Shine Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shine-effect"></div>

            <h3 class="text-3xl font-bold text-white">Road Trip AI</h3>
            <p class="text-gray-400 mt-2">Create your perfect road adventure.</p>

            <!-- Price -->
            <div class="flex items-end mt-6">
              <span class="text-5xl font-extrabold text-white">$15</span>
              <span class="text-gray-400 text-lg ml-2">/ trip</span>
              <span class="ml-4 bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs font-semibold">PRE-ORDER</span>
            </div>

            <!-- Divider -->
            <div class="my-6 h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"></div>

            <!-- Features List -->
            <ul class="mt-6 space-y-4 text-gray-300">
              <li v-for="(feature, index) in roadTripFeatures" :key="index" class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <!-- Call to Action -->
            <button
              class="block w-full mt-8 text-center bg-gray-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all cursor-not-allowed opacity-80"
              disabled
            >
              Join Waitlist
            </button>

            <!-- Launch Date -->
            <p class="text-center text-sm text-gray-400 mt-4">
              <span class="inline-block mr-1">📅</span> Payments supported by Stripe.
            </p>

            <!-- Payment Methods (Greyed Out) -->
            <div class="flex justify-center mt-6 space-x-3">
              <div class="w-10 h-6 bg-gray-700 rounded opacity-50"></div>
              <div class="w-10 h-6 bg-gray-700 rounded opacity-50"></div>
              <div class="w-10 h-6 bg-gray-700 rounded opacity-50"></div>
              <div class="w-10 h-6 bg-gray-700 rounded opacity-50"></div>
            </div>
          </div>

          <!-- Waitlist Counter -->
          <p class="text-center text-white/70 mt-6 flex items-center justify-center">
            <span class="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <span>124 people on the waitlist</span>
          </p>
        </div>

        <!-- Right Column: TripFlow AI (Current Product) -->
        <div class="w-full lg:w-1/2 transform transition-all duration-700 delay-200"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'">
          <!-- Pricing Card -->
          <div
            class="bg-[#1E293B]/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-purple-500/20 relative overflow-hidden transition-all duration-300"
            :class="{ 'transform scale-[1.02] shadow-purple-500/20': isHovered }"
            @mouseenter="setHovered('tripflow', true)"
            @mouseleave="setHovered('tripflow', false)"
          >
            <!-- Card Shine Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shine-effect"></div>

            <!-- Popular Badge -->
            <div class="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg shadow-lg transform rotate-0">
              MOST POPULAR
            </div>

            <h3 class="text-3xl font-bold text-white">TripFlow AI</h3>
            <p class="text-gray-400 mt-2">Create your perfect itinerary in seconds.</p>

            <!-- Price -->
            <div class="flex items-end mt-6">
              <span class="text-5xl font-extrabold text-white">{{ formatPrice(productData.value, productData.currency) }}</span>
              <span class="text-gray-400 text-lg ml-2">/ trip</span>
              <span class="ml-4 line-through text-gray-500">$19.99</span>
              <span class="ml-2 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">50% OFF</span>
            </div>

            <!-- Divider -->
            <div class="my-6 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

            <!-- Features List -->
            <ul class="mt-6 space-y-4 text-gray-300">
              <li v-for="(feature, index) in tripFlowFeatures" :key="index" class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <!-- Call to Action -->
            <router-link
              :to="navigateToQuestionnaire()"
              class="block mt-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-purple-500/30 transform hover:scale-[1.02] transition-all"
            >
              Get Your Itinerary
            </router-link>

            <!-- Guarantee Text -->
            <p class="text-center text-sm text-gray-400 mt-4">
              <span class="inline-block mr-1">🔒</span> 100% secure payment with SSL encryption
            </p>

            <!-- Payment Methods -->
            <div class="flex justify-center mt-6 space-x-3">
              <div class="w-10 h-6 bg-gray-700 rounded"></div>
              <div class="w-10 h-6 bg-gray-700 rounded"></div>
              <div class="w-10 h-6 bg-gray-700 rounded"></div>
              <div class="w-10 h-6 bg-gray-700 rounded"></div>
            </div>
          </div>

          <!-- Social Proof -->
          <p class="text-center text-white/70 mt-6 flex items-center justify-center">
            <span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span>12 travelers purchased in the last 24 hours</span>
          </p>
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
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.shine-effect {
  transform: translateX(-100%);
  animation: shine 3s infinite;
  animation-play-state: paused;
}

div:hover .shine-effect {
  animation-play-state: running;
}

/* Animation delays */
.delay-100 {
  transition-delay: 100ms;
}

.delay-200 {
  transition-delay: 200ms;
}

.delay-300 {
  transition-delay: 300ms;
}

/* Grayscale effect for coming soon product */
.grayscale {
  filter: grayscale(0.8);
}
</style>
