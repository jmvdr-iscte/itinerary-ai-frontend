<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// Define reactive states
const isLoading = ref(true); // Start in loading state
// Expanded statuses: pending, success, failed, cancelled, error (fetch/network), timeout
const paymentStatus = ref<'pending' | 'success' | 'failed' | 'cancelled' | 'error' | 'timeout'>('pending');
const errorMessage = ref<string | null>(null); // Store potential error messages

// Polling configuration
const POLLING_INTERVAL = 3000; // Check every 3 seconds
const MAX_POLL_ATTEMPTS = 30; // Max 10 attempts (30 seconds total)
const pollIntervalId = ref<ReturnType<typeof setInterval> | null>(null); // Use ReturnType for better typing
const pollAttempts = ref(0);

const router = useRouter();

// Function to stop polling
const stopPolling = () => {
  if (pollIntervalId.value !== null) {
    clearInterval(pollIntervalId.value);
    pollIntervalId.value = null;
    console.log('Polling stopped.');
  }
};

// Function to check transaction status (modified for polling)
const checkTransactionStatus = async (uid: string) => {
  // Only increment attempts if polling is active (or on the first manual call within startPolling)
  if (pollIntervalId.value !== null || pollAttempts.value === 0) {
      pollAttempts.value++;
      console.log(`Polling attempt: ${pollAttempts.value}`);
  }


  // Prevent further checks if polling was already stopped elsewhere
  if (pollIntervalId.value === null && pollAttempts.value > 1) {
      console.log('Polling already stopped, skipping check.');
      return;
  }

  try {
    // Replace with your actual API endpoint and add necessary headers
    const response = await fetch(`https://api.tripvibes.me/transactions/${uid}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Add authentication headers if required
        // 'Authorization': `Bearer ${yourAuthToken}`
      }
    });

    // --- Handle API Errors ---
    if (!response.ok) {
        let errorText = `Error fetching status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                 errorText += ` - ${errorData.message}`;
            }
        } catch (e) { /* Ignore if error response is not JSON */ }
        throw new Error(errorText); // Throw to be caught by the catch block
    }

    const data = await response.json();

    // --- Process Status ---
    // *** IMPORTANT: Adjust these status strings to match YOUR backend API ***
    const currentStatus = data?.status?.toUpperCase(); // Normalize to uppercase for comparison

    if (currentStatus === 'COMPLETED') {
      console.log('Status: COMPLETED');
      paymentStatus.value = 'success';
      stopPolling();
      isLoading.value = false;
    } else if (currentStatus === 'FAILED') {
      console.log('Status: FAILED');
      paymentStatus.value = 'failed';
      errorMessage.value = data?.message || 'Payment failed. Please contact support.'; // Use backend message if available
      stopPolling();
      isLoading.value = false;
    } else if (currentStatus === 'CANCELED' || currentStatus === 'CANCELLED') { // Allow for spelling variations
      console.log('Status: CANCELED/CANCELLED');
      paymentStatus.value = 'cancelled';
      errorMessage.value = data?.message || 'Payment was cancelled.';
      stopPolling();
      isLoading.value = false;
    } else if (pollAttempts.value >= MAX_POLL_ATTEMPTS) {
      // Reached max attempts without a final status
      console.log('Status: Timeout (Max attempts reached)');
      paymentStatus.value = 'timeout';
      errorMessage.value = `Payment status is still pending after ${MAX_POLL_ATTEMPTS * (POLLING_INTERVAL / 1000)} seconds. Please check your email or contact support.`;
      stopPolling();
      isLoading.value = false;
    } else {
       // Status is still pending or unrecognized, continue polling (if interval is set)
       console.log(`Status: ${currentStatus || 'Unknown'} - Continuing poll.`);
       // Ensure loading stays true while polling continues
       isLoading.value = true;
    }

  } catch (error: any) {
    console.error('Failed during status check:', error);
    paymentStatus.value = 'error'; // Use 'error' for fetch/network issues
    errorMessage.value = error.message || 'Could not verify payment status due to a network or server error.';
    stopPolling(); // Stop polling on error
    isLoading.value = false;
  }
};

// Function to start the polling process
const startPolling = (uid: string) => {
  console.log('Starting polling process...');
  isLoading.value = true; // Ensure loading is true at the start
  paymentStatus.value = 'pending'; // Reset status
  pollAttempts.value = 0; // Reset attempts

  // Perform the first check immediately
  checkTransactionStatus(uid).then(() => {
      // Only set the interval if the first check didn't result in a final state
      // (isLoading will be false if a final state was reached)
      if (isLoading.value && pollIntervalId.value === null) {
          console.log('Setting up interval...');
          pollIntervalId.value = setInterval(() => {
              checkTransactionStatus(uid);
          }, POLLING_INTERVAL);
      } else {
          console.log('First check yielded final status or error, no interval needed.');
      }
  });
};

onMounted(() => {
  const transactionUid = sessionStorage.getItem('pendingTransactionUid');

  if (transactionUid) {
    sessionStorage.removeItem('pendingTransactionUid'); // Remove immediately
    startPolling(transactionUid);
  } else {
    console.error('No transaction UID found in session storage.');
    paymentStatus.value = 'error';
    errorMessage.value = 'Could not verify payment: Transaction ID missing.';
    isLoading.value = false;
    // Maybe redirect or show a specific error message for missing UID
    // router.push('/'); // Option: redirect if no UID
  }
});

// Clean up the interval when the component is unmounted
onUnmounted(() => {
  stopPolling();
});

const goToHome = () => {
  router.push('/');
};

const contactSupport = () => {
  alert('Please contact support regarding your transaction.');
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0F1629] to-[#1A2333] text-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full filter blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s;"></div>
    </div>

    <div class="w-full max-w-md mx-auto relative z-10">
      <div v-if="isLoading" class="card w-full animate-fadeIn p-8 text-center">
         <div class="flex justify-center items-center mb-6">
            <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
         </div>
         <h2 class="text-2xl font-bold text-white mb-4">Verifying Payment...</h2>
         <p class="text-gray-300">Please wait while we confirm your transaction.</p>
      </div>

      <div v-else-if="paymentStatus === 'success'" class="card w-full animate-fadeIn p-8 text-center">
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
        <p class="text-gray-300 mb-8">
          Thank you! Your itinerary has been sent via email, if you can not find it, please check the spam folder.
        </p>
        <button @click="goToHome" class="w-full gradient-button p-4 rounded-xl flex justify-center items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <span>Return to Home</span>
        </button>
      </div>

      <div v-else class="card w-full animate-fadeIn p-8 text-center">
         <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
        </div>
         <h2 class="text-3xl font-bold text-white mb-4">
            <span v-if="paymentStatus === 'failed'">Payment Failed</span>
            <span v-else-if="paymentStatus === 'cancelled'">Payment Cancelled</span>
            <span v-else-if="paymentStatus === 'timeout'">Verification Timeout</span>
            <span v-else-if="paymentStatus === 'error'">Verification Error</span>
            <span v-else>Payment Issue</span> </h2>
        <p class="text-gray-300 mb-8">
          {{ errorMessage || 'There was an issue verifying your payment status. Please do not retry immediately.' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
             <button @click="goToHome" class="gradient-button p-4 rounded-xl flex justify-center items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 flex-1">
                <span>Return to Home</span>
             </button>
             <button @click="contactSupport" class="gradient-button p-4 rounded-xl flex justify-center items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex-1">
                <span>Contact Support</span>
             </button>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Keep your existing styles */
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

/* Add spinner animation if you use the SVG spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>