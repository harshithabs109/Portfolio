// Dark Mode Toggle
const toggle = document.getElementById('dark-mode-toggle');
const body = document.body;

toggle.addEventListener('change', () => {
    body.classList.toggle('light-mode');
});

// Typewriter Effect
const textElement = document.querySelector('.typing-text');
const textToType = 'A passionate Full-Stack Developer';
let i = 0;

function typeWriter() {
    if (i < textToType.length) {
        textElement.innerHTML += textToType.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}

// Intersection Observer for scroll animations
const animatedSections = document.querySelectorAll('.animated');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Add a class to trigger animation
        }
    });
}, { threshold: 0.2 });

animatedSections.forEach(section => {
    observer.observe(section);
});

// Add a 'visible' class in CSS for the animation to work
// E.g., .animated.visible .fade-in-up { animation: fadeInUp 1s ease forwards; }

// Initial call to start the typewriter effect
document.addEventListener('DOMContentLoaded', typeWriter);