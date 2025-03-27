<script setup lang="ts">
import { ref, onMounted } from 'vue';

const lastUpdated = ref('March 27, 2024');
const companyName = 'TripFlowAI';
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Privacy Policy
      </h1>

      <div class="space-y-6 text-gray-300">
        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">Introduction</h2>
          <p>
            Welcome to {{ companyName }}. We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
          <p>
            We only collect and store your email address for the following purposes:
          </p>
          <ul class="list-disc list-inside pl-4 mt-2">
            <li>Sending newsletters and updates about our service</li>
            <li>Providing account-related communications</li>
            <li>Delivering personalized travel recommendations</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
          <p>
            Your email is used solely for communication related to {{ companyName }} services. We do not sell, trade, or rent your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your email address from unauthorized access, disclosure, alteration, or destruction.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul class="list-disc list-inside pl-4 mt-2">
            <li>Request to view the personal information we hold</li>
            <li>Request correction of your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@tripflowai.com.
          </p>
        </section>

        <p class="text-gray-400 italic">
          Last Updated: {{ lastUpdated }}
        </p>
      </div>
    </div>
  </div>
</template>
