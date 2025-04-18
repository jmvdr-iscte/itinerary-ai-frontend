<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // You can add analytics tracking or other success-related logic here
});

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0F1629] to-[#1A2333] text-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full filter blur-3xl animate-float"></div>
      <div class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s;"></div>
    </div>

    <div class="w-full max-w-md mx-auto relative z-10">
      <div class="card w-full animate-fadeIn p-8 text-center">
        <!-- Success Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Success Message -->
        <h2 class="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
        <p class="text-gray-300 mb-8">
          Thank you for your payment. Your transaction has been completed successfully.
          We've sent a confirmation email with your trip details.
          If you can't find it, please check your spam folder or contact support.
        </p>

        <!-- Return Button -->
        <button
          @click="goToHome"
          class="w-full gradient-button p-4 rounded-xl flex justify-center items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.card {
  background-color: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
