<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import QuestionComponent from '@/components/QuestionComponent.vue'; // Ensure this path is correct
import ProgressIndicator from '@/components/ProgressIndicator.vue'; // Ensure this path is correct
import '@/assets/questionnaire.css'; // Ensure this path is correct or styles are global

// --- Interfaces and Types ---
interface QuestionOption {
  [key: string]: string; // e.g., "Adventure & thrill-seeking": "ADVENTURE"
}

interface Question {
  question: string;
  icon: string;
  options: QuestionOption;
  multiple?: boolean; // Optional flag for multiple answers. If absent/false, it's single choice.
}

interface ProductData {
  uid: string;
  value: number;
  currency: string;
  symbol: string;
}

// --- Composables ---
const router = useRouter();
const route = useRoute();

// --- State ---
const currentStep = ref(0);
// Stores selected answers: key is step index, value is string (single) or string[] (multiple)
const selectedAnswers = ref<Record<string, string | string[]>>({});
// Stores unique categories selected across all answers
const selectedCategories = ref<Set<string>>(new Set());
const isLoading = ref(true); // For initial load and final submission
const isTransitioning = ref(false); // For question transition animation
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

// Product data from route query parameters (initialized)
const productData = ref<ProductData>({
  uid: '',
  value: 0,
  currency: 'USD',
  symbol: '$'
});

// --- Questionnaire Data ---
const questions: Question[] = [
  {
    question: "What best describes your ideal travel experience?",
    icon: "✈️",
    options: {
      "Adventure & thrill-seeking": "ADVENTURE",
      "Exploring historical landmarks": "CULTURE",
      "Romantic getaways & couple retreats": "LOVE",
      "Relaxing on the beach or spa": "RELAX"
    }
    // 'multiple' is absent, defaults to single choice
  },
  {
    question: "What is your preferred nightlife experience?",
    icon: "🌃",
    options: {
      "Clubs & party scene": "NIGHTLIFE",
      "Casual bars & lounges": "RELAX",
      "Food & wine tastings": "WINE",
      "I prefer quiet evenings": "FAMILY"
    }
    // 'multiple' is absent, defaults to single choice
  },
    {
    question: "How active do you like to be on vacation?",
    icon: "🏃",
    options: {
      "I love hiking, biking, and outdoor sports": "SPORTS",
      "I enjoy a mix of activities & relaxation": "NATURE",
      "I prefer a laid-back experience": "RELAX"
    }
     // 'multiple' is absent, defaults to single choice
  },
  {
    question: "Which cultural aspects interest you most? (Select all that apply)", // Example multi-select
    icon: "🌍",
    options: {
      "Trying local foods & cuisines": "FOOD",
      "Learning about religious & spiritual sites": "RELIGION",
      "Exploring nature & scenic landscapes": "NATURE",
      "Understanding local history & museums": "CULTURE",
      "Shopping for local crafts & souvenirs": "SHOPPING"
    },
    multiple: true // <--- This makes it multiple choice
  },
   {
    question: "Are you traveling with family or kids?",
    icon: "👨‍👩‍👧‍👦",
    options: {
      "Yes, it's a family trip": "FAMILY",
      "No, it's a couple's trip": "LOVE",
      "No, it's a solo trip": "ADVENTURE",
      "Business trip, so no family activities": "BUSINESS"
    }
     // 'multiple' is absent, defaults to single choice
  },
];

// --- Computed Properties ---
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);

// Calculate progress percentage based on the number of steps *answered*
const progressPercentage = computed(() => {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) return 0;
  // Count how many steps have a defined answer (could be string or non-empty array)
  const answeredCount = Object.keys(selectedAnswers.value).filter(key => {
      const answer = selectedAnswers.value[key];
      return Array.isArray(answer) ? answer.length > 0 : answer !== undefined && answer !== null;
  }).length;

  // Show 100% only when finished, otherwise calculate based on answered count
  if (answeredCount === totalQuestions && currentStep.value === totalQuestions -1) {
      return 100;
  }
  // Progress can be based on current step index for visual progression feel
  // Or based strictly on answeredCount / totalQuestions
  return (currentStep.value / Math.max(1, totalQuestions -1)) * 100; // Based on step index (feel)
  // return (answeredCount / totalQuestions) * 100; // Based on completion (strict)

});

// --- Methods ---

// Function to update viewport height CSS variable
const updateVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Handle answer selection from QuestionComponent
const selectAnswer = (option: string, category: string) => {
  const currentQuestion = questions[currentStep.value];
  const isMultiple = currentQuestion.multiple === true;

  if (isMultiple) {
    // --- Handle Multiple Selections ---
    let currentSelection = selectedAnswers.value[currentStep.value];
    if (!Array.isArray(currentSelection)) {
      currentSelection = []; // Initialize if not an array
    }

    const index = currentSelection.indexOf(option);
    if (index > -1) {
      // Deselect: Remove option and its category (only if no other selected option shares it)
      currentSelection.splice(index, 1);
      recalculateCategories(); // Recalculate categories based on remaining selections
    } else {
      // Select: Add option and its category
      currentSelection.push(option);
      selectedCategories.value.add(category);
    }
    // Update the ref. Use spread operator to ensure reactivity if needed.
    selectedAnswers.value[currentStep.value] = [...currentSelection];

    // --- IMPORTANT: No auto-advance for multiple choice ---
    // User must click the "Next" button in QuestionComponent

  } else {
    // --- Handle Single Selection ---
    const previousAnswer = selectedAnswers.value[currentStep.value];
    // If changing answer, remove the old category before adding the new one
    if (typeof previousAnswer === 'string') {
        const oldOptionText = Object.keys(currentQuestion.options).find(opt => currentQuestion.options[opt] === previousAnswer);
        if(oldOptionText) {
            // This assumes the 'previousAnswer' IS the category - update if incorrect
            // A better approach might be needed if answer value isn't the category
            // selectedCategories.value.delete(previousAnswer as string); // Example if answer IS category
            // OR recalculate all categories (safer)
        }
    }

    selectedAnswers.value[currentStep.value] = option; // Store the selected option text itself maybe? or category? let's assume option text
    selectedCategories.value.add(category); // Add the new category
    recalculateCategories(); // Recalculate all categories to be safe

    // --- Auto-advance for single choice ---
    isTransitioning.value = true;
    setTimeout(() => {
      nextStep(true); // Pass flag indicating it was an auto-advance
      setTimeout(() => {
        isTransitioning.value = false; // End fade-in after content swap
      }, 50);
    }, 300); // Transition duration
  }
};

// Recalculates the entire selectedCategories Set based on current answers
// This is safer for handling deselection in both single/multi choice scenarios
const recalculateCategories = () => {
    const newCategories = new Set<string>();
    Object.keys(selectedAnswers.value).forEach(stepKey => {
        const stepIndex = parseInt(stepKey, 10);
        const question = questions[stepIndex];
        const answer = selectedAnswers.value[stepKey];

        if (question && answer) {
            const options = question.options;
            if (Array.isArray(answer)) { // Multiple choice answers (array of option texts)
                answer.forEach(selectedOptionText => {
                    const category = options[selectedOptionText];
                    if (category) newCategories.add(category);
                });
            } else { // Single choice answer (option text)
                 const category = options[answer as string];
                 if (category) newCategories.add(category);
            }
        }
    });
    selectedCategories.value = newCategories;
};


// Move to the next question
// `triggeredBySelect` helps differentiate manual "Next"/"Skip" from auto-advance
const nextStep = (triggeredBySelect: boolean = false) => {
  const isMultiple = questions[currentStep.value]?.multiple === true;

  // Prevent auto-advance from selectAnswer on multiple choice questions
  if (isMultiple && triggeredBySelect) {
      return;
  }

  if (currentStep.value < questions.length - 1) {
      isTransitioning.value = true; // Start fade-out before changing step
      setTimeout(() => {
            currentStep.value++;
            setTimeout(() => {
                isTransitioning.value = false; // End fade-in after content swap
            }, 50);
      }, 300); // Wait for fade-out transition
  } else {
    // Reached the end, attempt to finish
    finishQuestionnaire();
  }
};

// Go back to the previous question
const prevStep = () => {
  if (currentStep.value > 0) {
    isTransitioning.value = true;
    setTimeout(() => {
        currentStep.value--;
        // Optional: Clear answer for the step we are returning to?
        // delete selectedAnswers.value[currentStep.value]; recalculateCategories();
        setTimeout(() => {
            isTransitioning.value = false;
        }, 50);
    }, 300);
  }
};

// Go to a specific step (e.g., from progress indicator)
// Allow navigation only to already visited/answered steps
const goToStep = (step: number) => {
   const isReachable = step <= currentStep.value || selectedAnswers.value[step - 1] !== undefined;
   if (step !== currentStep.value && step >= 0 && step < questions.length && isReachable) {
        isTransitioning.value = true;
        setTimeout(() => {
            currentStep.value = step;
            setTimeout(() => {
                isTransitioning.value = false;
            }, 50);
        }, 300);
   }
};

// Redirect to itinerary form with selected categories and product data
const finishQuestionnaire = () => {
  // Check if the last question has been answered (especially important for multi-choice)
   const lastAnswer = selectedAnswers.value[questions.length - 1];
   const lastQuestionAnswered = lastAnswer !== undefined && (Array.isArray(lastAnswer) ? lastAnswer.length > 0 : true);

   if (!lastQuestionAnswered) {
       console.warn("Please answer the final question.");
       // Maybe show a small message to the user?
       return;
   }

  isLoading.value = true; // Show loading spinner/message
  const categoriesString = Array.from(selectedCategories.value).join(",");

  setTimeout(() => { // Simulate API call delay
    router.push({
      path: "/itinerary", // Ensure this route exists
      query: {
        categories: categoriesString,
        productUid: productData.value.uid,
        price: productData.value.value.toString(),
        currency: productData.value.currency,
        symbol: productData.value.symbol
      }
    });
     // No need to set isLoading back to false if navigating away
  }, 800);
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Get product data from route query parameters
  productData.value.uid = (route.query.productUid as string) || '';
  productData.value.value = parseInt(route.query.price as string) || 0;
  productData.value.currency = (route.query.currency as string) || 'USD';
  productData.value.symbol = (route.query.symbol as string) || '$';

  // Add resize and orientation change listeners
  window.addEventListener('resize', updateVh);
  window.addEventListener('orientationchange', updateVh);
  updateVh(); // Initial call to set CSS variable

  // Simulate initial loading
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
});

onUnmounted(() => {
  // Cleanup listeners
  window.removeEventListener('resize', updateVh);
  window.removeEventListener('orientationchange', updateVh);
});

// Watch for route query changes if the component might persist
watch(route, (newRoute) => {
    productData.value.uid = (newRoute.query.productUid as string) || '';
    productData.value.value = parseInt(newRoute.query.price as string) || 0;
    productData.value.currency = (newRoute.query.currency as string) || 'USD';
    productData.value.symbol = (newRoute.query.symbol as string) || '$';
}, { deep: true });

</script>

<template>
  <div class="min-h-screen-safe bg-gradient-to-br from-[#0F1629] to-[#1A2333] text-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl animate-float"></div>
      <div class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>

    <div class="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center relative z-10">
      <div v-if="isLoading" class="card p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div class="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-300 text-lg mt-4">{{ Array.from(selectedCategories).length > 0 ? 'Preparing your personalized itinerary...' : 'Loading questionnaire...' }}</p>
      </div>

      <div v-else class="card w-full animate-fadeIn">
        <div class="card-header">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-2">Plan Your Perfect Trip</h2>
          <p class="text-center text-white/80 text-sm md:text-base mb-6">Answer a few questions to tailor your experience.</p>

          <ProgressIndicator
            :current-step="currentStep"
            :total-steps="questions.length"
            :percentage="progressPercentage"
            :can-navigate-to-step="(step) => step <= currentStep || selectedAnswers[step - 1] !== undefined"
            @update="goToStep"
          />
        </div>

        <div class="p-6 md:p-8 min-h-[350px] md:min-h-[400px] flex flex-col">
           <transition name="fade-question" mode="out-in">
             <div
                :key="currentStep" class="question-container flex-grow flex flex-col"
             >
              <QuestionComponent
                v-if="questions.length > 0"
                :question="questions[currentStep].question"
                :icon="questions[currentStep].icon"
                :options="questions[currentStep].options"
                :multiple="questions[currentStep].multiple"
                :selected-answer="selectedAnswers[currentStep]"
                :current-step="currentStep"
                :total-steps="questions.length"
                @select="selectAnswer"
                @next="nextStep"
                @prev="prevStep"
              />
              <div v-else>
                  <p class="text-center text-red-400">No questions loaded.</p>
              </div>
             </div>
           </transition>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && questions.length > 0" class="sm:hidden fixed bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-20 pb-1">
        <button
            v-for="(_, index) in questions"
            :key="`dot-${index}`"
            @click="goToStep(index)"
            :disabled="!(index <= currentStep || selectedAnswers[index - 1] !== undefined)"
            :class="[
            'w-2 h-2 rounded-full transition-all duration-300 ease-in-out',
             index === currentStep
                ? 'bg-[#8B5CF6] scale-125' // Active step
                : (index <= currentStep || selectedAnswers[index - 1] !== undefined)
                ? 'bg-[#8B5CF6]/60 hover:bg-[#8B5CF6]/80 cursor-pointer' // Completed/Reachable step
                : 'bg-gray-600 cursor-not-allowed', // Future step (disabled)
             { 'opacity-50': !(index <= currentStep || selectedAnswers[index - 1] !== undefined) } // Dim disabled steps visually
            ]"
            :aria-label="`Go to step ${index + 1}`"
        ></button>
     </div>

  </div>
</template>

<style scoped>
/* Ensure styles from previous answers are included here or globally */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

/* Question transition styles */
.fade-question-enter-active,
.fade-question-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-question-enter-from {
  opacity: 0;
  transform: translateX(30px); /* Slide in from right */
}
.fade-question-leave-to {
  opacity: 0;
  transform: translateX(-30px); /* Slide out to left */
}


/* Use CSS variables for viewport height to fix mobile issues */
.min-h-screen-safe {
  min-height: 100vh; /* Fallback */
  min-height: calc(var(--vh, 1vh) * 100);
  display: flex;
  flex-direction: column;
}

/* Ensure the main content area can grow */
.flex-grow {
  flex-grow: 1;
}

/* Card base styles */
.card {
  background-color: rgba(26, 35, 51, 0.85); /* Slightly more opaque */
  border-radius: 1rem; /* 16px */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08);
  overflow: hidden;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.card-header {
   padding: 1.5rem; /* 24px */
   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
@media (min-width: 768px) {
    .card-header {
        padding: 2rem; /* 32px */
    }
}

.question-container {
    /* Ensures the container itself can flex if needed */
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}


/* Mobile-specific styles */
@media (max-width: 640px) {
  .card-header {
    padding: 1rem; /* Smaller padding on mobile */
  }
   /* Add padding bottom to prevent overlap with fixed dots */
  .min-h-screen-safe {
    padding-bottom: 3.5rem; /* More space for the dots */
  }
}

/* Landscape orientation on mobile */
@media (max-width: 800px) and (max-height: 500px) and (orientation: landscape) {
  .min-h-screen-safe {
     min-height: calc(var(--vh, 1vh) * 100); /* Ensure it still uses calculated vh */
     padding-bottom: 3.5rem; /* Space for dots */
  }
  .card {
    margin-top: 1rem;
    margin-bottom: 0.5rem; /* Reduce bottom margin */
  }
  .card-header h2 {
      font-size: 1.5rem; /* Smaller title */
  }
  .card-header p {
      font-size: 0.875rem; /* Smaller subtitle */
      margin-bottom: 1rem; /* Reduce space */
  }
   .p-6 { padding: 1rem; } /* Reduce padding */
   .md\:p-8 { padding: 1.25rem; } /* Reduce padding */
   .min-h-[350px] { min-height: 200px;} /* Reduce min height */
   .md\:min-h-[400px] { min-height: 220px;} /* Reduce min height */
}
</style>