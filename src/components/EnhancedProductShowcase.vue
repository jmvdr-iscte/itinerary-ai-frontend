<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Animation states
const isInView = ref(false);
const isHovered = ref(false);

// Intersection observer to trigger animations when section is in view
onMounted(() => {
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
const setHovered = (value) => {
  isHovered.value = value;
};

// Testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    location: "New York, USA",
    text: "TripFlowAI made planning my Europe trip so easy! The AI suggested places I never would have found on my own.",
    avatar: "👩‍🦱"
  },
  {
    name: "David Chen",
    location: "Toronto, Canada",
    text: "The optimized routes saved us hours of travel time. Worth every penny for our family vacation!",
    avatar: "👨‍🦰"
  },
  {
    name: "Maria Rodriguez",
    location: "Barcelona, Spain",
    text: "As a solo traveler, I felt confident with my AI itinerary. It matched my interests perfectly!",
    avatar: "👩"
  }
];

// Features list
const features = [
  "Personalized travel plans based on your preferences",
  "Optimized routes with Google Maps integration",
  "Instant delivery to your email",
  "24/7 customer support via chat",
  "Free updates and adjustments",
  "Money-back guarantee"
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
      <div class="flex flex-col lg:flex-row items-center gap-16">
        <!-- Left Column: Product Info -->
        <div class="w-full lg:w-1/2 transform transition-all duration-700"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'">
          <!-- Product Badge -->
          <div class="inline-flex items-center justify-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-white">Limited Time Offer</span>
          </div>
          
          <!-- Product Title -->
          <h2 class="text-4xl md:text-5xl font-extrabold mb-6 text-white">
            AI-Powered <span class="text-purple-200">Travel Itineraries</span>
          </h2>
          
          <p class="text-xl text-white/80 mb-8">Your personalized travel planner, powered by advanced AI to create the perfect trip experience.</p>
          
          <!-- Testimonials Carousel -->
          <div class="mb-10 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <div class="flex items-center mb-4">
              <div class="flex -space-x-2">
                <div v-for="(testimonial, index) in testimonials" :key="index" 
                     class="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center text-xl">
                  {{ testimonial.avatar }}
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span class="ml-2 text-white text-sm">4.9/5 from 500+ travelers</span>
                </div>
              </div>
            </div>
            
            <div class="relative overflow-hidden h-32">
              <div class="absolute inset-0 flex flex-col transition-transform duration-500 transform"
                   :style="{transform: `translateY(-${100 * Math.floor(Date.now() / 5000) % testimonials.length}%)`}">
                <div v-for="(testimonial, index) in testimonials" :key="index" 
                     class="py-4 flex-shrink-0 h-full">
                  <p class="text-white/90 italic">{{ testimonial.text }}</p>
                  <div class="mt-2 text-sm text-white/70">
                    {{ testimonial.name }}, {{ testimonial.location }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Trust Badges -->
          <div class="flex flex-wrap justify-center sm:justify-start gap-6 items-center text-white/60">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span>Secure Payment</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>24-Hour Delivery</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Money-Back Guarantee</span>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Pricing Card -->
        <div class="w-full lg:w-1/2 transform transition-all duration-700 delay-200"
             :class="isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'">
          <!-- Pricing Card -->
          <div 
            class="bg-[#1E293B]/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-purple-500/20 relative overflow-hidden transition-all duration-300"
            :class="{ 'transform scale-[1.02] shadow-purple-500/20': isHovered }"
            @mouseenter="setHovered(true)"
            @mouseleave="setHovered(false)"
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
              <span class="text-5xl font-extrabold text-white">$10</span>
              <span class="text-gray-400 text-lg ml-2">/ trip</span>
              <span class="ml-4 line-through text-gray-500">$19.99</span>
              <span class="ml-2 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">50% OFF</span>
            </div>
            
            <!-- Divider -->
            <div class="my-6 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

            <!-- Features List -->
            <ul class="mt-6 space-y-4 text-gray-300">
              <li v-for="(feature, index) in features" :key="index" class="flex items-start">
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
              to="/questionnaire"
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
</style>
