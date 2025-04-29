<script setup lang="ts">
import { ref, onMounted } from 'vue';

const currentYear = new Date().getFullYear();
const isInView = ref(false);
const email = ref('');
const isSubmitting = ref(false);
const subscriptionStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const errorMessage = ref('');
const socialLinks = [
	{ name: 'Twitter', icon: 'twitter', url: 'https://x.com/TripVibes251221' },
	{ name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/tripvibes_me' },
	{ name: 'Facebook', icon: 'facebook', url: '#' },
	{ name: 'LinkedIn', icon: 'linkedin', url: '#' }
];

// Submit email to API
const submitEmail = async () => {
	// Simple email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email.value)) {
		errorMessage.value = 'Please enter a valid email address';
		subscriptionStatus.value = 'error';
		return;
	}

	try {
		subscriptionStatus.value = 'loading';
		isSubmitting.value = true;

		const response = await fetch('https://api.tripvibes.me/user/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: email.value })
		});

		if (!response.ok) {
			throw new Error('Subscription failed');
		}

		// Success handling
		subscriptionStatus.value = 'success';
		email.value = '';

		// Reset status after 5 seconds
		setTimeout(() => {
			subscriptionStatus.value = 'idle';
		}, 5000);
	} catch (error) {
		// Error handling
		subscriptionStatus.value = 'error';
		errorMessage.value = error instanceof Error
			? error.message
			: 'Something went wrong. Please try again later.';

		// Reset error after 5 seconds
		setTimeout(() => {
			subscriptionStatus.value = 'idle';
			errorMessage.value = '';
		}, 5000);
	} finally {
		isSubmitting.value = false;
	}
};

// Intersection observer to trigger animations when section is in view
onMounted(() => {
	const observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			isInView.value = true;
			observer.disconnect();
		}
	}, { threshold: 0.2 });

	const footerSection = document.querySelector('footer');
	if (footerSection) {
		observer.observe(footerSection);
	}
});
</script>

<template>
	<footer class="relative bg-[#0F1629] text-gray-400 pt-16 pb-8 overflow-hidden">
		<!-- Background Elements -->
		<div class="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
		<div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

		<!-- Content Container -->
		<div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 transform transition-all duration-700"
					 :class="isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
				<!-- Logo & About -->
				<div class="md:col-span-1">
					<div class="flex items-center mb-4">
						<img
							src="https://images.tripvibes.me/tripflowai_icon_small.png"
							alt="TripVibes Logo"
              				class="w-15 h-10 rounded-full mr-1"
            			 />
						<h1 class="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
							Trip<span class="text-[#8B5CF6]">Vibes</span>
						</h1>
					</div>
					<p class="text-gray-500 mb-4">
						AI-powered travel itineraries tailored to your preferences and interests.
					</p>
					<div class="flex space-x-4">
						<a v-for="link in socialLinks" :key="link.name" :href="link.url" class="text-gray-400 hover:text-[#8B5CF6] transition-colors">
							<span class="sr-only">{{ link.name }}</span>
							<svg v-if="link.icon === 'twitter'" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
							</svg>
							<svg v-if="link.icon === 'instagram'" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"></path>
							</svg>
							<!-- <svg v-if="link.icon === 'facebook'" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"></path>
							</svg>
							<svg v-if="link.icon === 'linkedin'" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
							</svg> -->
						</a>
					</div>
				</div>

				<!-- Quick Links -->
				<div>
					<h3 class="text-white font-semibold mb-4 text-lg">Quick Links</h3>
					<ul class="space-y-2">
      <li>
        <router-link
          to="/"
          class="text-gray-400 hover:text-[#8B5CF6] transition-colors"
         >
          Home
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ path: '/', hash: '#features' }"
          class="text-gray-400 hover:text-[#8B5CF6] transition-colors"
        >
          Features
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ path: '/', hash: '#get-started' }"
          class="text-gray-400 hover:text-[#8B5CF6] transition-colors"
        >
          Pricing
        </router-link>
      </li>
      </ul>
				</div>

				<!-- Company -->
				<div>
					<h3 class="text-white font-semibold mb-4 text-lg">Company</h3>
					<ul class="space-y-2">
						<li>
							<router-link
									to="/about-us"
									class="text-gray-400 hover:text-[#8B5CF6] transition-colors"
							>
								About Us
							</router-link>
						</li>
						<li>
							<router-link
									to="/privacy-policy"
									class="text-gray-400 hover:text-[#8B5CF6] transition-colors"
							>
								Privacy Policy
							</router-link>
						</li>
						<li>
							<router-link
									to="/tos"
									class="text-gray-400 hover:text-[#8B5CF6] transition-colors"
							>
								Terms of Service
							</router-link>
						</li>
					</ul>
				</div>

				<!-- Newsletter -->
				<div>
					<h3 class="text-white font-semibold mb-4 text-lg">Stay Updated</h3>
					<p class="text-gray-400 mb-4">Subscribe to our newsletter for travel tips and exclusive offers.</p>
					<form @submit.prevent="submitEmail" class="space-y-3">
						<div class="flex">
							<input
								v-model="email"
								type="email"
								placeholder="Your email"
								class="bg-[#1E293B] text-white px-4 py-2 rounded-l-lg border border-gray-700 focus:outline-none focus:border-[#8B5CF6] w-full"
								:disabled="isSubmitting"
							>
							<button
								type="submit"
								class="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white px-4 py-2 rounded-r-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
								:disabled="isSubmitting"
							>
								<svg v-if="subscriptionStatus !== 'loading'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
								</svg>
								<svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							</button>
						</div>

						<!-- Success Message -->
						<div v-if="subscriptionStatus === 'success'" class="bg-green-800/20 border border-green-700 text-green-500 px-4 py-2 rounded-lg text-sm transition-all">
							<div class="flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								Thanks for subscribing! We'll keep you updated.
							</div>
						</div>

						<!-- Error Message -->
						<div v-if="subscriptionStatus === 'error'" class="bg-red-800/20 border border-red-700 text-red-500 px-4 py-2 rounded-lg text-sm transition-all">
							<div class="flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
								{{ errorMessage }}
							</div>
						</div>
					</form>
				</div>
			</div>

			<!-- Divider -->
			<div class="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8 transform transition-all duration-700 delay-200"
					 :class="isInView ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'"></div>

			<!-- Bottom Footer -->
			<div class="flex flex-col md:flex-row justify-between items-center transform transition-all duration-700 delay-300"
					 :class="isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
				<p class="text-sm text-center md:text-left">&copy; {{ currentYear }} TripVibes. All rights reserved.</p>

				<div class="flex space-x-6 mt-4 md:mt-0">
					<router-link to="/privacy-policy" class="text-gray-400 hover:text-[#8B5CF6] transition-colors text-sm">Privacy Policy</router-link>
					<router-link to="/tos" class="text-gray-400 hover:text-[#8B5CF6] transition-colors text-sm">Terms of Service</router-link>
				</div>
			</div>
		</div>

		<!-- Back to Top Button -->
		<a href="#" class="fixed bottom-8 right-8 bg-[#1E293B] text-white p-3 rounded-full shadow-lg hover:bg-[#8B5CF6] transition-colors z-50">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
			</svg>
		</a>
	</footer>
</template>

<style scoped>
.bg-grid-pattern {
	background-image:
		linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
		linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
	background-size: 40px 40px;
}

/* Animation delays */
.delay-100 {
	transition-delay: 100ms;
}

.delay-200 {
	transition-delay: 200ms;
}

.delay-300 {
	transition-delay: 300ms;
}
</style>
