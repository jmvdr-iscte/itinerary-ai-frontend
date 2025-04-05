<script setup lang="ts">
import { ref, onMounted } from 'vue';

const lastUpdated = ref('March 27, 2024');
const companyName = 'CarefreeTrip';
const activeSection = ref(0);

// Animation on scroll
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach((section) => {
    observer.observe(section);
  });
});

const sections = [
  { id: 1, title: 'Acceptance of Terms' },
  { id: 2, title: 'Service Description' },
  { id: 3, title: 'User Responsibilities' },
  { id: 4, title: 'Intellectual Property' },
  { id: 5, title: 'Limitation of Liability' },
  { id: 6, title: 'Termination' },
  { id: 7, title: 'Changes to Terms' },
  { id: 8, title: 'Governing Law' },
];

const scrollToSection = (index: number) => {
  activeSection.value = index;
  const element = document.getElementById(`section-${index + 1}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

    <div class="max-w-6xl mx-auto relative z-10">
      <!-- Header with gradient -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent inline-block">
          Terms of Service
        </h1>
        <div class="h-1 w-24 bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] mx-auto rounded-full"></div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Navigation Sidebar -->
        <div class="lg:w-1/4">
          <div class="bg-[#1E293B] rounded-xl p-5 sticky top-8 border border-gray-700/50 shadow-xl shadow-purple-900/5">
            <h3 class="text-lg font-semibold mb-4 text-white">Contents</h3>
            <ul class="space-y-2">
              <li v-for="(section, index) in sections" :key="section.id"
                  class="transition-all duration-200"
                  :class="activeSection === index ? 'transform translate-x-2' : ''">
                <button @click="scrollToSection(index)"
                        class="text-left w-full py-2 px-3 rounded-lg transition-all duration-200 hover:bg-[#2D3748] focus:outline-none"
                        :class="activeSection === index ? 'bg-[#2D3748] text-[#8B5CF6]' : 'text-gray-400'">
                  {{ section.id }}. {{ section.title }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:w-3/4 space-y-8 text-gray-300">
          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-1">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Acceptance of Terms
            </h2>
            <p class="pl-11">
              By accessing and using {{ companyName }}, you agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use our service.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-2">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Service Description
            </h2>
            <p class="pl-11">
              {{ companyName }} provides AI-powered travel itinerary creation and recommendations. We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-3">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              User Responsibilities
            </h2>
            <div class="pl-11">
              <p class="mb-2">As a user of our service, you are responsible for:</p>
              <ul class="space-y-2">
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Providing accurate and current information</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Maintaining the confidentiality of your account</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Complying with all applicable laws and regulations</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Using the service for lawful purposes only</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-4">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
              Intellectual Property
            </h2>
            <p class="pl-11">
              All content, features, and functionality are the exclusive property of {{ companyName }} and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-5">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
              Limitation of Liability
            </h2>
            <p class="pl-11">
              {{ companyName }} is not liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of our service, including but not limited to travel recommendations, itinerary suggestions, or third-party services.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-6">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">6</span>
              Termination
            </h2>
            <p class="pl-11">
              We may terminate or suspend your account and access to the service at our sole discretion, without notice, for any reason, including if you violate these Terms of Service.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-7">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">7</span>
              Changes to Terms
            </h2>
            <p class="pl-11">
              We reserve the right to modify these Terms of Service at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-8">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">8</span>
              Governing Law
            </h2>
            <p class="pl-11">
              These Terms of Service are governed by the laws of [Your Jurisdiction], without regard to its conflict of law principles.
            </p>
          </div>

          <!-- Last Updated -->
          <div class="text-right mt-8">
            <p class="text-gray-400 italic inline-block px-4 py-2 bg-[#1E293B] rounded-lg border border-gray-700/50">
              Last Updated: {{ lastUpdated }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Top Button -->
    <a href="#" class="fixed bottom-8 right-8 bg-[#1E293B] text-white p-3 rounded-full shadow-lg hover:bg-[#8B5CF6] transition-colors z-50">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </a>
  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add staggered animation delay for sections */
#section-1 { animation-delay: 0.1s; }
#section-2 { animation-delay: 0.2s; }
#section-3 { animation-delay: 0.3s; }
#section-4 { animation-delay: 0.4s; }
#section-5 { animation-delay: 0.5s; }
#section-6 { animation-delay: 0.6s; }
#section-7 { animation-delay: 0.7s; }
#section-8 { animation-delay: 0.8s; }
</style>
