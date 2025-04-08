<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Animation states for features
const isInView = ref(false);
const features = [
  {
    title: "Personalized Trips",
    description: "Tailored recommendations based on your interests, preferences, and travel style.",
    icon: "👤",
    color: "from-purple-500 to-indigo-500"
  },
  {
    title: "Optimized Routes",
    description: "Efficient travel planning to maximize your experience and minimize wasted time.",
    icon: "🗺️",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Seamless Integration",
    description: "Google Maps links for easy navigation and direct booking options for attractions.",
    icon: "📱",
    color: "from-pink-500 to-rose-500"
  }
];

// Intersection observer to trigger animations when section is in view
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      isInView.value = true;
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  const featuresSection = document.getElementById('features');
  if (featuresSection) {
    observer.observe(featuresSection);
  }
});
</script>

<template>
  <section id="features" class="py-24 px-6 w-full relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-[#0F1629] z-0"></div>
    <div class="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

    <!-- Content Container -->
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Section Header -->
      <div class="max-w-4xl mx-auto text-center mb-16">
        <div class="inline-flex items-center justify-center px-4 py-1.5 bg-purple-500/10 rounded-full mb-4 transform transition-all duration-700"
             :class="isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'">
          <span class="text-xs font-semibold uppercase tracking-wider text-purple-400">Why Choose Us</span>
        </div>

        <h2 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent transform transition-all duration-700"
            :class="isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'">
          Why Choose CarefreeTrip?
        </h2>

        <p class="text-xl text-gray-300 max-w-3xl mx-auto transform transition-all duration-700 delay-100"
           :class="isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
          Our AI analyzes your preferences, location, and time constraints to create an optimized travel plan that's uniquely yours.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card transform transition-all duration-700"
          :class="[
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20',
            `delay-${(index + 1) * 100}`
          ]"
        >
          <!-- Feature Icon -->
          <div class="mb-6 relative">
            <div :class="`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6`">
              <span class="text-3xl">{{ feature.icon }}</span>
            </div>
            <div class="absolute -bottom-2 -right-2 w-16 h-16 bg-white/5 rounded-2xl rotate-6"></div>
          </div>

          <!-- Feature Content -->
          <h3 class="text-2xl font-bold text-white mb-3">{{ feature.title }}</h3>
          <p class="text-gray-300">{{ feature.description }}</p>

          <!-- Feature Details -->
          <ul class="mt-4 space-y-2">
            <li class="flex items-start">
              <svg class="h-5 w-5 text-purple-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-gray-400">{{ index === 0 ? 'Customized for your interests' : index === 1 ? 'Save time between destinations' : 'One-click directions' }}</span>
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-purple-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-gray-400">{{ index === 0 ? 'Discover hidden gems' : index === 1 ? 'Optimal visit times' : 'Offline access' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.feature-card {
  @apply p-8 bg-[#1E293B] rounded-2xl shadow-xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.feature-card:hover::before {
  transform: translateX(100%);
}

.stat-card {
  @apply p-6 bg-[#1E293B]/50 rounded-xl border border-gray-800/30;
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

.delay-400 {
  transition-delay: 400ms;
}
</style>
