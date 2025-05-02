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
    </main>

    <AppFooter />
  </div>
</template>

<style>
@import '../assets/animations.css';
@import '../assets/responsive.css';
</style>
