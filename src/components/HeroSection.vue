<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Animation states
const isVisible = ref(false);
const animationDelay = ref(0);

// Parallax effect for background elements
const parallaxOffset = ref({ x: 0, y: 0 });

// Handle mouse movement for parallax effect
const handleMouseMove = (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 50;
  const y = (window.innerHeight / 2 - e.clientY) / 50;
  parallaxOffset.value = { x, y };
};

onMounted(() => {
  // Trigger animations after component is mounted
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
  
  // Add event listener for parallax effect
  window.addEventListener('mousemove', handleMouseMove);
  
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
});
</script>

<template>
  <section 
    id="hero"
    class="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
  >
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#2D1B69] via-[#512D6D] to-[#8B5CF6] z-0"></div>
    
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 z-10 overflow-hidden">
      <!-- Decorative circles -->
      <div 
        class="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        :style="{
          transform: `translate(${parallaxOffset.x * -1.5}px, ${parallaxOffset.y * -1.5}px)`
        }"
      ></div>
      <div 
        class="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        :style="{
          transform: `translate(${parallaxOffset.x * 1.5}px, ${parallaxOffset.y * 1.5}px)`
        }"
      ></div>
      
      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <!-- Floating elements -->
      <div class="absolute top-1/3 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-float"></div>
      <div class="absolute top-2/3 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-1/4 left-1/3 w-4 h-4 bg-white/10 rounded-full animate-float" style="animation-delay: 2s;"></div>
    </div>
    
    <!-- Content Container -->
    <div class="relative z-20 text-center px-6 max-w-5xl mx-auto">
      <!-- Animated Badge -->
      <div 
        class="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium transform transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'"
      >
        <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
        AI-Powered Travel Planning Made Simple
      </div>
      
      <!-- Main Heading -->
      <h1 
        class="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 transition-all duration-700 relative"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'"
      >
        <span class="block">AI-Powered</span>
        <span class="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Travel Itineraries</span>
        
        <!-- Decorative elements -->
        <span class="absolute -top-6 -right-6 text-4xl transform rotate-12 opacity-50">✨</span>
        <span class="absolute -bottom-4 -left-4 text-3xl transform -rotate-12 opacity-50">🌍</span>
      </h1>
      
      <!-- Subheading -->
      <p 
        class="mt-6 text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 transition-all duration-700"
        :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10', `delay-${animationDelay + 100}`]"
      >
        Let our AI generate the perfect trip tailored to your interests, preferences, and travel style.
      </p>
      
      <!-- CTA Buttons -->
      <div 
        class="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 transition-all duration-700"
        :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10', `delay-${animationDelay + 200}`]"
      >
        <a
          href="#get-started"
          class="px-8 py-4 bg-white text-[#512D6D] rounded-full text-lg font-bold shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 flex items-center"
        >
          Get Your Itinerary
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
        
        <a
          href="#features"
          class="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300"
        >
          Learn More
        </a>
      </div>
      
      <!-- Scroll Indicator -->
      <div 
        class="absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-500"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <div class="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div class="w-1 h-3 bg-white/60 rounded-full animate-scrollDown"></div>
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

@keyframes scrollDown {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-scrollDown {
  animation: scrollDown 1.5s ease-in-out infinite;
}

.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
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

.delay-500 {
  transition-delay: 500ms;
}
</style>
