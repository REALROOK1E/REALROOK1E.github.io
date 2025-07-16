// ====== ANIME STYLE FIGHTING GAME ======
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
        const superSampleRatio = 4;
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = baseWidth * superSampleRatio * dpr;
        this.canvas.height = baseHeight * superSampleRatio * dpr;
        this.canvas.style.width = baseWidth + 'px';
        this.canvas.style.height = baseHeight + 'px';
        
        this.ctx.scale(superSampleRatio * dpr, superSampleRatio * dpr);
        this.ctx.imageSmoothingEnabled = false;
        
        this.scaleFactor = superSampleRatio;
        this.renderWidth = baseWidth;
        this.renderHeight = baseHeight;
    }
    
    initGame() {
        this.gameRunning = false;
        this.score = 0;
        this.currentWave = 1;
        this.waveInProgress = false;
        
        this.player = {
            x: 100, y: 200, width: 32, height: 48,
            velocityX: 0, velocityY: 0,
            health: 100, maxHealth: 100,
            mana: 100, maxMana: 100,
            stamina: 100, maxStamina: 100,
            energy: 0, maxEnergy: 100,
            facing: 1, state: 'idle',
            isAttacking: false, attackType: '', attackFrame: 0,
            isBlocking: false, combo: 0, animFrame: 0
        };
        
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.powerups = [];
        this.backgroundEffects = [];
        this.keys = {};
        
        this.initializeBackgroundEffects();
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
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(event) {
        this.keys[event.key.toLowerCase()] = true;
        
        if (['w', 'a', 's', 'd', 'j', 'k', 'l', 'u', 'i', 'o', 'p', ' '].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
        
        if (event.key.toLowerCase() === 'r' && !this.gameRunning) {
            this.restart();
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }
    
    start() {
        this.gameRunning = true;
        this.spawnWave();
        this.gameLoop();
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        this.updatePlayer();
        this.updateEnemies();
        this.updateProjectiles();
        this.updateParticles();
        this.updateCollisions();
        this.updateAnimations();
        this.updateBackgroundEffects();
        
        if (this.player.health <= 0) {
            this.gameOver();
            return;
        }
        
        this.updateWaveSystem();
    }
    
    updatePlayer() {
        this.handleMovement();
        this.handleCombat();
        this.updatePlayerPhysics();
        this.updatePlayerAnimation();
    }
    
    handleMovement() {
        const speed = 4;
        let moving = false;
        
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.velocityX = -speed;
            this.player.facing = -1;
            moving = true;
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.player.velocityX = speed;
            this.player.facing = 1;
            moving = true;
        } else {
            this.player.velocityX *= 0.8;
        }
        
        if (this.keys['w'] || this.keys['arrowup']) {
            if (this.player.y >= this.player.lastGroundY - 5) {
                this.player.velocityY = -12;
            }
        }
        
        this.player.state = moving ? 'walking' : 'idle';
        if (this.player.velocityY !== 0) {
            this.player.state = 'jumping';
        }
    }
    
    handleCombat() {
        if (!this.player.isAttacking) {
            if (this.keys['j']) {
                this.performAttack('light_punch');
            } else if (this.keys['k']) {
                this.performAttack('heavy_punch');
            } else if (this.keys['l']) {
                this.performAttack('light_kick');
            } else if (this.keys['u']) {
                this.performAttack('heavy_kick');
            } else if (this.keys['i'] && this.player.mana >= 30) {
                this.performAttack('special');
            } else if (this.keys['o'] && this.player.energy >= 100) {
                this.performAttack('ultimate');
            }
        }
        
        this.player.isBlocking = this.keys['p'];
        
        if (this.player.isAttacking) {
            this.player.attackFrame++;
            if (this.player.attackFrame > 30) {
                this.player.isAttacking = false;
                this.player.attackFrame = 0;
            }
        }
        
        if (this.player.combo > 0) {
            this.player.comboTimer++;
            if (this.player.comboTimer > 120) {
                this.player.combo = 0;
                this.player.comboTimer = 0;
            }
        }
    }
    
    performAttack(attackType) {
        this.player.isAttacking = true;
        this.player.attackType = attackType;
        this.player.attackFrame = 0;
        
        const damages = {
            light_punch: 15,
            heavy_punch: 25,
            light_kick: 20,
            heavy_kick: 30,
            special: 40,
            ultimate: 80
        };
        
        const ranges = {
            light_punch: 40,
            heavy_punch: 45,
            light_kick: 50,
            heavy_kick: 55,
            special: 100,
            ultimate: 150
        };
        
        if (attackType === 'special') {
            this.player.mana -= 30;
            this.createProjectile(this.player.x + this.player.width/2, 
                               this.player.y + this.player.height/2, 
                               this.player.facing * 8, 0, damages[attackType]);
        } else if (attackType === 'ultimate') {
            this.player.energy = 0;
            this.createUltimateEffect();
        }
        
        this.checkAttackHit(attackType, damages[attackType], ranges[attackType]);
    }
    
    checkAttackHit(attackType, damage, range) {
        this.enemies.forEach((enemy, index) => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < range && 
                ((this.player.facing > 0 && enemy.x > this.player.x) || 
                 (this.player.facing < 0 && enemy.x < this.player.x))) {
                
                this.damageEnemy(enemy, damage);
                this.createHitEffect(enemy.x, enemy.y);
                
                this.player.combo++;
                this.player.comboTimer = 0;
                this.player.energy = Math.min(this.player.energy + 10, this.player.maxEnergy);
                this.score += damage * this.player.combo;
            }
        });
    }
    
    createProjectile(x, y, vx, vy, damage) {
        this.projectiles.push({
            x: x, y: y,
            velocityX: vx, velocityY: vy,
            width: 8, height: 8,
            damage: damage,
            color: '#00d4ff',
            trail: true
        });
    }
    
    createUltimateEffect() {
        this.enemies.forEach(enemy => {
            this.damageEnemy(enemy, 80);
            this.createHitEffect(enemy.x, enemy.y);
        });
        
        for (let i = 0; i < 20; i++) {
            this.createParticle(
                this.player.x + Math.random() * 100 - 50,
                this.player.y + Math.random() * 100 - 50,
                '#ffff00', 30
            );
        }
    }
    
    createHitEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.createParticle(x + Math.random() * 20 - 10, 
                              y + Math.random() * 20 - 10, 
                              '#ff0066', 15);
        }
    }
    
    createParticle(x, y, color, life) {
        this.particles.push({
            x: x, y: y,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: (Math.random() - 0.5) * 4,
            color: color,
            life: life,
            maxLife: life,
            size: Math.random() * 4 + 2,
            alpha: 1
        });
    }
    
    updatePlayerPhysics() {
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        this.player.velocityY += 0.8; // gravity
        
        if (this.player.y > this.player.lastGroundY) {
            this.player.y = this.player.lastGroundY;
            this.player.velocityY = 0;
        }
        
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > 900 - this.player.width) this.player.x = 900 - this.player.width;
    }
    
    updatePlayerAnimation() {
        this.player.animFrame++;
        
        if (this.player.stamina < this.player.maxStamina) {
            this.player.stamina += 0.5;
        }
        if (this.player.mana < this.player.maxMana) {
            this.player.mana += 0.3;
        }
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            this.updateEnemyAI(enemy);
            this.updateEnemyPhysics(enemy);
            
            if (enemy.health <= 0) {
                this.score += 100;
                this.enemies.splice(index, 1);
            }
        });
    }
    
    updateEnemyAI(enemy) {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
            enemy.velocityX = dx > 0 ? 2 : -2;
            enemy.facing = dx > 0 ? 1 : -1;
        } else {
            enemy.velocityX = 0;
            if (enemy.attackTimer <= 0) {
                this.enemyAttack(enemy);
                enemy.attackTimer = 60;
            }
        }
        
        if (enemy.attackTimer > 0) {
            enemy.attackTimer--;
        }
    }
    
    enemyAttack(enemy) {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
            if (!this.player.isBlocking) {
                this.player.health -= enemy.attackDamage || 10;
                this.createHitEffect(this.player.x, this.player.y);
            }
        }
    }
    
    updateEnemyPhysics(enemy) {
        enemy.x += enemy.velocityX;
        enemy.y += enemy.velocityY;
        
        enemy.velocityY += 0.8;
        
        if (enemy.y > 200) {
            enemy.y = 200;
            enemy.velocityY = 0;
        }
        
        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x > 900 - enemy.width) enemy.x = 900 - enemy.width;
    }
    
    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        enemy.hitstun = 10;
    }
    
    updateProjectiles() {
        this.projectiles.forEach((projectile, index) => {
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;
            
            if (projectile.x < 0 || projectile.x > 900 || 
                projectile.y < 0 || projectile.y > 300) {
                this.projectiles.splice(index, 1);
                return;
            }
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(projectile, enemy)) {
                    this.damageEnemy(enemy, projectile.damage);
                    this.createHitEffect(enemy.x, enemy.y);
                    this.projectiles.splice(index, 1);
                }
            });
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateCollisions() {
        // Player-enemy collision for basic melee
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                if (!this.player.isBlocking && !this.player.isAttacking) {
                    // Simple push back
                    const dx = this.player.x - enemy.x;
                    this.player.x += dx > 0 ? 5 : -5;
                }
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    updateAnimations() {
        this.player.animFrame++;
        this.enemies.forEach(enemy => {
            enemy.animFrame = (enemy.animFrame || 0) + 1;
        });
    }
    
    updateBackgroundEffects() {
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
    
    spawnEnemy(type) {
        const enemyConfigs = {
            cyber_ninja: {
                width: 24, height: 32, health: 60, speed: 3,
                attackDamage: 15, attackRange: 40, attackCooldown: 60,
                color: '#1a1a2e'
            },
            tech_warrior: {
                width: 28, height: 36, health: 100, speed: 2,
                attackDamage: 25, attackRange: 50, attackCooldown: 80,
                color: '#2563eb'
            },
            mech_fighter: {
                width: 36, height: 44, health: 150, speed: 1.5,
                attackDamage: 35, attackRange: 60, attackCooldown: 100,
                color: '#4b5563'
            },
            holo_assassin: {
                width: 22, height: 30, health: 80, speed: 3.5,
                attackDamage: 20, attackRange: 35, attackCooldown: 70,
                color: '#8b5cf6'
            },
            cyber_boss: {
                width: 48, height: 60, health: 300, speed: 1,
                attackDamage: 50, attackRange: 80, attackCooldown: 120,
                color: '#991b1b'
            }
        };
        
        const config = enemyConfigs[type] || enemyConfigs.cyber_ninja;
        const enemy = {
            type: type,
            x: 800 + Math.random() * 100,
            y: 200,
            width: config.width,
            height: config.height,
            velocityX: 0,
            velocityY: 0,
            health: config.health,
            maxHealth: config.health,
            speed: config.speed,
            attackDamage: config.attackDamage,
            attackRange: config.attackRange,
            attackTimer: 0,
            facing: -1,
            state: 'idle',
            animFrame: 0,
            color: config.color,
            hitstun: 0
        };
        
        this.enemies.push(enemy);
    }
    
    // ====== RENDERING METHODS ======
    
    render() {
        this.ctx.clearRect(0, 0, 900, 300);
        this.renderBackground();
        this.renderPlayer();
        this.renderEnemies();
        this.renderProjectiles();
        this.renderParticles();
        this.renderUI();
    }
    
    renderBackground() {
        // 赛博朋克背景渐变
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, 300);
        bgGradient.addColorStop(0, '#0f0f23');
        bgGradient.addColorStop(0.3, '#1a1a2e');
        bgGradient.addColorStop(0.7, '#16213e');
        bgGradient.addColorStop(1, '#0f3460');
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, 900, 300);
        
        // 城市天际线
        this.renderCityscape();
        
        // 背景特效
        this.renderBackgroundEffects();
        
        // 地面
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 270, 900, 30);
        
        // 地面霓虹线条
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(0, 270, 900, 2);
    }
    
    renderCityscape() {
        // 远景建筑
        for (let i = 0; i < 10; i++) {
            const buildingHeight = 80 + Math.random() * 120;
            const buildingWidth = 60 + Math.random() * 40;
            const x = i * 90 + Math.random() * 20;
            
            // 建筑主体
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(x, 270 - buildingHeight, buildingWidth, buildingHeight);
            
            // 建筑窗户
            this.ctx.fillStyle = Math.random() > 0.7 ? '#00d4ff' : '#333333';
            for (let j = 0; j < buildingHeight; j += 20) {
                for (let k = 0; k < buildingWidth; k += 15) {
                    if (Math.random() > 0.6) {
                        this.ctx.fillRect(x + k + 2, 270 - buildingHeight + j + 2, 8, 8);
                    }
                }
            }
        }
    }
    
    renderBackgroundEffects() {
        this.backgroundEffects.forEach(effect => {
            if (effect.type === 'floating_data') {
                this.ctx.fillStyle = effect.color;
                this.ctx.globalAlpha = 0.6;
                this.ctx.fillRect(effect.x, effect.y, effect.size, effect.size);
                this.ctx.globalAlpha = 1;
            } else if (effect.type === 'building_glow') {
                this.ctx.fillStyle = effect.color;
                this.ctx.globalAlpha = 0.3 * effect.intensity;
                this.ctx.fillRect(effect.x, effect.y, 20, 60);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderPlayer() {
        const p = this.player;
        
        // 能量光环
        if (p.energy > 80) {
            const auraIntensity = (p.energy - 80) / 20;
            this.ctx.globalAlpha = 0.3 * auraIntensity;
            
            const auraGradient = this.ctx.createRadialGradient(
                p.x + p.width/2, p.y + p.height/2, 0,
                p.x + p.width/2, p.y + p.height/2, 40
            );
            auraGradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
            auraGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
            
            this.ctx.fillStyle = auraGradient;
            this.ctx.fillRect(p.x - 20, p.y - 20, p.width + 40, p.height + 40);
            this.ctx.globalAlpha = 1;
        }
        
        // 日系动漫角色渲染
        this.renderAnimeCharacter(p);
        
        // 攻击特效
        if (p.isAttacking) {
            const effectOpacity = 1 - (p.attackFrame / 30);
            this.ctx.globalAlpha = effectOpacity;
            
            const effectX = p.x + (p.facing > 0 ? p.width : -20);
            const effectY = p.y + p.height/2 - 10;
            
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
    
    renderAnimeCharacter(p) {
        // 头部
        this.renderAnimeHead(p);
        
        // 躯干
        this.renderAnimeTorso(p);
        
        // 手臂
        this.renderAnimeArms(p);
        
        // 腿部
        this.renderAnimeLegs(p);
    }
    
    renderAnimeHead(p) {
        const headX = p.x + 8;
        const headY = p.y;
        const headW = 16;
        const headH = 18;
        
        // 脸部轮廓
        const faceGradient = this.ctx.createRadialGradient(
            headX + headW/2, headY + headH/2, 0,
            headX + headW/2, headY + headH/2, headW/2
        );
        faceGradient.addColorStop(0, '#ffe4c4');
        faceGradient.addColorStop(1, '#ffd7b3');
        
        this.ctx.fillStyle = faceGradient;
        this.ctx.fillRect(headX, headY + 2, headW, headH - 4);
        
        // 头发 - 尖锐的日系风格
        this.ctx.fillStyle = '#2d1b69';
        // 主要头发块
        this.ctx.fillRect(headX - 2, headY, headW + 4, 12);
        // 尖锐的刘海
        for (let i = 0; i < 4; i++) {
            this.ctx.fillRect(headX + i * 4, headY - 2 - Math.random() * 3, 3, 4 + Math.random() * 2);
        }
        // 侧面头发
        this.ctx.fillRect(headX - 3, headY + 2, 2, 8);
        this.ctx.fillRect(headX + headW + 1, headY + 2, 2, 8);
        
        // 眼睛 - 大眼睛动漫风格
        const eyeY = headY + 6;
        
        // 左眼
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(headX + 3, eyeY, 4, 3);
        this.ctx.fillStyle = '#4169e1';
        this.ctx.fillRect(headX + 4, eyeY, 2, 2);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(headX + 4, eyeY, 1, 2);
        
        // 右眼
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(headX + 9, eyeY, 4, 3);
        this.ctx.fillStyle = '#4169e1';
        this.ctx.fillRect(headX + 10, eyeY, 2, 2);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(headX + 11, eyeY, 1, 2);
        
        // 鼻子
        this.ctx.fillStyle = '#e6b899';
        this.ctx.fillRect(headX + 7, eyeY + 4, 1, 1);
        
        // 嘴巴
        this.ctx.fillStyle = '#d2691e';
        this.ctx.fillRect(headX + 6, eyeY + 6, 3, 1);
    }
    
    renderAnimeTorso(p) {
        const torsoX = p.x + 6;
        const torsoY = p.y + 18;
        const torsoW = 20;
        const torsoH = 16;
        
        // 战斗服装渐变
        const torsoGradient = this.ctx.createLinearGradient(torsoX, torsoY, torsoX, torsoY + torsoH);
        torsoGradient.addColorStop(0, '#1e40af');
        torsoGradient.addColorStop(0.5, '#1d4ed8');
        torsoGradient.addColorStop(1, '#1e3a8a');
        
        this.ctx.fillStyle = torsoGradient;
        this.ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
        
        // 护甲细节
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(torsoX + 2, torsoY + 2, torsoW - 4, 2);
        this.ctx.fillRect(torsoX + 4, torsoY + 6, torsoW - 8, 1);
        
        // 科技发光线条
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillRect(torsoX + 8, torsoY + 4, 4, 1);
        this.ctx.fillRect(torsoX + 3, torsoY + 10, 2, 1);
        this.ctx.fillRect(torsoX + 15, torsoY + 10, 2, 1);
    }
    
    renderAnimeArms(p) {
        const armW = 6;
        const armH = 16;
        const shoulderY = p.y + 18;
        
        let leftArmX, rightArmX, leftArmY, rightArmY;
        
        if (p.isAttacking) {
            // 攻击动作
            leftArmX = p.x + (p.facing > 0 ? 26 : -8);
            leftArmY = shoulderY - 2;
            rightArmX = p.x + (p.facing > 0 ? -2 : 28);
            rightArmY = shoulderY + 2;
        } else if (p.state === 'walking') {
            // 行走动画
            const walkCycle = Math.sin(p.animFrame * 0.3);
            leftArmX = p.x + (p.facing > 0 ? -1 : 27);
            leftArmY = shoulderY + walkCycle * 2;
            rightArmX = p.x + (p.facing > 0 ? 27 : -1);
            rightArmY = shoulderY - walkCycle * 2;
        } else {
            // 待机状态
            leftArmX = p.x + (p.facing > 0 ? -1 : 27);
            leftArmY = shoulderY;
            rightArmX = p.x + (p.facing > 0 ? 27 : -1);
            rightArmY = shoulderY;
        }
        
        // 皮肤色
        this.ctx.fillStyle = '#ffe4c4';
        this.ctx.fillRect(leftArmX, leftArmY, armW, armH);
        this.ctx.fillRect(rightArmX, rightArmY, armW, armH);
        
        // 护具
        this.ctx.fillStyle = '#1e40af';
        this.ctx.fillRect(leftArmX, leftArmY + armH - 4, armW, 3);
        this.ctx.fillRect(rightArmX, rightArmY + armH - 4, armW, 3);
    }
    
    renderAnimeLegs(p) {
        const legW = 8;
        const legH = 18;
        const hipY = p.y + 34;
        
        let leftLegX, rightLegX, leftLegY, rightLegY;
        
        if (p.state === 'walking') {
            // 行走动画
            const walkCycle = Math.sin(p.animFrame * 0.4);
            leftLegX = p.x + 8;
            leftLegY = hipY + Math.abs(walkCycle);
            rightLegX = p.x + 16;
            rightLegY = hipY + Math.abs(-walkCycle);
        } else {
            // 待机状态
            leftLegX = p.x + 8;
            leftLegY = hipY;
            rightLegX = p.x + 16;
            rightLegY = hipY;
        }
        
        // 裤子
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(leftLegX, leftLegY, legW, legH - 5);
        this.ctx.fillRect(rightLegX, rightLegY, legW, legH - 5);
        
        // 战斗靴
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(leftLegX, leftLegY + legH - 6, legW + 2, 5);
        this.ctx.fillRect(rightLegX, rightLegY + legH - 6, legW + 2, 5);
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            const isFlashing = enemy.hitstun > 0 && enemy.hitstun % 4 < 2;
            if (isFlashing) this.ctx.globalAlpha = 0.7;
            
            // 简化的敌人渲染
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 敌人眼睛
            this.ctx.fillStyle = '#ff0066';
            this.ctx.fillRect(enemy.x + 4, enemy.y + 3, 2, 2);
            this.ctx.fillRect(enemy.x + enemy.width - 6, enemy.y + 3, 2, 2);
            
            // 血条
            const healthRatio = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
            this.ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthRatio, 4);
            
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderProjectiles() {
        this.projectiles.forEach(projectile => {
            this.ctx.fillStyle = projectile.color || '#ffff00';
            this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
            
            if (projectile.trail) {
                this.ctx.fillStyle = projectile.color || '#ffff00';
                this.ctx.globalAlpha = 0.6;
                this.ctx.fillRect(
                    projectile.x - projectile.velocityX * 0.5,
                    projectile.y - projectile.velocityY * 0.5,
                    projectile.width, projectile.height
                );
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
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
        
        // Energy bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 75, 154, 18);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(22, 77, 150 * (this.player.energy / this.player.maxEnergy), 14);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`EN: ${Math.floor(this.player.energy)}`, 25, 88);
        
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
        this.ctx.fillText(`Wave: ${this.currentWave}`, 700, 50);
        
        // Controls
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('WASD: Move | J/K: Light | L/U: Heavy | I: Special | O: Ultimate | P: Block', 20, 280);
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
    
    restart() {
        this.gameRunning = true;
        this.score = 0;
        this.currentWave = 1;
        this.waveInProgress = false;
        
        this.player = {
            x: 100, y: 200, width: 32, height: 48,
            velocityX: 0, velocityY: 0,
            health: 100, maxHealth: 100,
            mana: 100, maxMana: 100,
            stamina: 100, maxStamina: 100,
            energy: 0, maxEnergy: 100,
            facing: 1, state: 'idle',
            isAttacking: false, attackType: '', attackFrame: 0,
            isBlocking: false, combo: 0, animFrame: 0
        };
        
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
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
