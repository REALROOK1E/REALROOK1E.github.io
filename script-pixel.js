// ====== PIXEL GAME PORTFOLIO - INTERACTIVE FEATURES ======

// Game State Management
const gameState = {
    playerLevel: 25,
    currentExperience: 9999,
    questsCompleted: 15,
    achievementsUnlocked: 12,
    citiesVisited: 20,
    isTyping: false
};

// Sound Effects (using Web Audio API for retro sounds)
class PixelSoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playBeep(frequency = 800, duration = 200, type = 'square') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    playHover() {
        this.playBeep(600, 100, 'square');
    }

    playClick() {
        this.playBeep(800, 150, 'triangle');
    }

    playSuccess() {
        this.playBeep(523, 200, 'sine'); // C note
        setTimeout(() => this.playBeep(659, 200, 'sine'), 100); // E note
        setTimeout(() => this.playBeep(784, 300, 'sine'), 200); // G note
    }
}

const soundManager = new PixelSoundManager();

// Initialize Game on Load
document.addEventListener('DOMContentLoaded', function() {
    initializePixelGame();
    setupNavigationEffects();
    setupTypingAnimation();
    setupQuestCards();
    setupAchievements();
    setupTerminalEffects();
    setupPixelCharacter();
    initializeMiniGame();
});

// ====== PIXEL GAME INITIALIZATION ======
function initializePixelGame() {
    console.log(`
    ╔════════════════════════════════════╗
    ║     REALROOK1E PIXEL PORTFOLIO     ║
    ║            GAME LOADED             ║
    ║          VERSION 2.0.0             ║
    ╚════════════════════════════════════╝
    `);

    // Add click sound to body
    document.body.addEventListener('click', () => {
        soundManager.playClick();
    });

    // Add retro loading effect
    showLoadingScreen();
}

function showLoadingScreen() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-dark);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: var(--accent-neon);
        font-family: var(--font-title);
        transition: opacity 1s ease;
    `;

    loadingOverlay.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 2rem; animation: pulse 1s infinite;">🎮</div>
        <div style="font-size: 2rem; margin-bottom: 1rem;">LOADING GAME...</div>
        <div class="loading-bar" style="width: 300px; height: 20px; border: 2px solid var(--accent-neon); background: transparent; position: relative;">
            <div class="loading-fill" style="height: 100%; background: linear-gradient(90deg, var(--accent-neon), var(--accent-blue)); width: 0%; transition: width 0.1s;"></div>
        </div>
        <div style="margin-top: 1rem; font-size: 1rem;">Initializing pixel world...</div>
    `;

    document.body.appendChild(loadingOverlay);

    // Function to close loading screen
    function closeLoading() {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(loadingOverlay)) {
                document.body.removeChild(loadingOverlay);
            }
            soundManager.playSuccess();
        }, 500);
    }

    // Auto close after 2 seconds
    setTimeout(closeLoading, 2000);

    // Animate loading bar to complete in 2 seconds
    const loadingFill = loadingOverlay.querySelector('.loading-fill');
    let progress = 0;
    const totalTime = 2000; // 2 seconds
    const updateInterval = 50; // Update every 50ms
    const increment = 100 / (totalTime / updateInterval); // Calculate increment for smooth animation
    
    const loadingInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
        }
        loadingFill.style.width = progress + '%';
    }, updateInterval);
}

// ====== NAVIGATION EFFECTS ======
function setupNavigationEffects() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scrolling with game-style effects
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Add glitch effect to current section
                const currentActive = document.querySelector('.nav-link.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                link.classList.add('active');

                // Smooth scroll with easing
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Play navigation sound
                soundManager.playBeep(1000, 200, 'triangle');
            }
        });

        // Hover effects
        link.addEventListener('mouseenter', () => {
            soundManager.playHover();
            link.style.textShadow = '0 0 20px var(--accent-neon)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.textShadow = '';
        });
    });

    // Auto-highlight current section
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ====== TYPING ANIMATION ======
function setupTypingAnimation() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                // Play typing sound
                if (Math.random() > 0.7) {
                    soundManager.playBeep(400 + Math.random() * 200, 50, 'square');
                }
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 100);
    });
}

// ====== QUEST CARDS INTERACTION ======
function setupQuestCards() {
    const questCards = document.querySelectorAll('.quest-card');
    
    questCards.forEach((card, index) => {
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 0 40px rgba(0, 255, 65, 0.6)';
            soundManager.playBeep(600 + index * 100, 100, 'sine');
            
            // Add glitch effect randomly
            if (Math.random() > 0.8) {
                card.classList.add('glitch');
                setTimeout(() => card.classList.remove('glitch'), 200);
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        // Add click effect
        card.addEventListener('click', () => {
            // Flash effect
            card.style.background = 'var(--accent-neon)';
            card.style.color = 'var(--bg-dark)';
            setTimeout(() => {
                card.style.background = '';
                card.style.color = '';
            }, 150);
            
            soundManager.playSuccess();
        });

        // Animate quest cards on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `questAppear 0.6s ease-out ${index * 0.1}s forwards`;
                }
            });
        });
        observer.observe(card);
    });
}

// ====== ACHIEVEMENT SYSTEM ======
function setupAchievements() {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    achievementCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.1) rotate(2deg)';
            soundManager.playBeep(800 + index * 50, 150, 'triangle');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ====== TERMINAL EFFECTS ======
function setupTerminalEffects() {
    const terminal = document.querySelector('.experience-terminal');
    const terminalLines = terminal.querySelectorAll('.experience-item');
    
    // Animate terminal text like it's being typed
    terminalLines.forEach((line, index) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        line.style.animation = 'terminalType 1s ease-out forwards';
                        soundManager.playBeep(300, 100, 'square');
                    }, index * 300);
                }
            });
        });
        observer.observe(line);
    });
}

// ====== PIXEL CHARACTER INTERACTION ======
function setupPixelCharacter() {
    const character = document.querySelector('.pixel-character');
    const avatar = document.querySelector('.character-avatar');
    
    character.addEventListener('click', () => {
        // Character interaction
        avatar.style.animation = 'none';
        avatar.offsetHeight; // Trigger reflow
        avatar.style.animation = 'bounce 0.5s ease-out';
        
        soundManager.playBeep(1200, 300, 'sine');
        
        // Show random status message
        const messages = [
            'Ready for next quest!',
            'Coding power at maximum!',
            'Adventure awaits!',
            'New skills acquired!',
            'Level up imminent!'
        ];
        
        showStatusMessage(messages[Math.floor(Math.random() * messages.length)]);
    });
}

function showStatusMessage(message) {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-ui);
        border: 2px solid var(--accent-neon);
        color: var(--accent-neon);
        padding: 1rem 2rem;
        border-radius: 10px;
        font-family: var(--font-title);
        font-weight: bold;
        z-index: 1001;
        animation: statusPop 2s ease-out forwards;
    `;
    statusDiv.textContent = message;
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
        document.body.removeChild(statusDiv);
    }, 2000);
}

// ====== CUSTOM ANIMATIONS ======
const style = document.createElement('style');
style.textContent = `
    @keyframes questAppear {
        0% { 
            opacity: 0; 
            transform: translateY(50px) scale(0.8); 
        }
        100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
        }
    }
    
    @keyframes terminalType {
        0% { 
            opacity: 0; 
            transform: translateX(-20px); 
        }
        100% { 
            opacity: 1; 
            transform: translateX(0); 
        }
    }
    
    @keyframes achievementUnlock {
        0% { 
            transform: scale(0.5) rotate(-10deg); 
            opacity: 0; 
        }
        50% { 
            transform: scale(1.1) rotate(5deg); 
            opacity: 1; 
        }
        100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
        }
    }
    
    @keyframes statusPop {
        0% { 
            transform: translate(-50%, -50%) scale(0); 
            opacity: 0; 
        }
        20% { 
            transform: translate(-50%, -50%) scale(1.2); 
            opacity: 1; 
        }
        80% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 1; 
        }
        100% { 
            transform: translate(-50%, -50%) scale(0.8); 
            opacity: 0; 
        }
    }
`;
document.head.appendChild(style);

// ====== EASTER EGGS ======
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateKonamiCode();
        konamiCode = [];
    }
});

function activateKonamiCode() {
    // Secret cheat code activated!
    document.body.style.animation = 'rainbow 1s infinite, shake 0.5s';
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 3000);
    
    showStatusMessage('🎮 CHEAT CODE ACTIVATED! 🎮');
    soundManager.playSuccess();
    
    // Add rainbow animation
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(rainbowStyle);
}

// ====== PERFORMANCE OPTIMIZATION ======
// Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimize scroll handling
window.addEventListener('scroll', throttle(() => {
    // Add parallax effect to background
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-section');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.1}px)`;
    }    }, 16)); // ~60fps

// ====== CYBERPUNK MINI GAME ======
function initializeMiniGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startGame');
    const scoreElement = document.getElementById('score');
    
    let gameRunning = false;
    let score = 0;
    let player = { x: 150, y: 180, width: 20, height: 15, speed: 3 };
    let targets = [];
    let particles = [];
    
    // Game loop
    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 20, 40, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update targets
        updateTargets();
        
        // Update particles
        updateParticles();
        
        // Draw player
        drawPlayer();
        
        // Draw targets
        targets.forEach(target => drawTarget(target));
        
        // Draw particles
        particles.forEach(particle => drawParticle(particle));
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        gameRunning = true;
        score = 0;
        targets = [];
        particles = [];
        player.x = 150;
        scoreElement.textContent = score;
        startBtn.textContent = 'PLAYING...';
        startBtn.disabled = true;
        
        // Spawn targets periodically
        const targetInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(targetInterval);
                return;
            }
            spawnTarget();
        }, 1500);
        
        // Game timer
        setTimeout(() => {
            endGame();
        }, 30000); // 30 seconds
        
        gameLoop();
    }
    
    function endGame() {
        gameRunning = false;
        startBtn.textContent = 'START';
        startBtn.disabled = false;
        
        // Show final score
        showStatusMessage(`🎮 Game Over! Final Score: ${score}`);
        soundManager.playSuccess();
    }
    
    function spawnTarget() {
        targets.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            width: 15,
            height: 15,
            speed: 1 + Math.random() * 2,
            color: Math.random() > 0.5 ? '#00ffff' : '#ff0080'
        });
    }
    
    function updateTargets() {
        targets.forEach((target, index) => {
            target.y += target.speed;
            
            // Remove targets that go off screen
            if (target.y > canvas.height) {
                targets.splice(index, 1);
            }
            
            // Check collision with player
            if (target.x < player.x + player.width &&
                target.x + target.width > player.x &&
                target.y < player.y + player.height &&
                target.y + target.height > player.y) {
                
                // Create particles
                createParticles(target.x, target.y, target.color);
                
                // Remove target and increase score
                targets.splice(index, 1);
                score += 10;
                scoreElement.textContent = score;
                
                // Play sound
                soundManager.playBeep(800 + score * 2, 150, 'sine');
            }
        });
    }
    
    function createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                color: color
            });
        }
    }
    
    function updateParticles() {
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                particles.splice(index, 1);
            }
        });
    }
    
    function drawPlayer() {
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Player glow effect
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 10;
        ctx.fillRect(player.x + 2, player.y + 2, player.width - 4, player.height - 4);
        ctx.shadowBlur = 0;
    }
    
    function drawTarget(target) {
        ctx.fillStyle = target.color;
        ctx.fillRect(target.x, target.y, target.width, target.height);
        
        // Target glow
        ctx.shadowColor = target.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(target.x + 2, target.y + 2, target.width - 4, target.height - 4);
        ctx.shadowBlur = 0;
    }
    
    function drawParticle(particle) {
        const alpha = particle.life / 30;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        ctx.globalAlpha = 1;
    }
    
    // Player controls
    canvas.addEventListener('mousemove', (e) => {
        if (!gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        player.x = (e.clientX - rect.left) * scaleX - player.width / 2;
        
        // Keep player in bounds
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    });
    
    // Touch controls for mobile
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const touch = e.touches[0];
        player.x = (touch.clientX - rect.left) * scaleX - player.width / 2;
        
        // Keep player in bounds
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    });
    
    // Start game button
    startBtn.addEventListener('click', startGame);
    
    // Draw initial state
    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '14px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('CYBER MATRIX', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText('Click START to begin', canvas.width / 2, canvas.height / 2 + 10);
}

console.log('🎮 PIXEL GAME PORTFOLIO LOADED SUCCESSFULLY! 🎮');

// Ensure game initializes even if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMiniGame);
} else {
    initializeMiniGame();
}
