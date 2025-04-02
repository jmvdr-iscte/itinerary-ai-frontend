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
    // 1. If navigating back/forward using browser buttons, use saved position
    if (savedPosition) {
      return savedPosition;
    }

    // 2. If navigating to a hash link on the *same* page OR *different* page
    if (to.hash) {
      // Use nextTick to ensure the element exists before scrolling
      return nextTick().then(() => {
        const element = document.querySelector(to.hash);
        if (element) {
          return {
            el: to.hash,
            behavior: 'smooth', // Use smooth scrolling
            // Optional: Add top offset for fixed headers
            // top: 80, // Example: Adjust '80' to your header's height in pixels
          };
        } else {
          // Fallback: If element not found (shouldn't usually happen), scroll to top
          return { top: 0 };
        }
      });
    }

    // 3. Otherwise, scroll to the top of the page
    return { top: 0, behavior: 'smooth' };
  }
  // --- END OF scrollBehavior ---
});

export default router;
