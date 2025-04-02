<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Import Header and Footer components
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

// --- Removed mobileMenuOpen ref - likely handled within AppHeader ---
// const mobileMenuOpen = ref(false);

// --- Kept newsletterEmail ref - might be used by AppFooter or a section here ---
const newsletterEmail = ref('');

// --- Removed currentYear - likely handled within AppFooter ---
// const currentYear = new Date().getFullYear();

// --- Data definitions remain the same ---
// AI Features data
const aiFeatures = [
  { title: 'Machine Learning', icon: 'fa-brain', description: 'Adapts to your preferences over time' },
  { title: 'Spatial Analysis', icon: 'fa-map-marked-alt', description: 'Optimizes routes for efficiency' },
  { title: 'Preference Matching', icon: 'fa-users', description: 'Aligns activities with your interests' },
  { title: 'Time Optimization', icon: 'fa-clock', description: 'Balances activities and rest' }
];

// Workflow steps
const workflowSteps = [
  { title: 'Share Your Preferences', description: 'Tell us about your travel style, interests, and must-see attractions' },
  { title: 'AI Creates Your Plan', description: 'Our AI analyzes your preferences to build a personalized itinerary' },
  { title: 'Enjoy Your Trip', description: 'Access your itinerary anytime, anywhere during your journey' }
];

// Company values
const companyValues = [
  { title: 'Innovation', icon: 'fa-lightbulb', description: 'We constantly push the boundaries of what\'s possible in travel planning, leveraging cutting-edge technology to create better experiences.' },
  { title: 'Personalization', icon: 'fa-fingerprint', description: 'We believe that every traveler is unique, and we\'re committed to creating experiences that reflect individual preferences and interests.' },
  { title: 'Simplicity', icon: 'fa-feather', description: 'We make complex travel planning effortless, allowing travelers to focus on enjoying their experiences rather than organizing them.' },
  { title: 'Quality', icon: 'fa-award', description: 'We\'re dedicated to excellence in every itinerary we create, ensuring that each recommendation meets our high standards.' },
  { title: 'Customer-Centricity', icon: 'fa-heart', description: 'We put travelers at the center of everything we do, listening to feedback and continuously improving our service.' },
  { title: 'Global Perspective', icon: 'fa-globe', description: 'We embrace diversity in travel experiences, celebrating the unique cultures and attractions that make our world worth exploring.' }
];

// Team members (Assuming team section might be added later or is part of the page content)
const teamMembers = [
  { name: 'Alex Morgan', position: 'CEO & Co-Founder', description: 'Travel enthusiast with a background in AI and machine learning', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
  { name: 'Samantha Chen', position: 'CTO & Co-Founder', description: 'AI expert with a passion for solving complex problems', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
  { name: 'David Wilson', position: 'Head of Travel Experience', description: 'Former travel guide with knowledge of destinations worldwide', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
  { name: 'Olivia Martinez', position: 'Head of UX Design', description: 'Designer focused on creating intuitive, beautiful experiences', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }
];


// Testimonials
const testimonials = [
  { quote: '"SeemlessTrip completely transformed our family vacation. The AI understood exactly what activities would keep both our teenagers and younger children engaged. It was like having a personal travel agent who really knew us."', name: 'Jennifer K.', type: 'Family Traveler', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&q=80' },
  { quote: '"As a solo traveler, I was amazed at how SeemlessTrip created an itinerary that perfectly balanced adventure and relaxation. I discovered hidden gems I would never have found on my own. This is the future of travel planning!"', name: 'Michael T.', type: 'Adventure Seeker', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&q=80' },
  { quote: '"My husband and I have very different travel preferences, but SeemlessTrip somehow created an itinerary that made us both happy. The AI\'s ability to balance different interests is truly impressive. We\'ll never plan a trip any other way."', name: 'Sarah L.', type: 'Couple Traveler', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&q=80' }
];

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Fix for mobile viewport height issues (kept for consistency, consider moving to App.vue or layout)
onMounted(() => {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);

  // Add event listeners for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#')) {
        scrollToSection(href.substring(1));
      }
    });
  });

  // Cleanup
  return () => {
    window.removeEventListener('resize', setVh);
    // Cleanup for scroll listeners might be needed if component unmounts often,
    // but usually less critical for page-level components.
  };
});
</script>

<template>
  <div class="bg-[#0F1629] text-white min-h-screen flex flex-col w-screen overflow-hidden">
    <AppHeader />

    <main class="flex-1 w-full">
      <section class="relative overflow-hidden py-20 md:py-28">
        <div class="absolute inset-0 bg-gradient-to-br from-[#2D1B69] via-[#512D6D] to-[#8B5CF6] opacity-20 z-0"></div>
        <div class="absolute inset-0 bg-[#0F1629] opacity-80 z-0"></div>
        <div class="absolute inset-0 bg-grid-pattern z-0"></div>

        <div class="container mx-auto px-6 relative z-10">
          <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-10 md:mb-0">
              <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Revolutionizing Travel Planning with AI</h1>
              <p class="text-xl text-gray-300 mb-8">We're on a mission to transform how you experience the world, one personalized itinerary at a time.</p>
              <a href="#our-story" class="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">Our Story</a>
            </div>
            <div class="md:w-1/2 flex justify-center">
              <div class="relative">
                <div class="absolute inset-0 bg-purple-600 rounded-full opacity-10 animate-pulse"></div>
                <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Travel Planning" class="rounded-xl shadow-2xl relative z-10 border border-purple-500/20">
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="our-story" class="py-20 bg-[#1A2333]">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-white">Our Story</h2>
            <div class="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-4 mb-6"></div>
            <p class="text-gray-300 max-w-3xl mx-auto">The journey that led us to create the future of travel planning</p>
          </div>

          <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-10 md:mb-0">
              <img src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Our Story" class="rounded-xl shadow-lg border border-purple-500/20">
            </div>
            <div class="md:w-1/2 md:pl-12">
              <h3 class="text-2xl font-bold mb-4 text-white">From Frustration to Innovation</h3>
              <p class="text-gray-300 mb-6">SeemlessTrip was born from a simple observation: planning the perfect trip is time-consuming, stressful, and often results in generic experiences that don't match travelers' unique preferences.</p>
              <p class="text-gray-300 mb-6">Our founders, avid travelers themselves, experienced this frustration firsthand. They spent countless hours researching destinations, reading reviews, and creating itineraries, only to find that their carefully crafted plans often missed hidden gems or included attractions that didn't match their interests.</p>
              <p class="text-gray-300">That's when the idea struck: what if artificial intelligence could analyze traveler preferences and create perfectly tailored itineraries in seconds? SeemlessTrip was created to make this vision a reality, combining cutting-edge AI technology with deep travel expertise to revolutionize how people plan their journeys.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-[#0F1629]">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <h3 class="text-2xl font-bold mb-6 text-white relative inline-block">
                Our Mission
                <span class="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></span>
              </h3>
              <p class="text-gray-300 mb-6">To transform travel planning by using AI to create personalized, memorable travel experiences tailored to each traveler's unique preferences.</p>
              <p class="text-gray-300">We believe that every journey should be as unique as the traveler taking it. By harnessing the power of artificial intelligence, we're eliminating the stress of travel planning and helping people discover experiences that truly resonate with their interests and desires.</p>
            </div>
            <div class="md:w-1/2">
              <h3 class="text-2xl font-bold mb-6 text-white relative inline-block">
                Our Vision
                <span class="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></span>
              </h3>
              <p class="text-gray-300 mb-6">A world where every traveler can enjoy a perfectly customized journey without the stress of planning.</p>
              <p class="text-gray-300">We envision a future where travel planning is effortless and intuitive, where technology understands your preferences better than any travel agent could, and where every trip becomes a collection of moments perfectly aligned with your unique travel style.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-[#1A2333]">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-white">Our AI Technology</h2>
            <div class="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-4 mb-6"></div>
            <p class="text-gray-300 max-w-3xl mx-auto">Powering personalized travel experiences with cutting-edge artificial intelligence</p>
          </div>
          <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 md:pr-12 mb-10 md:mb-0">
              <h3 class="text-2xl font-bold mb-4 text-white">The Science Behind Perfect Itineraries</h3>
              <p class="text-gray-300 mb-6">At the heart of SeemlessTrip is our proprietary AI engine that analyzes thousands of data points to create travel experiences that feel like they were crafted just for you.</p>
              <p class="text-gray-300 mb-6">Our technology goes beyond simple recommendations. It understands the nuances of travel preferences, from activity pace to cultural interests, and uses this understanding to build cohesive itineraries that maximize enjoyment while minimizing travel time.</p>
              <p class="text-gray-300">The more you use SeemlessTrip, the smarter it gets. Our AI learns from your feedback and travel patterns, continuously improving its recommendations to match your evolving preferences.</p>
            </div>
            <div class="md:w-1/2">
              <div class="bg-[#0F1629]/80 rounded-xl p-8 shadow-lg border border-purple-500/20">
                <div class="grid grid-cols-2 gap-6">
                  <div v-for="(feature, index) in aiFeatures" :key="index" class="text-center">
                    <div class="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                      <i :class="['fas', feature.icon, 'text-purple-400', 'text-2xl']"></i>
                    </div>
                    <h4 class="font-semibold mb-2 text-white">{{ feature.title }}</h4>
                    <p class="text-sm text-gray-400">{{ feature.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-[#0F1629]">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-white">How SeemlessTrip Works</h2>
            <div class="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-4 mb-6"></div>
            <p class="text-gray-300 max-w-3xl mx-auto">Creating your perfect itinerary in just a few simple steps</p>
          </div>
          <div class="flex flex-wrap justify-center">
            <div v-for="(step, index) in workflowSteps" :key="index" class="w-full md:w-1/4 px-4 mb-8 md:mb-0 text-center relative">
              <div class="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                <span class="text-purple-400 text-2xl font-bold">{{ index + 1 }}</span>
              </div>
              <h4 class="text-xl font-semibold mb-2 text-white">{{ step.title }}</h4>
              <p class="text-gray-400">{{ step.description }}</p>
              <div v-if="index < workflowSteps.length - 1" class="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-[#1A2333]">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-white">Our Values</h2>
            <div class="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-4 mb-6"></div>
            <p class="text-gray-300 max-w-3xl mx-auto">The principles that guide everything we do at SeemlessTrip</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(value, index) in companyValues" :key="index" class="bg-[#0F1629]/80 rounded-xl p-8 shadow-lg border border-purple-500/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl">
              <div class="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <i :class="['fas', value.icon, 'text-purple-400', 'text-2xl']"></i>
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">{{ value.title }}</h3>
              <p class="text-gray-400">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </section>

       <section class="py-20 bg-[#1A2333]">
         <div class="container mx-auto px-6">
           <div class="text-center mb-16">
             <h2 class="text-3xl md:text-4xl font-bold text-white">What Our Users Say</h2>
             <div class="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-4 mb-6"></div>
             <p class="text-gray-300 max-w-3xl mx-auto">Real experiences from travelers who've used SeemlessTrip</p>
           </div>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div v-for="(testimonial, index) in testimonials" :key="index" class="bg-[#0F1629]/80 p-8 rounded-xl shadow-lg border border-purple-500/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl">
               <div class="flex items-center mb-4">
                 <div class="text-yellow-400 flex">
                   <i v-for="star in 5" :key="star" class="fas fa-star"></i>
                 </div>
               </div>
               <p class="text-gray-300 mb-6">{{ testimonial.quote }}</p>
               <div class="flex items-center">
                 <img :src="testimonial.image" :alt="testimonial.name" class="rounded-full w-12 h-12 mr-4 border border-purple-500/30">
                 <div>
                   <h5 class="font-bold text-white">{{ testimonial.name }}</h5>
                   <p class="text-sm text-gray-400">{{ testimonial.type }}</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      <section class="py-20 bg-gradient-to-br from-[#2D1B69] via-[#512D6D] to-[#8B5CF6] relative overflow-hidden">
        <div class="absolute inset-0 bg-[#0F1629] opacity-70"></div>
        <div class="container mx-auto px-6 text-center relative z-10">
          <h2 class="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Experience the Future of Travel Planning?</h2>
          <p class="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">Join thousands of travelers who have discovered the perfect way to plan their next adventure.</p>
          <router-link to="/" class="inline-block bg-white text-purple-700 font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">Get Started Today</router-link>
        </div>
      </section>

    </main>

    <AppFooter />
    </div>
</template>

<style scoped>
/* Styles specific to the About Us page */
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Use CSS variables for viewport height to fix mobile issues */
.min-h-screen {
  min-height: 100vh; /* Fallback */
  min-height: calc(var(--vh, 1vh) * 100);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

</style>
