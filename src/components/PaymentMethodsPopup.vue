<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  show: boolean;
  selectedMethod: string;
  tripData: any; // Trip data from the main form
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'update:selectedMethod', value: string): void;
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'error', message: string): void;
}>();

const route = useRoute();
const localSelectedMethod = ref(props.selectedMethod || 'credit_card');
const isProcessing = ref(false);
const errorMessage = ref('');
const loadingMessage = ref('');
const showLoading = ref(false);

// Format the dates to Y-m-d\TH:i:sP format
const formatDate = (dateString) => {
  if (!dateString) return '';

  // If the date is already in the correct format, return it as is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Otherwise, parse and format the date
  const date = new Date(dateString);

  // Format to YYYY-MM-DDTHH:MM:SS+00:00 format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Get timezone offset in hours and minutes
  const tzOffset = -date.getTimezoneOffset();
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const tzSign = tzOffset >= 0 ? '+' : '-';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
};

// Watch for external changes
watch(() => props.selectedMethod, (newValue) => {
  if (newValue) {
    localSelectedMethod.value = newValue;
  }
});

// Watch for show changes
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Reset to default or previously selected method when dialog opens
    localSelectedMethod.value = props.selectedMethod || 'credit_card';
    // Clear any previous error messages
    errorMessage.value = '';
    isProcessing.value = false;
  }
});

const updateSelectedMethod = (method: string) => {
  localSelectedMethod.value = method;
  emit('update:selectedMethod', method);
};

const handleSubmit = async () => {
  try {
    isProcessing.value = true;
    errorMessage.value = '';

    // Show loading overlay for itinerary creation
    showLoading.value = true;
    loadingMessage.value = 'Creating your personalized itinerary...';

    // Get categories from props.tripData or set default values
    // If categories is empty, try to get them from URL query parameters
    let categories = props.tripData.categories || [];
    if (categories.length === 0 && route.query.categories) {
      const categoriesParam = route.query.categories as string;
      categories = categoriesParam.split(',');
      console.log('Using categories from URL:', categories);
    }

    // If still empty, set some default categories
    if (categories.length === 0) {
      categories = ["ADVENTURE", "FAMILY"];
      console.log('Using default categories:', categories);
    }

    // Step 1: Create the itinerary first (this is the expensive operation)
    // Format the request body according to the specified format
    const itineraryRequestBody = {
      categories: categories, // Use the categories we determined above
      destination: props.tripData.destination,
      number_of_people: props.tripData.number_of_people,
      origin: props.tripData.origin,
      from: formatDate(props.tripData.from), // Format date properly
      to: formatDate(props.tripData.to), // Format date properly
      transportation: props.tripData.transportation,
      email: props.tripData.email,
      budget: props.tripData.budget,
      currency: "USD" // Adding the currency field as specified
    };

    console.log('Sending itinerary request with data:', itineraryRequestBody);

    // Try with XMLHttpRequest instead of fetch
    const createItinerary = () => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost/itinerary', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if (this.status >= 200 && this.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`Itinerary creation failed with status: ${this.status}`));
          }
        };
        xhr.onerror = function() {
          reject(new Error('Network error occurred'));
        };
        xhr.send(JSON.stringify(itineraryRequestBody));
      });
    };

    try {
      const itineraryData = await createItinerary();

      if (!itineraryData || !itineraryData.uid) {
        throw new Error('Failed to create itinerary. Please try again.');
      }

      // Update loading message
      loadingMessage.value = 'Processing payment...';

      // Step 2: Process payment with the itinerary UID
      const paymentData = {
        itinerary_uid: itineraryData.uid,
        product_uid: "39609a11-2ab4-498a-a498-9a2c733d9c47", // This would ideally come from the itinerary or your app state
        currency: "USD",
        value: "10.00", // This would ideally be calculated based on the itinerary
        method: localSelectedMethod.value,
        gateway: "stripe",
        country: "PT",
        // In a real app, these URLs would point to your success and cancel pages
        success_url: "http://localhost:5174/payment-success",
        cancel_url: "http://localhost:5174/payment-cancel"
      };

      // Emit submit event to parent component
      emit('submit');

      // Process payment through the backend API using XMLHttpRequest
      const processPayment = () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', 'http://localhost/transactions', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error('Invalid JSON response'));
              }
            } else {
              reject(new Error(`Payment request failed with status: ${this.status}`));
            }
          };
          xhr.onerror = function() {
            reject(new Error('Network error occurred'));
          };
          xhr.send(JSON.stringify(paymentData));
        });
      };

      const paymentResponseData = await processPayment();

      // Hide loading overlay
      showLoading.value = false;

      // Redirect to Stripe checkout page
      if (paymentResponseData && paymentResponseData.checkout_session_url) {
        window.location.href = paymentResponseData.checkout_session_url;
      } else {
        throw new Error('Invalid response from payment service');
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    showLoading.value = false;
    errorMessage.value = error.message || 'There was an error processing your payment. Please try again.';
    isProcessing.value = false;
    emit('error', errorMessage.value);
  }
};

const handleCancel = () => {
  emit('update:show', false);
  emit('cancel');
};

// Payment method options with SVG icons
const paymentMethods = [
  { id: 'credit_card', name: 'Credit Card', icon: 'src/assets/payment_methods/credit-card-payment-svgrepo-com.svg'},
  { id: 'paypal', name: 'PayPal', icon: 'src/assets/payment_methods/paypal-svgrepo-com.svg' }
];
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" @click="handleCancel"></div>

    <!-- Dialog -->
    <div class="relative bg-gradient-to-br from-[#1E293B] to-[#0F1629] rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-fadeIn">
      <!-- Header -->
      <div class="p-6 border-b border-gray-800">
        <h3 class="text-xl font-bold text-white">Select Payment Method</h3>
        <p class="text-gray-400 text-sm mt-1">Choose how you'd like to pay for your trip</p>
      </div>

      <!-- Payment Methods -->
      <div class="p-6">
        <div class="space-y-3">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="p-4 rounded-xl border transition-all cursor-pointer"
            :class="localSelectedMethod === method.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-500'"
            @click="updateSelectedMethod(method.id)"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0 w-10 h-10 mr-3">
                <img :src="method.icon" alt="Payment method" class="w-full h-full object-contain">
              </div>
              <div class="flex-grow">
                <h4 class="font-medium text-white">{{ method.name }}</h4>
              </div>
              <div class="flex-shrink-0">
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  :class="localSelectedMethod === method.id ? 'border-purple-500' : 'border-gray-500'"
                >
                  <div v-if="localSelectedMethod === method.id" class="w-3 h-3 rounded-full bg-purple-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 border-t border-gray-800 flex justify-end space-x-3">
        <button
          @click="handleCancel"
          class="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
          :disabled="isProcessing"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center min-w-[150px]"
          :disabled="isProcessing"
        >
          <template v-if="isProcessing">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </template>
          <template v-else>
            Continue to Checkout
          </template>
        </button>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="showLoading" class="fixed inset-0 z-60 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"></div>

      <!-- Loading Content -->
      <div class="relative bg-gradient-to-br from-[#1E293B] to-[#0F1629] rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center animate-fadeIn">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white text-lg font-medium">{{ loadingMessage }}</p>
          <p class="text-gray-400 text-sm">This may take a moment, please don't close this page.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
