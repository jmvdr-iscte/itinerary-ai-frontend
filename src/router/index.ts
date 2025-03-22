import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import InputPage from "@/pages/InputPage.vue";
import QuestionairePage from "@/pages/QuestionairePage.vue";
import PaymentSuccess from "@/pages/PaymentSuccess.vue";
import PaymentCancel from "@/pages/PaymentCancel.vue";
const routes = [
  { path: "/", component: LandingPage },
  { path: "/questionnaire", component: QuestionairePage},
  { path: '/itinerary', component: InputPage },
  { path: '/payment-cancel', component: PaymentCancel },
  { path: '/payment-success', component: PaymentSuccess }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
