import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import InputPage from "@/pages/InputPage.vue";
import QuestionairePage from "@/pages/QuestionairePage.vue";
import PaymentSuccess from "@/pages/PaymentSuccess.vue";
import PaymentCancel from "@/pages/PaymentCancel.vue";
import PrivacyPolicy from "@/components/PrivacyPolicy.vue";
import TermsOfService from "@/components/TermsOfService.vue";
import AboutUs from "@/pages/AboutUs.vue";

const routes = [
  { path: "/", component: LandingPage },
  { path: "/questionnaire", component: QuestionairePage},
  { path: '/itinerary', component: InputPage },
  { path: '/payment-cancel', component: PaymentCancel },
  { path: '/payment-success', component: PaymentSuccess },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/about-us', component: AboutUs },
  { path: '/tos', component: TermsOfService }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
