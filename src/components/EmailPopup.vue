<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:show', value: boolean): void;
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const localEmail = ref(props.modelValue);
const isValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(localEmail.value);
});

watch(() => props.modelValue, (newValue) => {
  localEmail.value = newValue;
});

watch(() => props.show, (newValue) => {
  if (newValue) {
    // When popup opens, prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Focus the email input when popup opens
    setTimeout(() => {
      const emailInput = document.getElementById('email-input');
      if (emailInput) {
        emailInput.focus();
      }
    }, 100); // Short delay to ensure element is rendered
  } else {
    // Restore scrolling when popup closes
    document.body.style.overflow = '';
  }
}, { immediate: true }); // Run immediately to handle initial state if needed

const updateEmail = (event: Event) => {
  const target = event.target as HTMLInputElement;
  localEmail.value = target.value;
  emit('update:modelValue', target.value);
};

const close = () => {
  emit('update:show', false);
  emit('cancel');
};

const submit = () => {
  if (isValid.value) {
    emit('submit');
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close();
  } else if (event.key === 'Enter' && isValid.value) {
    // Prevent default Enter behavior if inside a form context
    event.preventDefault();
    submit();
  }
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      @keydown.esc="close" tabindex="-1" >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-popup-title"
        class="bg-[#1E293B] rounded-3xl shadow-2xl max-w-md w-full border border-gray-700/30 overflow-hidden transform transition-all"
        :class="{'animate-popup-in': show}"
      >
        <div class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] p-6 relative overflow-hidden">
          <div class="relative z-10">
            <h3 id="email-popup-title" class="text-2xl font-bold text-white">Almost There!</h3>
            <p class="text-white/80 mt-1">We'll send your itinerary to your email</p>
          </div>
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full opacity-50 pointer-events-none"></div>
          <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full opacity-50 pointer-events-none"></div>
        </div>

        <div class="p-6">
          <form @submit.prevent="submit" class="space-y-4">
            <div class="space-y-2">
              <label for="email-input" class="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email-input"
                  v-model="localEmail"
                  @input="updateEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  aria-required="true"
                  aria-invalid="!isValid && localEmail.length > 0"
                  class="component-input w-full pl-10 pr-10" aria-describedby="email-validation-error email-terms-hint"
                >
                <span
                  v-if="localEmail"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                  :class="isValid ? 'text-green-400' : 'text-red-400'"
                >
                  <svg v-if="isValid" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                </span>
              </div>
              <p id="email-validation-error" v-if="localEmail && !isValid" class="text-red-400 text-sm mt-1" role="alert">
                Please enter a valid email address.
              </p>
            </div>

            <div id="email-terms-hint" class="text-sm text-gray-400">
              By continuing, you agree to our
              <a href="http://localhost:5174/tos" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline focus:outline-none focus:ring-1 focus:ring-purple-500 rounded">Terms of Service</a>
              and acknowledge our
              <a href="http://localhost:5174/privacy-policy" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline focus:outline-none focus:ring-1 focus:ring-purple-500 rounded">Privacy Policy</a>.
            </div>

            <div class="flex justify-between items-center pt-4"> <button
                type="button"
                @click="close"
                class="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-[#0F1629]/50 flex items-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 Cancel
              </button>
              <button
                type="submit"
                class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#5B3AA3] hover:to-[#7B4CD6] transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center disabled:opacity-70 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800"
                :disabled="!isValid"
              >
                <span class="mr-2">Pay Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </button>
            </div>
          </form> </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Added standard input style definition */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out;
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
   color-scheme: dark;
}
.component-input::placeholder {
    @apply text-gray-500 opacity-100;
}
/* Adjust padding for icon and validation indicator */
.component-input.pl-10 { padding-left: 2.5rem; }
.component-input.pr-10 { padding-right: 2.5rem; }


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes popup-in {
  0% { opacity: 0; transform: scale(0.9); }
  70% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-popup-in {
  animation: popup-in 0.4s ease-out forwards;
}

/* Removing specific input focus style to rely on .component-input */
/* input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
} */
</style>
