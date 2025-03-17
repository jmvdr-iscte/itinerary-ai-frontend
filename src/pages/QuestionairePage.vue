<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

//TODO: Add transportation
const router = useRouter();
const currentStep = ref(0);
const selectedAnswers = ref<Record<string, string>>({});
const selectedCategories = ref<string[]>([]);

const questions = [
  {
    question: "What best describes your ideal travel experience?",
    options: {
      "Adventure & thrill-seeking": "ADVENTURE",
      "Exploring historical landmarks": "CULTURE",
      "Romantic getaways & couple retreats": "LOVE",
      "Relaxing on the beach or spa": "RELAX"
    }
  },
  {
    question: "What is your preferred nightlife experience?",
    options: {
      "Clubs & party scene": "NIGHTLIFE",
      "Casual bars & lounges": "RELAX",
      "Food & wine tastings": "WINE",
      "I prefer quiet evenings": "FAMILY"
    }
  },
  {
    question: "Do you enjoy shopping while traveling?",
    options: {
      "Yes, I love shopping for local fashion & brands": "SHOPPING",
      "I like exploring local markets & souvenirs": "CULTURE",
      "I prefer experiences over shopping": "ADVENTURE"
    }
  },
  {
    question: "How active do you like to be on vacation?",
    options: {
      "I love hiking, biking, and outdoor sports": "SPORTS",
      "I enjoy a mix of activities & relaxation": "NATURE",
      "I prefer a laid-back experience": "RELAX"
    }
  },
  {
    question: "Are you traveling with family or kids?",
    options: {
      "Yes, it’s a family trip": "FAMILY",
      "No, it's a solo or couple’s trip": "LOVE",
      "Business trip, so no family activities": "BUSINESS"
    }
  },
  {
    question: "What's your favorite part of experiencing new cultures?",
    options: {
      "Trying local foods & cuisines": "FOOD",
      "Learning about religious & spiritual sites": "RELIGION",
      "Exploring nature & scenic landscapes": "NATURE",
      "Understanding local history & museums": "CULTURE"
    }
  }
];

// Handle answer selection
const selectAnswer = (option: string, category: string) => {
  selectedAnswers.value[currentStep.value] = option;
  if (!selectedCategories.value.includes(category)) {
    selectedCategories.value.push(category);
  }
  nextStep();
};

// Move to the next question
const nextStep = () => {
  if (currentStep.value < questions.length - 1) {
    currentStep.value++;
  } else {
    finishQuestionnaire();
  }
};

// Redirect to itinerary form with selected categories
const finishQuestionnaire = () => {
  router.push({
    path: "/itinerary",
    query: { categories: selectedCategories.value.join(",") }
  });
};
</script>

<template>
  <div class="h-screen w-screen bg-[#0F1629] flex flex-col items-center justify-center px-6">
    <div class="w-full max-w-3xl bg-[#1E293B] p-10 rounded-2xl shadow-lg text-center">
      <h2 class="text-3xl font-bold text-[#8B5CF6]">Plan Your Perfect Trip</h2>
      <p class="mt-2 text-gray-300">Answer a few quick questions so we can tailor your itinerary.</p>

      <div class="mt-8">
        <h3 class="text-xl font-semibold text-white">
          {{ questions[currentStep].question }}
        </h3>

        <div class="mt-6 space-y-4">
          <button
            v-for="(category, option) in questions[currentStep].options"
            :key="option"
            @click="selectAnswer(option, category)"
            class="w-full py-3 bg-[#8B5CF6] text-white text-lg font-medium rounded-lg shadow-md hover:bg-[#6B46C1] transition">
            {{ option }}
          </button>
        </div>
      </div>

      <p class="mt-6 text-gray-400 text-sm">
        Question {{ currentStep + 1 }} of {{ questions.length }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
