<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

// Handle scroll event to change header appearance
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Close mobile menu when clicking outside
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      isScrolled
        ? 'bg-[#1E293B]/95 backdrop-blur-md py-3 shadow-lg'
        : 'bg-transparent py-5'
    ]"
  >
      <div class="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-8">
      <!-- Logo -->
      <div class="flex items-center">
        <img src="/public/tripflowai_icon_small.png" alt="TripFlowAI Logo" class="w-10 h-10 rounded-full mr-3 shadow-lg">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          TripFlow<span class="text-[#8B5CF6]">AI</span>
        </h1>
      </div>
    </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:block">
        <ul class="flex space-x-8">
          <li>
            <a
              href="#"
              class="text-white hover:text-[#8B5CF6] transition-colors relative group py-2"
            >
              Home
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5CF6] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </li>
          <li>
            <a
              href="#features"
              class="text-white hover:text-[#8B5CF6] transition-colors relative group py-2"
            >
              Features
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5CF6] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </li>
          <li>
            <a
              href="#get-started"
              class="text-white hover:text-[#8B5CF6] transition-colors relative group py-2"
            >
              Pricing
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5CF6] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-white hover:text-[#8B5CF6] transition-colors relative group py-2"
            >
              Contact
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5CF6] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- CTA Button -->
      <div class="hidden md:block">
        <a
          href="#get-started"
          class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105"
        >
          Get Started
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden text-white focus:outline-none"
        @click="toggleMobileMenu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            v-if="!isMobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden absolute top-full left-0 right-0 bg-[#1E293B]/95 backdrop-blur-md shadow-lg py-4 px-6 transition-all duration-300 animate-slideDown"
    >
      <nav>
        <ul class="space-y-4">
          <li>
            <a
              href="#"
              class="block text-white hover:text-[#8B5CF6] transition-colors py-2"
              @click="closeMobileMenu"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#features"
              class="block text-white hover:text-[#8B5CF6] transition-colors py-2"
              @click="closeMobileMenu"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#get-started"
              class="block text-white hover:text-[#8B5CF6] transition-colors py-2"
              @click="closeMobileMenu"
            >
              Pricing
            </a>
          </li>
          <li>
            <a
              href="#"
              class="block text-white hover:text-[#8B5CF6] transition-colors py-2"
              @click="closeMobileMenu"
            >
              Contact
            </a>
          </li>
        </ul>

        <a
          href="#get-started"
          class="block mt-6 bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white px-5 py-2 rounded-full font-medium text-center"
          @click="closeMobileMenu"
        >
          Get Started
        </a>
      </nav>
    </div>
  </header>

  <!-- Spacer to prevent content from being hidden under fixed header -->
  <div class="h-20"></div>
</template>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out forwards;
}
</style>
