import { ref, onMounted } from 'vue';

// Create a composable function for scroll animations
export function useScrollAnimation() {
  const animatedElements = ref([]);
  
  // Register elements to be animated
  const registerElement = (el, options = {}) => {
    if (!el) return;
    
    animatedElements.value.push({
      el,
      options: {
        threshold: options.threshold || 0.2,
        rootMargin: options.rootMargin || '0px',
        animationClass: options.animationClass || 'animate-in',
        delay: options.delay || 0,
      }
    });
  };
  
  // Initialize intersection observer
  onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const options = animatedElements.value.find(item => item.el === target)?.options;
          
          if (options) {
            setTimeout(() => {
              target.classList.add(options.animationClass);
            }, options.delay);
          }
          
          observer.unobserve(target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });
    
    // Observe all registered elements
    animatedElements.value.forEach(item => {
      observer.observe(item.el);
    });
    
    // Cleanup
    return () => {
      animatedElements.value.forEach(item => {
        observer.unobserve(item.el);
      });
    };
  });
  
  return {
    registerElement
  };
}

// Create a composable function for parallax effects
export function useParallax() {
  const parallaxElements = ref([]);
  const mousePosition = ref({ x: 0, y: 0 });
  
  // Register elements for parallax effect
  const registerParallaxElement = (el, options = {}) => {
    if (!el) return;
    
    parallaxElements.value.push({
      el,
      options: {
        strength: options.strength || 1,
        reverse: options.reverse || false,
      }
    });
  };
  
  // Update mouse position
  const updateMousePosition = (e) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate position relative to center of screen
    mousePosition.value = {
      x: (windowWidth / 2 - e.clientX) / 50,
      y: (windowHeight / 2 - e.clientY) / 50
    };
    
    // Apply parallax effect to all registered elements
    parallaxElements.value.forEach(item => {
      const { el, options } = item;
      const { strength, reverse } = options;
      
      const multiplier = reverse ? -1 : 1;
      const x = mousePosition.value.x * strength * multiplier;
      const y = mousePosition.value.y * strength * multiplier;
      
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  };
  
  // Initialize event listeners
  onMounted(() => {
    window.addEventListener('mousemove', updateMousePosition);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  });
  
  return {
    registerParallaxElement
  };
}

// Create a composable function for smooth scrolling
export function useSmoothScroll() {
  const scrollToElement = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // Initialize smooth scroll for all anchor links
  onMounted(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href !== '#') {
          scrollToElement(href);
        }
      });
    });
  });
  
  return {
    scrollToElement
  };
}
