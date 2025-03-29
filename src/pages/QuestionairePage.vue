<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import QuestionComponent from '@/components/QuestionComponent.vue';
import ProgressIndicator from '@/components/ProgressIndicator.vue';
import '@/assets/questionnaire.css';

const router = useRouter();
const route = useRoute();
const currentStep = ref(0);
const selectedAnswers = ref<Record<string, string>>({});
const selectedCategories = ref<string[]>([]);
const isLoading = ref(true);
const isTransitioning = ref(false);
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);

// Product data from route query parameters
const productData = ref({
  uid: '',
  value: 0,
  currency: 'USD'
});

const questions = [
  {
    question: "What best describes your ideal travel experience?",
    icon: "✈️",
    options: {
      "Adventure & thrill-seeking": "ADVENTURE",
      "Exploring historical landmarks": "CULTURE",
      "Romantic getaways & couple retreats": "LOVE",
      "Relaxing on the beach or spa": "RELAX"
    }
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
  },
  {
    question: "Do you enjoy shopping while traveling?",
    icon: "🛍️",
    options: {
      "Yes, I love shopping for local fashion & brands": "SHOPPING",
      "I like exploring local markets & souvenirs": "CULTURE",
      "I prefer experiences over shopping": "ADVENTURE"
    }
  },
  {
    question: "How active do you like to be on vacation?",
    icon: "🏃",
    options: {
      "I love hiking, biking, and outdoor sports": "SPORTS",
      "I enjoy a mix of activities & relaxation": "NATURE",
      "I prefer a laid-back experience": "RELAX"
    }
  },
  {
    question: "Are you traveling with family or kids?",
    icon: "👨‍👩‍👧‍👦",
    options: {
      "Yes, it's a family trip": "FAMILY",
      "No, it's a solo or couple's trip": "LOVE",
      "No, it's a solo trip": "ADVENTURE",
      "Business trip, so no family activities": "BUSINESS"
    }
  },
  {
    question: "What's your favorite part of experiencing new cultures?",
    icon: "🌍",
    options: {
      "Trying local foods & cuisines": "FOOD",
      "Learning about religious & spiritual sites": "RELIGION",
      "Exploring nature & scenic landscapes": "NATURE",
      "Understanding local history & museums": "CULTURE"
    }
  }
];

// Calculate progress percentage
const progressPercentage = computed(() => {
  return ((currentStep.value) / (questions.length - 1)) * 100;
});

// Handle answer selection
const selectAnswer = (option: string, category: string) => {
  selectedAnswers.value[currentStep.value] = option;
  if (!selectedCategories.value.includes(category)) {
    selectedCategories.value.push(category);
  }

  // Add transition effect
  isTransitioning.value = true;
  setTimeout(() => {
    nextStep();
    setTimeout(() => {
      isTransitioning.value = false;
    }, 50);
  }, 300);
};

// Move to the next question
const nextStep = () => {
  if (currentStep.value < questions.length - 1) {
    currentStep.value++;
  } else {
    finishQuestionnaire();
  }
};

// Go back to the previous question
const prevStep = () => {
  if (currentStep.value > 0) {
    isTransitioning.value = true;
    setTimeout(() => {
      currentStep.value--;
      setTimeout(() => {
        isTransitioning.value = false;
      }, 50);
    }, 300);
  }
};

// Go to a specific step
const goToStep = (step: number) => {
  if (step !== currentStep.value && step >= 0 && step < questions.length) {
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
  // Show completion animation
  isLoading.value = true;
  setTimeout(() => {
    router.push({
      path: "/itinerary",
      query: {
        categories: selectedCategories.value.join(","),
        productUid: productData.value.uid,
        price: productData.value.value.toString(),
        currency: productData.value.currency
      }
    });
  }, 800);
};

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;

  // Update vh variable when resizing
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Handle orientation change specifically for mobile
const handleOrientationChange = () => {
  setTimeout(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, 100);
};

onMounted(() => {
  // Get product data from route query parameters
  if (route.query.productUid) {
    productData.value.uid = route.query.productUid as string;
  }
  if (route.query.price) {
    productData.value.value = parseInt(route.query.price as string);
  }
  if (route.query.currency) {
    productData.value.currency = route.query.currency as string;
  }

  console.log('Product data received:', productData.value);

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);

  // Fix for mobile viewport height issues
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // Simulate loading state
  setTimeout(() => {
    isLoading.value = false;
  }, 800);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
  };
});
</script>

<template>
  <div class="min-h-screen-safe bg-gradient-to-br from-[#0F1629] to-[#1A2333] text-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl animate-float"></div>
      <div class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>

    <div class="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center relative z-10">
      <!-- Loading State -->
      <div v-if="isLoading" class="card p-8 flex flex-col items-center justify-center space-y-4">
        <div class="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-300">{{ selectedCategories.length > 0 ? 'Preparing your personalized itinerary...' : 'Loading your questionnaire...' }}</p>
      </div>

      <!-- Main Card -->
      <div v-else class="card w-full animate-fadeIn">
        <!-- Header -->
        <div class="card-header">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-2">Plan Your Perfect Trip</h2>
          <p class="text-center text-white/80 text-sm md:text-base">Answer a few quick questions so we can tailor your itinerary.</p>

          <!-- Progress Indicator Component -->
          <ProgressIndicator
            :current-step="currentStep"
            :total-steps="questions.length"
            :percentage="progressPercentage"
            @update="goToStep"
          />
        </div>

        <!-- Question Content -->
        <div class="p-6 md:p-8">
          <div
            class="question-container"
            :class="{ 'fade-out': isTransitioning, 'fade-in': !isTransitioning }"
          >
            <!-- Question Component -->
            <QuestionComponent
              :question="questions[currentStep].question"
              :icon="questions[currentStep].icon"
              :options="questions[currentStep].options"
              :current-step="currentStep"
              :total-steps="questions.length"
              @select="selectAnswer"
              @next="nextStep"
              @prev="prevStep"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed position dots for mobile -->
    <div class="sm:hidden fixed bottom-4 left-0 right-0 flex justify-center space-x-1.5">
      <button
        v-for="(_, index) in questions"
        :key="index"
        @click="goToStep(index)"
        :class="[
          'w-2 h-2 rounded-full transition-all',
          index === currentStep
            ? 'bg-[#8B5CF6] scale-110'
            : index < currentStep
              ? 'bg-[#8B5CF6]/50'
              : 'bg-gray-600'
        ]"
      ></button>
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

.question-container {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-out {
  opacity: 0;
  transform: translateY(20px);
}

.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* Use CSS variables for viewport height to fix mobile issues */
.min-h-screen-safe {
  min-height: 100vh; /* Fallback */
  min-height: calc(var(--vh, 1vh) * 100);
}

/* Mobile-specific styles */
@media (max-width: 640px) {
  .card-header {
    @apply p-4;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 767px) and (orientation: landscape) {
  .min-h-screen-safe {
    min-height: 100%;
    padding-bottom: 2rem;
  }

  .card {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
}

/* Ensure the container takes up available space */
@media (min-height: 800px) {
  .flex-grow {
    flex-grow: 1;
  }
}
</style>
