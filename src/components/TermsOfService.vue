<script setup lang="ts">
import { ref, onMounted } from 'vue';

const lastUpdated = ref('March 27, 2024');
const companyName = 'TripFlowAI';
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Terms of Service
      </h1>

      <div class="space-y-6 text-gray-300">
        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using {{ companyName }}, you agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">2. Service Description</h2>
          <p>
            {{ companyName }} provides AI-powered travel itinerary creation and recommendations. We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">3. User Responsibilities</h2>
          <ul class="list-disc list-inside pl-4 mt-2">
            <li>Provide accurate and current information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Use the service for lawful purposes only</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">4. Intellectual Property</h2>
          <p>
            All content, features, and functionality are the exclusive property of {{ companyName }} and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">5. Limitation of Liability</h2>
          <p>
            {{ companyName }} is not liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of our service, including but not limited to travel recommendations, itinerary suggestions, or third-party services.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">6. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service at our sole discretion, without notice, for any reason, including if you violate these Terms of Service.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">8. Governing Law</h2>
          <p>
            These Terms of Service are governed by the laws of [Your Jurisdiction], without regard to its conflict of law principles.
          </p>
        </section>

        <p class="text-gray-400 italic">
          Last Updated: {{ lastUpdated }}
        </p>
      </div>
    </div>
  </div>
</template>
