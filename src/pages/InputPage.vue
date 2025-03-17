<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import DestinationInput from "@/components/DestinationInput.vue";

const router = useRouter();
const categories = ref<string[]>([]);
const destination = ref("");
const numberOfPeople = ref(1);
const origin = ref("");
const fromDate = ref("");
const toDate = ref("");
const transportation = ref<string[]>([]);
const showEmailPopup = ref(false);
const email = ref("");

const transportationOptions = ["WALK", "CAR", "BIKE", "PUBLIC_TRANSPORT"];

const openEmailPopup = () => {
  showEmailPopup.value = true;
};

const closeEmailPopup = () => {
  showEmailPopup.value = false;
};

const submitForm = () => {
  const requestBody = {
    categories: categories.value,
    destination: destination.value,
    number_of_people: numberOfPeople.value,
    origin: origin.value,
    from: fromDate.value,
    to: toDate.value,
    transportation: transportation.value,
    email: email.value,
  };
  console.log("Submitting: ", requestBody);
  router.push("/checkout");
};
</script>

<template>
  <div class="min-h-screen bg-[#0F1629] text-white flex justify-center items-center px-4">
    <div class="bg-[#1E293B] p-8 rounded-2xl shadow-xl max-w-lg w-full">
      <h2 class="text-3xl font-bold text-center text-[#8B5CF6] mb-6">Plan Your Trip</h2>
      <form @submit.prevent="openEmailPopup" class="space-y-4">
        <div>
          <!-- Destination Component -->
          <DestinationInput v-model="destination" />
        </div>
        <div>
          <label class="block text-gray-300 mb-1">Origin</label>
          <input v-model="origin" type="text" class="w-full p-3 rounded-lg bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:outline-none">
        </div>
        <div>
          <label class="block text-gray-300 mb-1">Number of People</label>
          <input v-model.number="numberOfPeople" type="number" min="1" class="w-full p-3 rounded-lg bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:outline-none">
        </div>
        <div>
          <label class="block text-gray-300 mb-1">Transportation</label>
          <select v-model="transportation" multiple class="w-full p-3 rounded-lg bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:outline-none">
            <option v-for="option in transportationOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-300 mb-1">Start Date</label>
          <input v-model="fromDate" type="datetime-local" class="w-full p-3 rounded-lg bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:outline-none">
        </div>
        <div>
          <label class="block text-gray-300 mb-1">End Date</label>
          <input v-model="toDate" type="datetime-local" class="w-full p-3 rounded-lg bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:outline-none">
        </div>
        <button type="submit" class="w-full bg-[#8B5CF6] text-white p-3 rounded-lg font-semibold hover:bg-[#6B46C1] transition">Continue</button>
      </form>
    </div>

    <!-- Email Popup -->
    <div v-if="showEmailPopup" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-[#1E293B] p-6 rounded-lg shadow-lg text-center max-w-md w-full">
        <h3 class="text-xl font-bold text-[#8B5CF6]">Enter Your Email</h3>
        <p class="text-gray-300 mt-2">We'll send your itinerary to this email.</p>
        <input v-model="email" type="email" class="w-full mt-4 p-3 rounded-lg bg-[#0F1629] text-white border border-gray-700 focus:border-[#8B5CF6] focus:outline-none">
        <div class="mt-4 flex justify-between">
          <button @click="closeEmailPopup" class="text-gray-400 hover:text-gray-200">Cancel</button>
          <button @click="submitForm" class="bg-[#8B5CF6] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#6B46C1]">Pay Now</button>
        </div>
      </div>
    </div>
  </div>
</template>
