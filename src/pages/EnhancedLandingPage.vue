<script setup lang="ts">
import { onMounted } from 'vue';
import ImprovedAppHeader from './components/ImprovedAppHeader.vue';
import EnhancedHeroSection from './components/EnhancedHeroSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import EnhancedProductShowcase from './components/EnhancedProductShowcase.vue';
import EnhancedFooter from './components/EnhancedFooter.vue';

// Fix for mobile viewport height issues
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
    <ImprovedAppHeader />

    <main class="flex-1 w-full">
      <!-- Hero Section -->
      <EnhancedHeroSection />

      <!-- Features Section -->
      <FeaturesSection />

      <!-- Product Section -->
      <EnhancedProductShowcase />
    </main>

    <EnhancedFooter />
  </div>
</template>

<style>
@import './styles/animations.css';
@import './styles/responsive.css';
</style>
