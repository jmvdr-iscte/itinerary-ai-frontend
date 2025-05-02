import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import InputPage from "@/pages/InputPage.vue";
import QuestionairePage from "@/pages/QuestionairePage.vue";
import PaymentSuccess from "@/pages/PaymentSuccess.vue";
import PaymentCancel from "@/pages/PaymentCancel.vue";
import PrivacyPolicy from "@/components/PrivacyPolicy.vue";
import TermsOfService from "@/components/TermsOfService.vue";
import AboutUs from "@/pages/AboutUs.vue";
import ContactUs from "@/pages/ContactUs.vue";
import { nextTick } from 'vue';

const routes = [
  { path: "/", component: LandingPage },
  { path: "/questionnaire", component: QuestionairePage},
  { path: '/itinerary', component: InputPage },
  { path: '/payment-cancel', component: PaymentCancel },
  { path: '/payment-success', component: PaymentSuccess },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/about-us', component: AboutUs },
  { path: '/contact-us', component: ContactUs },
  { path: '/tos', component: TermsOfService }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return nextTick().then(() => {
        const element = document.querySelector(to.hash);
        if (element) {
          return {
            el: to.hash,
            behavior: 'smooth', // Use smooth scrolling
          };
        } else {
          return { top: 0 };
        }
      });
    }

    return { top: 0, behavior: 'smooth' };
  }
});

export default router;
