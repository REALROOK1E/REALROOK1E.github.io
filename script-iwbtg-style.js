// ====== I WANNA BE THE GUY STYLE GAME ======
// 🍎 惊喜陷阱与极限操作的平台游戏

class IWannaBeTheGuyGame {
    constructor() {
        console.log('Initializing IWBTG Game...');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        console.log('Canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            return;
        }
        console.log('2D context obtained');
        
        this.setupCanvas();
        this.initGame();
        this.setupEventListeners();
        this.start();
        console.log('IWBTG Game initialization complete!');
    }
    
    setupCanvas() {
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
        
        this.renderWidth = baseWidth;
        this.renderHeight = baseHeight;
    }
    
    initGame() {
        this.gameRunning = false;
        this.deathCount = 0;
        this.currentLevel = 1;
        this.cameraX = 0;
        this.screenShake = 0;
        
        // 玩家
        this.player = {
            x: 50, y: 200, width: 20, height: 24,
            velocityX: 0, velocityY: 0,
            onGround: false, canJump: true,
            facing: 1, state: 'idle',
            animFrame: 0, health: 1, // IWBTG style - one hit death!
            invulnerable: 0, deathAnimation: 0,
            isDead: false
        };
        
        // 游戏对象
        this.platforms = [];
        this.traps = [];
        this.collectibles = [];
        this.particles = [];
        this.backgroundElements = [];
        this.surpriseEvents = [];
        
        // 输入
        this.keys = {};
        this.keyPressed = {}; // For single key press detection
        
        this.initLevel();
        this.initNatureBackground();
        this.initSurpriseSystem();
    }
    
    initLevel() {
        // 基础平台
        this.platforms = [
            // 地面
            {x: 0, y: 270, width: 200, height: 30, type: 'grass'},
            {x: 250, y: 270, width: 150, height: 30, type: 'grass'},
            {x: 450, y: 270, width: 200, height: 30, type: 'grass'},
            {x: 700, y: 270, width: 200, height: 30, type: 'grass'},
            
            // 跳跃平台
            {x: 200, y: 220, width: 50, height: 15, type: 'wood', trap: 'falling'},
            {x: 400, y: 180, width: 50, height: 15, type: 'wood'},
            {x: 320, y: 140, width: 40, height: 15, type: 'stone'},
            {x: 480, y: 140, width: 60, height: 15, type: 'wood', trap: 'spikes'},
            {x: 600, y: 100, width: 50, height: 15, type: 'wood'},
            {x: 750, y: 180, width: 50, height: 15, type: 'wood', trap: 'vanish'},
            
            // 隐藏/假平台
            {x: 550, y: 200, width: 40, height: 15, type: 'fake'},
            {x: 680, y: 160, width: 30, height: 15, type: 'invisible'},
        ];
        
        // 陷阱系统
        this.traps = [
            // 苹果陷阱 (IWBTG经典)
            {type: 'apple', x: 100, y: -20, width: 16, height: 16, active: false, trigger: 80},
            {type: 'apple', x: 300, y: -20, width: 16, height: 16, active: false, trigger: 250},
            {type: 'apple', x: 500, y: -20, width: 16, height: 16, active: false, trigger: 450},
            
            // 樱桃炸弹
            {type: 'cherry', x: 400, y: 160, width: 12, height: 12, timer: 0, exploding: false},
            {type: 'cherry', x: 600, y: 80, width: 12, height: 12, timer: 0, exploding: false},
            
            // 倒刺陷阱
            {type: 'spikes', x: 220, y: 255, width: 30, height: 15, active: false},
            {type: 'spikes', x: 480, y: 125, width: 60, height: 15, active: false},
            
            // 移动锯片
            {type: 'saw', x: 350, y: 200, width: 20, height: 20, direction: 1, speed: 2},
            {type: 'saw', x: 650, y: 150, width: 20, height: 20, direction: -1, speed: 1.5},
            
            // 假币陷阱 (看起来是好东西)
            {type: 'fake_coin', x: 550, y: 185, width: 12, height: 12, collected: false},
        ];
        
        // 收集品
        this.collectibles = [
            {type: 'save_point', x: 50, y: 240, width: 20, height: 20, active: true},
            {type: 'coin', x: 150, y: 190, width: 12, height: 12, collected: false},
            {type: 'coin', x: 420, y: 150, width: 12, height: 12, collected: false},
            {type: 'save_point', x: 800, y: 240, width: 20, height: 20, active: true},
        ];
    }
    
    initNatureBackground() {
        this.backgroundElements = [];
        
        // 天空渐变会在render中绘制
        
        // 云朵
        for (let i = 0; i < 8; i++) {
            this.backgroundElements.push({
                type: 'cloud',
                x: Math.random() * 1000,
                y: Math.random() * 60 + 20,
                size: Math.random() * 30 + 20,
                speed: Math.random() * 0.3 + 0.1
            });
        }
        
        // 山脉
        for (let i = 0; i < 5; i++) {
            this.backgroundElements.push({
                type: 'mountain',
                x: i * 200 + Math.random() * 50,
                y: 180 + Math.random() * 30,
                width: 150 + Math.random() * 100,
                height: 80 + Math.random() * 40,
                color: `hsl(${120 + Math.random() * 60}, 30%, ${30 + Math.random() * 20}%)`
            });
        }
        
        // 树木
        for (let i = 0; i < 12; i++) {
            this.backgroundElements.push({
                type: 'tree',
                x: Math.random() * 900,
                y: 220 + Math.random() * 30,
                height: 40 + Math.random() * 30,
                dangerous: Math.random() < 0.3 // 30% chance to be dangerous
            });
        }
        
        // 花朵 (有些是陷阱)
        for (let i = 0; i < 15; i++) {
            this.backgroundElements.push({
                type: 'flower',
                x: Math.random() * 900,
                y: 260 + Math.random() * 10,
                color: `hsl(${Math.random() * 360}, 60%, 60%)`,
                dangerous: Math.random() < 0.2, // 20% chance to be trap
                triggered: false
            });
        }
    }
    
    initSurpriseSystem() {
        this.surpriseEvents = [
            // 苹果掉落事件
            {type: 'apple_rain', trigger: 'time', time: 300, activated: false},
            {type: 'apple_rain', trigger: 'time', time: 800, activated: false},
            
            // 平台消失事件
            {type: 'platform_vanish', trigger: 'position', x: 750, activated: false},
            
            // 假地面事件
            {type: 'fake_ground', trigger: 'position', x: 400, activated: false},
            
            // 重力反转 (短暂)
            {type: 'gravity_flip', trigger: 'cherry_explode', duration: 180, activated: false},
            
            // 屏幕抖动
            {type: 'screen_shake', trigger: 'death', intensity: 20, activated: false}
        ];
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        if (!this.keys[key]) {
            this.keyPressed[key] = true;
        }
        this.keys[key] = true;
        
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', ' '].includes(key)) {
            event.preventDefault();
        }
        
        if (key === 'r' && this.player.isDead) {
            this.respawn();
        }
    }
    
    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
        this.keyPressed[key] = false;
    }
    
    start() {
        console.log('Starting IWBTG game...');
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.ctx) {
            console.error('No context available for rendering!');
            return;
        }
        
        this.update();
        this.render();
        
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        if (!this.player.isDead) {
            this.updatePlayer();
            this.updateTraps();
            this.updateSurpriseEvents();
            this.updateParticles();
            this.updateBackground();
            this.checkCollisions();
        } else {
            this.updateDeathAnimation();
        }
        
        this.updateCamera();
        if (this.screenShake > 0) {
            this.screenShake--;
        }
    }
    
    updatePlayer() {
        this.handlePlayerInput();
        this.updatePlayerPhysics();
        this.updatePlayerAnimation();
        
        if (this.player.invulnerable > 0) {
            this.player.invulnerable--;
        }
    }
    
    handlePlayerInput() {
        const speed = 3;
        let moving = false;
        
        // 左右移动
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.velocityX = -speed;
            this.player.facing = -1;
            moving = true;
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.player.velocityX = speed;
            this.player.facing = 1;
            moving = true;
        } else {
            this.player.velocityX *= 0.8; // 摩擦力
        }
        
        // 跳跃 - IWBTG style precise jumping
        if ((this.keys['w'] || this.keys['arrowup'] || this.keys[' ']) && (this.keyPressed['w'] || this.keyPressed['arrowup'] || this.keyPressed[' '])) {
            if (this.player.onGround || this.player.canJump) {
                this.player.velocityY = -12;
                this.player.canJump = false;
                this.createJumpEffect();
            }
            this.keyPressed['w'] = false;
            this.keyPressed['arrowup'] = false;
            this.keyPressed[' '] = false;
        }
        
        this.player.state = moving ? 'walking' : 'idle';
        if (this.player.velocityY !== 0) {
            this.player.state = 'jumping';
        }
    }
    
    updatePlayerPhysics() {
        // 移动
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // 重力
        this.player.velocityY += 0.7;
        
        // 平台碰撞检测
        this.player.onGround = false;
        this.platforms.forEach(platform => {
            if (platform.type === 'fake' || platform.type === 'invisible') return;
            
            if (this.checkPlatformCollision(this.player, platform)) {
                if (this.player.velocityY > 0) { // 向下移动时
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                    this.player.canJump = true;
                    
                    // 检查平台陷阱
                    this.checkPlatformTraps(platform);
                }
            }
        });
        
        // 边界检查
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > 880) this.player.x = 880;
        
        // 掉出地图死亡
        if (this.player.y > 320) {
            this.killPlayer('fell');
        }
    }
    
    checkPlatformCollision(player, platform) {
        return player.x < platform.x + platform.width &&
               player.x + player.width > platform.x &&
               player.y < platform.y + platform.height &&
               player.y + player.height > platform.y &&
               player.y < platform.y; // 只有从上方接触才算碰撞
    }
    
    checkPlatformTraps(platform) {
        if (platform.trap === 'falling') {
            // 平台会掉落
            setTimeout(() => {
                platform.falling = true;
                platform.fallSpeed = 0;
            }, 500);
        } else if (platform.trap === 'spikes') {
            // 尖刺伸出
            setTimeout(() => {
                this.activateSpikes(platform.x, platform.y - 15);
            }, 200);
        } else if (platform.trap === 'vanish') {
            // 平台消失
            setTimeout(() => {
                platform.vanished = true;
            }, 1000);
        }
    }
    
    updatePlayerAnimation() {
        this.player.animFrame++;
    }
    
    updateTraps() {
        this.traps.forEach((trap, index) => {
            switch (trap.type) {
                case 'apple':
                    this.updateAppleTrap(trap);
                    break;
                case 'cherry':
                    this.updateCherryTrap(trap);
                    break;
                case 'saw':
                    this.updateSawTrap(trap);
                    break;
                case 'spikes':
                    this.updateSpikesTrap(trap);
                    break;
                case 'fake_coin':
                    this.updateFakeCoinTrap(trap);
                    break;
            }
        });
        
        // 更新掉落平台
        this.platforms.forEach(platform => {
            if (platform.falling) {
                platform.fallSpeed += 0.5;
                platform.y += platform.fallSpeed;
            }
        });
    }
    
    updateAppleTrap(trap) {
        if (!trap.active && this.player.x > trap.trigger - 20 && this.player.x < trap.trigger + 20) {
            trap.active = true;
            trap.velocityY = 0;
        }
        
        if (trap.active) {
            trap.y += trap.velocityY;
            trap.velocityY += 0.5; // 重力
            
            // 检查与玩家碰撞
            if (this.checkCollision(this.player, trap)) {
                this.killPlayer('apple');
            }
            
            // 掉出屏幕后重置
            if (trap.y > 320) {
                trap.y = -20;
                trap.active = false;
            }
        }
    }
    
    updateCherryTrap(trap) {
        if (this.checkCollision(this.player, trap) && !trap.exploding) {
            trap.exploding = true;
            trap.timer = 60; // 1秒后爆炸
        }
        
        if (trap.exploding) {
            trap.timer--;
            if (trap.timer <= 0) {
                this.explodeCherry(trap);
            }
        }
    }
    
    explodeCherry(trap) {
        // 创建爆炸效果
        for (let i = 0; i < 20; i++) {
            this.createParticle(
                trap.x + Math.random() * 20,
                trap.y + Math.random() * 20,
                '#ff4444', 30
            );
        }
        
        // 检查爆炸范围内的玩家
        const explosionRange = 50;
        const dx = this.player.x - trap.x;
        const dy = this.player.y - trap.y;
        if (Math.sqrt(dx * dx + dy * dy) < explosionRange) {
            this.killPlayer('explosion');
        }
        
        // 触发重力反转惊喜
        this.triggerSurprise('cherry_explode');
        
        // 重置樱桃
        trap.exploding = false;
        trap.timer = 0;
    }
    
    updateSawTrap(trap) {
        trap.x += trap.direction * trap.speed;
        
        // 边界反弹
        if (trap.x < 0 || trap.x > 880) {
            trap.direction *= -1;
        }
        
        // 检查与玩家碰撞
        if (this.checkCollision(this.player, trap)) {
            this.killPlayer('saw');
        }
    }
    
    updateSpikesTrap(trap) {
        if (trap.active && this.checkCollision(this.player, trap)) {
            this.killPlayer('spikes');
        }
    }
    
    updateFakeCoinTrap(trap) {
        if (!trap.collected && this.checkCollision(this.player, trap)) {
            trap.collected = true;
            // 假币陷阱 - 触发苹果雨
            this.triggerAppleRain();
        }
    }
    
    activateSpikes(x, y) {
        this.traps.forEach(trap => {
            if (trap.type === 'spikes' && Math.abs(trap.x - x) < 30) {
                trap.active = true;
                setTimeout(() => {
                    trap.active = false;
                }, 2000);
            }
        });
    }
    
    updateSurpriseEvents() {
        this.surpriseEvents.forEach(event => {
            if (event.activated) return;
            
            switch (event.trigger) {
                case 'time':
                    if (this.player.animFrame > event.time) {
                        this.triggerSurprise(event.type);
                        event.activated = true;
                    }
                    break;
                case 'position':
                    if (this.player.x > event.x - 20 && this.player.x < event.x + 20) {
                        this.triggerSurprise(event.type);
                        event.activated = true;
                    }
                    break;
            }
        });
    }
    
    triggerSurprise(type) {
        switch (type) {
            case 'apple_rain':
                this.triggerAppleRain();
                break;
            case 'platform_vanish':
                this.platforms.forEach(platform => {
                    if (platform.x > 740 && platform.x < 760) {
                        platform.vanished = true;
                    }
                });
                break;
            case 'gravity_flip':
                // 短暂重力反转
                setTimeout(() => {
                    this.player.velocityY = -8;
                }, 500);
                break;
            case 'cherry_explode':
                // 触发更多樱桃
                break;
        }
    }
    
    triggerAppleRain() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.traps.push({
                    type: 'apple',
                    x: Math.random() * 800 + 50,
                    y: -20,
                    width: 16, height: 16,
                    active: true,
                    velocityY: Math.random() * 3 + 2
                });
            }, i * 200);
        }
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
    
    updateBackground() {
        this.backgroundElements.forEach(element => {
            if (element.type === 'cloud') {
                element.x += element.speed;
                if (element.x > 950) {
                    element.x = -50;
                }
            } else if (element.type === 'flower' && element.dangerous) {
                // 危险花朵检测
                if (!element.triggered && this.checkCollision(this.player, {
                    x: element.x - 5, y: element.y - 5, width: 10, height: 10
                })) {
                    element.triggered = true;
                    this.createParticle(element.x, element.y, '#ff0066', 20);
                    this.killPlayer('flower');
                }
            }
        });
    }
    
    checkCollisions() {
        // 收集品碰撞
        this.collectibles.forEach(item => {
            if (item.type === 'save_point' && this.checkCollision(this.player, item)) {
                this.saveGame();
            } else if (item.type === 'coin' && !item.collected && this.checkCollision(this.player, item)) {
                item.collected = true;
                this.createParticle(item.x, item.y, '#ffdd00', 20);
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    killPlayer(cause) {
        if (this.player.invulnerable > 0) return;
        
        this.player.isDead = true;
        this.player.deathAnimation = 60;
        this.deathCount++;
        this.screenShake = 20;
        
        // 死亡特效
        for (let i = 0; i < 15; i++) {
            this.createParticle(
                this.player.x + Math.random() * 20,
                this.player.y + Math.random() * 20,
                '#ff0000', 30
            );
        }
        
        console.log(`Death ${this.deathCount}: ${cause}`);
    }
    
    updateDeathAnimation() {
        this.player.deathAnimation--;
        if (this.player.deathAnimation <= 0) {
            // Auto respawn after animation
            this.respawn();
        }
    }
    
    respawn() {
        this.player.isDead = false;
        this.player.deathAnimation = 0;
        this.player.x = 50;
        this.player.y = 200;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.invulnerable = 120; // 2秒无敌时间
        
        // 重置一些陷阱状态
        this.traps.forEach(trap => {
            if (trap.type === 'apple') {
                trap.active = false;
                trap.y = -20;
            } else if (trap.type === 'cherry') {
                trap.exploding = false;
                trap.timer = 0;
            }
        });
        
        // 重置平台
        this.platforms.forEach(platform => {
            platform.falling = false;
            platform.vanished = false;
        });
    }
    
    saveGame() {
        // IWBTG风格的存档点
        this.createParticle(this.player.x, this.player.y, '#00ff00', 40);
    }
    
    createParticle(x, y, color, life) {
        this.particles.push({
            x: x, y: y,
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: (Math.random() - 0.5) * 6,
            color: color,
            life: life,
            maxLife: life,
            size: Math.random() * 4 + 2,
            alpha: 1
        });
    }
    
    createJumpEffect() {
        for (let i = 0; i < 5; i++) {
            this.createParticle(
                this.player.x + Math.random() * 20,
                this.player.y + this.player.height,
                '#ffffff', 15
            );
        }
    }
    
    updateCamera() {
        // 简单的相机跟随
        const targetCameraX = this.player.x - 450;
        this.cameraX += (targetCameraX - this.cameraX) * 0.1;
        
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > 0) this.cameraX = 0; // 单屏游戏
    }
    
    // ====== RENDERING METHODS ======
    
    render() {
        if (!this.ctx) return;
        
        try {
            this.ctx.save();
            
            // 屏幕震动效果
            if (this.screenShake > 0) {
                this.ctx.translate(
                    (Math.random() - 0.5) * this.screenShake,
                    (Math.random() - 0.5) * this.screenShake
                );
            }
            
            // 清除画布
            this.ctx.clearRect(0, 0, 900, 300);
            
            // 渲染所有元素
            this.renderBackground();
            this.renderPlatforms();
            this.renderTraps();
            this.renderCollectibles();
            this.renderPlayer();
            this.renderParticles();
            this.renderUI();
            
            this.ctx.restore();
        } catch (error) {
            console.error('Render error:', error);
        }
    }
    
    renderBackground() {
        try {
            // 天空渐变 (自然风景)
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, 300);
            skyGradient.addColorStop(0, '#87CEEB'); // 天空蓝
            skyGradient.addColorStop(0.7, '#98FB98'); // 浅绿
            skyGradient.addColorStop(1, '#90EE90'); // 浅绿
            
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, 900, 300);
            
            // 简单的地面
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(0, 270, 900, 30);
            
            // 渲染背景元素（如果存在）
            if (this.backgroundElements && this.backgroundElements.length > 0) {
                this.backgroundElements.forEach(element => {
                    try {
                        switch (element.type) {
                            case 'cloud':
                                this.renderCloud(element);
                                break;
                            case 'mountain':
                                this.renderMountain(element);
                                break;
                            case 'tree':
                                this.renderTree(element);
                                break;
                            case 'flower':
                                this.renderFlower(element);
                                break;
                        }
                    } catch (e) {
                        console.warn('Error rendering background element:', e);
                    }
                });
            }
        } catch (error) {
            console.error('Background render error:', error);
            // 备用简单背景
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, 900, 300);
        }
    }
    
    renderCloud(cloud) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(cloud.x, cloud.y, cloud.size/3, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + cloud.size/2, cloud.y, cloud.size/4, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + cloud.size, cloud.y, cloud.size/3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderMountain(mountain) {
        this.ctx.fillStyle = mountain.color;
        this.ctx.beginPath();
        this.ctx.moveTo(mountain.x, mountain.y + mountain.height);
        this.ctx.lineTo(mountain.x + mountain.width/2, mountain.y);
        this.ctx.lineTo(mountain.x + mountain.width, mountain.y + mountain.height);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    renderTree(tree) {
        // 树干
        this.ctx.fillStyle = tree.dangerous ? '#8B4513' : '#654321';
        this.ctx.fillRect(tree.x - 3, tree.y, 6, tree.height);
        
        // 树叶
        this.ctx.fillStyle = tree.dangerous ? '#FF6B6B' : '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(tree.x, tree.y - tree.height/3, tree.height/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 危险树的警告效果
        if (tree.dangerous) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(tree.x, tree.y - tree.height/3, tree.height/2 + 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderFlower(flower) {
        this.ctx.fillStyle = flower.dangerous && !flower.triggered ? '#FF1493' : flower.color;
        this.ctx.beginPath();
        this.ctx.arc(flower.x, flower.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 花瓣
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            this.ctx.beginPath();
            this.ctx.arc(
                flower.x + Math.cos(angle) * 4,
                flower.y + Math.sin(angle) * 4,
                2, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    renderPlatforms() {
        this.platforms.forEach(platform => {
            if (platform.vanished) return;
            
            const colors = {
                grass: '#32CD32',
                wood: '#8B4513',
                stone: '#696969',
                fake: '#FF6347',
                invisible: 'rgba(255, 255, 255, 0.1)'
            };
            
            this.ctx.fillStyle = colors[platform.type] || '#666666';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // 草地纹理
            if (platform.type === 'grass') {
                this.ctx.fillStyle = '#228B22';
                for (let i = 0; i < platform.width; i += 5) {
                    this.ctx.fillRect(platform.x + i, platform.y, 2, 3);
                }
            }
            
            // 掉落平台的警告效果
            if (platform.trap === 'falling' && !platform.falling) {
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        });
    }
    
    renderTraps() {
        this.traps.forEach(trap => {
            switch (trap.type) {
                case 'apple':
                    if (trap.active) {
                        this.ctx.fillStyle = '#FF0000';
                        this.ctx.beginPath();
                        this.ctx.arc(trap.x + 8, trap.y + 8, 8, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // 苹果柄
                        this.ctx.fillStyle = '#8B4513';
                        this.ctx.fillRect(trap.x + 7, trap.y - 2, 2, 4);
                    }
                    break;
                    
                case 'cherry':
                    this.ctx.fillStyle = trap.exploding ? '#FF69B4' : '#FF1493';
                    this.ctx.beginPath();
                    this.ctx.arc(trap.x + 4, trap.y + 4, 4, 0, Math.PI * 2);
                    this.ctx.arc(trap.x + 8, trap.y + 4, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    if (trap.exploding) {
                        // 爆炸警告效果
                        const pulseAlpha = Math.sin(trap.timer * 0.5) * 0.5 + 0.5;
                        this.ctx.fillStyle = `rgba(255, 255, 0, ${pulseAlpha})`;
                        this.ctx.beginPath();
                        this.ctx.arc(trap.x + 6, trap.y + 6, 20, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    break;
                    
                case 'saw':
                    this.ctx.fillStyle = '#C0C0C0';
                    this.ctx.beginPath();
                    this.ctx.arc(trap.x + 10, trap.y + 10, 10, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 锯齿
                    this.ctx.fillStyle = '#696969';
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(trap.x + 10, trap.y + 10);
                        this.ctx.lineTo(
                            trap.x + 10 + Math.cos(angle) * 12,
                            trap.y + 10 + Math.sin(angle) * 12
                        );
                        this.ctx.lineTo(
                            trap.x + 10 + Math.cos(angle + 0.2) * 8,
                            trap.y + 10 + Math.sin(angle + 0.2) * 8
                        );
                        this.ctx.fill();
                    }
                    break;
                    
                case 'spikes':
                    if (trap.active) {
                        this.ctx.fillStyle = '#696969';
                        for (let i = 0; i < trap.width; i += 6) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(trap.x + i, trap.y + trap.height);
                            this.ctx.lineTo(trap.x + i + 3, trap.y);
                            this.ctx.lineTo(trap.x + i + 6, trap.y + trap.height);
                            this.ctx.fill();
                        }
                    }
                    break;
                    
                case 'fake_coin':
                    if (!trap.collected) {
                        this.ctx.fillStyle = '#FFD700';
                        this.ctx.beginPath();
                        this.ctx.arc(trap.x + 6, trap.y + 6, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // 可疑的红色光环
                        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();
                        this.ctx.arc(trap.x + 6, trap.y + 6, 8, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                    break;
            }
        });
    }
    
    renderCollectibles() {
        this.collectibles.forEach(item => {
            switch (item.type) {
                case 'save_point':
                    this.ctx.fillStyle = '#00FF00';
                    this.ctx.fillRect(item.x, item.y, item.width, item.height);
                    
                    // 存档点光环
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(item.x + 10, item.y + 10, 15, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                case 'coin':
                    if (!item.collected) {
                        this.ctx.fillStyle = '#FFD700';
                        this.ctx.beginPath();
                        this.ctx.arc(item.x + 6, item.y + 6, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    break;
            }
        });
    }
    
    renderPlayer() {
        if (!this.player) return;
        
        try {
            if (this.player.isDead) {
                // 死亡动画
                this.ctx.fillStyle = `rgba(255, 0, 0, ${this.player.deathAnimation / 60})`;
                this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
                return;
            }
            
            // 无敌时闪烁
            if (this.player.invulnerable > 0 && this.player.invulnerable % 8 < 4) {
                this.ctx.globalAlpha = 0.5;
            }
            
            // 玩家主体 - IWBTG风格的简单角色
            this.ctx.fillStyle = '#4169E1';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // 眼睛
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(this.player.x + 3, this.player.y + 3, 4, 4);
            this.ctx.fillRect(this.player.x + 13, this.player.y + 3, 4, 4);
            
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(this.player.x + (this.player.facing > 0 ? 5 : 4), this.player.y + 4, 2, 2);
            this.ctx.fillRect(this.player.x + (this.player.facing > 0 ? 15 : 14), this.player.y + 4, 2, 2);
            
            // 简单的嘴巴
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(this.player.x + 8, this.player.y + 12, 4, 2);
            
            this.ctx.globalAlpha = 1;
        } catch (error) {
            console.error('Player render error:', error);
            // 备用简单渲染
            this.ctx.fillStyle = '#4169E1';
            this.ctx.fillRect(this.player.x || 50, this.player.y || 200, 20, 24);
        }
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
        try {
            // 死亡计数器
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 16px monospace';
            this.ctx.fillText(`Deaths: ${this.deathCount || 0}`, 20, 30);
            
            // 关卡信息
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`Level: ${this.currentLevel || 1}`, 20, 50);
            
            // IWBTG风格的提示
            this.ctx.fillStyle = '#666666';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('Watch out for falling apples! Nothing is safe...', 20, 280);
            
            if (this.player && this.player.isDead) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, 900, 300);
                
                this.ctx.fillStyle = '#FF0000';
                this.ctx.font = 'bold 32px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('YOU DIED!', 450, 120);
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '16px monospace';
                this.ctx.fillText(`Death #${this.deathCount}`, 450, 150);
                this.ctx.fillText('Press R to respawn', 450, 180);
                
                this.ctx.textAlign = 'left';
            }
        } catch (error) {
            console.error('UI render error:', error);
        }
    }
}

// 🍎 I Wanna Be The Guy Game Class Available for Game Manager
// Use: new IWannaBeTheGuyGame() to create an instance
console.log('✅ IWannaBeTheGuyGame class loaded and ready');

// Debug: Make sure the class is available on window
window.IWannaBeTheGuyGame = IWannaBeTheGuyGame;
console.log('🔍 Debug: IWannaBeTheGuyGame assigned to window:', typeof window.IWannaBeTheGuyGame);
