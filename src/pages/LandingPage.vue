<template>
  <div class="landing-page">
    <header class="header">
      <nav class="nav">
        <h1 class="logo">TripFlow</h1>
        <ul class="nav-links">
          <li><router-link to="#features">Features</router-link></li>
          <li><router-link to="#about">About</router-link></li>
          <li><router-link to="#contact">Contact</router-link></li>
          <li><button class="cta-button">Plan Your Trip</button></li>
        </ul>
      </nav>
    </header>

    <section class="hero">
      <h2>AI-Powered Travel Perfection</h2>
      <p>Craft your dream itinerary with intelligent route optimization</p>
      <button class="cta-button">Start Your Journey</button>
      <div class="gradient-accent"></div>
    </section>

    <section id="features" class="features">
      <div class="feature-card">
        <div class="feature-icon">🧳</div>
        <h3>Smart Packing</h3>
        <p>AI-generated packing lists based on destination and weather</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🗺️</div>
        <h3>Route Genius</h3>
        <p>Optimized daily plans with perfect timing</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⏱️</div>
        <h3>Real-Time Updates</h3>
        <p>Instant adjustments for delays and closures</p>
      </div>
    </section>

    <footer class="footer">
      <p>&copy; 2025 TripFlow - Travel Smarter, Not Harder</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LandingPage',
});
</script>

<style scoped>
/* Color Scheme */
:root {
  --deep-ocean: #0F172A;
  --sky-blue: #3B82F6;
  --tropical-teal: #2DD4BF;
  --sunset-orange: #F97316;
  --moonlight: #F8FAFC;
  --twilight-purple: #818CF8;
}

/* Base Styles */
.landing-page {
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--moonlight);
  background-color: var(--deep-ocean);
  min-height: 100vh;
  position: relative;
}

/* Header Fixes */
.header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(248, 250, 252, 0.1);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 80px;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--sky-blue), var(--tropical-teal));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: var(--moonlight);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-links a:hover {
  color: var(--tropical-teal);
}

.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background: linear-gradient(90deg, var(--sky-blue), var(--tropical-teal));
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

/* Main Content Centering */
.main-content {
  padding-top: 80px; /* Header height offset */
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero {
  text-align: center;
  padding: 6rem 2rem;
  max-width: 1200px;
  width: 100%;
}

.hero h2 {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, var(--moonlight), var(--tropical-teal));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero p {
  font-size: 1.25rem;
  color: rgba(248, 250, 252, 0.9);
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

/* Features Grid */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  width: 100%;
  max-width: 1200px;
}

.feature-card {
  padding: 2rem;
  background: rgba(248, 250, 252, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: var(--tropical-teal);
}

/* CTA Button */
.cta-button {
  background: linear-gradient(135deg, var(--sky-blue), var(--twilight-purple));
  color: var(--moonlight);
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* Footer */
.footer {
  text-align: center;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(59, 130, 246, 0.1);
  margin-top: auto;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .nav {
    padding: 0 1rem;
  }

  .nav-links {
    display: none;
  }

  .hero {
    padding: 4rem 1rem;
  }

  .hero h2 {
    font-size: 2rem;
  }

  .features {
    padding: 2rem 1rem;
    grid-template-columns: 1fr;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
</style>
