<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import ProductShowcase from "@/components/ProductShowcase.vue";
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen flex flex-col w-screen">
    <AppHeader />

    <main class="flex-1 w-full">
      <!-- Hero Section -->
      <section class="relative text-center py-32 px-6 bg-gradient-to-r from-[#512D6D] to-[#8B5CF6] w-full">
        <h1 class="text-5xl font-extrabold tracking-tight">AI-Powered Travel Itineraries</h1>
        <p class="mt-4 text-lg text-gray-200">
          Let our AI generate the perfect trip tailored to your interests.
        </p>
        <a
          href="#get-started"
          class="mt-6 inline-block bg-[#1E293B] text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-[#334155] transition">
          Get Your Itinerary
        </a>
      </section>

      <!-- Features Section -->
      <section class="py-16 px-6 w-full">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-[#8B5CF6]">Why Choose TripFlowAI?</h2>
          <p class="mt-4 text-gray-300">
            Our AI analyzes your preferences, location, and time constraints to create an optimized travel plan.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 max-w-6xl mx-auto">
          <div class="p-6 bg-[#1E293B] rounded-lg shadow-lg text-center">
            <h3 class="text-xl font-semibold text-[#8B5CF6]">Personalized Trips</h3>
            <p class="mt-2 text-gray-400">Tailored recommendations based on your interests.</p>
          </div>
          <div class="p-6 bg-[#1E293B] rounded-lg shadow-lg text-center">
            <h3 class="text-xl font-semibold text-[#8B5CF6]">Optimized Routes</h3>
            <p class="mt-2 text-gray-400">Efficient travel planning to maximize your experience.</p>
          </div>
          <div class="p-6 bg-[#1E293B] rounded-lg shadow-lg text-center">
            <h3 class="text-xl font-semibold text-[#8B5CF6]">Seamless Integration</h3>
            <p class="mt-2 text-gray-400">Google Maps links for easy navigation.</p>
          </div>
        </div>
      </section>

      <!-- Product Section -->
      <ProductShowcase id="get-started" />
    </main>

    <AppFooter />
  </div>
</template>
