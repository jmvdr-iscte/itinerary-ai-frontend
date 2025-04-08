<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  show: boolean;
  selectedMethod: string;
  tripData: any; // Consider defining a more specific type for tripData
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'update:selectedMethod', value: string): void;
  // (e: 'submit'): void; // REMOVED - Parent no longer needs this signal to start payment
  (e: 'cancel'): void;
  (e: 'error', message: string): void;
}>();

const route = useRoute();
const localSelectedMethod = ref(props.selectedMethod || 'credit_card');
const isProcessing = ref(false); // Tracks if submit action is in progress
const errorMessage = ref('');
const loadingMessage = ref(''); // Text for the loading overlay
const showLoading = ref(false); // Controls loading overlay visibility

// --- Helper Functions ---
const formatDate = (dateString: string | undefined): string => {
    // ... (keep existing formatDate logic) ...
     if (!dateString) return '';
     if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(dateString)) { return dateString; }
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return ''; // Handle invalid date string
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, '0');
     const day = String(date.getDate()).padStart(2, '0');
     const hours = String(date.getHours()).padStart(2, '0');
     const minutes = String(date.getMinutes()).padStart(2, '0');
     const seconds = String(date.getSeconds()).padStart(2, '0');
     const tzOffset = -date.getTimezoneOffset();
     const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
     const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0');
     const tzSign = tzOffset >= 0 ? '+' : '-';
     return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
};

const formatPrice = (value: number | undefined): number => {
    // Original logic divided by 100, assuming input is in cents.
    // Stripe usually expects cents (integer). Ensure backend matches expectation.
    // Let's return the integer value assuming it's already in cents/smallest unit.
    // Or adjust if your backend expects float dollars.
    // Example: return value / 100; // If backend wants float dollars
    return value || 0; // Return the value directly (assuming cents) or 0 if undefined
};
// --- End Helper Functions ---


// --- Watchers ---
watch(() => props.selectedMethod, (newValue) => {
  if (newValue) { localSelectedMethod.value = newValue; }
});

watch(() => props.show, (newValue) => {
  if (newValue) {
    localSelectedMethod.value = props.selectedMethod || 'credit_card';
    errorMessage.value = '';
    isProcessing.value = false; // Ensure processing is false when shown
    showLoading.value = false; // Ensure loading overlay is hidden initially
  }
});
// --- End Watchers ---

const updateSelectedMethod = (method: string) => {
  localSelectedMethod.value = method;
  emit('update:selectedMethod', method);
};

// --- Main Submit Handler ---
const handleSubmit = async () => {
    const callTimestamp = Date.now(); // For debugging logs
    console.log(`handleSubmit ENTRY - Timestamp: ${callTimestamp}`);

    if (isProcessing.value) { // Prevent double execution
        console.warn(`handleSubmit ID: ${callTimestamp} - Blocked: Already processing.`);
        return;
    }

    try {
        isProcessing.value = true; // Disable button immediately
        errorMessage.value = '';
        showLoading.value = true; // Show loading overlay
        loadingMessage.value = 'Creating your personalized itinerary...';
        console.log("Show loading set to true, message:", loadingMessage.value);

        // Determine categories (keep existing logic)
        let categories = props.tripData.categories || [];
        if (categories.length === 0 && route.query.categories) { categories = (route.query.categories as string).split(','); console.log('Using categories from URL:', categories); }
        if (categories.length === 0) { categories = ["ADVENTURE", "FAMILY"]; console.log('Using default categories:', categories); }

        // Prepare itinerary request body
        const itineraryRequestBody = {
            categories: categories, destination: props.tripData.destination,
            number_of_people: props.tripData.number_of_people, origin: props.tripData.origin,
            from: formatDate(props.tripData.from), to: formatDate(props.tripData.to),
            transportation: props.tripData.transportation, email: props.tripData.email,
            budget: props.tripData.budget ?? 0, currency: props.tripData.currency,
            activity_pace: props.tripData.activity_pace || null,
            must_see_attractions: props.tripData.must_see_attractions?.length ? [...props.tripData.must_see_attractions] : null
        };
        console.log('Sending itinerary request with data:', itineraryRequestBody);

        // Define createItinerary within scope
        const createItinerary = (): Promise<any> => { /* ... keep XHR logic ... */
            return new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open('POST', 'http://128.199.62.202/itineraries', true); xhr.setRequestHeader('Content-Type', 'application/json'); xhr.onload = function() { if (this.status >= 200 && this.status < 300) { try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Invalid JSON response (itinerary)')); } } else { reject(new Error(`Itinerary creation failed: ${this.status}`)); } }; xhr.onerror = function() { reject(new Error('Network error (itinerary)')); }; xhr.send(JSON.stringify(itineraryRequestBody)); });
        };

        // Step 1: Create Itinerary
        const itineraryData = await createItinerary();
        console.log('Itinerary created:', itineraryData);
        if (!itineraryData?.uid) { throw new Error('Failed to create itinerary (missing UID).'); }

        // Update loading message and log
        loadingMessage.value = 'Processing payment...';
        console.log("Message updated, processing payment...");

        // Prepare payment data
        const paymentData = {
            itinerary_uid: itineraryData.uid, product_uid: props.tripData.productUid,
            currency: props.tripData.currency, value: formatPrice(props.tripData.price), // Use original value (assuming cents)
            method: localSelectedMethod.value, gateway: "stripe",
            success_url: "http://localhost:5173/payment-success", cancel_url: "http://localhost:5173/payment-cancel"
        };
        console.log('Sending payment request with data:', paymentData);

        // --- REMOVED emit('submit'); --- // No longer needed here

        // Define processPayment within scope
        const processPayment = (): Promise<any> => { /* ... keep XHR logic ... */
            return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', 'http://128.199.62.202/transactions', true);
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                   try { resolve(JSON.parse(xhr.responseText));

                   } catch (e) {
                     reject(new Error('Invalid JSON response (payment)'));
                     }
                    } else
                    {
                      reject(new Error(`Payment request failed: ${this.status}`));
                     }
                    };
                     xhr.onerror = function() {
                       reject(new Error('Network error (payment)')); };

                       xhr.send(JSON.stringify(paymentData));
                       });
        };

        // Step 2: Process Payment
        const paymentResponseData = await processPayment();
        console.log('Payment response:', paymentResponseData);

        // --- Hide loading overlay ONLY AFTER success and BEFORE redirect ---
        // showLoading.value = false; // Moved to finally block if redirect happens

        // Step 3: Redirect
        if (paymentResponseData?.checkout_session_url) {
            console.log("Redirecting to checkout:", paymentResponseData.checkout_session_url);
            // Hide loading just before redirecting
            showLoading.value = false;
            window.location.href = paymentResponseData.checkout_session_url;
            // Note: Code execution might stop here due to redirect
        } else {
            throw new Error('Invalid response from payment service (missing URL).');
        }

    } catch (error: any) { // Catch specific error type if possible
        console.error(`handleSubmit Timestamp: ${callTimestamp} - Payment processing error:`, error);
        showLoading.value = false; // Hide loading on error
        errorMessage.value = error.message || 'An error occurred during payment processing.';
        emit('error', errorMessage.value); // Notify parent of the error
    } finally {
        // This block runs whether the try succeeded or failed (unless redirected first)
        // Ensure the processing flag is reset so the button can be enabled again if needed (e.g., after error)
        isProcessing.value = false;
        console.log(`handleSubmit Timestamp: ${callTimestamp} - FINALLY block, isProcessing set to false.`);
    }
};
// --- End Submit Handler ---

const handleCancel = () => {
  emit('update:show', false);
  emit('cancel');
};

// --- Payment method options (keep as is) ---
const paymentMethods = [ { id: 'credit_card', name: 'Credit/Debit Card', icon: 'src/assets/payment_methods/Gemini_Generated_Image_nkjuwpnkjuwpnkju.png'},
{ id: 'paypal', name: 'PayPal', icon: 'src/assets/payment_methods/Gemini_Generated_Image_3sa91h3sa91h3sa9.png' } ];

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
                :class="localSelectedMethod === method.id ? 'border-purple-500 bg-purple-600/20 ring-1 ring-purple-500' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'"
                @click="updateSelectedMethod(method.id)"
            >
                <div class="flex items-center">
                    <div class="flex-shrink-3 w-12 h-12 mr-2 flex items-center justify-center overflow-hidden">
                        <img :src="method.icon" :alt="method.name" class="w-full h-full object-contain">
                    </div>
                    <div class="flex-grow"> <h4 class="font-medium text-white">{{ method.name }}</h4> </div>
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
          <button @click="handleSubmit" class="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center min-w-[150px] disabled:opacity-60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900" :disabled="isProcessing">
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
