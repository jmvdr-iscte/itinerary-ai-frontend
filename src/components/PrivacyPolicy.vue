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
  { id: 1, title: 'Introduction' },
  { id: 2, title: 'Information We Collect' },
  { id: 3, title: 'How We Use Your Information' },
  { id: 4, title: 'Data Security' },
  { id: 5, title: 'Your Rights' },
  { id: 6, title: 'Contact Us' },
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
          Privacy Policy
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
              Introduction
            </h2>
            <p class="pl-11">
              Welcome to {{ companyName }}. We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-2">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Information We Collect
            </h2>
            <div class="pl-11">
              <p class="mb-3">
                We only collect and store your email address for the following purposes:
              </p>
              <ul class="space-y-2">
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Sending newsletters and updates about our service</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Providing account-related communications</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Delivering personalized travel recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-3">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              How We Use Your Information
            </h2>
            <p class="pl-11">
              Your email is used solely for communication related to {{ companyName }} services. We do not sell, trade, or rent your personal information to third parties.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-4">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
              Data Security
            </h2>
            <p class="pl-11">
              We implement industry-standard security measures to protect your email address from unauthorized access, disclosure, alteration, or destruction.
            </p>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-5">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
              Your Rights
            </h2>
            <div class="pl-11">
              <p class="mb-3">
                You have the right to:
              </p>
              <ul class="space-y-2">
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Request to view the personal information we hold</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Request correction of your personal information</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Request deletion of your personal information</span>
                </li>
                <li class="flex items-start">
                  <span class="text-[#8B5CF6] mr-2">•</span>
                  <span>Opt-out of marketing communications</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 shadow-xl shadow-purple-900/5 transform transition-all duration-500 opacity-0 translate-y-4"
               :class="{'animate-fade-in': true}"
               id="section-6">
            <h2 class="text-2xl font-semibold mb-4 text-white flex items-center">
              <span class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">6</span>
              Contact Us
            </h2>
            <div class="pl-11">
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div class="mt-4 p-4 bg-[#0F1629] rounded-lg border border-gray-700/50 inline-block">
                <p class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#8B5CF6] mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href="mailto:privacy@tripflowai.com" class="text-[#8B5CF6] hover:underline">privacy@tripflowai.com</a>
                </p>
              </div>
            </div>
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
</style>
