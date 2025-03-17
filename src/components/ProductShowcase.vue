<script setup lang="ts">
</script>

<template>
  <section class="bg-gradient-to-r from-[#512D6D] to-[#8B5CF6] py-20 px-6 text-center text-white">
    <div class="max-w-4xl mx-auto">
      <!-- Product Title -->
      <h2 class="text-4xl font-extrabold mb-4">AI-Powered Travel Itineraries</h2>
      <p class="text-lg text-gray-200 mb-8">Your personalized travel planner, powered by AI.</p>

      <!-- Pricing Card -->
      <div class="bg-[#1E293B] p-8 rounded-2xl shadow-lg max-w-lg mx-auto text-left">
        <h3 class="text-3xl font-bold text-white">TripFlow AI</h3>
        <p class="text-gray-400 mt-2">Create your perfect itinerary in seconds.</p>

        <!-- Price -->
        <div class="flex items-end mt-6">
          <span class="text-5xl font-extrabold text-white">$10</span>
          <span class="text-gray-400 text-lg ml-2">/ trip</span>
        </div>

        <!-- Features List -->
        <ul class="mt-6 space-y-3 text-gray-300">
          <li class="flex items-center">
            ✅ Personalized travel plans based on your preferences
          </li>
          <li class="flex items-center">
            ✅ Optimized routes with Google Maps integration
          </li>
          <li class="flex items-center">
            ✅ Instant delivery to your email
          </li>
        </ul>

        <!-- Call to Action -->
    <router-link
      to="/questionnaire"
      class="block mt-6 text-center bg-[#8B5CF6] text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-[#6B46C1] transition">
      Get Your Itinerary
    </router-link>

      </div>

      <!-- Social Proof -->
      <p class="text-sm text-gray-300 mt-6">Trusted by travelers worldwide</p>
    </div>
  </section>
</template>

<style scoped>
/* Additional spacing and responsive improvements */
</style>
