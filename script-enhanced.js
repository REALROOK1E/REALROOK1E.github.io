// ====== ENHANCED FIGHTING GAME ======
// 连贯动作、多元机制的横版格斗游戏

class EnhancedFightingGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initGame();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        // Ultra High DPI support - 4x resolution
        const baseWidth = 900;
        const baseHeight = 300;
        const superSampleRatio = 4; // 4倍超采样
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual canvas size to 4x for ultra-high quality
        this.canvas.width = baseWidth * superSampleRatio * dpr;
        this.canvas.height = baseHeight * superSampleRatio * dpr;
        
        // Keep display size normal
        this.canvas.style.width = baseWidth + 'px';
        this.canvas.style.height = baseHeight + 'px';
        
        // Scale context for ultra-high quality rendering
        this.ctx.scale(superSampleRatio * dpr, superSampleRatio * dpr);
        
        // Ultra-crisp pixel rendering settings
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.oImageSmoothingEnabled = false;
        
        // High-quality text rendering
        this.ctx.textRenderingOptimization = 'optimizeQuality';
        this.ctx.fontKerning = 'normal';
        
        // Store scaling factors for calculations
        this.scaleFactor = superSampleRatio;
        this.renderWidth = baseWidth;
        this.renderHeight = baseHeight;
    }
    
    initGame() {
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.level = 1;
        this.cameraX = 0;
        this.levelWidth = 4000;
        this.gameMode = 'adventure'; // adventure, survival, boss_rush
        
        // Player with enhanced fighting system
        this.player = {
            x: 50, y: 200, width: 32, height: 48,
            velocityX: 0, velocityY: 0,
            speed: 6, jumpPower: 15,
            onGround: false, facing: 1,
            
            // Resources
            health: 100, maxHealth: 100,
            mana: 100, maxMana: 100,
            stamina: 100, maxStamina: 100,
            energy: 0, maxEnergy: 100, // Special meter for ultimate moves
            
            // Combat states
            isAttacking: false, attackType: '', attackFrame: 0,
            combo: 0, comboTimer: 0, maxCombo: 10,
            isBlocking: false, canCounter: false,
            invulnerable: 0, hitstun: 0,
            
            // Movement abilities
            canDoubleJump: true, canWallJump: false,
            dashCooldown: 0, canDash: true,
            
            // Animation
            animFrame: 0, animTimer: 0, animSpeed: 6,
            state: 'idle', // idle, walking, jumping, attacking, blocking, hurt, victory
            
            // Attack properties with frame data
            attacks: {
                light_punch: { 
                    startup: 3, active: 4, recovery: 8, damage: 12, range: 35, 
                    stamina: 5, hitstun: 8, blockstun: 4, knockback: 3 
                },
                heavy_punch: { 
                    startup: 8, active: 6, recovery: 15, damage: 25, range: 40, 
                    stamina: 15, hitstun: 15, blockstun: 8, knockback: 8 
                },
                light_kick: { 
                    startup: 5, active: 5, recovery: 10, damage: 15, range: 45, 
                    stamina: 8, hitstun: 10, blockstun: 5, knockback: 5 
                },
                heavy_kick: { 
                    startup: 12, active: 8, recovery: 20, damage: 35, range: 50, 
                    stamina: 25, hitstun: 20, blockstun: 12, knockback: 12 
                },
                uppercut: { 
                    startup: 10, active: 6, recovery: 18, damage: 40, range: 30, 
                    stamina: 30, hitstun: 25, blockstun: 15, knockback: 15, launcher: true 
                },
                special_fireball: { 
                    startup: 15, active: 30, recovery: 25, damage: 50, range: 200, 
                    stamina: 20, mana: 30, projectile: true 
                },
                ultimate_combo: { 
                    startup: 5, active: 60, recovery: 30, damage: 100, range: 60, 
                    energy: 100, cinematic: true 
                }
            },
            
            // Colors
            colors: {
                skin: '#ffdbac', hair: '#8b4513', shirt: '#4169e1',
                pants: '#2f2f2f', shoes: '#654321', aura: '#00ffff'
            }
        };
        
        // Game objects
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.hitEffects = [];
        this.platforms = [];
        this.environmentObjects = [];
        this.powerups = [];
        
        // Input system
        this.keys = {
            // Movement
            left: false, right: false, up: false, down: false,
            // Attacks  
            lightPunch: false, heavyPunch: false,
            lightKick: false, heavyKick: false,
            special: false, ultimate: false,
            block: false, dash: false
        };
        
        this.initLevel();
        this.initSoundSystem();
    }
    
    initLevel() {
        // Multi-layered platforms with different properties
        this.platforms = [
            // Ground level
            {x: 0, y: 270, width: 1000, height: 30, type: 'solid'},
            {x: 1200, y: 270, width: 800, height: 30, type: 'solid'},
            {x: 2200, y: 270, width: 1000, height: 30, type: 'solid'},
            {x: 3400, y: 270, width: 600, height: 30, type: 'solid'},
            
            // Floating platforms with special properties
            {x: 200, y: 220, width: 120, height: 15, type: 'breakable', health: 3},
            {x: 400, y: 180, width: 140, height: 15, type: 'moving', moveX: 1, moveRange: 100},
            {x: 600, y: 140, width: 120, height: 15, type: 'bouncy', bounce: 1.5},
            {x: 1000, y: 200, width: 100, height: 15, type: 'crumbling'},
            {x: 1400, y: 160, width: 150, height: 15, type: 'ice', friction: 0.1},
            {x: 1700, y: 180, width: 120, height: 15, type: 'fire', damage: 5},
            {x: 2000, y: 140, width: 180, height: 15, type: 'teleporter', target: {x: 2800, y: 140}},
            {x: 2400, y: 200, width: 160, height: 15, type: 'switch', activated: false},
            {x: 2800, y: 160, width: 140, height: 15, type: 'elevator', moveY: 1, moveRange: 80},
            {x: 3200, y: 180, width: 200, height: 15, type: 'boss_platform'}
        ];
        
        // Environmental objects for interactive gameplay
        this.environmentObjects = [
            // Destructible objects
            {x: 250, y: 240, width: 20, height: 30, type: 'crate', health: 2, loot: 'health'},
            {x: 450, y: 245, width: 25, height: 25, type: 'barrel', health: 1, explosive: true},
            {x: 850, y: 235, width: 30, height: 35, type: 'generator', health: 3, powered: true},
            
            // Interactive mechanisms
            {x: 1200, y: 200, width: 40, height: 70, type: 'lever', activated: false},
            {x: 1600, y: 180, width: 20, height: 90, type: 'laser_gate', active: true},
            {x: 2000, y: 240, width: 60, height: 30, type: 'launch_pad', power: 20},
            
            // Atmospheric elements
            {x: 100, y: 50, width: 40, height: 220, type: 'building', parallax: 0.3},
            {x: 300, y: 30, width: 60, height: 240, type: 'tower', parallax: 0.5},
            {x: 1500, y: 80, width: 25, height: 30, type: 'neon_sign', animated: true},
            {x: 2500, y: 90, width: 30, height: 20, type: 'hologram', animated: true}
        ];
        
        this.spawnEnemies();
        this.spawnPowerups();
    }
    
    spawnEnemies() {
        this.enemies = [
            // Basic fighters with different AI patterns
            {
                x: 300, y: 245, width: 30, height: 25, health: 40, maxHealth: 40,
                type: 'brawler', ai: 'aggressive', facing: -1,
                moveSpeed: 2, attackRange: 40, attackCooldown: 0,
                attacks: ['punch', 'kick'], combo: 0
            },
            {
                x: 800, y: 175, width: 28, height: 25, health: 60, maxHealth: 60,
                type: 'martial_artist', ai: 'technical', facing: -1,
                moveSpeed: 3, attackRange: 50, attackCooldown: 0,
                attacks: ['punch', 'kick', 'uppercut'], combo: 0, canBlock: true
            },
            {
                x: 1300, y: 245, width: 32, height: 28, health: 80, maxHealth: 80,
                type: 'heavy_fighter', ai: 'defensive', facing: -1,
                moveSpeed: 1.5, attackRange: 35, attackCooldown: 0,
                attacks: ['heavy_punch', 'heavy_kick'], armor: 10, canBlock: true
            },
            {
                x: 2000, y: 155, width: 26, height: 25, health: 50, maxHealth: 50,
                type: 'ninja', ai: 'hit_and_run', facing: -1,
                moveSpeed: 4, attackRange: 45, attackCooldown: 0,
                attacks: ['punch', 'kick'], canDash: true, invisibleTimer: 0
            },
            {
                x: 3200, y: 175, width: 50, height: 45, health: 200, maxHealth: 200,
                type: 'boss', ai: 'boss_pattern', facing: -1,
                moveSpeed: 2, attackRange: 60, attackCooldown: 0,
                attacks: ['heavy_punch', 'heavy_kick', 'fireball', 'ground_slam'],
                phase: 1, maxPhase: 3, specialTimer: 0
            }
        ];
    }
    
    spawnPowerups() {
        this.powerups = [
            {x: 250, y: 190, type: 'health_small', value: 25, collected: false},
            {x: 650, y: 110, type: 'mana_crystal', value: 50, collected: false},
            {x: 1150, y: 170, type: 'stamina_boost', value: 50, collected: false},
            {x: 1500, y: 130, type: 'energy_orb', value: 25, collected: false},
            {x: 2000, y: 140, type: 'health_large', value: 75, collected: false},
            {x: 2400, y: 145, type: 'attack_boost', duration: 600, collected: false},
            {x: 2800, y: 110, type: 'speed_boost', duration: 600, collected: false},
            {x: 3000, y: 170, type: 'ultimate_charge', value: 100, collected: false}
        ];
    }
    
    initSoundSystem() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {
            punch: { freq: 400, duration: 80, wave: 'square' },
            kick: { freq: 300, duration: 100, wave: 'sawtooth' },
            heavy: { freq: 200, duration: 150, wave: 'triangle' },
            special: { freq: 600, duration: 200, wave: 'sine' },
            hit: { freq: 800, duration: 60, wave: 'square' },
            block: { freq: 1000, duration: 40, wave: 'triangle' },
            dash: { freq: 1200, duration: 120, wave: 'sine' },
            combo: { freq: 500, duration: 40, wave: 'sine' },
            ultimate: { freq: 150, duration: 300, wave: 'sawtooth' }
        };
    }
    
    playSound(type, volume = 0.3) {
        if (!this.sounds[type]) return;
        
        const { freq, duration, wave } = this.sounds[type];
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = wave;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'a': this.keys.left = true; break;
            case 'd': this.keys.right = true; break;
            case 'w': this.keys.up = true; break;
            case 's': this.keys.down = true; break;
            case 'j': this.keys.lightPunch = true; break;
            case 'k': this.keys.lightKick = true; break;
            case 'l': this.keys.heavyPunch = true; break;
            case 'u': this.keys.heavyKick = true; break;
            case 'i': this.keys.special = true; break;
            case 'o': this.keys.ultimate = true; break;
            case 'p': this.keys.block = true; break;
            case ' ': this.keys.dash = true; break;
        }
        e.preventDefault();
    }
    
    handleKeyUp(e) {
        switch(e.key.toLowerCase()) {
            case 'a': this.keys.left = false; break;
            case 'd': this.keys.right = false; break;
            case 'w': this.keys.up = false; break;
            case 's': this.keys.down = false; break;
            case 'j': this.keys.lightPunch = false; break;
            case 'k': this.keys.lightKick = false; break;
            case 'l': this.keys.heavyPunch = false; break;
            case 'u': this.keys.heavyKick = false; break;
            case 'i': this.keys.special = false; break;
            case 'o': this.keys.ultimate = false; break;
            case 'p': this.keys.block = false; break;
            case ' ': this.keys.dash = false; break;
        }
    }
    
    start() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateEnemies();
        this.updateProjectiles();
        this.updateParticles();
        this.updateEnvironment();
        this.updateCamera();
        this.checkCollisions();
    }
    
    updatePlayer() {
        // Update timers
        if (this.player.invulnerable > 0) this.player.invulnerable--;
        if (this.player.hitstun > 0) this.player.hitstun--;
        if (this.player.dashCooldown > 0) this.player.dashCooldown--;
        if (this.player.comboTimer > 0) this.player.comboTimer--;
        else this.player.combo = 0;
        
        // Resource regeneration
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 0.5);
        this.player.mana = Math.min(this.player.maxMana, this.player.mana + 0.3);
        
        // Handle input only if not in hitstun
        if (this.player.hitstun <= 0) {
            this.handleMovement();
            this.handleCombat();
        }
        
        this.updatePlayerPhysics();
        this.updatePlayerAnimation();
    }
    
    handleMovement() {
        let moving = false;
        
        // Horizontal movement
        if (this.keys.left && !this.player.isAttacking) {
            this.player.velocityX = -this.player.speed;
            this.player.facing = -1;
            moving = true;
        } else if (this.keys.right && !this.player.isAttacking) {
            this.player.velocityX = this.player.speed;
            this.player.facing = 1;
            moving = true;
        } else {
            this.player.velocityX *= 0.8; // Friction
        }
        
        // Jumping
        if (this.keys.up && this.player.onGround && !this.player.isAttacking) {
            this.player.velocityY = -this.player.jumpPower;
            this.player.onGround = false;
            this.player.state = 'jumping';
            this.playSound('dash', 0.2);
        }
        
        // Double jump
        if (this.keys.up && !this.player.onGround && this.player.canDoubleJump && !this.player.isAttacking) {
            this.player.velocityY = -this.player.jumpPower * 0.8;
            this.player.canDoubleJump = false;
            this.createJumpEffect();
        }
        
        // Dash
        if (this.keys.dash && this.player.dashCooldown <= 0 && this.player.stamina >= 20) {
            this.performDash();
        }
        
        // Update state
        if (!this.player.isAttacking) {
            if (!this.player.onGround) {
                this.player.state = 'jumping';
            } else if (moving) {
                this.player.state = 'walking';
            } else {
                this.player.state = 'idle';
            }
        }
    }
    
    handleCombat() {
        // Blocking
        this.player.isBlocking = this.keys.block;
        
        if (this.player.isAttacking) return;
        
        // Attack inputs with combo system
        if (this.keys.lightPunch && this.player.stamina >= 5) {
            this.performAttack('light_punch');
        } else if (this.keys.heavyPunch && this.player.stamina >= 15) {
            this.performAttack('heavy_punch');
        } else if (this.keys.lightKick && this.player.stamina >= 8) {
            this.performAttack('light_kick');
        } else if (this.keys.heavyKick && this.player.stamina >= 25) {
            this.performAttack('heavy_kick');
        } else if (this.keys.special && this.player.mana >= 30) {
            this.performAttack('special_fireball');
        } else if (this.keys.ultimate && this.player.energy >= 100) {
            this.performAttack('ultimate_combo');
        }
    }
    
    performAttack(attackType) {
        const attack = this.player.attacks[attackType];
        if (!attack) return;
        
        // Resource costs
        if (attack.stamina && this.player.stamina < attack.stamina) return;
        if (attack.mana && this.player.mana < attack.mana) return;
        if (attack.energy && this.player.energy < attack.energy) return;
        
        // Consume resources
        if (attack.stamina) this.player.stamina -= attack.stamina;
        if (attack.mana) this.player.mana -= attack.mana;
        if (attack.energy) this.player.energy -= attack.energy;
        
        // Set attack state
        this.player.isAttacking = true;
        this.player.attackType = attackType;
        this.player.attackFrame = 0;
        this.player.state = attackType;
        
        // Combo system
        if (this.player.combo < this.player.maxCombo) {
            this.player.combo++;
            this.player.comboTimer = 120; // 2 seconds at 60fps
            if (this.player.combo > 1) {
                this.playSound('combo');
            }
        }
        
        // Visual and audio effects
        this.createAttackEffect(attackType);
        this.playSound(attackType === 'ultimate_combo' ? 'ultimate' : 
                      attackType.includes('heavy') ? 'heavy' :
                      attackType.includes('kick') ? 'kick' : 'punch');
    }
    
    performDash() {
        this.player.velocityX = this.player.facing * 15;
        this.player.dashCooldown = 60; // 1 second cooldown
        this.player.stamina -= 20;
        this.player.invulnerable = 8; // Brief invulnerability
        
        // Dash particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.player.x + this.player.width/2,
                y: this.player.y + this.player.height/2,
                velocityX: -this.player.facing * (Math.random() * 6 + 4),
                velocityY: (Math.random() - 0.5) * 6,
                life: 20,
                maxLife: 20,
                color: '#00ffff',
                size: 3
            });
        }
        
        this.playSound('dash');
    }
    
    createJumpEffect() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.player.x + this.player.width/2,
                y: this.player.y + this.player.height,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: Math.random() * 3,
                life: 15,
                maxLife: 15,
                color: '#ffffff',
                size: 2
            });
        }
    }
    
    createAttackEffect(attackType) {
        const colors = {
            light_punch: '#ff6600',
            heavy_punch: '#ff3300',
            light_kick: '#0066ff',
            heavy_kick: '#0033ff',
            uppercut: '#ff00ff',
            special_fireball: '#ff9900',
            ultimate_combo: '#ff0099'
        };
        
        const effectX = this.player.x + (this.player.facing > 0 ? this.player.width + 5 : -15);
        const effectY = this.player.y + this.player.height/2;
        
        // Attack trail particles
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: effectX,
                y: effectY + (Math.random() - 0.5) * 30,
                velocityX: this.player.facing * (Math.random() * 8 + 6),
                velocityY: (Math.random() - 0.5) * 8,
                life: 20,
                maxLife: 20,
                color: colors[attackType] || '#ffffff',
                size: Math.random() * 4 + 2
            });
        }
        
        // Special effects for ultimate
        if (attackType === 'ultimate_combo') {
            this.createScreenShake(10);
            // Energy wave effect
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: this.player.x + this.player.width/2,
                    y: this.player.y + this.player.height/2,
                    velocityX: Math.cos(i * 0.2) * 12,
                    velocityY: Math.sin(i * 0.2) * 12,
                    life: 40,
                    maxLife: 40,
                    color: '#ff0099',
                    size: 6
                });
            }
        }
        
        // Create projectile for special fireball
        if (attackType === 'special_fireball') {
            setTimeout(() => {
                this.projectiles.push({
                    x: this.player.x + (this.player.facing > 0 ? this.player.width : -8),
                    y: this.player.y + this.player.height/2,
                    velocityX: this.player.facing * 12,
                    velocityY: 0,
                    width: 10,
                    height: 10,
                    damage: 50,
                    life: 120,
                    type: 'player',
                    color: '#ff9900',
                    trail: true
                });
            }, 200); // Delay to match attack animation
        }
    }
    
    createScreenShake(intensity) {
        // Screen shake implementation
        this.screenShake = {
            intensity: intensity,
            duration: 20,
            timer: 0
        };
    }
    
    updatePlayerPhysics() {
        // Gravity
        if (!this.player.onGround) {
            this.player.velocityY += 0.8;
        }
        
        // Apply velocity
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Platform collision
        this.player.onGround = false;
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY >= 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                    this.player.canDoubleJump = true;
                    
                    // Platform-specific effects
                    if (platform.type === 'bouncy') {
                        this.player.velocityY = -this.player.jumpPower * (platform.bounce || 1.2);
                    } else if (platform.type === 'ice') {
                        this.player.velocityX *= 1.1; // Slippery
                    } else if (platform.type === 'fire') {
                        this.takeDamage(platform.damage || 5);
                    }
                }
            }
        });
        
        // World bounds
        this.player.x = Math.max(0, Math.min(this.player.x, this.levelWidth - this.player.width));
        if (this.player.y > 300) {
            this.takeDamage(25); // Fall damage
            this.player.y = 200;
            this.player.velocityY = 0;
        }
    }
    
    updatePlayerAnimation() {
        // Attack animation
        if (this.player.isAttacking) {
            this.player.attackFrame++;
            const attack = this.player.attacks[this.player.attackType];
            
            // Hit detection during active frames
            if (this.player.attackFrame >= attack.startup && 
                this.player.attackFrame < attack.startup + attack.active) {
                this.checkAttackHit();
            }
            
            // End attack
            if (this.player.attackFrame >= attack.startup + attack.active + attack.recovery) {
                this.player.isAttacking = false;
                this.player.attackFrame = 0;
                this.player.attackType = '';
                this.player.state = this.player.onGround ? 'idle' : 'jumping';
            }
        }
        
        // General animation timer
        this.player.animTimer++;
        if (this.player.animTimer >= this.player.animSpeed) {
            this.player.animTimer = 0;
            this.player.animFrame = (this.player.animFrame + 1) % 4;
        }
    }
    
    checkAttackHit() {
        const attack = this.player.attacks[this.player.attackType];
        const hitbox = {
            x: this.player.x + (this.player.facing > 0 ? this.player.width : -attack.range),
            y: this.player.y - 5,
            width: attack.range,
            height: this.player.height + 10
        };
        
        // Check enemy hits
        this.enemies.forEach(enemy => {
            if (this.checkCollision(hitbox, enemy) && !enemy.hitThisFrame) {
                this.hitEnemy(enemy, this.player.attackType);
                enemy.hitThisFrame = true;
                setTimeout(() => enemy.hitThisFrame = false, 100);
            }
        });
        
        // Check environmental object hits
        this.environmentObjects.forEach(obj => {
            if (obj.health && this.checkCollision(hitbox, obj)) {
                this.hitEnvironmentObject(obj);
            }
        });
    }
    
    hitEnvironmentObject(obj) {
        obj.health--;
        
        // Create destruction effect
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: obj.x + obj.width/2,
                y: obj.y + obj.height/2,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: obj.type === 'barrel' ? '#ff6600' : '#8b4513',
                size: Math.random() * 3 + 2
            });
        }
        
        // Object-specific effects
        if (obj.health <= 0) {
            if (obj.explosive) {
                this.createExplosion(obj.x + obj.width/2, obj.y + obj.height/2);
                // Damage nearby enemies
                this.enemies.forEach(enemy => {
                    const distance = Math.sqrt(
                        Math.pow(enemy.x - obj.x, 2) + Math.pow(enemy.y - obj.y, 2)
                    );
                    if (distance < 80) {
                        this.hitEnemy(enemy, 'explosion');
                    }
                });
            }
            
            if (obj.loot) {
                this.spawnLoot(obj.x + obj.width/2, obj.y + obj.height/2, obj.loot);
            }
            
            // Remove destroyed object
            const index = this.environmentObjects.indexOf(obj);
            if (index > -1) {
                this.environmentObjects.splice(index, 1);
            }
        }
        
        this.playSound('hit');
    }
    
    spawnLoot(x, y, type) {
        this.powerups.push({
            x: x - 8,
            y: y - 8,
            type: type,
            value: type === 'health' ? 25 : 20,
            collected: false
        });
    }
    
    createExplosion(x, y) {
        // Large explosion effect
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 20,
                velocityY: (Math.random() - 0.5) * 20,
                life: 40,
                maxLife: 40,
                color: ['#ff6600', '#ff3300', '#ffff00'][Math.floor(Math.random() * 3)],
                size: Math.random() * 6 + 4
            });
        }
        
        this.createScreenShake(12);
        this.playSound('ultimate', 0.5);
    }
    
    hitEnemy(enemy, attackType) {
        const attack = this.player.attacks[attackType];
        
        // Calculate damage with combo multiplier
        const baseDamage = attack.damage;
        const comboMultiplier = 1 + (this.player.combo - 1) * 0.1;
        const finalDamage = Math.floor(baseDamage * comboMultiplier);
        
        // Apply damage
        enemy.health -= finalDamage;
        
        // Knockback
        enemy.x += this.player.facing * attack.knockback;
        
        // Hitstun
        enemy.hitstun = attack.hitstun;
        
        // Create hit effect
        this.createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2, attackType);
        
        // Build energy
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 5);
        
        // Score
        this.score += finalDamage * this.player.combo;
        
        this.playSound('hit');
    }
    
    createHitEffect(x, y, attackType) {
        const colors = {
            light_punch: '#ff6600', heavy_punch: '#ff3300',
            light_kick: '#0066ff', heavy_kick: '#0033ff',
            uppercut: '#ff00ff', special_fireball: '#ff9900',
            ultimate_combo: '#ff0099'
        };
        
        // Impact particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x, y: y,
                velocityX: (Math.random() - 0.5) * 15,
                velocityY: (Math.random() - 0.5) * 15,
                life: 25,
                maxLife: 25,
                color: colors[attackType] || '#ffffff',
                size: Math.random() * 5 + 3
            });
        }
        
        // Screen shake for heavy attacks
        if (attackType.includes('heavy') || attackType === 'ultimate_combo') {
            this.createScreenShake(attackType === 'ultimate_combo' ? 15 : 8);
        }
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                this.score += enemy.maxHealth * 2;
                
                // Special rewards for boss
                if (enemy.type === 'boss') {
                    this.score += 1000;
                    // Spawn multiple powerups
                    for (let i = 0; i < 3; i++) {
                        this.spawnLoot(
                            enemy.x + enemy.width/2 + (i - 1) * 20, 
                            enemy.y + enemy.height/2, 
                            ['health', 'energy_orb', 'ultimate_charge'][i]
                        );
                    }
                }
                
                this.enemies.splice(index, 1);
                return;
            }
            
            // Update hitstun
            if (enemy.hitstun > 0) {
                enemy.hitstun--;
                return;
            }
            
            // Update special boss states
            if (enemy.type === 'boss') {
                this.updateBossSpecialStates(enemy);
            }
            
            // AI behavior
            this.updateEnemyAI(enemy);
        });
    }
    
    updateBossSpecialStates(boss) {
        // Handle charging state
        if (boss.charging && boss.chargeTimer > 0) {
            boss.chargeTimer--;
            boss.x += boss.velocityX || 0;
            
            // Charge trail effects
            if (boss.chargeTimer % 3 === 0) {
                this.particles.push({
                    x: boss.x + boss.width/2,
                    y: boss.y + boss.height/2,
                    velocityX: -(boss.velocityX || 0) * 0.5,
                    velocityY: (Math.random() - 0.5) * 6,
                    life: 15,
                    maxLife: 15,
                    color: '#ff0000',
                    size: 4
                });
            }
            
            if (boss.chargeTimer <= 0) {
                boss.charging = false;
                boss.velocityX = 0;
            }
        }
        
        // Phase transition effects
        if (boss.health < boss.maxHealth * 0.66 && boss.phase === 1) {
            boss.phase = 2;
            this.createPhaseTransition(boss, 2);
        } else if (boss.health < boss.maxHealth * 0.33 && boss.phase === 2) {
            boss.phase = 3;
            this.createPhaseTransition(boss, 3);
        }
    }
    
    createPhaseTransition(boss, newPhase) {
        this.createScreenShake(20);
        
        // Phase transition explosion
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: boss.x + boss.width/2,
                y: boss.y + boss.height/2,
                velocityX: (Math.random() - 0.5) * 30,
                velocityY: (Math.random() - 0.5) * 30,
                life: 60,
                maxLife: 60,
                color: newPhase === 3 ? '#9900ff' : '#ffff00',
                size: Math.random() * 8 + 6
            });
        }
        
        // Temporary invulnerability
        boss.invulnerable = 60;
        
        // Heal boss slightly on phase transition
        boss.health = Math.min(boss.maxHealth, boss.health + 20);
        
        this.playSound('ultimate', 1.0);
    }
    
    updateEnemyAI(enemy) {
        const distanceToPlayer = this.player.x - enemy.x;
        const absDistance = Math.abs(distanceToPlayer);
        
        switch (enemy.ai) {
            case 'aggressive':
                // Always move toward player and attack when in range
                if (absDistance > enemy.attackRange) {
                    enemy.x += Math.sign(distanceToPlayer) * enemy.moveSpeed;
                    enemy.facing = Math.sign(distanceToPlayer);
                } else if (enemy.attackCooldown <= 0) {
                    this.enemyAttack(enemy);
                }
                break;
                
            case 'technical':
                // Smart fighter - blocks, counters, combos
                if (this.player.isAttacking && enemy.canBlock && Math.random() < 0.3) {
                    enemy.blocking = true;
                } else {
                    enemy.blocking = false;
                    if (absDistance > enemy.attackRange * 1.2) {
                        enemy.x += Math.sign(distanceToPlayer) * enemy.moveSpeed;
                        enemy.facing = Math.sign(distanceToPlayer);
                    } else if (enemy.attackCooldown <= 0) {
                        this.enemyAttack(enemy);
                    }
                }
                break;
                
            case 'hit_and_run':
                // Fast attacks then retreat
                if (enemy.invisibleTimer > 0) {
                    enemy.invisibleTimer--;
                    enemy.alpha = 0.3;
                } else {
                    enemy.alpha = 1;
                    if (absDistance > enemy.attackRange) {
                        enemy.x += Math.sign(distanceToPlayer) * enemy.moveSpeed;
                        enemy.facing = Math.sign(distanceToPlayer);
                    } else if (enemy.attackCooldown <= 0) {
                        this.enemyAttack(enemy);
                        // Retreat after attack
                        enemy.x -= Math.sign(distanceToPlayer) * enemy.moveSpeed * 3;
                        if (enemy.canDash) {
                            enemy.invisibleTimer = 60;
                        }
                    }
                }
                break;
                
            case 'boss_pattern':
                // Complex boss AI with phases
                this.updateBossAI(enemy);
                break;
        }
        
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
    }
    
    updateBossAI(boss) {
        boss.specialTimer++;
        
        // Phase transitions
        if (boss.health < boss.maxHealth * 0.66 && boss.phase === 1) {
            boss.phase = 2;
            this.createScreenShake(15);
        } else if (boss.health < boss.maxHealth * 0.33 && boss.phase === 2) {
            boss.phase = 3;
            this.createScreenShake(20);
        }
        
        const distanceToPlayer = Math.abs(this.player.x - boss.x);
        
        // Special attacks based on timer and phase
        if (boss.specialTimer > 180) { // Every 3 seconds
            boss.specialTimer = 0;
            
            if (boss.phase >= 2 && Math.random() < 0.5) {
                this.bossSpecialAttack(boss, 'ground_slam');
            } else if (boss.phase >= 3 && Math.random() < 0.3) {
                this.bossSpecialAttack(boss, 'fireball_barrage');
            }
        }
        
        // Normal movement and attacks
        if (distanceToPlayer > boss.attackRange) {
            boss.x += Math.sign(this.player.x - boss.x) * boss.moveSpeed;
            boss.facing = Math.sign(this.player.x - boss.x);
        } else if (boss.attackCooldown <= 0) {
            this.enemyAttack(boss);
        }
    }
    
    bossSpecialAttack(boss, attackType) {
        boss.specialTimer = 0;
        boss.attackCooldown = 120; // 2 second cooldown after special
        
        switch (attackType) {
            case 'ground_slam':
                this.bossGroundSlam(boss);
                break;
            case 'fireball_barrage':
                this.bossFireballBarrage(boss);
                break;
            case 'charge_attack':
                this.bossChargeAttack(boss);
                break;
            case 'energy_wave':
                this.bossEnergyWave(boss);
                break;
        }
        
        this.playSound('ultimate', 0.7);
        this.createScreenShake(12);
    }
    
    bossGroundSlam(boss) {
        // Create shockwave effect
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: boss.x + boss.width/2,
                y: boss.y + boss.height,
                velocityX: (Math.random() - 0.5) * 25,
                velocityY: -Math.random() * 15,
                life: 45,
                maxLife: 45,
                color: '#8B4513',
                size: Math.random() * 8 + 4
            });
        }
        
        // Damage player if on ground and within range
        const distance = Math.abs(this.player.x - boss.x);
        if (distance < 150 && this.player.onGround) {
            this.takeDamage(25);
            this.player.velocityY = -10; // Knockup
        }
        
        // Create temporary platforms destruction
        this.platforms.forEach(platform => {
            if (platform.type === 'breakable' && 
                Math.abs(platform.x - boss.x) < 200) {
                platform.health = Math.max(0, platform.health - 1);
            }
        });
    }
    
    bossFireballBarrage(boss) {
        // Launch multiple fireballs
        const fireballCount = 5 + boss.phase;
        
        for (let i = 0; i < fireballCount; i++) {
            setTimeout(() => {
                const angle = (Math.PI / 6) * (i - fireballCount/2); // Spread pattern
                const speed = 8;
                
                this.projectiles.push({
                    x: boss.x + boss.width/2,
                    y: boss.y + boss.height/2,
                    velocityX: Math.cos(angle) * speed * boss.facing,
                    velocityY: Math.sin(angle) * speed,
                    width: 12,
                    height: 12,
                    damage: 20 + boss.phase * 5,
                    life: 180,
                    type: 'enemy',
                    color: '#ff6600',
                    trail: true
                });
            }, i * 100); // Staggered launch
        }
    }
    
    bossChargeAttack(boss) {
        // Fast charge toward player
        const chargeSpeed = 15;
        const direction = Math.sign(this.player.x - boss.x);
        
        boss.velocityX = direction * chargeSpeed;
        boss.charging = true;
        boss.chargeTimer = 30; // Duration of charge
        
        // Charge trail effect
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: boss.x + boss.width/2,
                y: boss.y + boss.height/2,
                velocityX: -direction * (Math.random() * 8 + 4),
                velocityY: (Math.random() - 0.5) * 8,
                life: 25,
                maxLife: 25,
                color: '#ff0000',
                size: Math.random() * 6 + 3
            });
        }
        
        // Check for collision with player during charge
        setTimeout(() => {
            if (this.checkCollision(boss, this.player)) {
                this.takeDamage(30 + boss.phase * 10);
                this.player.velocityX = direction * 12; // Heavy knockback
            }
            boss.charging = false;
            boss.velocityX = 0;
        }, 500);
    }
    
    bossEnergyWave(boss) {
        // Create expanding energy wave
        const waveCount = 3;
        
        for (let wave = 0; wave < waveCount; wave++) {
            setTimeout(() => {
                // Create wave particles
                for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                    this.particles.push({
                        x: boss.x + boss.width/2,
                        y: boss.y + boss.height/2,
                        velocityX: Math.cos(angle) * (8 + wave * 2),
                        velocityY: Math.sin(angle) * (8 + wave * 2),
                        life: 60,
                        maxLife: 60,
                        color: boss.phase >= 3 ? '#9900ff' : '#ffff00',
                        size: 4 + wave,
                        isWave: true
                    });
                }
                
                // Check damage to player
                setTimeout(() => {
                    const distance = Math.sqrt(
                        Math.pow(this.player.x - boss.x, 2) + 
                        Math.pow(this.player.y - boss.y, 2)
                    );
                    const waveRadius = 50 + wave * 30;
                    
                    if (distance < waveRadius && distance > waveRadius - 20) {
                        if (!this.player.isBlocking) {
                            this.takeDamage(15 + wave * 5);
                        }
                    }
                }, 200);
                
            }, wave * 300);
        }
    }
    
    enemyAttack(enemy) {
        const attacks = enemy.attacks || ['punch'];
        const attackType = attacks[Math.floor(Math.random() * attacks.length)];
        
        enemy.attacking = true;
        enemy.attackType = attackType;
        enemy.attackFrame = 0;
        enemy.attackCooldown = 60 + Math.random() * 60; // 1-2 seconds
        
        // Check if attack hits player
        setTimeout(() => {
            const hitbox = {
                x: enemy.x + (enemy.facing > 0 ? enemy.width : -enemy.attackRange),
                y: enemy.y,
                width: enemy.attackRange,
                height: enemy.height
            };
            
            if (this.checkCollision(hitbox, this.player)) {
                if (this.player.isBlocking && this.player.facing !== enemy.facing) {
                    // Blocked attack
                    this.playSound('block');
                    this.player.canCounter = true;
                    setTimeout(() => this.player.canCounter = false, 300);
                } else {
                    // Hit player
                    this.takeDamage(15 + enemy.phase * 5);
                }
            }
            
            enemy.attacking = false;
        }, 200); // Attack delay
    }
    
    takeDamage(damage) {
        if (this.player.invulnerable > 0) return;
        
        this.player.health -= damage;
        this.player.hitstun = 15;
        this.player.invulnerable = 60; // 1 second invulnerability
        
        // Knockback
        this.player.velocityX += (Math.random() - 0.5) * 10;
        
        // Hit effect
        this.createHitEffect(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 'hit');
        
        this.playSound('hit');
        
        // Game over check
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    updateProjectiles() {
        this.projectiles.forEach((projectile, index) => {
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;
            projectile.life--;
            
            // Remove expired projectiles
            if (projectile.life <= 0 || 
                projectile.x < this.cameraX - 100 || 
                projectile.x > this.cameraX + 1000) {
                this.projectiles.splice(index, 1);
                return;
            }
            
            // Check collisions
            if (projectile.type === 'player') {
                // Player projectiles hit enemies
                this.enemies.forEach(enemy => {
                    if (this.checkCollision(projectile, enemy)) {
                        this.hitEnemy(enemy, 'special_fireball');
                        this.projectiles.splice(index, 1);
                    }
                });
            } else if (projectile.type === 'enemy') {
                // Enemy projectiles hit player
                if (this.checkCollision(projectile, this.player)) {
                    if (this.player.isBlocking && this.player.facing !== Math.sign(projectile.velocityX)) {
                        // Blocked projectile
                        this.playSound('block');
                        this.player.canCounter = true;
                        setTimeout(() => this.player.canCounter = false, 300);
                        
                        // Reflect projectile
                        projectile.velocityX *= -0.5;
                        projectile.type = 'player';
                        projectile.color = '#00ffff';
                    } else {
                        // Hit player
                        this.takeDamage(projectile.damage || 15);
                        this.projectiles.splice(index, 1);
                    }
                }
                
                // Enemy projectiles can hit environment
                this.environmentObjects.forEach(obj => {
                    if (obj.health && this.checkCollision(projectile, obj)) {
                        this.hitEnvironmentObject(obj);
                        this.projectiles.splice(index, 1);
                    }
                });
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            
            // Gravity for some particles
            if (particle.color === '#ffffff') {
                particle.velocityY += 0.2;
            }
            
            // Fade out
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateEnvironment() {
        // Update moving platforms
        this.platforms.forEach(platform => {
            if (platform.type === 'moving') {
                if (!platform.startX) platform.startX = platform.x;
                platform.x += platform.moveX || 0;
                if (Math.abs(platform.x - platform.startX) > platform.moveRange) {
                    platform.moveX *= -1;
                }
            }
        });
        
        // Update environmental objects
        this.environmentObjects.forEach(obj => {
            if (obj.animated) {
                obj.animFrame = (obj.animFrame || 0) + 1;
            }
        });
    }
    
    updateCamera() {
        // Smooth camera following
        const targetX = this.player.x - 300;
        this.cameraX += (targetX - this.cameraX) * 0.1;
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - 900));
        
        // Screen shake
        if (this.screenShake && this.screenShake.timer < this.screenShake.duration) {
            this.screenShake.timer++;
            const shake = this.screenShake.intensity * (1 - this.screenShake.timer / this.screenShake.duration);
            this.cameraX += (Math.random() - 0.5) * shake;
        }
    }
    
    checkCollisions() {
        // Player with powerups
        this.powerups.forEach((powerup, index) => {
            if (!powerup.collected && this.checkCollision(this.player, powerup)) {
                this.collectPowerup(powerup);
                this.powerups.splice(index, 1);
            }
        });
    }
    
    collectPowerup(powerup) {
        switch (powerup.type) {
            case 'health_small':
            case 'health_large':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + powerup.value);
                break;
            case 'mana_crystal':
                this.player.mana = Math.min(this.player.maxMana, this.player.mana + powerup.value);
                break;
            case 'stamina_boost':
                this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + powerup.value);
                break;
            case 'energy_orb':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + powerup.value);
                break;
            case 'ultimate_charge':
                this.player.energy = this.player.maxEnergy;
                break;
        }
        
        this.playSound('combo', 0.5);
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render() {
        // Clear with atmospheric background
        const gradient = this.ctx.createLinearGradient(0, 0, 900, 300);
        gradient.addColorStop(0, '#0a0815');
        gradient.addColorStop(0.5, '#1a1530');
        gradient.addColorStop(1, '#0f0a20');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 300);
        
        // Save context for camera
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Render game world
        this.renderBackground();
        this.renderPlatforms();
        this.renderEnvironmentObjects();
        this.renderPowerups();
        this.renderEnemies();
        this.renderPlayer();
        this.renderProjectiles();
        this.renderParticles();
        
        this.ctx.restore();
        
        // Render UI (not affected by camera)
        this.renderUI();
    }
    
    renderBackground() {
        // Parallax background elements
        this.environmentObjects.forEach(obj => {
            if (obj.type === 'building' || obj.type === 'tower') {
                const parallaxX = obj.x - this.cameraX * (obj.parallax || 0.5);
                this.ctx.fillStyle = obj.color || '#2a3f5f';
                this.ctx.globalAlpha = 0.6;
                this.ctx.fillRect(parallaxX, obj.y, obj.width, obj.height);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderPlatforms() {
        this.platforms.forEach(platform => {
            // Platform color based on type
            const colors = {
                solid: '#666666',
                breakable: '#cc6666',
                moving: '#6666cc',
                bouncy: '#66cc66',
                ice: '#66cccc',
                fire: '#cc6600',
                teleporter: '#cc66cc'
            };
            
            this.ctx.fillStyle = colors[platform.type] || '#666666';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Platform effects
            if (platform.type === 'fire') {
                this.ctx.fillStyle = '#ff6600';
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderEnvironmentObjects() {
        this.environmentObjects.forEach(obj => {
            if (obj.type === 'building' || obj.type === 'tower') return; // Rendered in background
            
            const colors = {
                crate: '#8b4513',
                barrel: '#cd853f',
                generator: '#4169e1',
                neon_sign: obj.color || '#ff0066'
            };
            
            this.ctx.fillStyle = colors[obj.type] || '#999999';
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Animated effects
            if (obj.animated && obj.type === 'neon_sign') {
                const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                this.ctx.fillStyle = obj.color || '#ff0066';
                this.ctx.globalAlpha = pulse;
                this.ctx.fillRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderPowerups() {
        this.powerups.forEach(powerup => {
            if (powerup.collected) return;
            
            const colors = {
                health_small: '#ff0066',
                health_large: '#ff0033',
                mana_crystal: '#0066ff',
                stamina_boost: '#66ff00',
                energy_orb: '#ffff00',
                ultimate_charge: '#ff00ff'
            };
            
            const y = powerup.y + Math.sin(Date.now() * 0.005 + powerup.x * 0.01) * 3;
            
            this.ctx.fillStyle = colors[powerup.type] || '#ffffff';
            this.ctx.fillRect(powerup.x, y, 16, 16);
            
            // Glow effect
            this.ctx.fillStyle = colors[powerup.type] || '#ffffff';
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(powerup.x - 2, y - 2, 20, 20);
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            // Ultra-high detail enemy rendering (4x pixel density)
            this.renderUltraDetailedEnemy(enemy);
            
            // Health bar for bosses and damaged enemies
            if (enemy.type === 'boss' || enemy.health < enemy.maxHealth) {
                this.renderEnemyHealthBar(enemy);
            }
        });
    }
    
    renderUltraDetailedEnemy(enemy) {
        const healthRatio = enemy.health / enemy.maxHealth;
        
        // Flashing when hit
        const isFlashing = enemy.hitstun > 0 && enemy.hitstun % 4 < 2;
        
        // Transparency for ninja
        if (enemy.alpha) {
            this.ctx.globalAlpha = enemy.alpha;
        }
        
        // Render based on enemy type with ultra detail
        switch (enemy.type) {
            case 'brawler':
                this.renderBrawler(enemy, isFlashing, healthRatio);
                break;
            case 'martial_artist':
                this.renderMartialArtist(enemy, isFlashing, healthRatio);
                break;
            case 'heavy_fighter':
                this.renderHeavyFighter(enemy, isFlashing, healthRatio);
                break;
            case 'ninja':
                this.renderNinja(enemy, isFlashing, healthRatio);
                break;
            case 'boss':
                this.renderBoss(enemy, isFlashing, healthRatio);
                break;
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    renderBrawler(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // Base color with health indication
        const baseColor = isFlashing ? '#ffffff' : 
            `rgb(${255 * healthRatio}, ${100 + 100 * healthRatio}, ${100 + 100 * healthRatio})`;
        
        // Muscular torso
        this.ctx.fillStyle = '#8B4513'; // Brown shirt
        this.ctx.fillRect(x + 4, y + 8, w - 8, h - 16);
        
        // Detailed head
        this.ctx.fillStyle = '#FFDBAC'; // Skin
        this.ctx.fillRect(x + 6, y, w - 12, 10);
        
        // Hair
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x + 7, y, w - 14, 4);
        
        // Detailed eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 8, y + 3, 2, 2);
        this.ctx.fillRect(x + w - 10, y + 3, 2, 2);
        
        // Scars and details
        this.ctx.fillStyle = '#AA6644';
        this.ctx.fillRect(x + 7, y + 6, 3, 1); // Scar
        
        // Arms with muscles
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 2, y + 10, 4, 8); // Left arm
        this.ctx.fillRect(x + w - 6, y + 10, 4, 8); // Right arm
        
        // Muscle definition
        this.ctx.fillStyle = '#DDB584';
        this.ctx.fillRect(x + 3, y + 11, 2, 3);
        this.ctx.fillRect(x + w - 5, y + 11, 2, 3);
        
        // Legs
        this.ctx.fillStyle = '#2F2F2F'; // Dark pants
        this.ctx.fillRect(x + 6, y + h - 8, w - 12, 8);
        
        // Combat stance
        if (enemy.attacking) {
            this.renderEnemyAttackEffect(x, y, w, h, '#ff6666');
        }
    }
    
    renderMartialArtist(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // Gi (martial arts uniform)
        this.ctx.fillStyle = isFlashing ? '#ffffff' : '#ffffff';
        this.ctx.fillRect(x + 3, y + 6, w - 6, h - 12);
        
        // Belt
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 3, y + h - 10, w - 6, 2);
        
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 5, y, w - 10, 8);
        
        // Hair
        this.ctx.fillStyle = '#2F2F2F';
        this.ctx.fillRect(x + 6, y, w - 12, 3);
        
        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 7, y + 2, 1, 1);
        this.ctx.fillRect(x + w - 8, y + 2, 1, 1);
        
        // Arms in fighting stance
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 1, y + 8, 3, 6); // Left arm
        this.ctx.fillRect(x + w - 4, y + 8, 3, 6); // Right arm
        
        // Hands
        this.ctx.fillStyle = '#DDB584';
        this.ctx.fillRect(x + 1, y + 14, 3, 3);
        this.ctx.fillRect(x + w - 4, y + 14, 3, 3);
        
        // Legs
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 5, y + h - 6, w - 10, 6);
        
        // Martial arts aura
        if (enemy.canBlock) {
            this.ctx.fillStyle = '#66ff66';
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderHeavyFighter(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // Large muscular frame
        this.ctx.fillStyle = isFlashing ? '#ffffff' : '#4169E1';
        this.ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
        
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 4, y, w - 8, 6);
        
        // Bald head
        this.ctx.fillStyle = '#DDB584';
        this.ctx.fillRect(x + 5, y, w - 10, 3);
        
        // Eyes
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 6, y + 2, 2, 1);
        this.ctx.fillRect(x + w - 8, y + 2, 2, 1);
        
        // Massive arms
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x, y + 6, 5, 10); // Left arm
        this.ctx.fillRect(x + w - 5, y + 6, 5, 10); // Right arm
        
        // Armor details
        this.ctx.fillStyle = '#708090';
        this.ctx.fillRect(x + 3, y + 5, w - 6, 2); // Chest armor
        this.ctx.fillRect(x + 4, y + 8, w - 8, 1); // Armor line
        
        // Legs
        this.ctx.fillStyle = '#2F2F2F';
        this.ctx.fillRect(x + 4, y + h - 6, w - 8, 6);
        
        // Armor glow
        if (enemy.armor > 0) {
            this.ctx.fillStyle = '#0099ff';
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderNinja(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // Black ninja outfit
        this.ctx.fillStyle = isFlashing ? '#ffffff' : '#1a1a1a';
        this.ctx.fillRect(x + 3, y + 2, w - 6, h - 4);
        
        // Ninja mask
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 4, y, w - 8, 6);
        
        // Eyes
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 6, y + 2, 1, 1);
        this.ctx.fillRect(x + w - 7, y + 2, 1, 1);
        
        // Arms
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x + 1, y + 6, 3, 8);
        this.ctx.fillRect(x + w - 4, y + 6, 3, 8);
        
        // Legs
        this.ctx.fillRect(x + 4, y + h - 6, w - 8, 6);
        
        // Ninja weapons
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.fillRect(x + 2, y + 8, 1, 4); // Sword handle
        this.ctx.fillRect(x + w - 3, y + 8, 1, 4);
        
        // Stealth effect
        if (enemy.invisibleTimer > 0) {
            this.ctx.fillStyle = '#9400d3';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
        }
    }
    
    renderBoss(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // Imposing boss frame
        this.ctx.fillStyle = isFlashing ? '#ffffff' : '#8B0000';
        this.ctx.fillRect(x + 5, y + 8, w - 10, h - 16);
        
        // Large head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 8, y, w - 16, 12);
        
        // Boss hair/helmet
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 9, y, w - 18, 5);
        
        // Menacing eyes
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 12, y + 4, 3, 2);
        this.ctx.fillRect(x + w - 15, y + 4, 3, 2);
        
        // Boss armor
        this.ctx.fillStyle = '#708090';
        this.ctx.fillRect(x + 4, y + 10, w - 8, h - 20);
        
        // Armor details
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x + 6, y + 12, w - 12, 2);
        this.ctx.fillRect(x + 8, y + 16, w - 16, 2);
        
        // Massive arms
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(x, y + 12, 8, 12);
        this.ctx.fillRect(x + w - 8, y + 12, 8, 12);
        
        // Legs
        this.ctx.fillStyle = '#2F2F2F';
        this.ctx.fillRect(x + 10, y + h - 8, w - 20, 8);
        
        // Boss aura based on phase
        const auraColors = ['#ff0000', '#ff6600', '#ffff00'];
        const auraColor = auraColors[Math.min(enemy.phase - 1, 2)];
        this.ctx.fillStyle = auraColor;
        this.ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
        this.ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
        this.ctx.globalAlpha = 1;
        
        // Special attack charging
        if (enemy.specialTimer > 120) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        }
    }
    
    renderEnemyAttackEffect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.6;
        this.ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
        this.ctx.globalAlpha = 1;
    }
    
    renderEnemyHealthBar(enemy) {
        const barWidth = enemy.width + 10;
        const barHeight = 4;
        const barX = enemy.x - 5;
        const barY = enemy.y - 10;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthRatio = enemy.health / enemy.maxHealth;
        const healthColor = healthRatio > 0.6 ? '#00ff00' : 
                           healthRatio > 0.3 ? '#ffff00' : '#ff0000';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * healthRatio, barHeight - 2);
        
        // Border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    renderPlayer() {
        const p = this.player;
        
        // Ultra-high detail player rendering (4x pixel density)
        let playerColor = p.colors.shirt;
        
        // Flashing when invulnerable
        if (p.invulnerable > 0 && p.invulnerable % 6 < 3) {
            playerColor = '#ffffff';
        }
        
        // Aura when energy is full
        if (p.energy >= p.maxEnergy) {
            this.ctx.fillStyle = p.colors.aura;
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16);
            this.ctx.globalAlpha = 1;
        }
        
        // Ultra-detailed character rendering with 4x pixel density
        this.renderUltraDetailedPlayer(p, playerColor);
        
        // Attack effects
        if (p.isAttacking) {
            this.renderAttackAnimation();
        }
        
        // Blocking effect with high detail
        if (p.isBlocking) {
            this.renderBlockingEffect();
        }
    }
    
    renderUltraDetailedPlayer(p, baseColor) {
        // 🎌 日系动漫风格超高清渲染
        this.renderAnimePlayerHead(p);
        this.renderAnimePlayerTorso(p, baseColor);
        this.renderAnimePlayerArms(p);
        this.renderAnimePlayerLegs(p);
        this.renderAnimePlayerEffects(p);
    }
    
    renderAnimePlayerHead(p) {
        const headX = p.x + 6;
        const headY = p.y + 1;
        const headW = 20;
        const headH = 16;
        
        // 动漫风格脸部基础形状 - 更大的头部比例
        const faceGradient = this.ctx.createRadialGradient(
            headX + headW/2, headY + headH/2, 0,
            headX + headW/2, headY + headH/2, headW/2
        );
        faceGradient.addColorStop(0, '#ffe4c4');
        faceGradient.addColorStop(0.7, '#ffd7b3');
        faceGradient.addColorStop(1, '#e6b899');
        
        this.ctx.fillStyle = faceGradient;
        // 椭圆形脸型
        this.ctx.beginPath();
        this.ctx.ellipse(headX + headW/2, headY + headH/2, headW/2, headH/2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 动漫风格大眼睛
        this.renderAnimeEyes(headX, headY, headW, headH, p.facing);
        
        // 动漫风格头发 - 锋利的发丝
        this.renderAnimeHair(headX, headY, headW, headH);
        
        // 表情细节
        this.renderFacialDetails(headX, headY, headW, headH, p.facing);
    }
    
    renderAnimeEyes(headX, headY, headW, headH, facing) {
        const eyeY = headY + headH * 0.35;
        const eyeW = 4;
        const eyeH = 5;
        
        if (facing > 0) {
            // 左眼 (更大更闪亮)
            const leftEyeX = headX + headW * 0.25;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(leftEyeX, eyeY, eyeW, eyeH);
            
            // 虹膜 - 蓝绿色
            this.ctx.fillStyle = '#00b8d4';
            this.ctx.fillRect(leftEyeX + 1, eyeY + 1, 2, 3);
            
            // 瞳孔
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(leftEyeX + 1.5, eyeY + 1.5, 1, 2);
            
            // 高光点
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(leftEyeX + 1, eyeY + 1, 1, 1);
            
            // 右眼 (侧面视角)
            const rightEyeX = headX + headW * 0.65;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(rightEyeX, eyeY, eyeW - 1, eyeH);
            this.ctx.fillStyle = '#00b8d4';
            this.ctx.fillRect(rightEyeX + 1, eyeY + 1, 1, 3);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(rightEyeX + 1, eyeY + 2, 1, 1);
        } else {
            // 面向左时的眼睛渲染 (镜像)
            const rightEyeX = headX + headW * 0.65;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(rightEyeX, eyeY, eyeW, eyeH);
            this.ctx.fillStyle = '#00b8d4';
            this.ctx.fillRect(rightEyeX + 1, eyeY + 1, 2, 3);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(rightEyeX + 1.5, eyeY + 1.5, 1, 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(rightEyeX + 2, eyeY + 1, 1, 1);
            
            const leftEyeX = headX + headW * 0.25;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(leftEyeX, eyeY, eyeW - 1, eyeH);
            this.ctx.fillStyle = '#00b8d4';
            this.ctx.fillRect(leftEyeX + 1, eyeY + 1, 1, 3);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(leftEyeX + 1, eyeY + 2, 1, 1);
        }
        
        // 睫毛
        this.ctx.fillStyle = '#2c1810';
        this.ctx.fillRect(headX + headW * 0.25, eyeY - 1, eyeW, 1);
        this.ctx.fillRect(headX + headW * 0.65, eyeY - 1, eyeW - 1, 1);
    }
    
    renderAnimeHair(headX, headY, headW, headH) {
        // 动漫风格尖锐头发
        const hairGradient = this.ctx.createLinearGradient(headX, headY, headX, headY + headH);
        hairGradient.addColorStop(0, '#4a5568');
        hairGradient.addColorStop(0.5, '#2d3748');
        hairGradient.addColorStop(1, '#1a202c');
        
        this.ctx.fillStyle = hairGradient;
        
        // 主要头发形状
        this.ctx.fillRect(headX + 2, headY - 2, headW - 4, 8);
        
        // 尖锐的发丝效果
        const spikes = [
            {x: headX + 3, y: headY - 4, w: 2, h: 4},
            {x: headX + 7, y: headY - 5, w: 3, h: 5},
            {x: headX + 12, y: headY - 4, w: 2, h: 4},
            {x: headX + 16, y: headY - 3, w: 2, h: 3}
        ];
        
        spikes.forEach(spike => {
            this.ctx.fillRect(spike.x, spike.y, spike.w, spike.h);
        });
        
        // 侧边头发
        this.ctx.fillRect(headX, headY + 2, 3, headH - 4);
        this.ctx.fillRect(headX + headW - 3, headY + 2, 3, headH - 4);
    }
    
    renderFacialDetails(headX, headY, headW, headH, facing) {
        // 鼻子 (简约线条)
        this.ctx.fillStyle = '#d4a574';
        this.ctx.fillRect(headX + headW/2, headY + headH * 0.55, 1, 2);
        
        // 嘴巴 (根据动作状态变化)
        this.ctx.fillStyle = '#ff6b7a';
        if (this.player.isAttacking) {
            // 攻击时的坚毅表情
            this.ctx.fillRect(headX + headW * 0.4, headY + headH * 0.7, 4, 1);
        } else {
            // 平常的微笑
            this.ctx.fillRect(headX + headW * 0.4, headY + headH * 0.72, 3, 1);
            this.ctx.fillRect(headX + headW * 0.38, headY + headH * 0.73, 1, 1);
            this.ctx.fillRect(headX + headW * 0.44, headY + headH * 0.73, 1, 1);
        }
        
        // 脸部轮廓阴影
        this.ctx.fillStyle = '#e6b899';
        this.ctx.fillRect(headX + 1, headY + headH * 0.8, 2, 2);
        this.ctx.fillRect(headX + headW - 3, headY + headH * 0.8, 2, 2);
    }
    
    
    renderAnimePlayerTorso(p, baseColor) {
        const torsoX = p.x + 4;
        const torsoY = p.y + 16;
        const torsoW = 24;
        const torsoH = 20;
        
        // 动漫风格战斗服装 - 未来科技感
        const jacketGradient = this.ctx.createLinearGradient(torsoX, torsoY, torsoX + torsoW, torsoY + torsoH);
        jacketGradient.addColorStop(0, '#1e3a8a');  // 深蓝色
        jacketGradient.addColorStop(0.3, '#3b82f6'); // 蓝色
        jacketGradient.addColorStop(0.7, '#1e40af'); // 中蓝色
        jacketGradient.addColorStop(1, '#1e3a8a');   // 深蓝色
        
        this.ctx.fillStyle = jacketGradient;
        this.ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
        
        // 科技纹路装饰
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(torsoX + 2, torsoY + 3, torsoW - 4, 1); // 上装饰线
        this.ctx.fillRect(torsoX + 4, torsoY + 8, torsoW - 8, 1); // 中装饰线
        this.ctx.fillRect(torsoX + 2, torsoY + 15, torsoW - 4, 1); // 下装饰线
        
        // 胸前徽章/Logo
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(torsoX + torsoW/2 - 2, torsoY + 5, 4, 4);
        this.ctx.fillStyle = '#ff6b7a';
        this.ctx.fillRect(torsoX + torsoW/2 - 1, torsoY + 6, 2, 2);
        
        // 侧面高光
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(torsoX + 1, torsoY + 1, 1, torsoH - 2);
        this.ctx.fillRect(torsoX + torsoW - 2, torsoY + 1, 1, torsoH - 2);
        
        // 战斗护具细节
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(torsoX + 3, torsoY + 12, 3, 4); // 左护具
        this.ctx.fillRect(torsoX + torsoW - 6, torsoY + 12, 3, 4); // 右护具
    }
    
    renderAnimePlayerArms(p) {
        const armW = 6;
        const armH = 16;
        const shoulderY = p.y + 18;
        
        // 动画状态相关的手臂位置
        let leftArmX, rightArmX, leftArmY, rightArmY;
        let leftArmAngle = 0, rightArmAngle = 0;
        
        if (p.isAttacking) {
            // 攻击动作
            switch (p.attackType) {
                case 'light_punch':
                case 'heavy_punch':
                    leftArmX = p.x + (p.facing > 0 ? 26 : -8);
                    leftArmY = shoulderY - 2;
                    rightArmX = p.x + (p.facing > 0 ? -2 : 28);
                    rightArmY = shoulderY + 2;
                    rightArmAngle = p.facing * 0.5;
                    break;
                case 'light_kick':
                case 'heavy_kick':
                    leftArmX = p.x + (p.facing > 0 ? -4 : 30);
                    leftArmY = shoulderY - 4;
                    rightArmX = p.x + (p.facing > 0 ? 28 : -6);
                    rightArmY = shoulderY - 2;
                    leftArmAngle = -p.facing * 0.3;
                    rightArmAngle = p.facing * 0.7;
                    break;
                default:
                    leftArmX = p.x + (p.facing > 0 ? 24 : 2);
                    leftArmY = shoulderY;
                    rightArmX = p.x + (p.facing > 0 ? 2 : 24);
                    rightArmY = shoulderY;
            }
        } else if (p.state === 'walking') {
            // 行走动画
            const walkCycle = Math.sin(p.animFrame * 0.3);
            leftArmX = p.x + (p.facing > 0 ? -1 : 27);
            leftArmY = shoulderY + walkCycle * 2;
            rightArmX = p.x + (p.facing > 0 ? 27 : -1);
            rightArmY = shoulderY - walkCycle * 2;
            leftArmAngle = walkCycle * 0.3;
            rightArmAngle = -walkCycle * 0.3;
        } else {
            // 待机状态
            leftArmX = p.x + (p.facing > 0 ? -1 : 27);
            leftArmY = shoulderY;
            rightArmX = p.x + (p.facing > 0 ? 27 : -1);
            rightArmY = shoulderY;
        }
        
        // 渲染手臂
        this.renderDetailedArm(leftArmX, leftArmY, armW, armH, leftArmAngle, 'left');
        this.renderDetailedArm(rightArmX, rightArmY, armW, armH, rightArmAngle, 'right');
    }
    
    renderDetailedArm(x, y, w, h, angle, side) {
        this.ctx.save();
        this.ctx.translate(x + w/2, y + h/2);
        this.ctx.rotate(angle);
        
        // 皮肤渐变
        const armGradient = this.ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
        armGradient.addColorStop(0, '#ffe4c4');
        armGradient.addColorStop(0.5, '#ffd7b3');
        armGradient.addColorStop(1, '#e6b899');
        
        this.ctx.fillStyle = armGradient;
        this.ctx.fillRect(-w/2, -h/2, w, h);
        
        // 肌肉线条
        this.ctx.fillStyle = '#d4a574';
        this.ctx.fillRect(-w/2 + 1, -h/2 + 3, 1, h - 6);
        this.ctx.fillRect(w/2 - 2, -h/2 + 2, 1, h - 4);
        
        // 护具/手套
        this.ctx.fillStyle = side === 'left' ? '#1e40af' : '#dc2626';
        this.ctx.fillRect(-w/2, h/2 - 4, w, 3);
        
        // 科技发光线条
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(-w/2 + 1, h/2 - 3, w - 2, 1);
        
        this.ctx.restore();
    }
    
    renderAnimePlayerLegs(p) {
        const legW = 8;
        const legH = 18;
        const hipY = p.y + 34;
        
        let leftLegX, rightLegX, leftLegY, rightLegY;
        let leftLegAngle = 0, rightLegAngle = 0;
        
        if (p.state === 'walking') {
            // 行走动画
            const walkCycle = Math.sin(p.animFrame * 0.4);
            leftLegX = p.x + 8;
            leftLegY = hipY + Math.abs(walkCycle);
            rightLegX = p.x + 16;
            rightLegY = hipY + Math.abs(-walkCycle);
            leftLegAngle = walkCycle * 0.2;
            rightLegAngle = -walkCycle * 0.2;
        } else if (p.state === 'jumping') {
            // 跳跃姿势
            leftLegX = p.x + 6;
            leftLegY = hipY;
            rightLegX = p.x + 18;
            rightLegY = hipY;
            leftLegAngle = -0.3;
            rightLegAngle = 0.2;
        } else {
            // 待机状态
            leftLegX = p.x + 8;
            leftLegY = hipY;
            rightLegX = p.x + 16;
            rightLegY = hipY;
        }
        
        this.renderDetailedLeg(leftLegX, leftLegY, legW, legH, leftLegAngle, 'left');
        this.renderDetailedLeg(rightLegX, rightLegY, legW, legH, rightLegAngle, 'right');
    }
    
    renderDetailedLeg(x, y, w, h, angle, side) {
        this.ctx.save();
        this.ctx.translate(x + w/2, y + w/2);
        this.ctx.rotate(angle);
        
        // 裤子渐变
        const pantGradient = this.ctx.createLinearGradient(-w/2, -w/2, w/2, h - w/2);
        pantGradient.addColorStop(0, '#374151');
        pantGradient.addColorStop(0.5, '#1f2937');
        pantGradient.addColorStop(1, '#111827');
        
        this.ctx.fillStyle = pantGradient;
        this.ctx.fillRect(-w/2, -w/2, w, h);
        
        // 护膝装备
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-w/2 + 1, h/3, w - 2, 4);
        
        // 科技线条
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(-w/2 + 2, h/3 + 1, w - 4, 1);
        
        // 战斗靴
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-w/2, h - 6, w + 2, 5);
        this.ctx.fillStyle = '#1e40af';
        this.ctx.fillRect(-w/2, h - 5, w + 2, 2);
        
        this.ctx.restore();
    }
    
    renderAnimePlayerEffects(p) {
        // 能量光环效果
        if (p.energy > 80) {
            const auraIntensity = (p.energy - 80) / 20;
            this.ctx.globalAlpha = 0.3 * auraIntensity;
            
            const auraGradient = this.ctx.createRadialGradient(
                p.x + p.width/2, p.y + p.height/2, 0,
                p.x + p.width/2, p.y + p.height/2, 40
            );
            auraGradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
            auraGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
            auraGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
            
            this.ctx.fillStyle = auraGradient;
            this.ctx.fillRect(p.x - 20, p.y - 20, p.width + 40, p.height + 40);
            this.ctx.globalAlpha = 1;
        }
        
        // 攻击特效
        if (p.isAttacking) {
            const effectOpacity = 1 - (p.attackFrame / 30);
            this.ctx.globalAlpha = effectOpacity;
            
            const effectX = p.x + (p.facing > 0 ? p.width : -20);
            const effectY = p.y + p.height/2 - 10;
            
            // 攻击能量波纹
            this.ctx.strokeStyle = '#00d4ff';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                this.ctx.beginPath();
                this.ctx.arc(effectX + 10, effectY + 10, 5 + i * 8 + p.attackFrame, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.globalAlpha = 1;
        }
    }
}
        const leftEyeX = headX + 3;
        const rightEyeX = headX + 10;
        
        // Eye whites
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(leftEyeX, eyeY, 3, 2);
        this.ctx.fillRect(rightEyeX, eyeY, 3, 2);
        
        // Pupils (direction based on facing)
        this.ctx.fillStyle = '#000000';
        const pupilOffset = p.facing > 0 ? 1 : 0;
        this.ctx.fillRect(leftEyeX + pupilOffset, eyeY, 1, 2);
        this.ctx.fillRect(rightEyeX + pupilOffset, eyeY, 1, 2);
        
        // Eye highlights
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(leftEyeX + 1, eyeY, 1, 1);
        this.ctx.fillRect(rightEyeX + 1, eyeY, 1, 1);
        
        // Nose and mouth details
        this.ctx.fillStyle = '#cc9966';
        this.ctx.fillRect(headX + 7, headY + 6, 2, 1); // Nose
        this.ctx.fillStyle = '#aa6644';
        this.ctx.fillRect(headX + 6, headY + 8, 4, 1); // Mouth
        
        // Facial shading
        this.ctx.fillStyle = '#cc9966';
        this.ctx.globalAlpha = 0.6;
        this.ctx.fillRect(headX + headW - 3, headY + 2, 2, headH - 4);
        this.ctx.globalAlpha = 1;
    }
    
    renderDetailedTorso(p, baseColor) {
        const torsoX = p.x + 4;
        const torsoY = p.y + 14;
        const torsoW = 24;
        const torsoH = 20;
        
        // Shirt with detailed shading and highlights
        const shirtGradient = this.ctx.createLinearGradient(torsoX, torsoY, torsoX + torsoW, torsoY + torsoH);
        shirtGradient.addColorStop(0, '#5588ff');
        shirtGradient.addColorStop(0.5, baseColor);
        shirtGradient.addColorStop(1, '#2244aa');
        this.ctx.fillStyle = shirtGradient;
        this.ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
        
        // Shirt details and texture
        this.ctx.fillStyle = '#7799ff';
        this.ctx.fillRect(torsoX + 2, torsoY + 2, torsoW - 4, 2); // Collar
        this.ctx.fillRect(torsoX + 8, torsoY + 4, 8, 1); // Chest line
        
        // Shirt shadows and highlights
        this.ctx.fillStyle = '#2244aa';
        this.ctx.fillRect(torsoX + torsoW - 3, torsoY + 2, 2, torsoH - 4); // Right shadow
        this.ctx.fillStyle = '#7799ff';
        this.ctx.fillRect(torsoX + 1, torsoY + 2, 2, torsoH - 4); // Left highlight
        
        // Belt with metallic details
        const beltY = torsoY + torsoH - 4;
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(torsoX, beltY, torsoW, 4);
        
        // Belt buckle
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(torsoX + 10, beltY + 1, 4, 2);
        this.ctx.fillStyle = '#ffff99';
        this.ctx.fillRect(torsoX + 11, beltY + 1, 2, 1);
    }
    
    renderDetailedArms(p) {
        const armOffset = this.getArmOffset(p);
        
        // Left arm with detailed shading
        this.renderDetailedArm(p.x + 2, p.y + 16, armOffset.left, p.colors.skin, p.colors.shirt);
        
        // Right arm with detailed shading
        this.renderDetailedArm(p.x + 26, p.y + 16, armOffset.right, p.colors.skin, p.colors.shirt);
    }
    
    renderDetailedArm(x, y, offset, skinColor, shirtColor) {
        // Upper arm (shirt sleeve)
        this.ctx.fillStyle = shirtColor;
        this.ctx.fillRect(x + offset.x, y + offset.y, 6, 8);
        
        // Sleeve shading
        this.ctx.fillStyle = '#2244aa';
        this.ctx.fillRect(x + offset.x + 4, y + offset.y + 1, 1, 6);
        
        // Forearm (skin)
        const forearmGradient = this.ctx.createLinearGradient(x, y + 8, x + 6, y + 16);
        forearmGradient.addColorStop(0, '#ffeaa7');
        forearmGradient.addColorStop(1, skinColor);
        this.ctx.fillStyle = forearmGradient;
        this.ctx.fillRect(x + offset.x, y + offset.y + 8, 6, 8);
        
        // Arm muscle definition
        this.ctx.fillStyle = '#cc9966';
        this.ctx.fillRect(x + offset.x + 1, y + offset.y + 9, 4, 2);
        
        // Hand with detailed fingers
        this.renderDetailedHand(x + offset.x + 1, y + offset.y + 16, skinColor, offset.attacking);
    }
    
    renderDetailedHand(x, y, skinColor, isAttacking) {
        // Palm
        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect(x, y, 4, 4);
        
        // Fingers based on attack state
        if (isAttacking) {
            // Fist
            this.ctx.fillStyle = '#cc9966';
            this.ctx.fillRect(x, y, 4, 3);
            this.ctx.fillStyle = skinColor;
            this.ctx.fillRect(x + 1, y + 1, 2, 2);
        } else {
            // Open hand
            this.ctx.fillStyle = skinColor;
            this.ctx.fillRect(x, y - 1, 1, 2); // Thumb
            this.ctx.fillRect(x + 1, y - 2, 3, 2); // Fingers
        }
        
        // Hand details
        this.ctx.fillStyle = '#cc9966';
        this.ctx.fillRect(x + 1, y + 2, 2, 1); // Palm line
    }
    
    getArmOffset(p) {
        let leftOffset = { x: 0, y: 0, attacking: false };
        let rightOffset = { x: 0, y: 0, attacking: false };
        
        if (p.isAttacking) {
            const progress = p.attackFrame / (p.attacks[p.attackType].startup + p.attacks[p.attackType].active + p.attacks[p.attackType].recovery);
            const animOffset = Math.sin(progress * Math.PI) * 12;
            
            switch (p.attackType) {
                case 'light_punch':
                case 'heavy_punch':
                    if (p.facing > 0) {
                        rightOffset = { x: animOffset, y: -animOffset * 0.3, attacking: true };
                    } else {
                        leftOffset = { x: -animOffset, y: -animOffset * 0.3, attacking: true };
                    }
                    break;
                    
                case 'uppercut':
                    if (p.facing > 0) {
                        rightOffset = { x: animOffset * 0.5, y: -animOffset, attacking: true };
                    } else {
                        leftOffset = { x: -animOffset * 0.5, y: -animOffset, attacking: true };
                    }
                    break;
                    
                case 'ultimate_combo':
                    leftOffset = { x: -animOffset * 0.7, y: -animOffset * 0.5, attacking: true };
                    rightOffset = { x: animOffset * 0.7, y: -animOffset * 0.5, attacking: true };
                    break;
            }
        } else if (p.state === 'walking') {
            const walkCycle = Math.sin(p.animFrame * 0.5) * 4;
            leftOffset = { x: 0, y: walkCycle, attacking: false };
            rightOffset = { x: 0, y: -walkCycle, attacking: false };
        }
        
        return { left: leftOffset, right: rightOffset };
    }
    
    renderDetailedLegs(p) {
        const legX = p.x + 8;
        const legY = p.y + 34;
        const legW = 8;
        const legH = 14;
        
        const walkOffset = p.state === 'walking' ? 
            Math.sin(p.animFrame * Math.PI / 2) * 3 : 0;
        
        // Left leg with detailed pants
        this.renderDetailedLeg(legX, legY, legW, legH, walkOffset, p.colors.pants);
        
        // Right leg with detailed pants  
        this.renderDetailedLeg(legX + 8, legY, legW, legH, -walkOffset, p.colors.pants);
        
        // Detailed shoes
        this.renderDetailedShoes(legX, legY + legH, p.colors.shoes);
    }
    
    renderDetailedLeg(x, y, w, h, offset, pantsColor) {
        // Pants with gradient and details
        const pantsGradient = this.ctx.createLinearGradient(x, y, x + w, y + h);
        pantsGradient.addColorStop(0, '#444444');
        pantsGradient.addColorStop(0.5, pantsColor);
        pantsGradient.addColorStop(1, '#1a1a1a');
        this.ctx.fillStyle = pantsGradient;
        this.ctx.fillRect(x, y + offset, w, h);
        
        // Pants seam
        this.ctx.fillStyle = '#555555';
        this.ctx.fillRect(x + 1, y + offset + 1, 1, h - 2);
        
        // Pants shadow
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x + w - 1, y + offset + 1, 1, h - 2);
    }
    
    renderDetailedShoes(x, y, shoeColor) {
        // Left shoe
        this.ctx.fillStyle = shoeColor;
        this.ctx.fillRect(x - 1, y, 10, 4);
        
        // Shoe details
        this.ctx.fillStyle = '#2a1810';
        this.ctx.fillRect(x, y + 1, 8, 2);
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 1, y + 2, 6, 1);
        
        // Right shoe
        this.ctx.fillStyle = shoeColor;
        this.ctx.fillRect(x + 7, y, 10, 4);
        
        // Shoe details
        this.ctx.fillStyle = '#2a1810';
        this.ctx.fillRect(x + 8, y + 1, 8, 2);
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 9, y + 2, 6, 1);
    }
    
    renderPlayerDetails(p) {
        // Character shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(p.x + 4, p.y + p.height, p.width - 8, 3);
        
        // Character outline for depth
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(p.x, p.y, p.width, p.height);
        
        // Health indicator
        if (p.health < p.maxHealth * 0.3) {
            // Red glow when low health
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(p.x - 2, p.y - 2, p.width + 4, p.height + 4);
        }
        
        // Breathing animation
        const breathOffset = Math.sin(Date.now() * 0.003) * 0.5;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(p.x + 12, p.y + 18 + breathOffset, 8, 2);
    }
    
    renderBlockingEffect() {
        const p = this.player;
        // Ultra-detailed blocking shield effect
        this.ctx.fillStyle = '#00ffff';
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(p.x + (p.facing > 0 ? p.width : -12), p.y - 4, 12, p.height + 8);
        
        // Shield pattern details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = 0.9;
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(
                p.x + (p.facing > 0 ? p.width + 2 : -10), 
                p.y + i * 10, 
                8, 
                2
            );
        }
        this.ctx.globalAlpha = 1;
    }
    
    renderAttackAnimation() {
        const p = this.player;
        const attack = p.attacks[p.attackType];
        const progress = p.attackFrame / (attack.startup + attack.active + attack.recovery);
        
        // Attack visualization
        const colors = {
            light_punch: '#ff6600',
            heavy_punch: '#ff3300',
            light_kick: '#0066ff',
            heavy_kick: '#0033ff',
            uppercut: '#ff00ff',
            special_fireball: '#ff9900',
            ultimate_combo: '#ff0099'
        };
        
        const attackColor = colors[p.attackType] || '#ffffff';
        
        // Attack range visualization
        if (p.attackFrame >= attack.startup && p.attackFrame < attack.startup + attack.active) {
            this.ctx.fillStyle = attackColor;
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillRect(
                p.x + (p.facing > 0 ? p.width : -attack.range),
                p.y - 5,
                attack.range,
                p.height + 10
            );
            this.ctx.globalAlpha = 1;
        }
        
        // Special attack effects
        if (p.attackType === 'ultimate_combo') {
            const wave = Math.sin(p.attackFrame * 0.3) * 20;
            this.ctx.fillStyle = '#ff0099';
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(p.x - wave, p.y - wave, p.width + wave * 2, p.height + wave * 2);
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderProjectiles() {
        this.projectiles.forEach(projectile => {
            // Main projectile
            this.ctx.fillStyle = projectile.color || '#ffff00';
            this.ctx.fillRect(
                projectile.x, 
                projectile.y, 
                projectile.width || 8, 
                projectile.height || 8
            );
            
            // Enhanced trail effect for special projectiles
            if (projectile.trail) {
                this.ctx.fillStyle = projectile.color || '#ffff00';
                this.ctx.globalAlpha = 0.6;
                this.ctx.fillRect(
                    projectile.x - projectile.velocityX * 0.5,
                    projectile.y - projectile.velocityY * 0.5,
                    projectile.width || 8,
                    projectile.height || 8
                );
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(
                    projectile.x - projectile.velocityX,
                    projectile.y - projectile.velocityY,
                    projectile.width || 8,
                    projectile.height || 8
                );
                this.ctx.globalAlpha = 1;
            }
            
            // Glow effect for boss projectiles
            if (projectile.type === 'enemy') {
                this.ctx.fillStyle = projectile.color || '#ff6600';
                this.ctx.globalAlpha = 0.4;
                this.ctx.fillRect(
                    projectile.x - 2, 
                    projectile.y - 2, 
                    (projectile.width || 8) + 4, 
                    (projectile.height || 8) + 4
                );
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha || 1;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    renderUI() {
        // Health bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 204, 24);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(22, 22, 200 * (this.player.health / this.player.maxHealth), 20);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`HP: ${this.player.health}/${this.player.maxHealth}`, 25, 36);
        
        // Mana bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 50, 154, 18);
        this.ctx.fillStyle = '#0066ff';
        this.ctx.fillRect(22, 52, 150 * (this.player.mana / this.player.maxMana), 14);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`MP: ${Math.floor(this.player.mana)}`, 25, 63);
        
        // Stamina bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 75, 154, 18);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(22, 77, 150 * (this.player.stamina / this.player.maxStamina), 14);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`ST: ${Math.floor(this.player.stamina)}`, 25, 88);
        
        // Energy bar (Ultimate meter)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 100, 154, 18);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(22, 102, 150 * (this.player.energy / this.player.maxEnergy), 14);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`EN: ${Math.floor(this.player.energy)}`, 25, 113);
        
        // Combo counter
        if (this.player.combo > 1) {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.font = 'bold 24px monospace';
            this.ctx.fillText(`${this.player.combo} COMBO!`, 400, 50);
        }
        
        // Score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Score: ${this.score}`, 700, 30);
        
        // Controls help
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('WASD: Move | J/K: Light | L/U: Heavy | I: Special | O: Ultimate | P: Block | Space: Dash', 20, 280);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, 900, 300);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', 450, 120);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px monospace';
        this.ctx.fillText(`Final Score: ${this.score}`, 450, 160);
        
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Press R to restart', 450, 200);
        
        this.ctx.textAlign = 'left';
    }
}

// Initialize the enhanced fighting game
let enhancedGame;

function initEnhancedGame() {
    enhancedGame = new EnhancedFightingGame('pixelCanvas');
    
    // Add restart functionality
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r' && !enhancedGame.gameRunning) {
            enhancedGame = new EnhancedFightingGame('pixelCanvas');
            enhancedGame.start();
        }
    });
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFightingGame;
}
