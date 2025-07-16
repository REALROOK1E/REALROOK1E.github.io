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
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 900 * dpr;
        this.canvas.height = 300 * dpr;
        this.canvas.style.width = '900px';
        this.canvas.style.height = '300px';
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
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
                this.enemies.splice(index, 1);
                return;
            }
            
            // Update hitstun
            if (enemy.hitstun > 0) {
                enemy.hitstun--;
                return;
            }
            
            // AI behavior
            this.updateEnemyAI(enemy);
        });
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
                this.enemies.forEach(enemy => {
                    if (this.checkCollision(projectile, enemy)) {
                        this.hitEnemy(enemy, 'special_fireball');
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
            // Enemy color based on type and health
            const colors = {
                brawler: '#ff6666',
                martial_artist: '#66ff66',
                heavy_fighter: '#6666ff',
                ninja: '#ff66ff',
                boss: '#ff0000'
            };
            
            const baseColor = colors[enemy.type] || '#ff6666';
            const healthRatio = enemy.health / enemy.maxHealth;
            
            // Flashing when hit
            if (enemy.hitstun > 0 && enemy.hitstun % 4 < 2) {
                this.ctx.fillStyle = '#ffffff';
            } else {
                this.ctx.fillStyle = baseColor;
            }
            
            // Transparency for ninja
            if (enemy.alpha) {
                this.ctx.globalAlpha = enemy.alpha;
            }
            
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Enemy details
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(enemy.x + 4, enemy.y + 3, 4, 4); // Eyes
            
            // Health bar for bosses
            if (enemy.type === 'boss') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(enemy.x - 5, enemy.y - 15, enemy.width + 10, 8);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(enemy.x - 4, enemy.y - 14, (enemy.width + 8) * healthRatio, 6);
            }
            
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderPlayer() {
        const p = this.player;
        
        // Player base
        let playerColor = p.colors.shirt;
        
        // Flashing when invulnerable
        if (p.invulnerable > 0 && p.invulnerable % 6 < 3) {
            playerColor = '#ffffff';
        }
        
        // Aura when energy is full
        if (p.energy >= p.maxEnergy) {
            this.ctx.fillStyle = p.colors.aura;
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(p.x - 5, p.y - 5, p.width + 10, p.height + 10);
            this.ctx.globalAlpha = 1;
        }
        
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);
        
        // Player details
        this.ctx.fillStyle = p.colors.skin;
        this.ctx.fillRect(p.x + 4, p.y + 2, 24, 12); // Head
        this.ctx.fillRect(p.x + 6, p.y + 18, 8, 12); // Left arm
        this.ctx.fillRect(p.x + 18, p.y + 18, 8, 12); // Right arm
        
        this.ctx.fillStyle = p.colors.pants;
        this.ctx.fillRect(p.x + 8, p.y + 32, 16, 16); // Legs
        
        this.ctx.fillStyle = p.colors.hair;
        this.ctx.fillRect(p.x + 6, p.y + 2, 20, 6); // Hair
        
        this.ctx.fillStyle = p.colors.shoes;
        this.ctx.fillRect(p.x + 6, p.y + 44, 20, 6); // Shoes
        
        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(p.x + 8 + (p.facing > 0 ? 4 : 0), p.y + 6, 2, 2);
        this.ctx.fillRect(p.x + 18 + (p.facing > 0 ? 4 : 0), p.y + 6, 2, 2);
        
        // Attack effects
        if (p.isAttacking) {
            this.renderAttackAnimation();
        }
        
        // Blocking effect
        if (p.isBlocking) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(p.x + (p.facing > 0 ? p.width : -8), p.y, 8, p.height);
            this.ctx.globalAlpha = 1;
        }
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
            this.ctx.fillStyle = projectile.color || '#ffff00';
            this.ctx.fillRect(projectile.x, projectile.y, projectile.width || 8, projectile.height || 8);
            
            // Trail effect
            this.ctx.fillStyle = projectile.color || '#ffff00';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(
                projectile.x - projectile.velocityX,
                projectile.y - projectile.velocityY,
                projectile.width || 8,
                projectile.height || 8
            );
            this.ctx.globalAlpha = 1;
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
