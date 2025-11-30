/**
 * Advanced Background Effects & UI Interactions
 * Adds a dynamic starfield/network background and scroll animations
 */

class ParticleNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        
        // Configuration
        this.config = {
            particleCount: 100,
            connectionDistance: 150,
            mouseDistance: 200,
            speed: 0.5,
            colors: ['#00f3ff', '#ff00ff', '#9d00ff']
        };
        
        this.mouse = { x: null, y: null };
        
        // Event Listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        this.init();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(new Particle(this.canvas, this.config));
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.mouse);
            this.particles[i].draw(this.ctx);
            
            // Draw connections
            for (let j = i; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(100, 200, 255, ${1 - distance / this.config.connectionDistance})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.size = Math.random() * 3 + 1;
        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    }
    
    update(mouse) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > this.canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > this.canvas.height) this.vy = -this.vy;
        
        // Mouse interaction
        if (mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.config.mouseDistance) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (this.config.mouseDistance - distance) / this.config.mouseDistance;
                const directionX = forceDirectionX * force * this.config.speed;
                const directionY = forceDirectionY * force * this.config.speed;
                
                this.vx += directionX;
                this.vy += directionY;
            }
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Scroll Reveal Animation
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.quest-card, .cyber-terminal-container, .achievement-card, .section-title').forEach(el => {
        el.classList.add('scroll-hidden');
        observer.observe(el);
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create canvas if it doesn't exist
    if (!document.getElementById('bg-canvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);
        
        new ParticleNetwork('bg-canvas');
    }
    
    initScrollReveal();
});
