<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import HeroSection from '@/components/HeroSection.vue';
import FeaturesSection from '@/components/FeaturesSection.vue';
import ProductShowcase from '@/components/ProductShowcase.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useHead } from '@vueuse/head';

useHead({
  title: 'TripVibes: Personalized Travel Itinerary Generator',
  meta: [
    { name: 'description', content: 'Get a custom itinerary based on your travel preferences with TripVibes.' },
    { name: 'keywords', content: 'vacation planning, itinerary generator, trip planning, travel preferences, AI, artificial inteligence' },
    { property: 'og:title', content: 'TripVibes: Personalized  Travel Itinerary Generator' },
    { property: 'og:description', content: 'Get a custom itinerary based on your travel preferences.' },
    { property: 'og:url', content: 'https://tripvibes.me' },
  ]
});

onMounted(() => {
  // Set the value of --vh to be equal to 1% of the viewport height
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Initial set
  setVh();

  // Update on resize
  window.addEventListener('resize', setVh);

  // Cleanup
  return () => {
    window.removeEventListener('resize', setVh);
  };
});
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen flex flex-col w-screen overflow-hidden">
    <AppHeader />

    <main class="flex-1 w-full">
      <!-- Hero Section -->
      <HeroSection />

      <!-- Features Section -->
      <FeaturesSection />

      <!-- Product Section -->
      <ProductShowcase />
      <section class="w-full flex flex-col items-center py-12 px-4 bg-[#101B35]">
        <h2 class="text-2xl md:text-3xl font-semibold mb-8 text-center text-white">
          See TripVibes in Action
        </h2>
        <div class="w-full max-w-4xl aspect-video rounded-2xl shadow-lg overflow-hidden">
          <iframe
            class="w-full h-full"
            src="https://www.youtube.com/embed/rtuoicjbr1Q?si=9GG5KU9kHspodduo&&modestbranding=1&rel=0&showinfo=0&controls=1"
            title="TripVibes Demo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style>
@import '../assets/animations.css';
@import '../assets/responsive.css';
</style>
