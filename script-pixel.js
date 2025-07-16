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
    console.log('🎮 DOM Content Loaded - Starting initialization...');
    
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        try {
            initializePixelGame();
            setupNavigationEffects();
            setupTypingAnimation();
            setupQuestCards();
            setupAchievements();
            setupTerminalEffects();
            setupPixelCharacter();
            setupFeaturedProject();
            initializeMiniGame();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }, 100);
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
    const terminal = document.querySelector('.cyber-terminal-container');
    if (!terminal) {
        console.log('Terminal container not found');
        return;
    }
    
    const terminalLines = terminal.querySelectorAll('.cyber-experience-item');
    if (!terminalLines || terminalLines.length === 0) {
        console.log('No terminal lines found');
        return;
    }
    
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

// ====== CYBER WARRIOR - SIDE-SCROLLING ACTION GAME ======
function initializeMiniGame() {
    console.log('🎮 Initializing Cyber Warrior game...');
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const startBtn = document.getElementById('startGame');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    
    if (!canvas || !startBtn || !scoreElement) {
        console.warn('Game elements not found, skipping game initialization');
        return;
    }

    // Enhanced rendering setup for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set internal size to actual size multiplied by device pixel ratio
    canvas.width = 900 * dpr;
    canvas.height = 300 * dpr;
    
    // Scale the context to match device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Set display size (CSS pixels)
    canvas.style.width = '900px';
    canvas.style.height = '300px';
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = false; // Keep pixelated for retro feel
    ctx.textRenderingOptimization = 'optimizeQuality';

    // Game state
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    let level = 1;
    let cameraX = 0;
    let levelWidth = 3600; // 4x wider screen width for scrolling
    let renderScale = dpr; // Track render scale for calculations
    
    // Player object with enhanced fighting system and animation states
    let player = {
        x: 50,
        y: 200,
        width: 32,
        height: 48,
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        jumpPower: 14,
        onGround: false,
        facing: 1, // 1 = right, -1 = left
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        stamina: 100,
        maxStamina: 100,
        
        // Fighting system with detailed animation states
        isAttacking: false,
        attackType: '',
        attackFrame: 0,
        attackDuration: 0,
        attackCooldown: 0,
        combo: 0,
        comboTimer: 0,
        
        // Animation system
        animFrame: 0,
        animTimer: 0,
        animSpeed: 8, // frames per animation step
        state: 'idle', // idle, walking, jumping, punching, kicking, heavy, special, blocking, hurt
        
        // Combat states
        isBlocking: false,
        canCombo: false,
        invulnerable: 0,
        hitstun: 0,
        
        // Movement abilities
        canDoubleJump: true,
        canWallJump: false,
        dashCooldown: 0,
        canDash: true,
        
        // Colors for detailed sprite
        skinColor: '#ffdbac',
        hairColor: '#8b4513',
        shirtColor: '#4169e1',
        pantsColor: '#2f2f2f',
        shoeColor: '#654321',
        
        // Attack hitboxes and properties
        attacks: {
            punch: { duration: 12, damage: 15, range: 35, stamina: 8, mana: 0, knockback: 5 },
            kick: { duration: 16, damage: 20, range: 40, stamina: 12, mana: 0, knockback: 8 },
            heavy: { duration: 24, damage: 35, range: 45, stamina: 20, mana: 0, knockback: 15 },
            special: { duration: 32, damage: 50, range: 60, stamina: 15, mana: 25, knockback: 25 },
            grab: { duration: 20, damage: 25, range: 30, stamina: 10, mana: 0, knockback: 0 }
        }
    };
    
    // Game objects arrays
    let bullets = [];
    let enemies = [];
    let platforms = [];
    let powerups = [];
    let particles = [];
    let explosions = [];
    
    // Controls - fighting game style
    let keys = {
        // Movement
        left: false,    // A
        right: false,   // D
        up: false,      // W
        down: false,    // S
        
        // Attacks
        punch: false,   // J - Light punch
        kick: false,    // K - Light kick
        heavy: false,   // L - Heavy attack
        special: false, // U - Special move
        block: false,   // I - Block/Guard
        grab: false     // O - Grab/Throw
    };
    
    // Initialize level
    function initLevel() {
        platforms = [
            // Ground platforms - extended for wider screen
            {x: 0, y: 270, width: 800, height: 30},
            {x: 900, y: 270, width: 600, height: 30},
            {x: 1600, y: 270, width: 800, height: 30},
            {x: 2500, y: 270, width: 600, height: 30},
            {x: 3200, y: 270, width: 400, height: 30},
            
            // Floating platforms - more detailed layout
            {x: 200, y: 220, width: 120, height: 15},
            {x: 400, y: 180, width: 140, height: 15},
            {x: 600, y: 140, width: 120, height: 15},
            {x: 800, y: 200, width: 100, height: 15},
            {x: 1000, y: 160, width: 150, height: 15},
            {x: 1200, y: 200, width: 180, height: 15},
            {x: 1450, y: 160, width: 120, height: 15},
            {x: 1700, y: 180, width: 200, height: 15},
            {x: 1950, y: 140, width: 150, height: 15},
            {x: 2200, y: 200, width: 180, height: 15},
            {x: 2450, y: 160, width: 120, height: 15},
            {x: 2700, y: 180, width: 160, height: 15},
            {x: 2950, y: 140, width: 140, height: 15},
            {x: 3150, y: 200, width: 200, height: 15}
        ];
        
        enemies = [
            // Early enemies
            {x: 300, y: 245, width: 18, height: 20, health: 30, type: 'walker', velocityX: -1, lastShot: 0},
            {x: 500, y: 155, width: 18, height: 20, health: 30, type: 'walker', velocityX: 1, lastShot: 0},
            {x: 750, y: 175, width: 18, height: 20, health: 30, type: 'walker', velocityX: -1, lastShot: 0},
            
            // Middle section enemies
            {x: 1100, y: 245, width: 18, height: 20, health: 50, type: 'shooter', velocityX: 0, lastShot: 0},
            {x: 1300, y: 175, width: 18, height: 20, health: 30, type: 'walker', velocityX: 1, lastShot: 0},
            {x: 1550, y: 135, width: 18, height: 20, health: 30, type: 'walker', velocityX: -1, lastShot: 0},
            {x: 1800, y: 155, width: 18, height: 20, health: 50, type: 'shooter', velocityX: 0, lastShot: 0},
            
            // Advanced section enemies
            {x: 2100, y: 245, width: 18, height: 20, health: 30, type: 'walker', velocityX: -1, lastShot: 0},
            {x: 2350, y: 175, width: 18, height: 20, health: 50, type: 'shooter', velocityX: 0, lastShot: 0},
            {x: 2600, y: 155, width: 18, height: 20, health: 30, type: 'walker', velocityX: 1, lastShot: 0},
            {x: 2850, y: 115, width: 18, height: 20, health: 50, type: 'shooter', velocityX: 0, lastShot: 0},
            
            // Boss section
            {x: 3100, y: 245, width: 25, height: 30, health: 100, type: 'boss', velocityX: 0, lastShot: 0}
        ];
        
        powerups = [
            {x: 250, y: 190, type: 'health', collected: false},
            {x: 650, y: 110, type: 'ammo', collected: false},
            {x: 1150, y: 170, type: 'health', collected: false},
            {x: 1500, y: 130, type: 'ammo', collected: false},
            {x: 2000, y: 170, type: 'health', collected: false},
            {x: 2400, y: 145, type: 'ammo', collected: false},
            {x: 2800, y: 110, type: 'health', collected: false},
            {x: 3000, y: 170, type: 'ammo', collected: false}
        ];
    }
    
    // Game loop
    function gameLoop() {
        if (!gameRunning) return;
        
        update();
        render();
        
        requestAnimationFrame(gameLoop);
    }
    
    function update() {
        // Update camera to follow player (use display width, not canvas internal width)
        const displayWidth = 900;
        cameraX = player.x - displayWidth / 2;
        cameraX = Math.max(0, Math.min(levelWidth - displayWidth, cameraX));
        
        // Update player
        updatePlayer();
        
        // Update bullets
        updateBullets();
        
        // Update enemies
        updateEnemies();
        
        // Update particles and explosions
        updateParticles();
        updateExplosions();
        
        // Check collisions
        checkCollisions();
        
        // Check win condition
        if (enemies.filter(e => e.type === 'boss').length === 0) {
            nextLevel();
        }
    }
    
    function updatePlayer() {
        // Update attack cooldown
        if (player.attackCooldown > 0) {
            player.attackCooldown--;
        }
        
        // Update attack frame
        if (player.isAttacking) {
            player.attackFrame++;
            if (player.attackFrame > 20) {
                player.isAttacking = false;
                player.attackFrame = 0;
                player.attackType = '';
            }
        }
        
        // Horizontal movement
        if (keys.left && !player.isAttacking) {
            player.velocityX = -player.speed;
            player.facing = -1;
            player.state = 'walking';
        } else if (keys.right && !player.isAttacking) {
            player.velocityX = player.speed;
            player.facing = 1;
            player.state = 'walking';
        } else {
            player.velocityX *= 0.8; // Friction
            if (Math.abs(player.velocityX) < 0.1) {
                player.state = 'idle';
            }
        }
        
        // Jumping
        if (keys.up && player.onGround && !player.isAttacking) {
            player.velocityY = -player.jumpPower;
            player.onGround = false;
            player.state = 'jumping';
            soundManager.playJump();
        }
        
        // Crouching
        if (keys.down && player.onGround) {
            player.state = 'crouching';
            player.velocityX *= 0.5; // Slower movement when crouching
        }
        
        // Fighting moves
        if (player.attackCooldown <= 0) {
            if (keys.punch) {
                performAttack('punch', 15, 10);
            } else if (keys.kick) {
                performAttack('kick', 20, 15);
            } else if (keys.heavy) {
                performAttack('heavy', 35, 25);
            } else if (keys.special && player.mana >= 20) {
                performAttack('special', 50, 30);
                player.mana -= 20;
            } else if (keys.grab) {
                performAttack('grab', 25, 20);
            }
        }
        
        // Blocking
        if (keys.block) {
            player.state = 'blocking';
            player.velocityX *= 0.3;
        }
        
        // Apply gravity
        player.velocityY += 0.6;
        
        // Apply velocities
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // Platform collision
        player.onGround = false;
        platforms.forEach(platform => {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + 10) {
                
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
                if (player.state === 'jumping') {
                    player.state = 'idle';
                }
            }
        });
        
        // Keep player in bounds
        if (player.x < 0) player.x = 0;
        if (player.x > levelWidth - player.width) player.x = levelWidth - player.width;
        if (player.y > 300) { // Use display height
            takeDamage(50);
        }
        
        // Regenerate mana slowly
        if (player.mana < player.maxMana) {
            player.mana += 0.1;
        }
    }
    
    function performAttack(type, damage, cooldown) {
        if (player.isAttacking) return;
        
        player.isAttacking = true;
        player.attackType = type;
        player.attackFrame = 0;
        player.attackCooldown = cooldown;
        player.state = 'attacking';
        
        // Create attack hitbox
        const attackRange = type === 'special' ? 80 : 60;
        const attackX = player.facing > 0 ? player.x + player.width : player.x - attackRange;
        const attackY = player.y;
        
        // Check for enemy hits
        enemies.forEach((enemy, index) => {
            if (enemy.x < attackX + attackRange &&
                enemy.x + enemy.width > attackX &&
                enemy.y < attackY + player.height &&
                enemy.y + enemy.height > attackY) {
                
                // Deal damage
                enemy.health -= damage;
                
                // Create hit effect
                createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2, type);
                
                // Knockback
                const knockback = type === 'heavy' ? 15 : (type === 'special' ? 25 : 8);
                enemy.x += player.facing * knockback;
                
                // Screen shake for heavy hits
                if (type === 'heavy' || type === 'special') {
                    createScreenShake(5);
                }
                
                // Combo system
                player.combo++;
                score += damage * player.combo;
                
                soundManager.playHit(type);
            }
        });
        
        // Play attack sound
        soundManager.playAttack(type);
    }
    
    function createHitEffect(x, y, attackType) {
        const effectColor = {
            'punch': '#ff6600',
            'kick': '#ff0066',
            'heavy': '#ff0000',
            'special': '#9900ff',
            'grab': '#ffff00'
        }[attackType] || '#ffffff';
        
        // Create impact particles
        for (let i = 0; i < 12; i++) {
            particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 12,
                velocityY: (Math.random() - 0.5) * 12,
                life: 30,
                color: effectColor,
                size: Math.random() * 4 + 2
            });
        }
        
        // Add special effect for heavy attacks
        if (attackType === 'heavy' || attackType === 'special') {
            explosions.push({
                x: x,
                y: y,
                radius: 0,
                maxRadius: attackType === 'special' ? 60 : 40,
                life: 25,
                color: effectColor
            });
        }
    }
    
    function createScreenShake(intensity) {
        // Screen shake effect (can be implemented later)
        console.log(`Screen shake: ${intensity}`);
    }
    
    function shoot() {
        bullets.push({
            x: player.x + (player.facing > 0 ? player.width : 0),
            y: player.y + player.height / 2,
            velocityX: player.facing * 8,
            velocityY: 0,
            damage: 25,
            type: 'player'
        });
        soundManager.playShoot();
    }
    
    function updateBullets() {
        bullets.forEach((bullet, index) => {
            bullet.x += bullet.velocityX;
            bullet.y += bullet.velocityY;
            
            // Remove bullets that go off screen (use display width)
            const displayWidth = 900;
            if (bullet.x < cameraX - 50 || bullet.x > cameraX + displayWidth + 50) {
                bullets.splice(index, 1);
            }
        });
    }
    
    function updateEnemies() {
        enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                score += enemy.type === 'boss' ? 500 : 100;
                enemies.splice(index, 1);
                return;
            }
            
            if (enemy.type === 'walker') {
                enemy.x += enemy.velocityX;
                
                // Reverse direction at platform edges
                let onPlatform = false;
                platforms.forEach(platform => {
                    if (enemy.x + enemy.width > platform.x && 
                        enemy.x < platform.x + platform.width &&
                        Math.abs(enemy.y + enemy.height - platform.y) < 5) {
                        onPlatform = true;
                    }
                });
                
                if (!onPlatform || enemy.x <= 0 || enemy.x >= levelWidth - enemy.width) {
                    enemy.velocityX *= -1;
                }
            } else if (enemy.type === 'shooter' || enemy.type === 'boss') {
                // Shoot at player
                const distanceToPlayer = Math.abs(enemy.x - player.x);
                if (distanceToPlayer < 300 && Date.now() - enemy.lastShot > 1500) {
                    enemyShoot(enemy);
                    enemy.lastShot = Date.now();
                }
            }
        });
    }
    
    function enemyShoot(enemy) {
        const directionX = player.x > enemy.x ? 1 : -1;
        bullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            velocityX: directionX * 4,
            velocityY: 0,
            damage: 20,
            type: 'enemy'
        });
        soundManager.playEnemyShoot();
    }
    
    function checkCollisions() {
        // Player bullets vs enemies
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.type !== 'player') return;
            
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + 5 > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + 3 > enemy.y) {
                    
                    enemy.health -= bullet.damage;
                    createParticles(bullet.x, bullet.y, '#ff0080');
                    bullets.splice(bulletIndex, 1);
                    soundManager.playHit();
                }
            });
        });
        
        // Enemy bullets vs player
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.type !== 'enemy') return;
            
            if (bullet.x < player.x + player.width &&
                bullet.x + 5 > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + 3 > player.y) {
                
                takeDamage(bullet.damage);
                bullets.splice(bulletIndex, 1);
            }
        });
        
        // Player vs powerups
        powerups.forEach((powerup, index) => {
            if (powerup.collected) return;
            
            if (player.x < powerup.x + 15 &&
                player.x + player.width > powerup.x &&
                player.y < powerup.y + 15 &&
                player.y + player.height > powerup.y) {
                
                if (powerup.type === 'health') {
                    player.health = Math.min(100, player.health + 30);
                } else if (powerup.type === 'ammo') {
                    player.shotCooldown = Math.max(50, player.shotCooldown - 50);
                }
                
                powerup.collected = true;
                score += 50;
                soundManager.playPowerup();
            }
        });
    }
    
    function takeDamage(amount) {
        player.health -= amount;
        createParticles(player.x + player.width/2, player.y + player.height/2, '#ff0000');
        
        if (player.health <= 0) {
            lives--;
            if (lives <= 0) {
                endGame();
            } else {
                respawn();
            }
        }
    }
    
    function respawn() {
        player.x = 50;
        player.y = 200;
        player.health = 100;
        player.velocityX = 0;
        player.velocityY = 0;
    }
    
    function nextLevel() {
        level++;
        initLevel();
        player.x = 50;
        player.y = 200;
        showStatusMessage(`🎯 Level ${level} Complete!`);
    }
    
    function createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8,
                life: 30,
                color: color
            });
        }
    }
    
    function createExplosion(x, y) {
        explosions.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 40,
            life: 20
        });
        soundManager.playExplosion();
    }
    
    function updateParticles() {
        particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityX *= 0.95;
            particle.velocityY *= 0.95;
            particle.life--;
            
            if (particle.life <= 0) {
                particles.splice(index, 1);
            }
        });
    }
    
    function updateExplosions() {
        explosions.forEach((explosion, index) => {
            explosion.radius += 3;
            explosion.life--;
            
            if (explosion.life <= 0) {
                explosions.splice(index, 1);
            }
        });
    }
    
    function render() {
        // Clear canvas (use display dimensions)
        ctx.fillStyle = 'rgba(10, 20, 35, 1)';
        ctx.fillRect(0, 0, 900, 300);
        
        // Save context for camera transform
        ctx.save();
        ctx.translate(-cameraX, 0);
        
        // Draw background elements
        drawBackground();
        
        // Draw platforms
        platforms.forEach(platform => drawPlatform(platform));
        
        // Draw powerups
        powerups.forEach(powerup => {
            if (!powerup.collected) drawPowerup(powerup);
        });
        
        // Draw enemies
        enemies.forEach(enemy => drawEnemy(enemy));
        
        // Draw player
        drawPlayer();
        
        // Draw bullets
        bullets.forEach(bullet => drawBullet(bullet));
        
        // Draw particles
        particles.forEach(particle => drawParticle(particle));
        
        // Draw explosions
        explosions.forEach(explosion => drawExplosion(explosion));
        
        // Restore context
        ctx.restore();
        
        // Draw UI
        drawUI();
    }
    
    function drawBackground() {
        // Distant cyber city skyline
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = i * 200 + Math.sin(Date.now() * 0.001 + i) * 20;
            const y = 50 + Math.sin(Date.now() * 0.002 + i) * 30;
            
            // Building silhouettes
            ctx.fillRect(x, y, 4, 60 + i * 2);
            ctx.fillRect(x + 10, y + 10, 3, 50 + i);
        }
        
        // Floating tech debris
        ctx.fillStyle = 'rgba(255, 0, 128, 0.08)';
        for (let i = 0; i < 15; i++) {
            const x = i * 250 + Math.cos(Date.now() * 0.0008 + i) * 30;
            const y = 80 + Math.cos(Date.now() * 0.0015 + i) * 40;
            ctx.fillRect(x, y, 3, 3);
            ctx.fillRect(x + 5, y + 2, 2, 2);
        }
        
        // Energy grid lines
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 100, 0);
            ctx.lineTo(i * 100, 300);
            ctx.stroke();
        }
        
        // Atmospheric particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 150 + Date.now() * 0.02) % 4000;
            const y = 30 + Math.sin(x * 0.01) * 100;
            ctx.fillRect(x - cameraX, y, 1, 1);
        }
    }
    
    function drawPlatform(platform) {
        const x = platform.x;
        const y = platform.y;
        const w = platform.width;
        const h = platform.height;
        
        // Platform base (tech metal)
        ctx.fillStyle = '#4682b4';
        ctx.fillRect(x, y, w, h);
        
        // Top surface (energy coating)
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(x, y, w, 3);
        
        // Tech details
        ctx.fillStyle = '#1e90ff';
        for (let i = 0; i < w; i += 20) {
            ctx.fillRect(x + i, y + 3, 2, h - 3);
        }
        
        // Energy lines
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(x, y + h/2, w, 1);
        
        // Platform glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, w, 2);
        ctx.shadowBlur = 0;
        
        // Floating platform energy field (for smaller platforms)
        if (h <= 15) {
            const glow = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
            ctx.globalAlpha = glow * 0.4;
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(x - 2, y - 1, w + 4, 1);
            ctx.fillRect(x - 1, y + h, w + 2, 1);
            ctx.globalAlpha = 1;
        }
    }
    
    function drawPlayer() {
        const x = Math.floor(player.x);
        const y = Math.floor(player.y);
        const facing = player.facing;
        
        // Animation frame calculation
        player.animTimer++;
        if (player.animTimer > 8) {
            player.animFrame = (player.animFrame + 1) % 4;
            player.animTimer = 0;
        }
        
        // Color palette - 256 color style
        const colors = {
            skin: ['#ffdbac', '#f5c28a', '#e6b373'],
            hair: ['#8b4513', '#a0522d', '#6b3410'],
            shirt: ['#4169e1', '#5a7dff', '#2e4bc7'],
            pants: ['#2f2f2f', '#404040', '#1a1a1a'],
            shoes: ['#654321', '#7a5530', '#4a2c17'],
            outline: '#000000',
            highlight: '#ffffff'
        };
        
        // Attack effects
        if (player.isAttacking) {
            drawAttackEffects(x, y, facing);
        }
        
        // Body parts drawing (detailed pixel art)
        drawPlayerHead(x, y, facing, colors);
        drawPlayerTorso(x, y, facing, colors);
        drawPlayerArms(x, y, facing, colors);
        drawPlayerLegs(x, y, facing, colors);
        
        // Health and status effects
        drawPlayerStatusEffects(x, y);
    }
    
    function drawPlayerHead(x, y, facing, colors) {
        // Head outline
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 10, y + 2, 12, 12);
        
        // Face
        ctx.fillStyle = colors.skin[0];
        ctx.fillRect(x + 11, y + 3, 10, 10);
        
        // Hair
        ctx.fillStyle = colors.hair[0];
        ctx.fillRect(x + 9, y + 1, 14, 6);
        ctx.fillStyle = colors.hair[1];
        ctx.fillRect(x + 10, y + 2, 12, 4);
        
        // Eyes
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 13, y + 6, 2, 2);
        ctx.fillRect(x + 17, y + 6, 2, 2);
        ctx.fillStyle = colors.highlight;
        ctx.fillRect(x + 13, y + 6, 1, 1);
        ctx.fillRect(x + 17, y + 6, 1, 1);
        
        // Nose
        ctx.fillStyle = colors.skin[1];
        ctx.fillRect(x + 15, y + 8, 2, 1);
        
        // Mouth
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 14, y + 10, 4, 1);
        
        // Facial shadows
        ctx.fillStyle = colors.skin[2];
        ctx.fillRect(x + 12, y + 7, 1, 3);
        ctx.fillRect(x + 19, y + 7, 1, 3);
    }
    
    function drawPlayerTorso(x, y, facing, colors) {
        // Shirt outline
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 8, y + 14, 16, 20);
        
        // Shirt base
        ctx.fillStyle = colors.shirt[0];
        ctx.fillRect(x + 9, y + 15, 14, 18);
        
        // Shirt highlights
        ctx.fillStyle = colors.shirt[1];
        ctx.fillRect(x + 10, y + 16, 3, 16);
        
        // Shirt shadows
        ctx.fillStyle = colors.shirt[2];
        ctx.fillRect(x + 20, y + 16, 2, 16);
        
        // Chest muscles definition
        ctx.fillStyle = colors.shirt[1];
        ctx.fillRect(x + 12, y + 18, 8, 3);
        
        // Belt
        ctx.fillStyle = colors.shoes[0];
        ctx.fillRect(x + 9, y + 30, 14, 3);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 15, y + 31, 2, 1);
    }
    
    function drawPlayerArms(x, y, facing, colors) {
        const armOffset = player.isAttacking ? (facing > 0 ? 4 : -4) : 0;
        
        // Left arm
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 4 + armOffset, y + 16, 6, 16);
        ctx.fillStyle = colors.skin[0];
        ctx.fillRect(x + 5 + armOffset, y + 17, 4, 8);
        ctx.fillStyle = colors.shirt[0];
        ctx.fillRect(x + 5 + armOffset, y + 17, 4, 4);
        
        // Right arm
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 22 - armOffset, y + 16, 6, 16);
        ctx.fillStyle = colors.skin[0];
        ctx.fillRect(x + 23 - armOffset, y + 17, 4, 8);
        ctx.fillStyle = colors.shirt[0];
        ctx.fillRect(x + 23 - armOffset, y + 17, 4, 4);
        
        // Hands
        ctx.fillStyle = colors.skin[0];
        ctx.fillRect(x + 5 + armOffset, y + 25, 4, 4);
        ctx.fillRect(x + 23 - armOffset, y + 25, 4, 4);
        
        // Hand details
        ctx.fillStyle = colors.skin[1];
        ctx.fillRect(x + 6 + armOffset, y + 26, 2, 2);
        ctx.fillRect(x + 24 - armOffset, y + 26, 2, 2);
    }
    
    function drawPlayerLegs(x, y, facing, colors) {
        const walkOffset = player.state === 'walking' ? 
            Math.sin(player.animFrame * Math.PI / 2) * 2 : 0;
        
        // Left leg
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 10, y + 34, 6, 14);
        ctx.fillStyle = colors.pants[0];
        ctx.fillRect(x + 11, y + 35, 4, 10);
        
        // Right leg
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x + 16, y + 34, 6, 14);
        ctx.fillStyle = colors.pants[0];
        ctx.fillRect(x + 17, y + 35, 4, 10);
        
        // Shoes
        ctx.fillStyle = colors.shoes[0];
        ctx.fillRect(x + 10, y + 44, 7, 4);
        ctx.fillRect(x + 16, y + 44, 7, 4);
        
        // Shoe details
        ctx.fillStyle = colors.shoes[1];
        ctx.fillRect(x + 11, y + 45, 5, 2);
        ctx.fillRect(x + 17, y + 45, 5, 2);
        
        // Leg shadows
        ctx.fillStyle = colors.pants[2];
        ctx.fillRect(x + 14, y + 35, 1, 10);
        ctx.fillRect(x + 20, y + 35, 1, 10);
    }
    
    function drawPlayerStatusEffects(x, y) {
        // Health bar above player
        if (player.health < player.maxHealth) {
            // Health bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - 2, y - 8, 36, 6);
            
            // Health bar border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 2, y - 8, 36, 6);
            
            // Health bar fill
            const healthPercent = player.health / player.maxHealth;
            ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : 
                           healthPercent > 0.3 ? '#ffff00' : '#ff0000';
            ctx.fillRect(x - 1, y - 7, 34 * healthPercent, 4);
        }
        
        // Mana bar
        if (player.mana < player.maxMana) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - 2, y - 16, 36, 4);
            ctx.fillStyle = '#0080ff';
            ctx.fillRect(x - 1, y - 15, 34 * (player.mana / player.maxMana), 2);
        }
        
        // Combat effects
        if (player.isAttacking) {
            const glow = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = glow * 10;
            ctx.fillStyle = `rgba(255, 102, 0, ${glow * 0.3})`;
            ctx.fillRect(x - 5, y - 5, 42, 58);
            ctx.shadowBlur = 0;
        }
    }
    
    function drawAttackEffects(x, y, facing) {
        const effectX = facing > 0 ? x + 32 : x - 16;
        const effectY = y + 16;
        
        // Attack particles
        for (let i = 0; i < 5; i++) {
            const px = effectX + (Math.random() - 0.5) * 20;
            const py = effectY + (Math.random() - 0.5) * 20;
            
            ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${0.7 + Math.random() * 0.3})`;
            ctx.fillRect(px, py, 3, 3);
        }
        
        // Impact lines
        if (player.attackFrame < 10) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(effectX, effectY + i * 8);
                ctx.lineTo(effectX + facing * 15, effectY + i * 8);
                ctx.stroke();
            }
        }
    }
    
    function drawEnemy(enemy) {
        const x = Math.floor(enemy.x);
        const y = Math.floor(enemy.y);
        
        if (enemy.type === 'walker') {
            // Street Fighter - detailed pixel design
            drawStreetFighter(x, y, enemy);
        } else if (enemy.type === 'shooter') {
            // Heavy Brawler - muscular character
            drawHeavyBrawler(x, y, enemy);
        } else if (enemy.type === 'boss') {
            // Boss Fighter - intimidating design
            drawBossFighter(x, y, enemy);
        }
        
        // Enemy health bar
        const maxHealth = enemy.type === 'boss' ? 100 : (enemy.type === 'shooter' ? 50 : 30);
        if (enemy.health < maxHealth) {
            // Health bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x - 2, y - 10, enemy.width + 4, 6);
            
            // Health bar border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 2, y - 10, enemy.width + 4, 6);
            
            // Health fill
            const healthPercent = enemy.health / maxHealth;
            ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : 
                           healthPercent > 0.3 ? '#ffff00' : '#ff0000';
            ctx.fillRect(x - 1, y - 9, (enemy.width + 2) * healthPercent, 4);
        }
    }
    
    function drawStreetFighter(x, y, enemy) {
        // Color palette for street fighter
        const colors = {
            skin: '#d2b48c',
            hair: '#4b0082',
            gi: '#ffffff',
            belt: '#ff4500',
            gloves: '#ff0000'
        };
        
        // Head
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 2, 12, 12);
        ctx.fillStyle = colors.skin;
        ctx.fillRect(x + 7, y + 3, 10, 10);
        
        // Hair (spiky anime style)
        ctx.fillStyle = colors.hair;
        ctx.fillRect(x + 5, y + 1, 4, 6);
        ctx.fillRect(x + 9, y, 6, 8);
        ctx.fillRect(x + 15, y + 1, 4, 6);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 9, y + 6, 2, 2);
        ctx.fillRect(x + 13, y + 6, 2, 2);
        
        // Gi (martial arts uniform)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, y + 14, 16, 22);
        ctx.fillStyle = colors.gi;
        ctx.fillRect(x + 5, y + 15, 14, 20);
        
        // Belt
        ctx.fillStyle = colors.belt;
        ctx.fillRect(x + 5, y + 25, 14, 3);
        
        // Arms with fighting gloves
        ctx.fillStyle = colors.skin;
        ctx.fillRect(x + 1, y + 16, 5, 12);
        ctx.fillRect(x + 18, y + 16, 5, 12);
        
        // Fighting gloves
        ctx.fillStyle = colors.gloves;
        ctx.fillRect(x, y + 22, 6, 6);
        ctx.fillRect(x + 18, y + 22, 6, 6);
        
        // Legs
        ctx.fillStyle = colors.gi;
        ctx.fillRect(x + 7, y + 35, 5, 13);
        ctx.fillRect(x + 12, y + 35, 5, 13);
        
        // Feet
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 46, 7, 4);
        ctx.fillRect(x + 11, y + 46, 7, 4);
    }
    
    function drawHeavyBrawler(x, y, enemy) {
        // Muscular brawler design
        const colors = {
            skin: '#8b4513',
            shirt: '#006400',
            pants: '#2f4f4f',
            boots: '#654321'
        };
        
        // Larger frame for heavy character
        const scale = 1.2;
        
        // Head (bald with scars)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 5, y + 1, 14, 14);
        ctx.fillStyle = colors.skin;
        ctx.fillRect(x + 6, y + 2, 12, 12);
        
        // Scars
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + 8, y + 4, 1, 6);
        ctx.fillRect(x + 15, y + 6, 1, 4);
        
        // Eyes (menacing)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + 9, y + 7, 2, 1);
        ctx.fillRect(x + 13, y + 7, 2, 1);
        
        // Massive torso
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 3, y + 15, 18, 24);
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(x + 4, y + 16, 16, 22);
        
        // Muscle definition
        ctx.fillStyle = '#004d00';
        ctx.fillRect(x + 6, y + 18, 5, 8);
        ctx.fillRect(x + 13, y + 18, 5, 8);
        
        // Massive arms
        ctx.fillStyle = colors.skin;
        ctx.fillRect(x - 1, y + 17, 6, 15);
        ctx.fillRect(x + 19, y + 17, 6, 15);
        
        // Fists
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x - 2, y + 28, 7, 7);
        ctx.fillRect(x + 19, y + 28, 7, 7);
        
        // Legs
        ctx.fillStyle = colors.pants;
        ctx.fillRect(x + 6, y + 38, 6, 12);
        ctx.fillRect(x + 12, y + 38, 6, 12);
        
        // Combat boots
        ctx.fillStyle = colors.boots;
        ctx.fillRect(x + 5, y + 48, 8, 6);
        ctx.fillRect(x + 11, y + 48, 8, 6);
    }
    
    function drawBossFighter(x, y, enemy) {
        // Boss character - intimidating design
        const colors = {
            skin: '#2f2f2f',
            armor: '#8b0000',
            cape: '#4b0082',
            glow: '#ff6600'
        };
        
        // Cape flowing behind
        ctx.fillStyle = colors.cape;
        ctx.fillRect(x - 3, y + 10, 6, 25);
        ctx.fillRect(x + 22, y + 10, 6, 25);
        
        // Armor outline
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2, y + 8, 21, 32);
        
        // Main armor body
        ctx.fillStyle = colors.armor;
        ctx.fillRect(x + 3, y + 9, 19, 30);
        
        // Armor details
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + 5, y + 12, 3, 15);
        ctx.fillRect(x + 17, y + 12, 3, 15);
        
        // Head (helmet)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 1, 13, 13);
        ctx.fillStyle = colors.armor;
        ctx.fillRect(x + 7, y + 2, 11, 11);
        
        // Helmet spikes
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(x + 9, y - 1, 2, 4);
        ctx.fillRect(x + 13, y - 2, 2, 5);
        ctx.fillRect(x + 17, y - 1, 2, 4);
        
        // Glowing eyes
        const glow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = glow;
        ctx.fillStyle = colors.glow;
        ctx.fillRect(x + 9, y + 6, 3, 2);
        ctx.fillRect(x + 14, y + 6, 3, 2);
        ctx.globalAlpha = 1;
        
        // Gauntlets
        ctx.fillStyle = colors.armor;
        ctx.fillRect(x - 1, y + 20, 7, 12);
        ctx.fillRect(x + 19, y + 20, 7, 12);
        
        // Leg armor
        ctx.fillStyle = colors.armor;
        ctx.fillRect(x + 6, y + 38, 6, 15);
        ctx.fillRect(x + 13, y + 38, 6, 15);
        
        // Boss aura
        const aura = Math.sin(Date.now() * 0.003) * 0.4 + 0.6;
        ctx.globalAlpha = aura * 0.3;
        ctx.fillStyle = colors.glow;
        ctx.fillRect(x - 5, y - 3, enemy.width + 10, enemy.height + 6);
        ctx.globalAlpha = 1;
    }
    
    function drawBullet(bullet) {
        const x = bullet.x;
        const y = bullet.y;
        
        if (bullet.type === 'player') {
            // Energy plasma bolt
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(x, y, 6, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 1, y, 4, 2);
            
            // Energy trail
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 8;
            ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.fillRect(x - 3, y, 3, 2);
            ctx.shadowBlur = 0;
        } else {
            // Enemy laser beam
            ctx.fillStyle = '#ff0080';
            ctx.fillRect(x, y, 8, 2);
            ctx.fillStyle = '#ff69b4';
            ctx.fillRect(x + 1, y, 6, 2);
            
            // Laser trail
            ctx.shadowColor = '#ff0080';
            ctx.shadowBlur = 6;
            ctx.fillStyle = 'rgba(255, 0, 128, 0.5)';
            ctx.fillRect(x - 4, y, 4, 2);
            ctx.shadowBlur = 0;
        }
    }
    
    function drawPowerup(powerup) {
        const x = powerup.x;
        const y = powerup.y;
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        
        if (powerup.type === 'health') {
            // Health potion - crystal style
            ctx.globalAlpha = pulse;
            
            // Crystal base
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(x + 4, y + 8, 6, 6);
            
            // Crystal top
            ctx.fillStyle = '#32cd32';
            ctx.fillRect(x + 5, y + 6, 4, 4);
            ctx.fillRect(x + 6, y + 4, 2, 4);
            
            // Cross symbol (health)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 6, y + 9, 2, 4);
            ctx.fillRect(x + 5, y + 10, 4, 2);
            
            // Glow effect
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 12;
            ctx.fillRect(x + 3, y + 7, 8, 8);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            
        } else if (powerup.type === 'ammo') {
            // Energy core - tech style
            ctx.globalAlpha = pulse;
            
            // Core base
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(x + 3, y + 7, 8, 8);
            
            // Inner core
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + 4, y + 8, 6, 6);
            
            // Center energy
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 6, y + 10, 2, 2);
            
            // Tech details
            ctx.fillStyle = '#ff8c00';
            ctx.fillRect(x + 2, y + 10, 2, 2);
            ctx.fillRect(x + 10, y + 10, 2, 2);
            ctx.fillRect(x + 6, y + 6, 2, 2);
            ctx.fillRect(x + 6, y + 12, 2, 2);
            
            // Electric glow
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;
            ctx.fillRect(x + 2, y + 6, 10, 10);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }
    
    function drawParticle(particle) {
        const alpha = particle.life / 30;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        ctx.globalAlpha = 1;
    }
    
    function drawExplosion(explosion) {
        const alpha = explosion.life / 20;
        ctx.globalAlpha = alpha;
        
        ctx.strokeStyle = '#ff4000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }
    
    function drawUI() {
        // Health bar frame
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(8, 8, 124, 24);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 124, 24);
        
        // Health bar background
        ctx.fillStyle = '#2f2f2f';
        ctx.fillRect(12, 14, 116, 12);
        
        // Health bar (gradient effect)
        const healthPercent = player.health / 100;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffff00' : '#ff0000');
        ctx.fillRect(12, 14, 116 * healthPercent, 12);
        
        // Health bar glow
        ctx.shadowColor = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 5;
        ctx.fillRect(12, 14, 116 * healthPercent, 12);
        ctx.shadowBlur = 0;
        
        // Health text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HEALTH', 70, 23);
        
        // Health percentage
        ctx.font = '8px monospace';
        ctx.fillText(`${Math.floor(player.health)}%`, 70, 30);
        
        // Mini radar/map (top right)
        const radarSize = 80;
        const radarX = 900 - radarSize - 10;
        const radarY = 10;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(radarX, radarY, radarSize, radarSize);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(radarX, radarY, radarSize, radarSize);
        
        // Player position on radar
        const playerRadarX = radarX + (player.x / levelWidth) * radarSize;
        const playerRadarY = radarY + radarSize - 10;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(playerRadarX - 1, playerRadarY - 1, 3, 3);
        
        // Enemy positions on radar
        enemies.forEach(enemy => {
            const enemyRadarX = radarX + (enemy.x / levelWidth) * radarSize;
            const enemyRadarY = radarY + radarSize - 15;
            ctx.fillStyle = enemy.type === 'boss' ? '#ff4000' : '#ff0080';
            ctx.fillRect(enemyRadarX, enemyRadarY, 2, 2);
        });
        
        // Radar label
        ctx.fillStyle = '#00ffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('RADAR', radarX + radarSize/2, radarY + radarSize + 10);
    }
    
    // Enhanced sound effects for fighting game
    soundManager.playJump = function() {
        this.playBeep(300, 100, 'square');
    };
    
    soundManager.playAttack = function(type) {
        const sounds = {
            'punch': [400, 80, 'square'],
            'kick': [500, 100, 'square'],
            'heavy': [250, 150, 'sawtooth'],
            'special': [600, 200, 'sine'],
            'grab': [350, 120, 'triangle']
        };
        
        const [freq, dur, wave] = sounds[type] || [400, 80, 'square'];
        this.playBeep(freq, dur, wave);
    };
    
    soundManager.playHit = function(type) {
        const intensity = {
            'punch': [800, 60],
            'kick': [900, 80],
            'heavy': [600, 120],
            'special': [1000, 150],
            'grab': [700, 100]
        };
        
        const [freq, dur] = intensity[type] || [800, 60];
        this.playBeep(freq, dur, 'square');
        
        // Add impact sound
        setTimeout(() => {
            this.playBeep(freq * 0.5, dur * 0.7, 'sawtooth');
        }, 50);
    };
    
    soundManager.playEnemyShoot = function() {
        this.playBeep(400, 120, 'sawtooth');
    };
    
    soundManager.playExplosion = function() {
        this.playBeep(150, 300, 'sawtooth');
    };
    
    soundManager.playPowerup = function() {
        this.playBeep(600, 200, 'sine');
        setTimeout(() => this.playBeep(800, 200, 'sine'), 100);
    };
    
    // Fighting game controls
    document.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            // Movement
            case 'a':
                keys.left = true;
                e.preventDefault();
                break;
            case 'd':
                keys.right = true;
                e.preventDefault();
                break;
            case 'w':
                keys.up = true;
                e.preventDefault();
                break;
            case 's':
                keys.down = true;
                e.preventDefault();
                break;
                
            // Attacks
            case 'j':
                keys.punch = true;
                e.preventDefault();
                break;
            case 'k':
                keys.kick = true;
                e.preventDefault();
                break;
            case 'l':
                keys.heavy = true;
                e.preventDefault();
                break;
            case 'u':
                keys.special = true;
                e.preventDefault();
                break;
            case 'i':
                keys.block = true;
                e.preventDefault();
                break;
            case 'o':
                keys.grab = true;
                e.preventDefault();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key.toLowerCase()) {
            // Movement
            case 'a':
                keys.left = false;
                break;
            case 'd':
                keys.right = false;
                break;
            case 'w':
                keys.up = false;
                break;
            case 's':
                keys.down = false;
                break;
                
            // Attacks
            case 'j':
                keys.punch = false;
                break;
            case 'k':
                keys.kick = false;
                break;
            case 'l':
                keys.heavy = false;
                break;
            case 'u':
                keys.special = false;
                break;
            case 'i':
                keys.block = false;
                break;
            case 'o':
                keys.grab = false;
                break;
        }
    });
    
    function startGame() {
        console.log('🎮 Starting Cyber Warrior...');
        gameRunning = true;
        score = 0;
        lives = 3;
        level = 1;
        player.health = 100;
        
        // Update UI
        scoreElement.textContent = score;
        if (livesElement) livesElement.textContent = lives;
        if (levelElement) levelElement.textContent = level;
        
        startBtn.textContent = 'FIGHTING...';
        startBtn.disabled = true;
        
        // Initialize level
        initLevel();
        respawn();
        
        // Start game loop
        gameLoop();
        
        // Update UI periodically
        const uiInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(uiInterval);
                return;
            }
            scoreElement.textContent = score;
            if (livesElement) livesElement.textContent = lives;
            if (levelElement) levelElement.textContent = level;
        }, 100);
        
        showStatusMessage('🎯 Cyber Warrior Activated! Eliminate all enemies!');
    }
    
    function endGame() {
        gameRunning = false;
        startBtn.textContent = 'START';
        startBtn.disabled = false;
        
        const finalScore = score;
        showStatusMessage(`🎮 Mission Complete! Final Score: ${finalScore}`);
        soundManager.playSuccess();
    }
    
    // Start button event
    startBtn.addEventListener('click', startGame);
    
    // Draw initial state
    ctx.fillStyle = 'rgba(0, 20, 40, 0.9)';
    ctx.fillRect(0, 0, 900, 300);
    
    // Title background with gradient effect
    const gradient = ctx.createLinearGradient(300, 120, 600, 180);
    gradient.addColorStop(0, 'rgba(255, 0, 128, 0.2)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 102, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(300, 120, 300, 60);
    
    // Main title with glow
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 28px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 15;
    ctx.fillText('CYBER BRAWLERS', 450, 145);
    ctx.shadowBlur = 0;
    
    // Subtitle
    ctx.fillStyle = '#00ffff';
    ctx.font = '16px "Share Tech Mono"';
    ctx.fillText('Rogue-like Fighting Game', 450, 165);
    
    // Controls info with better styling
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Share Tech Mono"';
    ctx.fillText('WASD: Move | J: Punch | K: Kick | L: Heavy', 450, 185);
    ctx.fillText('U: Special | I: Block | O: Grab', 450, 198);
    
    // Fighting stance silhouettes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    // Left fighter
    ctx.fillRect(100, 220, 32, 48);
    // Right fighter  
    ctx.fillRect(770, 220, 32, 48);
    
    // Energy effects
    ctx.fillStyle = 'rgba(255, 0, 128, 0.3)';
    for (let i = 0; i < 15; i++) {
        const x = 50 + i * 55;
        const y = 250 + Math.sin(i * 0.8 + Date.now() * 0.005) * 15;
        ctx.fillRect(x, y, 4, 4);
    }
    
    // Ready indicator with pulse
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 18px "Share Tech Mono"';
    const pulse = Math.sin(Date.now() * 0.008) * 0.4 + 0.6;
    ctx.globalAlpha = pulse;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fillText('ENTER THE ARENA', 450, 240);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    
    console.log('🎮 Cyber Warrior game initialized successfully!');
}

// ====== FEATURED PROJECT SHOWCASE INTERACTIONS ======
function setupFeaturedProject() {
    // Setup legacy services grid if exists
    const servicesGrid = document.getElementById('servicesGrid');
    if (servicesGrid) {
        setupLegacyServicesGrid();
    }
    
    // Setup new architecture diagram
    setupArchitectureDiagram();
    
    // Setup tech items interaction
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('click', () => {
            item.style.animation = 'techHighlight 0.4s ease-out';
            setTimeout(() => {
                item.style.animation = '';
            }, 400);
        });
    });
}

// Setup Architecture Diagram Layer Toggles
function setupArchitectureDiagram() {
    const layerToggles = document.querySelectorAll('.layer-toggle');
    
    layerToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const layer = toggle.getAttribute('data-layer');
            const content = document.querySelector(`[data-content="${layer}"]`);
            
            if (content) {
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    toggle.textContent = '▲';
                    toggle.style.transform = 'rotate(180deg)';
                } else {
                    content.classList.add('collapsed');
                    toggle.textContent = '▼';
                    toggle.style.transform = 'rotate(0deg)';
                }
                
                // Sound effect
                if (window.soundManager) {
                    window.soundManager.playBeep(isCollapsed ? 800 : 600, 150);
                }
            }
        });
    });
    
    // Setup layer title clicks
    const layerTitles = document.querySelectorAll('.layer-title');
    layerTitles.forEach(title => {
        title.addEventListener('click', () => {
            const toggle = title.querySelector('.layer-toggle');
            if (toggle) {
                toggle.click();
            }
        });
    });
    
    // Setup architecture nodes interaction
    const archNodes = document.querySelectorAll('.arch-node');
    archNodes.forEach(node => {
        node.addEventListener('click', () => {
            // Create pulse effect
            node.style.animation = 'nodeActivate 0.6s ease-out';
            setTimeout(() => {
                node.style.animation = '';
            }, 600);
            
            // Show node details
            const nodeName = node.querySelector('span').textContent;
            const nodeDetail = node.querySelector('.node-detail');
            if (nodeDetail) {
                showArchNodeDetails(nodeName, nodeDetail.textContent);
            }
        });
        
        // Hover effects
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        node.addEventListener('mouseleave', () => {
            node.style.transform = '';
        });
    });
}

// Legacy services grid setup
function setupLegacyServicesGrid() {
    const servicesGrid = document.getElementById('servicesGrid');
    const demoBtn = document.getElementById('demoBtn');
    const featuresScroll = document.getElementById('featuresScroll');
    
    if (!servicesGrid) return;
    
    // Service nodes interaction
    const serviceNodes = servicesGrid.querySelectorAll('.service-node');
    serviceNodes.forEach(node => {
        node.addEventListener('click', () => {
            // Remove active class from all nodes
            serviceNodes.forEach(n => n.classList.remove('active-service'));
            
            // Add active class to clicked node
            node.classList.add('active-service');
            
            // Create pulse effect
            node.style.animation = 'serviceActivate 0.6s ease-out';
            setTimeout(() => {
                node.style.animation = '';
            }, 600);
            
            // Show service info
            const serviceName = node.querySelector('span').textContent;
            showServiceDetails(serviceName);
        });
        
        // Hover effects
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'translateY(-5px) scale(1.05)';
            node.style.boxShadow = '0 0 25px var(--accent-cyan)';
        });
        
        node.addEventListener('mouseleave', () => {
            if (!node.classList.contains('active-service')) {
                node.style.transform = '';
                node.style.boxShadow = '';
            }
        });
    });
    
    // Demo button interaction
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            runSystemDemo();
        });
    }
    
    // Auto-scroll features panel
    if (featuresScroll) {
        autoScrollFeatures();
    }
}

function showArchNodeDetails(nodeName, details) {
    // Create a temporary tooltip or notification
    const notification = document.createElement('div');
    notification.className = 'arch-notification';
    notification.innerHTML = `
        <div class="notification-header">
            <i class="fas fa-info-circle"></i> ${nodeName}
        </div>
        <div class="notification-content">${details}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Position notification
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.zIndex = '10000';
    notification.style.background = 'var(--bg-game)';
    notification.style.border = '1px solid var(--accent-cyan)';
    notification.style.borderRadius = '8px';
    notification.style.padding = '1rem';
    notification.style.maxWidth = '300px';
    notification.style.boxShadow = '0 0 20px var(--accent-cyan)';
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
    
    // Click to close
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

function showServiceDetails(serviceName) {
    const serviceDetails = {
        'Gateway': 'API Gateway with load balancing and rate limiting',
        'Auth': 'JWT authentication with RBAC and SMS verification',
        'User': 'User management with L2 cache and high concurrency',
        'Blog': 'Blog service with async processing and real-time updates',
        'Relation': 'Social relations with Redis and MQ optimization',
        'Counter': 'High-performance counting with buffer aggregation',
        'OSS': 'Multi-cloud storage with factory pattern',
        'Search': 'Real-time search with Elasticsearch and Canal'
    };
    
    const detail = serviceDetails[serviceName] || 'Advanced microservice component';
    showStatusMessage(`🔧 ${serviceName}: ${detail}`);
}

function runSystemDemo() {
    const demoBtn = document.getElementById('demoBtn');
    const serviceNodes = document.querySelectorAll('.service-node');
    const metricCards = document.querySelectorAll('.metric-card');
    
    demoBtn.textContent = 'RUNNING...';
    demoBtn.disabled = true;
    
    // Simulate system activation
    let index = 0;
    const activateServices = setInterval(() => {
        if (index < serviceNodes.length) {
            serviceNodes[index].style.animation = 'serviceActivate 0.6s ease-out';
            serviceNodes[index].style.borderColor = 'var(--accent-cyan)';
            serviceNodes[index].style.boxShadow = '0 0 20px var(--accent-cyan)';
            index++;
        } else {
            clearInterval(activateServices);
            
            // Animate metrics
            metricCards.forEach((card, i) => {
                setTimeout(() => {
                    card.style.animation = 'metricPulse 0.8s ease-out';
                }, i * 200);
            });
            
            setTimeout(() => {
                demoBtn.textContent = 'DEMO_COMPLETE';
                demoBtn.style.background = 'var(--accent-magenta)';
                showStatusMessage('🚀 System demo completed! All services are operational.');
                
                setTimeout(() => {
                    demoBtn.textContent = 'RUN_DEMO';
                    demoBtn.style.background = 'var(--accent-cyan)';
                    demoBtn.disabled = false;
                    
                    // Reset service nodes
                    serviceNodes.forEach(node => {
                        node.style.animation = '';
                        node.style.borderColor = '';
                        node.style.boxShadow = '';
                    });
                }, 3000);
            }, 2000);
        }
    }, 300);
}

function autoScrollFeatures() {
    const featuresScroll = document.getElementById('featuresScroll');
    if (!featuresScroll) return;
    
    let scrollDirection = 1;
    let scrollPosition = 0;
    
    setInterval(() => {
        scrollPosition += scrollDirection * 50;
        
        if (scrollPosition >= featuresScroll.scrollHeight - featuresScroll.clientHeight) {
            scrollDirection = -1;
        } else if (scrollPosition <= 0) {
            scrollDirection = 1;
        }
        
        featuresScroll.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }, 3000);
}

// Add new CSS animations via JavaScript
const featuredProjectStyles = `
@keyframes serviceActivate {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1.05); }
}

@keyframes techHighlight {
    0% { transform: scale(1); }
    50% { transform: scale(1.2) rotate(5deg); }
    100% { transform: scale(1); }
}

@keyframes metricPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
}

.active-service {
    border-color: var(--accent-cyan) !important;
    box-shadow: 0 0 20px var(--accent-cyan) !important;
    transform: translateY(-5px) scale(1.05) !important;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = featuredProjectStyles;
document.head.appendChild(styleSheet);

console.log('🎮 PIXEL GAME PORTFOLIO LOADED SUCCESSFULLY! 🎮');

// Game initialization is handled by the main DOMContentLoaded event
// No need for duplicate initialization here
