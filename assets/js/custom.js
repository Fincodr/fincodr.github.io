/**
 * Terminal Style Theme JavaScript
 * Handles typing animations, starfield, and interactive effects
 */

(function() {
    'use strict';
    
    // ================================================
    // 80's Asteroid-Style Starfield Animation
    // ================================================
    class Starfield {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.stars = [];
            this.numStars = 200;
            this.centerX = 0;
            this.centerY = 0;
            
            // Mouse interaction
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetOffsetX = 0;
            this.targetOffsetY = 0;
            this.currentOffsetX = 0;
            this.currentOffsetY = 0;
            this.maxOffset = 100; // Maximum offset in pixels
            
            this.resize();
            this.init();
            this.animate();
            
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        }
        
        onMouseMove(event) {
            // Calculate mouse position relative to center (normalized -1 to 1)
            const rect = this.canvas.getBoundingClientRect();
            const mouseXNorm = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseYNorm = ((event.clientY - rect.top) / rect.height) * 2 - 1;
            
            // Set target offset (inverted for parallax effect)
            this.targetOffsetX = -mouseXNorm * this.maxOffset;
            this.targetOffsetY = -mouseYNorm * this.maxOffset;
        }
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
        }
        
        init() {
            this.stars = [];
            for (let i = 0; i < this.numStars; i++) {
                const star = this.createStar();
                // Initialize screen position
                const scale = 2000 / (2000 + star.z);
                star.screenX = this.centerX + star.originX * scale;
                star.screenY = this.centerY + star.originY * scale;
                this.stars.push(star);
            }
        }
        
        createStar() {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * Math.max(this.canvas.width, this.canvas.height);
            
            return {
                // Original position relative to center
                originX: Math.cos(angle) * distance,
                originY: Math.sin(angle) * distance,
                z: Math.random() * 2000,
                size: Math.random() * 2 + 0.5,
                angle: angle,
                speed: Math.random() * 0.5 + 0.2
            };
        }
        
        update() {
            // Smoothly interpolate offset (easing effect)
            const easing = 0.05;
            this.currentOffsetX += (this.targetOffsetX - this.currentOffsetX) * easing;
            this.currentOffsetY += (this.targetOffsetY - this.currentOffsetY) * easing;
            
            this.stars.forEach((star, index) => {
                // Move star away from center (classic asteroid parallax effect)
                star.z -= star.speed * 5;
                
                // Calculate 3D perspective
                const scale = 2000 / (2000 + star.z);
                const depth = 1 - (star.z / 2000); // 0 (far) to 1 (near)
                
                // Calculate screen position from origin
                const baseX = this.centerX + star.originX * scale;
                const baseY = this.centerY + star.originY * scale;
                
                // Apply parallax offset based on depth - closer stars move more
                const parallaxX = this.currentOffsetX * depth * 0.3;
                const parallaxY = this.currentOffsetY * depth * 0.3;
                
                star.screenX = baseX + parallaxX;
                star.screenY = baseY + parallaxY;
                
                // Reset star if it goes off screen or too close
                if (star.z < 1 || 
                    star.screenX < -50 || star.screenX > this.canvas.width + 50 ||
                    star.screenY < -50 || star.screenY > this.canvas.height + 50) {
                    this.stars[index] = this.createStar();
                    this.stars[index].z = 2000;
                }
            });
        }
        
        draw() {
            // Clear with black background
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.stars.forEach(star => {
                // Skip if no screen position calculated yet
                if (star.screenX === undefined || star.screenY === undefined) return;
                
                const scale = 2000 / (2000 + star.z);
                const size = star.size * scale;
                const brightness = 1 - (star.z / 2000);
                
                // Draw star with 80's style - use green tint for some stars (consistent per star)
                const starHash = (star.originX * 1000 + star.originY * 1000) % 1;
                const isGreenStar = starHash > 0.7;
                
                if (isGreenStar) {
                    this.ctx.fillStyle = `rgba(0, 255, 65, ${brightness * 0.8})`;
                } else {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(star.screenX, star.screenY, size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw motion trail for faster stars (80's effect)
                if (star.speed > 0.5) {
                    const trailLength = (1 - scale) * 30;
                    const dx = Math.cos(star.angle) * trailLength;
                    const dy = Math.sin(star.angle) * trailLength;
                    
                    const gradient = this.ctx.createLinearGradient(
                        star.screenX, star.screenY,
                        star.screenX - dx, star.screenY - dy
                    );
                    
                    if (isGreenStar) {
                        gradient.addColorStop(0, `rgba(0, 255, 65, ${brightness * 0.5})`);
                        gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
                    } else {
                        gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.5})`);
                        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    }
                    
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = size;
                    this.ctx.beginPath();
                    this.ctx.moveTo(star.screenX, star.screenY);
                    this.ctx.lineTo(star.screenX - dx, star.screenY - dy);
                    this.ctx.stroke();
                }
            });
        }
        
        animate() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    }
    
    // Configuration
    const CONFIG = {
        typingSpeed: 100,        // milliseconds per character
        deletingSpeed: 50,       // milliseconds per character when deleting
        pauseAfterComplete: 2000, // pause before starting next phrase
        pauseBeforeDelete: 1500   // pause before deleting
    };
    
    // Phrases to cycle through
    const phrases = [
        'Game Developer since 1996',
        'Software Architect',
        'Cyber Security Expert',
        'Demo Scene Programmer',
        'Creator of Piranha (DOS)',
        'Full-Stack Developer'
    ];
    
    /**
     * Typing Effect Class
     */
    class TypingEffect {
        constructor(element, phrases, config) {
            this.element = element;
            this.phrases = phrases;
            this.config = config;
            this.phraseIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.isPaused = false;
            
            // Start the typing effect after a short delay
            setTimeout(() => this.type(), 500);
        }
        
        type() {
            const currentPhrase = this.phrases[this.phraseIndex];
            
            // Update text
            if (this.isDeleting) {
                // Remove character
                this.element.textContent = currentPhrase.substring(0, this.charIndex - 1);
                this.charIndex--;
            } else {
                // Add character
                this.element.textContent = currentPhrase.substring(0, this.charIndex + 1);
                this.charIndex++;
            }
            
            // Determine typing speed
            let typeSpeed = this.isDeleting ? this.config.deletingSpeed : this.config.typingSpeed;
            
            // Add some randomness to make it feel more natural
            typeSpeed += Math.random() * 50;
            
            // Handle completion states
            if (!this.isDeleting && this.charIndex === currentPhrase.length) {
                // Finished typing current phrase
                typeSpeed = this.config.pauseBeforeDelete;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                // Finished deleting
                this.isDeleting = false;
                this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
                typeSpeed = this.config.pauseAfterComplete;
            }
            
            // Continue typing
            setTimeout(() => this.type(), typeSpeed);
        }
    }
    
    /**
     * Initialize when DOM is ready
     */
    function init() {
        // Initialize starfield
        new Starfield('starfield');
        
        // Initialize typing effect
        const typedElement = document.getElementById('typed-text');
        if (typedElement) {
            new TypingEffect(typedElement, phrases, CONFIG);
        }
        
        // Add smooth scroll behavior for any anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
        
        // Add keyboard shortcuts (Easter egg)
        addKeyboardShortcuts();
        
        // Add console message (Easter egg)
        addConsoleMessage();
    }
    
    /**
     * Add keyboard shortcuts
     */
    function addKeyboardShortcuts() {
        const konami = [];
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        
        document.addEventListener('keydown', (e) => {
            konami.push(e.key);
            konami.splice(-konamiCode.length - 1, konami.length - konamiCode.length);
            
            if (konami.join('') === konamiCode.join('')) {
                activateEasterEgg();
            }
        });
    }
    
    /**
     * Easter egg activation
     */
    function activateEasterEgg() {
        const terminal = document.querySelector('.terminal-container');
        if (terminal) {
            terminal.style.animation = 'none';
            setTimeout(() => {
                terminal.style.animation = 'easterEggPulse 0.5s ease-in-out 3';
            }, 10);
        }
        
        console.log('%c🎉 Konami Code Activated! 🎉', 'font-size: 20px; color: #00ff41; font-weight: bold;');
    }
    
    /**
     * Add console message
     */
    function addConsoleMessage() {
        const styles = [
            'font-size: 16px',
            'font-family: monospace',
            'color: #00ff41',
            'text-shadow: 0 0 5px rgba(0, 255, 65, 0.5)',
            'padding: 10px'
        ].join(';');
        
        console.log('%c', 'font-size: 1px; padding: 100px 100px; background: url(https://fincodr.com/assets/images/mika_pixel_2017_200x200.png) no-repeat; background-size: contain;');
        console.log('%cFincodr :: Code', styles);
        console.log('%cWelcome to my terminal! 👋', 'font-size: 14px; color: #0ce3ac;');
        console.log('%c> Curious about the code? Check it out on GitHub!', 'font-size: 12px; color: #6c757d;');
        console.log('%c> Try the Konami Code for a surprise... 🎮', 'font-size: 12px; color: #6c757d; font-style: italic;');
    }
    
    /**
     * Add CSS animation for easter egg
     */
    function addEasterEggAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes easterEggPulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 65, 0.1);
                }
                50% {
                    transform: scale(1.02);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 255, 65, 0.5);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize easter egg animation
    addEasterEggAnimation();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

