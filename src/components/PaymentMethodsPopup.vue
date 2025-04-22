<script setup lang="ts">
import { ref, watch, computed } from 'vue'; // Added computed
import { useRoute } from 'vue-router';

const props = defineProps<{
  show: boolean;
  selectedMethod: string;
  tripData: any; // Consider defining a more specific type for tripData
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'update:selectedMethod', value: string): void;
  (e: 'cancel'): void;
  (e: 'error', message: string): void;
}>();

const route = useRoute();
const localSelectedMethod = ref(props.selectedMethod || 'credit_card');
const isProcessing = ref(false); // Tracks if submit action is in progress
const errorMessage = ref('');
const loadingMessage = ref(''); // Text for the loading overlay during submission
const showLoading = ref(false); // Controls loading overlay visibility during submission

// --- NEW: Image Loading State ---
// Status per image ID: 'loading', 'loaded', 'error'
const imagesLoadingStatus = ref<{ [key: string]: 'loading' | 'loaded' | 'error' }>({});
// --- End NEW ---


// --- Helper Functions ---
const formatPrice = (value: number | undefined): number => {
    return value || 0; // Return the value directly (assuming cents) or 0 if undefined
};
// --- End Helper Functions ---

// --- Payment method options ---
// Moved up slightly to be available for watcher initialization
const paymentMethods = [
    { id: 'credit_card', name: 'Credit/Debit Card', icon: 'https://images.tripvibes.me/credit_card_logo.png'},
    { id: 'paypal', name: 'PayPal', icon: 'https://images.tripvibes.me/paypal_logo.png' }
    // Add more methods here if needed
];
// --- End Payment method options ---

// --- NEW: Image Load Handlers ---
const handleImageLoad = (methodId: string) => {
    imagesLoadingStatus.value[methodId] = 'loaded';
    // console.log(`Image loaded: ${methodId}`);
};

const handleImageError = (methodId: string) => {
    console.error(`Failed to load image for method: ${methodId}`);
    imagesLoadingStatus.value[methodId] = 'error';
};
// --- End NEW ---

// --- Computed Property to check if any image is still loading ---
const areImagesLoading = computed(() => {
    return paymentMethods.some(method => imagesLoadingStatus.value[method.id] === 'loading');
});
// --- End Computed Property ---


// --- Watchers ---
watch(() => props.selectedMethod, (newValue) => {
  if (newValue) { localSelectedMethod.value = newValue; }
});

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Reset component state when shown
    localSelectedMethod.value = props.selectedMethod || 'credit_card';
    errorMessage.value = '';
    isProcessing.value = false;
    showLoading.value = false;

    // --- NEW: Reset Image Loading Status ---
    const initialStatus: { [key: string]: 'loading' | 'loaded' | 'error' } = {};
    paymentMethods.forEach(method => {
        // Assume loading initially - events will update status
        initialStatus[method.id] = 'loading';
    });
    imagesLoadingStatus.value = initialStatus;
    // --- End NEW ---

  }
}, { immediate: true }); // Use immediate: true if needed to run on initial component load if props.show is true initially
// --- End Watchers ---

const updateSelectedMethod = (method: string) => {
  // Prevent changing selection while images might still be loading (optional, for smoother UX)
  // if (areImagesLoading.value) return;
  localSelectedMethod.value = method;
  emit('update:selectedMethod', method);
};

// --- Main Submit Handler (No changes needed here for image loading) ---
const handleSubmit = async () => {
    const callTimestamp = Date.now();

    if (isProcessing.value) {
        console.warn(`handleSubmit ID: ${callTimestamp} - Blocked: Already processing.`);
        return;
    }

    // --- Prevent submission if images haven't loaded (optional safety check) ---
    // This prevents users submitting before potentially seeing an image error
    if (areImagesLoading.value) {
        console.warn(`handleSubmit ID: ${callTimestamp} - Blocked: Images still loading.`);
        errorMessage.value = "Please wait for images to load.";
        // Optionally emit an error or just prevent submission
        // emit('error', errorMessage.value);
        return;
    }
    // --- End optional safety check ---

    try {
        isProcessing.value = true;
        errorMessage.value = '';
        showLoading.value = true; // Show the MAIN loading overlay for API calls
        loadingMessage.value = 'Creating your personalized itinerary...';

        let categories = props.tripData.categories || [];
        if (categories.length === 0 && route.query.categories) { categories = (route.query.categories as string).split(','); }
        if (categories.length === 0) { categories = ["ADVENTURE", "FAMILY"]; }

        const itineraryRequestBody = {
            categories: categories, destination: props.tripData.destination,
            number_of_people: props.tripData.number_of_people,
            origin: props.tripData.origin,
            transportation: props.tripData.transportation,
            email: props.tripData.email,
            number_of_days: props.tripData.number_of_days,
            budget: props.tripData.budget ?? 0, currency: props.tripData.currency,
            activity_pace: props.tripData.activity_pace || null,
            season: props.tripData.season,
            user_input: props.tripData.user_input || null,
        };

        const createItinerary = (): Promise<any> => {
            return new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open('POST', 'https://api.tripvibes.me/itineraries', true); xhr.setRequestHeader('Content-Type', 'application/json'); xhr.onload = function() { if (this.status >= 200 && this.status < 300) { try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Invalid JSON response (itinerary)')); } } else { reject(new Error(`Itinerary creation failed: ${this.status}`)); } }; xhr.onerror = function() { reject(new Error('Network error (itinerary)')); }; xhr.send(JSON.stringify(itineraryRequestBody)); });
        };

        const itineraryData = await createItinerary();
        if (!itineraryData?.uid) { throw new Error('Failed to create itinerary (missing UID).'); }

        loadingMessage.value = 'Processing payment...';

        const paymentData = {
            itinerary_uid: itineraryData.uid, product_uid: props.tripData.productUid,
            currency: props.tripData.currency, value: formatPrice(props.tripData.price),
            method: localSelectedMethod.value, gateway: "stripe",
            success_url: "http://localhost:5173/payment-success", cancel_url: "http://localhost:5173/payment-cancel"
        };

        const processPayment = (): Promise<any> => {
            return new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open('POST', 'https://api.tripvibes.me/transactions', true); xhr.setRequestHeader('Content-Type', 'application/json'); xhr.onload = function() { if (this.status >= 200 && this.status < 300) { try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Invalid JSON response (payment)')); } } else { reject(new Error(`Payment request failed: ${this.status}`)); } }; xhr.onerror = function() { reject(new Error('Network error (payment)')); }; xhr.send(JSON.stringify(paymentData)); });
        };

        const paymentResponseData = await processPayment();

        if (paymentResponseData?.checkout_session_url && paymentResponseData?.uid) {
          sessionStorage.setItem('pendingTransactionUid', paymentResponseData.uid);

          showLoading.value = false;
          window.location.href = paymentResponseData.checkout_session_url;
      } else {
          console.error('Invalid response from payment service:');
          throw new Error('Invalid response from payment service (missing URL or UID).');
      }

    } catch (error: any) {
        console.error(`handleSubmit Timestamp: ${callTimestamp} - Payment processing error:`);
        showLoading.value = false; // Hide MAIN loading overlay on error
        errorMessage.value = error.message || 'An error occurred during payment processing.';
        emit('error', errorMessage.value);
    } finally {
        // Ensure processing flag is reset if redirect didn't happen (e.g., on error)
        isProcessing.value = false;
    }
};
// --- End Submit Handler ---

const handleCancel = () => {
  emit('update:show', false);
  emit('cancel');
};

</script>
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" @click="handleCancel"></div>

    <div role="dialog" aria-modal="true" aria-labelledby="payment-popup-title" class="relative bg-gradient-to-br from-[#1E293B] to-[#0F1629] rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-fadeIn">
        <div class="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
          <h3 id="payment-popup-title" class="text-xl font-bold text-white">Select Payment Method</h3>
          <p class="text-gray-200 text-sm mt-1">Choose how you'd like to pay</p>
        </div>

        <div class="p-6">
          <div class="space-y-3">
            <div
                v-for="method in paymentMethods" :key="method.id"
                class="p-4 rounded-xl border transition-all cursor-pointer"
                :class="[
                    localSelectedMethod === method.id ? 'border-purple-500 bg-purple-600/20 ring-1 ring-purple-500' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30',
                    {'opacity-70 pointer-events-none': areImagesLoading}
                ]"
                @click="updateSelectedMethod(method.id)"
            >
                <div class="flex items-center">
                  <div class="flex-shrink-0 w-12 h-12 mr-4 flex items-center justify-center overflow-hidden relative">
                <div v-if="imagesLoadingStatus[method.id] === 'loading'" class="absolute inset-0 flex items-center justify-center">
                    <svg class="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <div v-else-if="imagesLoadingStatus[method.id] === 'error'" class="absolute inset-0 flex items-center justify-center">
                    <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <img
                    v-show="imagesLoadingStatus[method.id] === 'loaded'"
                    :src="method.icon"
                    :alt="method.name"
                    class="w-full h-full object-contain"
                    @load="handleImageLoad(method.id)"
                    @error="handleImageError(method.id)"
                />
            </div>
                    <div class="flex-grow">
                         <h4 class="font-medium text-white">{{ method.name }}</h4>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors" :class="localSelectedMethod === method.id ? 'border-purple-500 bg-purple-600' : 'border-slate-600 bg-slate-700/50'">
                            <div v-if="localSelectedMethod === method.id" class="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

          <div v-if="errorMessage" class="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {{ errorMessage }}
          </div>
        </div>

        <div class="p-4 border-t border-gray-700/50 flex justify-end space-x-3 bg-slate-800/30">
          <button @click="handleCancel" class="px-5 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700/70 transition disabled:opacity-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900" :disabled="isProcessing"> Cancel </button>
          <button @click="handleSubmit" class="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center min-w-[150px] disabled:opacity-60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900" :disabled="isProcessing || areImagesLoading">
            <template v-if="isProcessing">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                Processing...
            </template>
            <template v-else> Continue to Checkout </template>
          </button>
        </div>
     </div>

     <div v-if="showLoading" class="fixed inset-0 z-60 flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm"></div>
      <div class="relative bg-gradient-to-br from-[#1E293B] to-[#0F1629] rounded-2xl shadow-xl p-8 max-w-xs w-full mx-4 text-center animate-fadeIn border border-slate-700">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white text-base font-medium">{{ loadingMessage }}</p>
          <p class="text-gray-400 text-xs">Please wait, don't close this page.</p>
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