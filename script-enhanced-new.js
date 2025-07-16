// ====== ENHANCED FIGHTING GAME WITH ANIME STYLE ======
// 🎌 日系动漫风格格斗游戏

class AnimeStyleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initGame();
        this.setupEventListeners();
        this.start();
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
        this.currentWave = 1;
        this.waveInProgress = false;
        
        // Player
        this.player = {
            x: 100, y: 200, width: 32, height: 48,
            velocityX: 0, velocityY: 0,
            health: 100, maxHealth: 100,
            mana: 100, maxMana: 100,
            stamina: 100, maxStamina: 100,
            energy: 0, maxEnergy: 100,
            facing: 1, state: 'idle',
            isAttacking: false, attackType: '', attackFrame: 0,
            isBlocking: false, isInvincible: false,
            invincibilityTimer: 0, combo: 0, comboTimer: 0,
            animFrame: 0, dashCooldown: 0,
            isDashing: false, dashFrames: 0,
            lastGroundY: 200
        };
        
        // Game objects
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.powerups = [];
        this.platforms = [];
        this.environmentObjects = [];
        this.backgroundEffects = [];
        
        // Input
        this.keys = {};
        
        this.initializeBackgroundEffects();
    }
    }
    
    initializeBackgroundEffects() {
        this.backgroundEffects = [];
        
        // 浮动数据流
        for (let i = 0; i < 15; i++) {
            this.backgroundEffects.push({
                type: 'floating_data',
                x: Math.random() * 900,
                y: Math.random() * 300,
                speed: 0.5 + Math.random() * 1.5,
                size: Math.random() * 4 + 2,
                color: ['#00d4ff', '#ff0066', '#00ff66'][Math.floor(Math.random() * 3)]
            });
        }
        
        // 建筑发光效果
        for (let i = 0; i < 8; i++) {
            this.backgroundEffects.push({
                type: 'building_glow',
                x: i * 120 + Math.random() * 50,
                y: 100 + Math.random() * 100,
                intensity: Math.random(),
                phase: Math.random() * Math.PI * 2,
                color: ['#00d4ff', '#ff0066', '#9333ea'][Math.floor(Math.random() * 3)]
            });
        }
    }
    }
    
    initLevel() {
        // 🏗️ 赛博朋克风格平台
        this.platforms = [
            // Ground level
            {x: 0, y: 270, width: 1000, height: 30, type: 'solid'},
            {x: 1200, y: 270, width: 800, height: 30, type: 'solid'},
            {x: 2200, y: 270, width: 1000, height: 30, type: 'solid'},
            {x: 3400, y: 270, width: 600, height: 30, type: 'solid'},
            
            // 科技平台
            {x: 200, y: 220, width: 120, height: 15, type: 'tech', glowing: true},
            {x: 400, y: 180, width: 140, height: 15, type: 'moving', moveX: 1, moveRange: 100},
            {x: 600, y: 140, width: 120, height: 15, type: 'energy', bounce: 1.5},
            {x: 1000, y: 200, width: 100, height: 15, type: 'hologram'},
            {x: 1400, y: 160, width: 150, height: 15, type: 'ice', friction: 0.1},
            {x: 1700, y: 180, width: 120, height: 15, type: 'fire', damage: 5},
            {x: 2000, y: 140, width: 180, height: 15, type: 'teleporter', target: {x: 2800, y: 140}},
            {x: 2400, y: 200, width: 160, height: 15, type: 'switch', activated: false},
            {x: 2800, y: 160, width: 140, height: 15, type: 'elevator', moveY: 1, moveRange: 80},
            {x: 3200, y: 180, width: 200, height: 15, type: 'boss_platform'}
        ];
        
        // 🏙️ 赛博朋克环境物体
        this.environmentObjects = [
            // 科技建筑
            {x: 250, y: 150, width: 80, height: 120, type: 'tech_tower', animated: true},
            {x: 450, y: 100, width: 60, height: 170, type: 'data_spire', glowing: true},
            {x: 850, y: 120, width: 100, height: 150, type: 'cyber_building'},
            
            // 交互装置
            {x: 1200, y: 200, width: 40, height: 70, type: 'control_panel', activated: false},
            {x: 1600, y: 180, width: 20, height: 90, type: 'laser_gate', active: true},
            {x: 2000, y: 240, width: 60, height: 30, type: 'launch_pad', power: 20},
            
            // 装饰元素
            {x: 100, y: 50, width: 40, height: 220, type: 'neon_sign', color: '#ff0066'},
            {x: 300, y: 30, width: 60, height: 240, type: 'hologram_ad', animated: true},
            {x: 1500, y: 80, width: 25, height: 30, type: 'data_node', pulsing: true},
            {x: 2500, y: 90, width: 30, height: 20, type: 'energy_core', glowing: true}
        ];
        
        this.spawnEnemies();
        this.spawnPowerups();
    }
    
    spawnEnemies() {
        this.enemies = [
            // 🥷 各种风格的敌人
            {
                x: 300, y: 245, width: 30, height: 25, health: 40, maxHealth: 40,
                type: 'cyber_ninja', ai: 'aggressive', facing: -1,
                moveSpeed: 2, attackRange: 40, attackCooldown: 0,
                attacks: ['cyber_slash', 'dash_strike'], combo: 0
            },
            {
                x: 800, y: 175, width: 28, height: 25, health: 60, maxHealth: 60,
                type: 'tech_warrior', ai: 'technical', facing: -1,
                moveSpeed: 3, attackRange: 50, attackCooldown: 0,
                attacks: ['energy_punch', 'tech_kick', 'plasma_shot'], combo: 0, canBlock: true
            },
            {
                x: 1300, y: 245, width: 32, height: 28, health: 80, maxHealth: 80,
                type: 'mech_fighter', ai: 'defensive', facing: -1,
                moveSpeed: 1.5, attackRange: 35, attackCooldown: 0,
                attacks: ['heavy_slam', 'rocket_punch'], armor: 10, canBlock: true
            },
            {
                x: 2000, y: 155, width: 26, height: 25, health: 50, maxHealth: 50,
                type: 'holo_assassin', ai: 'hit_and_run', facing: -1,
                moveSpeed: 4, attackRange: 45, attackCooldown: 0,
                attacks: ['holo_strike', 'vanish_attack'], canDash: true, invisibleTimer: 0
            },
            {
                x: 3200, y: 175, width: 50, height: 45, health: 200, maxHealth: 200,
                type: 'cyber_boss', ai: 'boss_pattern', facing: -1,
                moveSpeed: 2, attackRange: 60, attackCooldown: 0,
                attacks: ['plasma_barrage', 'energy_slam', 'cyber_wave', 'teleport_strike'],
                phase: 1, maxPhase: 3, specialTimer: 0
            }
        ];
    }
    
    spawnPowerups() {
        this.powerups = [
            {x: 250, y: 190, type: 'nano_heal', value: 25, collected: false},
            {x: 650, y: 110, type: 'energy_crystal', value: 50, collected: false},
            {x: 1150, y: 170, type: 'bio_enhancer', value: 50, collected: false},
            {x: 1500, y: 130, type: 'power_core', value: 25, collected: false},
            {x: 2000, y: 140, type: 'mega_heal', value: 75, collected: false},
            {x: 2400, y: 145, type: 'combat_stim', duration: 600, collected: false},
            {x: 2800, y: 110, type: 'speed_chip', duration: 600, collected: false},
            {x: 3000, y: 170, type: 'ultimate_core', value: 100, collected: false}
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
                    if (platform.type === 'energy') {
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
                color: obj.type === 'data_spire' ? '#ff6600' : '#8b4513',
                size: Math.random() * 3 + 2
            });
        }
        
        // Object-specific effects
        if (obj.health <= 0) {
            if (obj.explosive) {
                this.createExplosion(obj.x + obj.width/2, obj.y + obj.height/2);
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
            
            // Simple AI behavior
            const distanceToPlayer = this.player.x - enemy.x;
            const absDistance = Math.abs(distanceToPlayer);
            
            if (absDistance > enemy.attackRange) {
                enemy.x += Math.sign(distanceToPlayer) * enemy.moveSpeed;
                enemy.facing = Math.sign(distanceToPlayer);
            } else if (enemy.attackCooldown <= 0) {
                this.enemyAttack(enemy);
            }
            
            if (enemy.attackCooldown > 0) {
                enemy.attackCooldown--;
            }
        });
    }
    
    enemyAttack(enemy) {
        enemy.attacking = true;
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
                } else {
                    // Hit player
                    this.takeDamage(15);
                }
            }
            
            enemy.attacking = false;
        }, 200); // Attack delay
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
                    if (!this.player.isBlocking) {
                        this.takeDamage(projectile.damage || 20);
                    }
                    this.projectiles.splice(index, 1);
                }
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
            case 'nano_heal':
            case 'mega_heal':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + powerup.value);
                break;
            case 'energy_crystal':
                this.player.mana = Math.min(this.player.maxMana, this.player.mana + powerup.value);
                break;
            case 'bio_enhancer':
                this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + powerup.value);
                break;
            case 'power_core':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + powerup.value);
                break;
            case 'ultimate_core':
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
        // 🌆 赛博朋克背景渲染
        this.renderCyberBackground();
        
        // Save context for camera
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Render game world
        this.renderEnvironmentObjects();
        this.renderPlatforms();
        this.renderPowerups();
        this.renderEnemies();
        this.renderAnimePlayer();
        this.renderProjectiles();
        this.renderParticles();
        
        this.ctx.restore();
        
        // Render UI (not affected by camera)
        this.renderUI();
    }
    
    renderCyberBackground() {
        // 🌌 多层次赛博朋克背景
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, 300);
        skyGradient.addColorStop(0, '#0a0015'); // 深紫色夜空
        skyGradient.addColorStop(0.3, '#1a0f2e'); // 中层紫色
        skyGradient.addColorStop(0.7, '#2a1b3d'); // 地平线紫色
        skyGradient.addColorStop(1, '#3d2952'); // 底部紫红色
        
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, 900, 300);
        
        // 霓虹云彩效果
        this.ctx.fillStyle = 'rgba(255, 20, 147, 0.2)';
        this.ctx.fillRect(200 - this.cameraX * 0.1, 30, 300, 40);
        this.ctx.fillRect(800 - this.cameraX * 0.15, 50, 400, 30);
        this.ctx.fillRect(1500 - this.cameraX * 0.08, 20, 250, 35);
        
        // 远景摩天大楼剪影
        this.renderCityscape();
    }
    
    renderCityscape() {
        this.ctx.fillStyle = '#0f0520';
        const buildings = [
            {x: 100, y: 80, w: 60, h: 180},
            {x: 180, y: 50, w: 40, h: 210},
            {x: 240, y: 90, w: 80, h: 170},
            {x: 350, y: 40, w: 35, h: 220},
            {x: 400, y: 70, w: 55, h: 190},
            {x: 500, y: 100, w: 45, h: 160},
            {x: 600, y: 60, w: 70, h: 200}
        ];
        
        buildings.forEach(building => {
            const buildingX = building.x - this.cameraX * 0.2;
            this.ctx.fillRect(buildingX, building.y, building.w, building.h);
            
            // 建筑物霓虹窗户
            this.ctx.fillStyle = Math.random() > 0.7 ? '#00d4ff' : '#ff1493';
            for (let floor = 0; floor < building.h; floor += 15) {
                if (Math.random() > 0.6) {
                    this.ctx.fillRect(buildingX + 5, building.y + floor + 3, 4, 6);
                    this.ctx.fillRect(buildingX + building.w - 9, building.y + floor + 3, 4, 6);
                }
            }
            this.ctx.fillStyle = '#0f0520';
        });
    }
    
    renderAnimePlayer() {
        const p = this.player;
        
        // Invulnerability flashing
        const isFlashing = p.invulnerable > 0 && p.invulnerable % 6 < 3;
        if (isFlashing) this.ctx.globalAlpha = 0.7;
        
        // 🎌 日系动漫风格主角渲染
        this.renderAnimePlayerHead(p);
        this.renderAnimePlayerTorso(p);
        this.renderAnimePlayerArms(p);
        this.renderAnimePlayerLegs(p);
        this.renderAnimePlayerEffects(p);
        
        this.ctx.globalAlpha = 1;
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
    
    renderAnimePlayerTorso(p) {
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
        this.ctx.fillRect(torsoX + 2, torsoY + 3, torsoW - 4, 1);
        this.ctx.fillRect(torsoX + 4, torsoY + 8, torsoW - 8, 1);
        this.ctx.fillRect(torsoX + 2, torsoY + 15, torsoW - 4, 1);
        
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
        this.ctx.fillRect(torsoX + 3, torsoY + 12, 3, 4);
        this.ctx.fillRect(torsoX + torsoW - 6, torsoY + 12, 3, 4);
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
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            this.renderAnimeEnemy(enemy);
        });
    }
    
    renderAnimeEnemy(enemy) {
        const healthRatio = enemy.health / enemy.maxHealth;
        
        // Flashing when hit
        const isFlashing = enemy.hitstun > 0 && enemy.hitstun % 4 < 2;
        if (isFlashing) this.ctx.globalAlpha = 0.7;
        
        // Transparency for stealth enemies
        if (enemy.alpha) {
            this.ctx.globalAlpha = enemy.alpha;
        }
        
        // Render based on enemy type
        switch (enemy.type) {
            case 'cyber_ninja':
                this.renderCyberNinja(enemy, isFlashing, healthRatio);
                break;
            case 'tech_warrior':
                this.renderTechWarrior(enemy, isFlashing, healthRatio);
                break;
            case 'mech_fighter':
                this.renderMechFighter(enemy, isFlashing, healthRatio);
                break;
            case 'holo_assassin':
                this.renderHoloAssassin(enemy, isFlashing, healthRatio);
                break;
            case 'cyber_boss':
                this.renderCyberBoss(enemy, isFlashing, healthRatio);
                break;
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    renderCyberNinja(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // 忍者装甲
        const armorGradient = this.ctx.createLinearGradient(x, y, x + w, y + h);
        armorGradient.addColorStop(0, '#1a1a2e');
        armorGradient.addColorStop(0.5, '#16213e');
        armorGradient.addColorStop(1, '#0f0f23');
        
        this.ctx.fillStyle = armorGradient;
        this.ctx.fillRect(x, y, w, h);
        
        // 发光眼睛
        this.ctx.fillStyle = '#ff0066';
        this.ctx.fillRect(x + 4, y + 3, 2, 2);
        this.ctx.fillRect(x + w - 6, y + 3, 2, 2);
        
        // 科技装饰
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(x + 2, y + h/2, w - 4, 1);
    }
    
    renderTechWarrior(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // 科技战士装甲
        this.ctx.fillStyle = '#2563eb';
        this.ctx.fillRect(x, y, w, h);
        
        // 能量核心
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(x + w/2 - 2, y + h/2 - 2, 4, 4);
        
        // 装甲细节
        this.ctx.fillStyle = '#1e40af';
        this.ctx.fillRect(x + 2, y + 2, w - 4, 2);
        this.ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
    }
    
    renderMechFighter(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // 机甲外壳
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(x, y, w, h);
        
        // 重装护甲
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
        
        // 机械细节
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(x + 6, y + 6, 2, 2);
        this.ctx.fillRect(x + w - 8, y + 6, 2, 2);
    }
    
    renderHoloAssassin(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // 全息效果
        const alpha = enemy.invisibleTimer > 0 ? 0.3 : 1;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.fillStyle = '#8b5cf6';
        this.ctx.fillRect(x, y, w, h);
        
        // 全息纹理
        this.ctx.fillStyle = '#a78bfa';
        for (let i = 0; i < h; i += 4) {
            this.ctx.fillRect(x, y + i, w, 1);
        }
    }
    
    renderCyberBoss(enemy, isFlashing, healthRatio) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;
        
        // Boss主体
        const bossGradient = this.ctx.createLinearGradient(x, y, x + w, y + h);
        bossGradient.addColorStop(0, '#991b1b');
        bossGradient.addColorStop(0.5, '#dc2626');
        bossGradient.addColorStop(1, '#7f1d1d');
        
        this.ctx.fillStyle = bossGradient;
        this.ctx.fillRect(x, y, w, h);
        
        // Boss装甲
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
        
        // 能量核心
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(x + w/2 - 4, y + h/2 - 4, 8, 8);
        
        // Boss发光效果
        if (enemy.phase > 1) {
            this.ctx.fillStyle = enemy.phase > 2 ? '#9333ea' : '#eab308';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderPowerups() {
        this.powerups.forEach(powerup => {
            if (powerup.collected) return;
            
            const colors = {
                nano_heal: '#ff0066',
                mega_heal: '#ff0033',
                energy_crystal: '#0066ff',
                bio_enhancer: '#66ff00',
                power_core: '#ffff00',
                ultimate_core: '#ff00ff'
            };
            
            const y = powerup.y + Math.sin(Date.now() * 0.005 + powerup.x * 0.01) * 3;
            
            this.ctx.fillStyle = colors[powerup.type] || '#ffffff';
            this.ctx.fillRect(powerup.x, y, 16, 16);
            
            // Glow effect
            this.ctx.fillStyle = colors[powerup.type] || '#ffffff';
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillRect(powerup.x - 2, y - 2, 20, 20);
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderEnvironmentObjects() {
        this.environmentObjects.forEach(obj => {
            if (obj.type === 'tech_tower' || obj.type === 'cyber_building') {
                // Tech buildings
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                
                // Tech details
                this.ctx.fillStyle = '#00ffff';
                for (let i = 0; i < obj.height; i += 20) {
                    this.ctx.fillRect(obj.x + 2, obj.y + i, obj.width - 4, 1);
                }
            } else if (obj.type === 'data_spire') {
                // Data spire
                this.ctx.fillStyle = '#4c1d95';
                this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                
                if (obj.glowing) {
                    this.ctx.fillStyle = '#8b5cf6';
                    this.ctx.globalAlpha = 0.6;
                    this.ctx.fillRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);
                    this.ctx.globalAlpha = 1;
                }
            } else if (obj.type === 'neon_sign') {
                // Neon signs
                this.ctx.fillStyle = obj.color || '#ff0066';
                this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                
                // Neon glow
                this.ctx.fillStyle = obj.color || '#ff0066';
                this.ctx.globalAlpha = 0.5;
                this.ctx.fillRect(obj.x - 4, obj.y - 4, obj.width + 8, obj.height + 8);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderPlatforms() {
        this.platforms.forEach(platform => {
            this.renderPlatformBase(platform);
            this.renderPlatformDetails(platform);
            this.renderPlatformEffects(platform);
        });
    }
    
    renderPlatformBase(platform) {
        const colors = {
            solid: '#4a5568',
            tech: '#3182ce',
            moving: '#3182ce',
            energy: '#38a169',
            hologram: '#9f7aea',
            ice: '#63b3ed',
            fire: '#dd6b20',
            teleporter: '#9f7aea'
        };
        
        const baseGradient = this.ctx.createLinearGradient(
            platform.x, platform.y, 
            platform.x, platform.y + platform.height
        );
        baseGradient.addColorStop(0, colors[platform.type] || '#666666');
        baseGradient.addColorStop(1, '#2d3748');
        
        this.ctx.fillStyle = baseGradient;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    renderPlatformDetails(platform) {
        // 科技纹理
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, 1);
        
        // 侧面高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(platform.x, platform.y, 1, platform.height);
        
        // 底部阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 2);
    }
    
    renderPlatformEffects(platform) {
        if (platform.type === 'fire') {
            // 火焰效果
            for (let i = 0; i < platform.width; i += 8) {
                const flameHeight = Math.sin(Date.now() * 0.01 + i) * 8 + 12;
                this.ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, 0.8)`;
                this.ctx.fillRect(platform.x + i, platform.y - flameHeight, 4, flameHeight);
            }
        } else if (platform.type === 'ice') {
            // 冰晶效果
            this.ctx.fillStyle = 'rgba(99, 179, 237, 0.6)';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        } else if (platform.type === 'teleporter') {
            // 传送门效果
            const pulseAlpha = Math.sin(Date.now() * 0.008) * 0.3 + 0.4;
            this.ctx.fillStyle = `rgba(159, 122, 234, ${pulseAlpha})`;
            this.ctx.fillRect(platform.x, platform.y - 20, platform.width, 20);
        } else if (platform.type === 'tech' && platform.glowing) {
            // 科技发光
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.fillRect(platform.x, platform.y - 4, platform.width, 4);
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
        
        // Update animations
        this.updateAnimations();
        
        // Update background elements
        this.updateBackgroundEffects();
        
        // Check for game over
        if (this.player.health <= 0) {
            this.gameOver();
            return;
        }
        
        // Update wave progression
        this.updateWaveSystem();
        
        // Schedule next frame
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    updateAnimations() {
        // Update player animation frame
        this.player.animFrame++;
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.animFrame = (enemy.animFrame || 0) + 1;
        });
        
        // Update particles animation
        this.particles.forEach((particle, index) => {
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateBackgroundEffects() {
        // Update cyberpunk background effects
        this.backgroundEffects.forEach(effect => {
            if (effect.type === 'floating_data') {
                effect.y += effect.speed;
                if (effect.y > 300) {
                    effect.y = -20;
                    effect.x = Math.random() * 900;
                }
            } else if (effect.type === 'building_glow') {
                effect.intensity = Math.sin(Date.now() * 0.003 + effect.phase) * 0.3 + 0.7;
            }
        });
    }
    
    updateWaveSystem() {
        if (this.enemies.length === 0 && !this.waveInProgress) {
            this.currentWave++;
            this.spawnWave();
        }
    }
    
    spawnWave() {
        this.waveInProgress = true;
        const waveData = this.getWaveData(this.currentWave);
        
        setTimeout(() => {
            for (let i = 0; i < waveData.enemyCount; i++) {
                setTimeout(() => {
                    this.spawnEnemy(waveData.enemyTypes[i % waveData.enemyTypes.length]);
                }, i * 1000);
            }
            this.waveInProgress = false;
        }, 2000);
    }
    
    spawnEnemy(type) {
        const enemyConfigs = {
            cyber_ninja: {
                width: 24, height: 32, health: 60, speed: 3,
                attackDamage: 15, attackRange: 40, attackCooldown: 60,
                color: '#1a1a2e', abilities: ['stealth_dash', 'shadow_strike']
            },
            tech_warrior: {
                width: 28, height: 36, health: 100, speed: 2,
                attackDamage: 25, attackRange: 50, attackCooldown: 80,
                color: '#2563eb', abilities: ['energy_blast', 'shield_boost']
            },
            mech_fighter: {
                width: 36, height: 44, health: 150, speed: 1.5,
                attackDamage: 35, attackRange: 60, attackCooldown: 100,
                color: '#4b5563', abilities: ['rocket_punch', 'armor_mode']
            },
            holo_assassin: {
                width: 22, height: 30, health: 80, speed: 3.5,
                attackDamage: 20, attackRange: 35, attackCooldown: 70,
                color: '#8b5cf6', abilities: ['phase_shift', 'holo_clone']
            },
            cyber_boss: {
                width: 48, height: 60, health: 300, speed: 1,
                attackDamage: 50, attackRange: 80, attackCooldown: 120,
                color: '#991b1b', abilities: ['laser_sweep', 'emp_blast', 'rage_mode']
            }
        };
        
        const config = enemyConfigs[type] || enemyConfigs.cyber_ninja;
        const enemy = {
            type: type,
            x: 800 + Math.random() * 100,
            y: Math.random() * 100 + 150,
            width: config.width,
            height: config.height,
            velocityX: 0,
            velocityY: 0,
            health: config.health,
            maxHealth: config.health,
            speed: config.speed,
            attackDamage: config.attackDamage,
            attackRange: config.attackRange,
            attackCooldown: config.attackCooldown,
            attackTimer: 0,
            facing: -1,
            state: 'idle',
            isAttacking: false,
            attackFrame: 0,
            hitstun: 0,
            abilities: config.abilities,
            abilityTimer: 0,
            animFrame: 0,
            color: config.color,
            lastGroundY: 200
        };
        
        // Special properties for certain enemy types
        if (type === 'holo_assassin') {
            enemy.alpha = 1;
            enemy.invisibleTimer = 0;
        }
        
        if (type === 'cyber_boss') {
            enemy.phase = 1;
            enemy.phaseTimer = 0;
        }
        
        this.enemies.push(enemy);
    }
    
    getWaveData(wave) {
        const waves = {
            1: { enemyCount: 3, enemyTypes: ['cyber_ninja'] },
            2: { enemyCount: 4, enemyTypes: ['cyber_ninja', 'tech_warrior'] },
            3: { enemyCount: 5, enemyTypes: ['tech_warrior', 'mech_fighter'] },
            4: { enemyCount: 6, enemyTypes: ['cyber_ninja', 'tech_warrior', 'holo_assassin'] },
            5: { enemyCount: 1, enemyTypes: ['cyber_boss'] }
        };
        
        return waves[wave] || { 
            enemyCount: Math.min(wave + 2, 8), 
            enemyTypes: ['cyber_ninja', 'tech_warrior', 'mech_fighter', 'holo_assassin'] 
        };
    }
    
    // Input handling
    handleKeyDown(event) {
        this.keys[event.key.toLowerCase()] = true;
        
        // Prevent default for game keys
        if (['w', 'a', 's', 'd', 'j', 'k', 'l', 'u', 'i', 'o', 'p', ' '].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
        
        // Special key actions
        if (event.key.toLowerCase() === 'r' && !this.gameRunning) {
            this.restart();
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }
    
    restart() {
        // Reset game state
        this.gameRunning = true;
        this.score = 0;
        this.currentWave = 1;
        this.waveInProgress = false;
        
        // Reset player
        this.player = {
            x: 100,
            y: 200,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            stamina: 100,
            maxStamina: 100,
            energy: 0,
            maxEnergy: 100,
            facing: 1,
            state: 'idle',
            isAttacking: false,
            attackType: '',
            attackFrame: 0,
            isBlocking: false,
            isInvincible: false,
            invincibilityTimer: 0,
            combo: 0,
            comboTimer: 0,
            animFrame: 0,
            dashCooldown: 0,
            isDashing: false,
            dashFrames: 0,
            lastGroundY: 200
        };
        
        // Clear game objects
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.powerups = [];
        
        // Initialize game
        this.spawnWave();
        this.gameLoop();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        new AnimeStyleGame();
    }
});

// 初始化增强游戏
let enhancedGame;

function initEnhancedGame() {
    enhancedGame = new EnhancedFightingGame('pixelCanvas');
    
    // 添加重启功能
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r' && !enhancedGame.gameRunning) {
            enhancedGame = new EnhancedFightingGame('pixelCanvas');
            enhancedGame.start();
        }
    });
}
