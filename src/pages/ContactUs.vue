<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppHeader from '@/components/AppHeader.vue'; // Assuming these components exist
import AppFooter from '@/components/AppFooter.vue'; // Assuming these components exist

// Form state
const name = ref(''); // Keep name if needed for validation, though not sent to this specific API
const email = ref('');
const subject = ref(''); // Maps to 'title' in the API
const message = ref(''); // Maps to 'content' in the API
const formSubmitted = ref(false);
const formError = ref('');
const isLoading = ref(false); // Loading state for API call

// Placeholder contact info - replace with your actual details
const contactEmail = 'support@seemlesstrip.ai';
const contactPhone = '+1 (555) 123-4567';
const contactAddress = '123 AI Way, Innovation Hub, Tech City, 90210';

// --- Placeholder Social Media Links ---
const socialLinks = ref([
  { name: 'Facebook', icon: 'fab fa-facebook-f', url: '#' },
  { name: 'Twitter', icon: 'fab fa-twitter', url: '#' },
  { name: 'Instagram', icon: 'fab fa-instagram', url: '#' },
  { name: 'LinkedIn', icon: 'fab fa-linkedin-in', url: '#' },
]);

// --- Handler for Form Submission ---
const handleSubmit = async () => {
  formError.value = '';
  formSubmitted.value = false;

  // Basic Validation
  if (!name.value || !email.value || !message.value) {
    formError.value = 'Please fill in all required fields (Name, Email, Message).';
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email.value)) {
      formError.value = 'Please enter a valid email address.';
      return;
  }

  isLoading.value = true; // Start loading

  // Prepare API request body
  const requestBody = {
      name: name.value,
      email: email.value,
      content: message.value,
      title: subject.value || null // Send null if subject is empty
  };

  try {
    // --- API Call ---
    const response = await fetch('http://localhost/user/support', { // UPDATE WITH YOUR ACTUAL API ENDPOINT
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // --- Response Handling ---
    if (response.status === 201) {
      // Success (201 Created)
      formSubmitted.value = true;
      // Clear the form
      name.value = '';
      email.value = '';
      subject.value = '';
      message.value = '';
      // Hide success message after 5 seconds
      setTimeout(() => { formSubmitted.value = false; }, 5000);
    } else {
      // Handle API errors (non-201 status)
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage; // Use message from API if available
      } catch (e) {
          console.warn("Could not parse error response body:", e);
      }
      formError.value = `Failed to send message. ${errorMessage}`;
      console.error('API Error:', response.status, response.statusText);
    }
  } catch (error) {
    // Handle Network / Fetch errors
    console.error('Fetch Error:', error);
    formError.value = 'Unable to reach the server. Please check your connection or try again later.';
     if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
         formError.value = 'Network error or potential CORS issue. Ensure the server at http://localhost allows requests from this origin.';
    }
  } finally {
      isLoading.value = false; // Stop loading
  }
};

// Fix for mobile viewport height issues (vh units)
onMounted(() => {
   const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);
  return () => {
    window.removeEventListener('resize', setVh);
  };
});
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen flex flex-col w-screen overflow-hidden">
    <AppHeader />

    <main class="flex-1 w-full">
      <section class="relative py-20 md:py-28 bg-gradient-to-b from-[#1A2333] to-[#0F1629]">
         <div class="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div class="container mx-auto px-6 text-center relative z-10">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Get in Touch
          </h1>
          <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question about our features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      <section class="py-16 md:py-24">
        <div class="container mx-auto px-6">
          <div class="w-full max-w-2xl mx-auto bg-[#1A2333] p-8 rounded-xl shadow-lg border border-purple-500/20">
            <h2 class="text-2xl font-bold mb-6 text-white text-center md:text-left">Send Us a Message</h2>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-300">Your Name <span class="text-red-500">*</span></label>
                <input type="text" id="name" v-model="name" required class="bg-[#0F1629] border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 placeholder-gray-500 transition duration-300" placeholder="John Doe"/>
              </div>
              <div>
                <label for="email" class="block mb-2 text-sm font-medium text-gray-300">Your Email <span class="text-red-500">*</span></label>
                <input type="email" id="email" v-model="email" required class="bg-[#0F1629] border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 placeholder-gray-500 transition duration-300" placeholder="name@example.com"/>
              </div>
              <div>
                <label for="subject" class="block mb-2 text-sm font-medium text-gray-300">Subject (Optional)</label>
                <input type="text" id="subject" v-model="subject" class="bg-[#0F1629] border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 placeholder-gray-500 transition duration-300" placeholder="Inquiry about pricing"/>
              </div>
              <div>
                <label for="message" class="block mb-2 text-sm font-medium text-gray-300">Your Message <span class="text-red-500">*</span></label>
                <textarea id="message" rows="6" v-model="message" required class="bg-[#0F1629] border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 placeholder-gray-500 transition duration-300" placeholder="Enter your message here..."></textarea>
              </div>
              <div v-if="formError" class="text-red-400 text-sm p-3 bg-red-900/30 rounded-md border border-red-500/50">
                {{ formError }}
              </div>
              <div v-if="formSubmitted" class="text-green-400 text-sm p-3 bg-green-900/30 rounded-md border border-green-500/50">
                Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full sm:w-auto px-8 py-3 text-base font-medium text-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:ring-4 focus:outline-none focus:ring-purple-300 transition duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                {{ isLoading ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>

          <div class="w-full max-w-2xl mx-auto mt-16">
            <h2 class="text-2xl font-bold mb-6 text-white text-center md:text-left">Contact Information</h2>
            <p class="text-gray-300 mb-8 text-center md:text-left">
              Reach out to us directly through the channels below. We aim to respond within 24 business hours.
            </p>
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-8 h-8 mt-1 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30"><i class="fas fa-envelope text-purple-400"></i></div>
                <div>
                  <h3 class="font-semibold text-white">Email Us</h3>
                  <a :href="'mailto:' + contactEmail" class="text-purple-400 hover:text-purple-300 transition-colors break-all">{{ contactEmail }}</a>
                  <p class="text-sm text-gray-400 mt-1">For general inquiries and support.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-8 h-8 mt-1 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30"><i class="fas fa-phone text-purple-400"></i></div>
                <div>
                  <h3 class="font-semibold text-white">Call Us</h3>
                  <a :href="'tel:' + contactPhone" class="text-purple-400 hover:text-purple-300 transition-colors">{{ contactPhone }}</a>
                  <p class="text-sm text-gray-400 mt-1">Mon-Fri, 9am - 5pm WEST</p> </div>
              </div>
               <div class="flex items-start space-x-4">
                 <div class="flex-shrink-0 w-8 h-8 mt-1 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30"><i class="fas fa-map-marker-alt text-purple-400"></i></div>
                 <div>
                   <h3 class="font-semibold text-white">Visit Us</h3>
                   <p class="text-gray-300">{{ contactAddress }}</p>
                   <p class="text-sm text-gray-400 mt-1">Please schedule an appointment beforehand.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Grid Pattern Background */
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Viewport Height Fix */
.min-h-screen {
  min-height: 100vh; /* Fallback */
  min-height: calc(var(--vh, 1vh) * 100);
}

/* Input Focus Styles */
input:focus, textarea:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #8B5CF6; /* purple-500 */
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3); /* Ring effect */
}

/* Ensure disabled styles are applied (Tailwind's 'disabled:' prefix usually handles this) */
button:disabled {
   /* Styles are applied via Tailwind classes: disabled:opacity-50 disabled:cursor-not-allowed etc. */
   /* You could add more explicit styles here if needed */
}

/* Ensure FontAwesome icons render if you haven't included the library globally */
/* @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'); */
</style>
