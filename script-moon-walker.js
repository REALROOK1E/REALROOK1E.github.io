// ====== MOON WALKER - 相位探索游戏 ======
// 🌙 月球环境下的维度探索与解谜游�?

class MoonWalkerGame {
    constructor() {
        console.log('初始化月球漫步者游�?..');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas未找�?');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initGame();
        this.setupEventListeners();
        this.start();
        console.log('🌙 月球漫步者游戏初始化完成!');
    }
    
    setupCanvas() {
        const baseWidth = 900;
        const baseHeight = 300;
        const superSampleRatio = 1.5; // 降低从2到1.5以减少内存使用
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制最大DPR为2
        
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
        this.currentPhase = 'normal'; // normal, shadow, energy
        this.phaseTimer = 0;
        this.energyCollected = 0;
        this.puzzlesSolved = 0;
        this.currentLevel = 1;
        
        // 胜利条件 - 重新设计为通关导向
        this.gameWon = false;
        this.winConditions = {
            reachFinalPlatform: false,    // 必须到达终点平台
            collectKeyItems: false,       // 收集关键物品
            activateAllPortals: false,    // 激活传送门网络
            solveMainPuzzle: false,       // 解决主要谜题
            energyThreshold: 300          // 能量门槛
        };
        this.achievedConditions = {
            reachFinalPlatform: false,
            collectKeyItems: false,
            activateAllPortals: false,
            solveMainPuzzle: false,
            energyThreshold: false
        };
        this.phasesUsed = new Set();
        this.transportUsed = 0;
        
        // 月球漫步者角�?
        this.player = {
            x: 50, y: 200, width: 24, height: 32,
            velocityX: 0, velocityY: 0,
            onGround: false, facing: 1,
            state: 'idle', animFrame: 0,
            energy: 100, maxEnergy: 100,
            phaseAbility: true, // 相位能力
            canPhaseShift: true,
            phaseCooldown: 0,
            isPhasing: false, // 相位状�?
            glowing: false, // 发光状�?
            moonJumpPower: 8, // 月球重力下的跳跃�?
            lastGroundY: 200
        };
        
        // 游戏世界
        this.platforms = [];
        this.energyOrbs = [];
        this.phaseSwitches = [];
        this.teleporters = [];
        this.puzzleElements = [];
        this.particles = [];
        this.backgroundStars = [];
        this.moonCraters = [];
        
        this.keys = {};
        this.keyPressed = {};
        
        this.initMoonEnvironment();
        this.initPuzzleElements();
        this.initStarField();
    }
    
    initMoonEnvironment() {
        // 复杂的多层月球迷宫设�?
        this.platforms = [
            // 基础月球地面
            {x: 0, y: 270, width: 900, height: 30, type: 'moon_surface', phase: 'all'},
            
            // 第一�?- 起始区域 (普通相�?
            {x: 100, y: 240, width: 60, height: 15, type: 'rock', phase: 'normal'},
            {x: 200, y: 210, width: 50, height: 15, type: 'rock', phase: 'normal'},
            {x: 300, y: 180, width: 70, height: 15, type: 'crystal', phase: 'normal', checkpoint: 1},
            
            // 影子相位专用路径 - 中层迷宫
            {x: 150, y: 190, width: 40, height: 15, type: 'shadow', phase: 'shadow'},
            {x: 220, y: 160, width: 60, height: 15, type: 'shadow', phase: 'shadow'},
            {x: 320, y: 130, width: 50, height: 15, type: 'shadow', phase: 'shadow'},
            {x: 420, y: 160, width: 80, height: 15, type: 'shadow', phase: 'shadow', key_platform: true},
            {x: 530, y: 130, width: 60, height: 15, type: 'shadow', phase: 'shadow'},
            
            // 能量相位专用路径 - 上层网络
            {x: 180, y: 120, width: 50, height: 15, type: 'energy', phase: 'energy'},
            {x: 280, y: 90, width: 70, height: 15, type: 'energy', phase: 'energy'},
            {x: 400, y: 70, width: 60, height: 15, type: 'energy', phase: 'energy'},
            {x: 520, y: 50, width: 80, height: 15, type: 'energy', phase: 'energy', power_core: true},
            {x: 650, y: 80, width: 50, height: 15, type: 'energy', phase: 'energy'},
            
            // 混合相位区域 - 需要精确切�?
            {x: 600, y: 200, width: 60, height: 15, type: 'crystal', phase: 'normal'},
            {x: 700, y: 170, width: 50, height: 15, type: 'shadow', phase: 'shadow'},
            {x: 750, y: 140, width: 70, height: 15, type: 'energy', phase: 'energy'},
            
            // 终点区域 - 需要特殊条�?
            {x: 800, y: 110, width: 80, height: 15, type: 'victory_gate', phase: 'all', locked: true},
            {x: 820, y: 80, width: 40, height: 15, type: 'final_platform', phase: 'all', victory: true},
        ];
        
        // 战略性能量球放置
        this.energyOrbs = [
            // 普通相位收集品
            {x: 120, y: 220, type: 'blue', collected: false, value: 20, phase: 'normal'},
            {x: 320, y: 160, type: 'green', collected: false, value: 30, phase: 'normal'},
            
            // 影子相位专用 - 需要技巧到�?
            {x: 240, y: 140, type: 'purple', collected: false, value: 50, phase: 'shadow'},
            {x: 440, y: 140, type: 'purple', collected: false, value: 50, phase: 'shadow', key_orb: true},
            {x: 550, y: 110, type: 'blue', collected: false, value: 20, phase: 'shadow'},
            
            // 能量相位专用 - 高价值但难到�?
            {x: 200, y: 100, type: 'green', collected: false, value: 30, phase: 'energy'},
            {x: 420, y: 50, type: 'golden', collected: false, value: 100, phase: 'energy', power_orb: true},
            {x: 670, y: 60, type: 'purple', collected: false, value: 50, phase: 'energy'},
            
            // 隐藏奖励 - 需要传送门组合到达
            {x: 50, y: 50, type: 'golden', collected: false, value: 150, phase: 'all', secret: true},
        ];
        
        // 复杂传送门网络 - 需要策略性使�?
        this.teleporters = [
            // 基础传送网�?
            {x: 350, y: 160, target: {x: 600, y: 180}, energy_cost: 40, phase_required: 'normal', id: 'portal_1'},
            {x: 470, y: 140, target: {x: 150, y: 170}, energy_cost: 50, phase_required: 'shadow', id: 'portal_2'},
            {x: 540, y: 30, target: {x: 720, y: 150}, energy_cost: 60, phase_required: 'energy', id: 'portal_3'},
            
            // 反向传�?- 创造复杂路�?
            {x: 720, y: 150, target: {x: 200, y: 120}, energy_cost: 45, phase_required: 'energy', id: 'portal_4'},
            {x: 620, y: 180, target: {x: 420, y: 140}, energy_cost: 35, phase_required: 'normal', id: 'portal_5'},
            
            // 秘密传�?- 需要特定条�?
            {x: 750, y: 120, target: {x: 30, y: 30}, energy_cost: 100, phase_required: 'all', 
             special: true, requires_key: true, id: 'secret_portal'},
            
            // 紧急逃生传�?
            {x: 50, y: 250, target: {x: 100, y: 220}, energy_cost: 20, phase_required: 'all', id: 'escape_portal'},
            
            // 终点传�?- 只有满足条件才激�?
            {x: 800, y: 200, target: {x: 830, y: 60}, energy_cost: 80, phase_required: 'all', 
             final: true, requires_power_core: true, id: 'final_portal'},
        ];
        
        // 相位切换�?- 战略位置
        this.phaseSwitches = [
            {x: 280, y: 200, type: 'shadow', active: false, cooldown: 0},
            {x: 450, y: 90, type: 'energy', active: false, cooldown: 0},
            {x: 680, y: 190, type: 'normal', active: false, cooldown: 0},
            {x: 580, y: 60, type: 'shadow', active: false, cooldown: 0},
        ];
        
        // 游戏状态追�?
        this.gameState = {
            hasKey: false,              // 是否获得关键物品
            hasPowerCore: false,        // 是否获得能量核心
            visitedCheckpoints: [],     // 访问过的检查点
            portalUsageCount: {},       // 传送门使用次数
            secretFound: false,         // 是否发现秘密
        };
        
        // 月球环形�?- 增加视觉层次
        for (let i = 0; i < 12; i++) {
            const radius = 5 + Math.random() * 15;
            const depth = Math.min(radius * 0.7, 2 + Math.random() * 4); // 确保深度不超过半径的70%
            this.moonCraters.push({
                x: Math.random() * 900,
                y: 250 + Math.random() * 20,
                radius: radius,
                depth: depth
            });
        }
    }
    
    initPuzzleElements() {
        // 复杂的相互关联谜题系�?
        this.puzzleElements = [
            {
                type: 'key_collector',
                x: 440, y: 140,
                collected: false,
                solved: false,
                description: '影子钥匙 - 解锁秘密传送门'
            },
            {
                type: 'power_core',
                x: 540, y: 30,
                powered: false,
                solved: false,
                description: '能量核心 - 激活终点传送门'
            },
            {
                type: 'checkpoint_crystal',
                x: 320, y: 160,
                activated: false,
                checkpoint_id: 1,
                solved: false
            },
            {
                type: 'phase_gate_sequence',
                x: 780, y: 90,
                required_sequence: ['normal', 'shadow', 'energy', 'shadow'],
                current_sequence: [],
                solved: false,
                unlocks_victory_gate: true
            },
            {
                type: 'portal_stabilizer',
                x: 650, y: 60,
                stabilized_portals: [],
                required_portals: ['portal_1', 'portal_2', 'portal_3'],
                solved: false
            },
            {
                type: 'energy_resonance_field',
                x: 200, y: 100,
                energy_threshold: 200,
                activated: false,
                solved: false,
                enables_secret_area: true
            }
        ];
    }
    
    initStarField() {
        // 星空背景
        for (let i = 0; i < 100; i++) {
            this.backgroundStars.push({
                x: Math.random() * 900,
                y: Math.random() * 200,
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * 100,
                brightness: Math.random()
            });
        }
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
        
        if (['w', 'a', 's', 'd', 'e', 'q', 'r', 'f', ' '].includes(key)) {
            event.preventDefault();
        }
    }
    
    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
        this.keyPressed[key] = false;
    }
    
    start() {
        console.log('🚀 启动月球探索...');
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.ctx) return;
        
        this.update();
        this.render();
        
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        this.updatePlayer();
        this.updatePhaseSystem();
        this.updatePuzzles();
        this.updateParticles();
        this.updateEnvironment();
        this.checkWinConditions();
    }
    
    updatePlayer() {
        this.handlePlayerInput();
        this.updatePlayerPhysics();
        this.updatePlayerAnimation();
        
        if (this.player.phaseCooldown > 0) {
            this.player.phaseCooldown--;
        }
    }
    
    handlePlayerInput() {
        const moonSpeed = 2.5; // 月球上的移动速度稍慢
        let moving = false;
        
        // 移动
        if (this.keys['a']) {
            this.player.velocityX = -moonSpeed;
            this.player.facing = -1;
            moving = true;
        } else if (this.keys['d']) {
            this.player.velocityX = moonSpeed;
            this.player.facing = 1;
            moving = true;
        } else {
            this.player.velocityX *= 0.9; // 月球表面摩擦
        }
        
        // 月球跳跃 - 低重�?
        if ((this.keys['w'] || this.keys[' ']) && (this.keyPressed['w'] || this.keyPressed[' '])) {
            if (this.player.onGround) {
                this.player.velocityY = -this.player.moonJumpPower;
                this.createMoonDust();
            }
            this.keyPressed['w'] = false;
            this.keyPressed[' '] = false;
        }
        
        // 相位转换
        if (this.keys['e'] && this.keyPressed['e'] && this.player.phaseCooldown <= 0) {
            this.cyclePhase();
            this.keyPressed['e'] = false;
        }
        
        // 能量脉冲
        if (this.keys['q'] && this.keyPressed['q'] && this.player.energy >= 20) {
            this.createEnergyPulse();
            this.keyPressed['q'] = false;
        }
        
        // 激活机�?
        if (this.keys['f'] && this.keyPressed['f']) {
            this.activateNearbyDevices();
            this.keyPressed['f'] = false;
        }
        
        // 重置相位
        if (this.keys['r'] && this.keyPressed['r']) {
            if (this.gameWon) {
                // 如果已经胜利，重新开始游�?
                this.initGame();
                console.log('🔄 重新开始月球探�?..');
            } else {
                // 否则只重置相�?
                this.resetPhase();
            }
            this.keyPressed['r'] = false;
        }
        
        this.player.state = moving ? 'walking' : 'idle';
        if (this.player.velocityY !== 0) {
            this.player.state = 'floating'; // 月球环境下是飘浮
        }
    }
    
    cyclePhase() {
        const phases = ['normal', 'shadow', 'energy'];
        const currentIndex = phases.indexOf(this.currentPhase);
        this.currentPhase = phases[(currentIndex + 1) % phases.length];
        
        // 记录使用过的相位
        this.phasesUsed.add(this.currentPhase);
        
        this.player.phaseCooldown = 30; // 0.5秒冷�?
        this.player.isPhasing = true;
        
        // 创建相位转换特效
        this.createPhaseTransitionEffect();
        
        // 检查水晶共振器
        this.checkCrystalResonator();
        
        console.log(`🔄 相位切换�? ${this.currentPhase}`);
    }
    
    resetPhase() {
        this.currentPhase = 'normal';
        this.createPhaseTransitionEffect();
        console.log('🔄 相位重置�? normal');
    }
    
    createEnergyPulse() {
        if (this.player.energy < 20) return;
        
        this.player.energy -= 20;
        
        // 创建能量脉冲效果
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.createParticle(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height/2,
                Math.cos(angle) * 5,
                Math.sin(angle) * 5,
                '#00FFFF', 40
            );
        }
        
        // 激活附近的能量节点
        this.puzzleElements.forEach(element => {
            if (element.type === 'energy_node') {
                const dx = element.x - this.player.x;
                const dy = element.y - this.player.y;
                if (Math.sqrt(dx * dx + dy * dy) < 100) {
                    element.powered = true;
                    if (!element.solved) {
                        element.solved = true;
                        this.puzzlesSolved++;
                        console.log('🧩 能量节点已激�?');
                    }
                }
            }
        });
    }
    
    activateNearbyDevices() {
        // 激活传送门 - 增加复杂的条件检�?
        this.teleporters.forEach(teleporter => {
            const dx = teleporter.x - this.player.x;
            const dy = teleporter.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50 && this.player.energy >= teleporter.energy_cost) {
                // 检查相位要�?
                if (teleporter.phase_required !== 'all' && teleporter.phase_required !== this.currentPhase) {
                    console.log(`�?需�?{teleporter.phase_required}相位才能使用此传送门!`);
                    return;
                }
                
                // 检查特殊要�?
                if (teleporter.requires_key && !this.gameState.hasKey) {
                    console.log('�?需要影子钥匙才能使用秘密传送门!');
                    return;
                }
                
                if (teleporter.requires_power_core && !this.gameState.hasPowerCore) {
                    console.log('�?需要能量核心才能使用终点传送门!');
                    return;
                }
                
                // 执行传�?
                this.player.x = teleporter.target.x;
                this.player.y = teleporter.target.y;
                this.player.energy -= teleporter.energy_cost;
                this.transportUsed++;
                
                // 记录传送门使用
                if (!this.gameState.portalUsageCount[teleporter.id]) {
                    this.gameState.portalUsageCount[teleporter.id] = 0;
                }
                this.gameState.portalUsageCount[teleporter.id]++;
                
                // 检查传送门精通成�?
                if (Object.keys(this.gameState.portalUsageCount).length >= 5) {
                    this.achievedConditions.activateAllPortals = true;
                }
                
                this.createTeleportEffect(teleporter.x, teleporter.y);
                this.createTeleportEffect(teleporter.target.x, teleporter.target.y);
                
                console.log(`🚀 使用传送门 ${teleporter.id}`);
            }
        });
        
        // 激活相位切换器
        this.phaseSwitches.forEach(phaseSwitch => {
            const dx = phaseSwitch.x - this.player.x;
            const dy = phaseSwitch.y - this.player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 40) {
                this.currentPhase = phaseSwitch.type;
                phaseSwitch.active = true;
                phaseSwitch.cooldown = 120;
                this.createPhaseTransitionEffect();
                console.log(`🔄 强制切换�?{phaseSwitch.type}相位`);
            }
        });
        
        // 激活谜题元�?
        this.activatePuzzleElements();
    }
    
    updatePlayerPhysics() {
        // 移动
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // 月球重力 (比地球弱很多)
        this.player.velocityY += 0.3; // 低重�?
        
        // 检查重力场影响
        this.puzzleElements.forEach(element => {
            if (element.type === 'gravity_field' && element.active) {
                const dx = this.player.x - element.x;
                const dy = this.player.y - element.y;
                if (dx >= 0 && dx <= element.width && dy >= 0 && dy <= element.height) {
                    this.player.velocityY += (0.3 * element.strength) - 0.3; // 修改重力
                }
            }
        });
        
        // 平台碰撞
        this.player.onGround = false;
        this.platforms.forEach(platform => {
            if (this.isPlatformVisible(platform) && this.checkPlatformCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                }
            }
        });
        
        // 检查秘密平台碰�?
        if (this.secretPlatforms) {
            this.secretPlatforms.forEach(platform => {
                if (this.isPlatformVisible(platform) && this.checkPlatformCollision(this.player, platform)) {
                    if (this.player.velocityY > 0) {
                        this.player.y = platform.y - this.player.height;
                        this.player.velocityY = 0;
                        this.player.onGround = true;
                        
                        // 检查胜利平�?
                        if (platform.type === 'victory') {
                            this.achievedConditions.reachSecretArea = true;
                        }
                    }
                }
            });
        }
        
        // 边界
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > 876) this.player.x = 876;
        
        // 掉出地图重置
        if (this.player.y > 320) {
            this.player.x = 50;
            this.player.y = 200;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
    }
    
    isPlatformVisible(platform) {
        return platform.phase === 'all' || platform.phase === this.currentPhase;
    }
    
    checkPlatformCollision(player, platform) {
        return player.x < platform.x + platform.width &&
               player.x + player.width > platform.x &&
               player.y < platform.y + platform.height &&
               player.y + player.height > platform.y &&
               player.y < platform.y;
    }
    
    updatePlayerAnimation() {
        this.player.animFrame++;
        
        // 能量恢复
        if (this.player.energy < this.player.maxEnergy) {
            this.player.energy += 0.2;
        }
        
        // 相位状态更�?
        if (this.player.isPhasing) {
            this.player.isPhasing = false;
        }
    }
    
    updatePhaseSystem() {
        this.phaseTimer++;
        
        // 更新相位切换器冷�?
        this.phaseSwitches.forEach(phaseSwitch => {
            if (phaseSwitch.cooldown > 0) {
                phaseSwitch.cooldown--;
                if (phaseSwitch.cooldown <= 0) {
                    phaseSwitch.active = false;
                }
            }
        });
    }
    
    updatePuzzles() {
        // 检查能量球收集
        this.energyOrbs.forEach(orb => {
            if (!orb.collected && 
                (!orb.phase || orb.phase === this.currentPhase || orb.phase === 'all') &&
                this.checkCollision(this.player, orb)) {
                orb.collected = true;
                this.player.energy = Math.min(this.player.energy + orb.value, this.player.maxEnergy);
                this.energyCollected += orb.value;
                this.createEnergyCollectEffect(orb.x, orb.y, orb.type);
                
                // 检查特殊能量球
                if (orb.key_orb) {
                    console.log('🗝�?关键能量球已收集!');
                }
                if (orb.power_orb) {
                    console.log('�?能量核心球已收集!');
                }
                if (orb.secret) {
                    console.log('🌟 秘密能量球已收集!');
                }
            }
        });
        
        // 检查是否到达最终平�?
        this.platforms.forEach(platform => {
            if (platform.victory && this.checkPlatformCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                    this.achievedConditions.reachFinalPlatform = true;
                    console.log('🏆 到达最终平�?');
                }
            }
        });
        
        // 检查能量门�?
        if (this.energyCollected >= this.winConditions.energyThreshold) {
            this.achievedConditions.energyThreshold = true;
        }
        
        // 检查关键物品收�?
        if (this.gameState.hasKey && this.gameState.hasPowerCore) {
            this.achievedConditions.collectKeyItems = true;
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
    
    updateEnvironment() {
        // 更新星空闪烁
        this.backgroundStars.forEach(star => {
            star.twinkle += 0.1;
            star.brightness = Math.sin(star.twinkle) * 0.3 + 0.7;
        });
    }
    
    // ====== 胜利条件检测系�?======
    
    checkWinConditions() {
        if (this.gameWon) return;
        
        // 检查是否所有主要条件都达成
        const allConditionsMet = Object.values(this.achievedConditions).every(condition => condition);
        
        if (allConditionsMet && !this.gameWon) {
            this.gameWon = true;
            this.triggerVictory();
        }
    }
    
    triggerVictory() {
        console.log('🎉🎉🎉 恭喜！你已经征服了月球迷宫！🎉🎉🎉');
        console.log('通过巧妙的策略和相位操控，你找到了通往终点的道路！');
        
        // 创建盛大的胜利特�?
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                this.createParticle(
                    this.player.x + this.player.width/2 + (Math.random() - 0.5) * 100,
                    this.player.y + this.player.height/2 + (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 15,
                    ['#FFD700', '#FF69B4', '#00FFFF', '#98FB98', '#FF6347', '#9370DB'][Math.floor(Math.random() * 6)],
                    120
                );
            }, i * 50);
        }
    }
    
    checkCrystalResonator() {
        // 这个方法已被整合�?activatePuzzleElements �?
        // 保留为兼容�?
    }
    
    activatePuzzleElements() {
        this.puzzleElements.forEach(element => {
            const dx = element.x - this.player.x;
            const dy = element.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                switch (element.type) {
                    case 'key_collector':
                        if (!element.collected && this.currentPhase === 'shadow') {
                            element.collected = true;
                            element.solved = true;
                            this.gameState.hasKey = true;
                            this.puzzlesSolved++;
                            console.log('🗝�?获得影子钥匙!');
                        }
                        break;
                        
                    case 'power_core':
                        if (!element.powered && this.currentPhase === 'energy' && this.player.energy >= 150) {
                            element.powered = true;
                            element.solved = true;
                            this.gameState.hasPowerCore = true;
                            this.player.energy -= 150;
                            this.puzzlesSolved++;
                            console.log('�?获得能量核心!');
                        }
                        break;
                        
                    case 'checkpoint_crystal':
                        if (!element.activated) {
                            element.activated = true;
                            element.solved = true;
                            this.gameState.visitedCheckpoints.push(element.checkpoint_id);
                            console.log(`💎 激活检查点 ${element.checkpoint_id}!`);
                        }
                        break;
                        
                    case 'phase_gate_sequence':
                        if (!element.solved) {
                            element.current_sequence.push(this.currentPhase);
                            console.log(`🎯 相位序列: ${element.current_sequence.join(' �?')}`);
                            
                            // 检查序列是否正�?
                            let isCorrect = true;
                            for (let i = 0; i < element.current_sequence.length; i++) {
                                if (element.current_sequence[i] !== element.required_sequence[i]) {
                                    isCorrect = false;
                                    break;
                                }
                            }
                            
                            if (!isCorrect) {
                                element.current_sequence = [this.currentPhase];
                                console.log('�?序列错误，重新开�?');
                            } else if (element.current_sequence.length >= element.required_sequence.length) {
                                element.solved = true;
                                this.puzzlesSolved++;
                                this.achievedConditions.solveMainPuzzle = true;
                                // 解锁胜利之门
                                this.platforms.forEach(platform => {
                                    if (platform.type === 'victory_gate') {
                                        platform.locked = false;
                                        console.log('🏆 胜利之门已解�?');
                                    }
                                });
                                console.log('🧩 主要谜题完成!');
                            }
                        }
                        break;
                        
                    case 'energy_resonance_field':
                        if (!element.activated && this.player.energy >= element.energy_threshold) {
                            element.activated = true;
                            element.solved = true;
                            this.gameState.secretFound = true;
                            console.log('🌟 能量共振场激活，发现秘密区域!');
                        }
                        break;
                }
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + (obj2.width || 12) &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + (obj2.height || 12) &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // ====== 特效创建方法 ======
    
    createPhaseTransitionEffect() {
        const colors = {
            normal: '#FFFFFF',
            shadow: '#8A2BE2',
            energy: '#00FFFF'
        };
        
        for (let i = 0; i < 20; i++) {
            this.createParticle(
                this.player.x + Math.random() * this.player.width,
                this.player.y + Math.random() * this.player.height,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                colors[this.currentPhase], 30
            );
        }
    }
    
    createMoonDust() {
        for (let i = 0; i < 8; i++) {
            this.createParticle(
                this.player.x + Math.random() * this.player.width,
                this.player.y + this.player.height,
                (Math.random() - 0.5) * 3,
                -Math.random() * 2,
                '#D3D3D3', 20
            );
        }
    }
    
    createEnergyCollectEffect(x, y, type) {
        const colors = {
            blue: '#0080FF',
            green: '#00FF80',
            purple: '#8000FF',
            golden: '#FFD700'
        };
        
        for (let i = 0; i < 15; i++) {
            this.createParticle(
                x + 6, y + 6,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                colors[type] || '#FFFFFF', 25
            );
        }
    }
    
    createTeleportEffect(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            this.createParticle(
                x + Math.cos(angle) * 20,
                y + Math.sin(angle) * 20,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                '#FF00FF', 35
            );
        }
    }
    
    createParticle(x, y, vx, vy, color, life) {
        this.particles.push({
            x: x, y: y,
            velocityX: vx, velocityY: vy,
            color: color,
            life: life,
            maxLife: life,
            size: Math.random() * 3 + 1,
            alpha: 1
        });
    }
    
    // ====== 渲染方法 ======
    
    render() {
        if (!this.ctx) return;
        
        try {
            this.ctx.clearRect(0, 0, 900, 300);
            
            this.renderSpaceBackground();
            this.renderMoonSurface();
            this.renderPlatforms();
            this.renderSecretPlatforms();
            this.renderPuzzleElements();
            this.renderEnergyOrbs();
            this.renderPhaseSwitches();
            this.renderTeleporters();
            this.renderPlayer();
            this.renderParticles();
            this.renderUI();
            this.renderPhaseIndicator();
            this.renderWinConditions();
        } catch (error) {
            console.error('渲染错误:', error);
        }
    }
    
    renderSpaceBackground() {
        // 太空背景渐变
        const spaceGradient = this.ctx.createLinearGradient(0, 0, 0, 300);
        spaceGradient.addColorStop(0, '#000011');
        spaceGradient.addColorStop(0.5, '#001122');
        spaceGradient.addColorStop(1, '#002244');
        
        this.ctx.fillStyle = spaceGradient;
        this.ctx.fillRect(0, 0, 900, 300);
        
        // 星空
        this.backgroundStars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // 地球在远�?
        this.ctx.fillStyle = '#4169E1';
        this.ctx.beginPath();
        this.ctx.arc(800, 50, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 地球的云
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(790, 45, 8, 0, Math.PI * 2);
        this.ctx.arc(805, 55, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderMoonSurface() {
        // 月球表面
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(0, 270, 900, 30);
        
        // 月球环形�?
        this.moonCraters.forEach(crater => {
            this.ctx.fillStyle = '#A0A0A0';
            this.ctx.beginPath();
            this.ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 环形山内部阴�?- 确保半径为正�?
            const innerRadius = Math.max(0.5, crater.radius - crater.depth);
            this.ctx.fillStyle = '#808080';
            this.ctx.beginPath();
            this.ctx.arc(crater.x, crater.y, innerRadius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderPlatforms() {
        this.platforms.forEach(platform => {
            if (!this.isPlatformVisible(platform)) return;
            
            const colors = {
                moon_surface: '#C0C0C0',
                rock: '#696969',
                crystal: '#E6E6FA',
                metal: '#708090',
                ice: '#B0E0E6',
                shadow: '#4B0082',
                energy: '#00CED1',
                victory_gate: platform.locked ? '#8B4513' : '#FFD700',
                final_platform: '#FF69B4'
            };
            
            this.ctx.fillStyle = colors[platform.type] || '#666666';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // 特殊效果
            if (platform.glowing || platform.checkpoint) {
                this.ctx.fillStyle = 'rgba(230, 230, 250, 0.5)';
                this.ctx.fillRect(platform.x - 2, platform.y - 2, platform.width + 4, platform.height + 4);
            }
            
            if (platform.type === 'energy') {
                // 能量平台的脉冲效�?
                const pulse = Math.sin(this.phaseTimer * 0.1) * 0.3 + 0.7;
                this.ctx.fillStyle = `rgba(0, 206, 209, ${pulse * 0.5})`;
                this.ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
            }
            
            if (platform.type === 'victory_gate') {
                // 胜利之门的锁�?解锁效果
                if (platform.locked) {
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.font = '12px monospace';
                    this.ctx.fillText('🔒', platform.x + platform.width/2 - 6, platform.y - 5);
                } else {
                    // 解锁后的金光效果
                    const pulse = Math.sin(this.phaseTimer * 0.2) * 0.5 + 0.5;
                    this.ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
                    this.ctx.fillRect(platform.x - 5, platform.y - 5, platform.width + 10, platform.height + 10);
                }
            }
            
            if (platform.type === 'final_platform' && platform.victory) {
                // 最终平台的彩虹效果
                const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
                const pulse = Math.sin(this.phaseTimer * 0.3) * 0.5 + 0.5;
                
                colors.forEach((color, index) => {
                    this.ctx.fillStyle = color;
                    this.ctx.globalAlpha = pulse * 0.6;
                    this.ctx.fillRect(
                        platform.x + index * 2, 
                        platform.y - index, 
                        platform.width - index * 4, 
                        platform.height + index * 2
                    );
                });
                this.ctx.globalAlpha = 1;
                
                // 胜利标志
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 16px monospace';
                this.ctx.fillText('🏆', platform.x + platform.width/2 - 8, platform.y - 10);
            }
            
            // 平台类型标识
            if (platform.key_platform) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('🗝️', platform.x + platform.width/2 - 6, platform.y - 5);
            }
            
            if (platform.power_core) {
                this.ctx.fillStyle = '#00FFFF';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('⚡', platform.x + platform.width/2 - 6, platform.y - 5);
            }
        });
    }
    
    renderPuzzleElements() {
        this.puzzleElements.forEach(element => {
            switch (element.type) {
                case 'energy_node':
                    this.ctx.fillStyle = element.powered ? '#FFD700' : '#696969';
                    this.ctx.beginPath();
                    this.ctx.arc(element.x, element.y, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    if (element.powered) {
                        // 能量连接�?
                        element.connections.forEach(conn => {
                            this.ctx.strokeStyle = '#FFD700';
                            this.ctx.lineWidth = 2;
                            this.ctx.beginPath();
                            this.ctx.moveTo(element.x, element.y);
                            this.ctx.lineTo(conn.x, conn.y);
                            this.ctx.stroke();
                        });
                    }
                    break;
                    
                case 'phase_door':
                    if (element.isOpen) {
                        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
                    } else {
                        this.ctx.fillStyle = '#8B4513';
                    }
                    this.ctx.fillRect(element.x, element.y, element.width, element.height);
                    break;
                    
                case 'gravity_field':
                    if (element.active) {
                        this.ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
                        this.ctx.fillRect(element.x, element.y, element.width, element.height);
                        
                        // 重力场粒子效�?
                        for (let i = 0; i < 5; i++) {
                            const x = element.x + Math.random() * element.width;
                            const y = element.y + Math.random() * element.height;
                            this.ctx.fillStyle = 'rgba(138, 43, 226, 0.8)';
                            this.ctx.fillRect(x, y, 2, 2);
                        }
                    }
                    break;
                    
                case 'crystal_resonator':
                    // 水晶共振�?
                    this.ctx.fillStyle = element.solved ? '#FFD700' : '#E6E6FA';
                    this.ctx.beginPath();
                    this.ctx.arc(element.x, element.y, 12, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 显示激活的相位
                    element.activatedPhases.forEach((phase, index) => {
                        const angle = (index / element.activatedPhases.length) * Math.PI * 2;
                        const phaseColors = { normal: '#FFFFFF', shadow: '#8A2BE2', energy: '#00FFFF' };
                        this.ctx.fillStyle = phaseColors[phase];
                        this.ctx.fillRect(
                            element.x + Math.cos(angle) * 20 - 2,
                            element.y + Math.sin(angle) * 20 - 2,
                            4, 4
                        );
                    });
                    break;
                    
                case 'phase_lock':
                    // 相位�?
                    this.ctx.fillStyle = element.solved ? '#00FF00' : '#FF6666';
                    this.ctx.fillRect(element.x, element.y, 25, 25);
                    
                    // 显示当前步骤
                    this.ctx.fillStyle = '#000000';
                    this.ctx.font = '12px monospace';
                    this.ctx.fillText(`${element.currentStep}/${element.sequence.length}`, element.x + 2, element.y + 15);
                    break;
                    break;
            }
        });
    }
    
    renderEnergyOrbs() {
        this.energyOrbs.forEach(orb => {
            if (orb.collected || (orb.phase && orb.phase !== this.currentPhase)) return;
            
            const colors = {
                blue: '#0080FF',
                green: '#00FF80',
                purple: '#8000FF',
                golden: '#FFD700'
            };
            
            // 能量球浮动效�?
            const floatY = orb.y + Math.sin(this.phaseTimer * 0.05 + orb.x * 0.01) * 3;
            
            this.ctx.fillStyle = colors[orb.type];
            this.ctx.beginPath();
            this.ctx.arc(orb.x + 6, floatY + 6, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 能量球光�?
            this.ctx.fillStyle = colors[orb.type];
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(orb.x + 6, floatY + 6, 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderPhaseSwitches() {
        this.phaseSwitches.forEach(phaseSwitch => {
            const colors = {
                normal: '#FFFFFF',
                shadow: '#8A2BE2',
                energy: '#00FFFF'
            };
            
            this.ctx.fillStyle = phaseSwitch.active ? colors[phaseSwitch.type] : '#696969';
            this.ctx.fillRect(phaseSwitch.x, phaseSwitch.y, 20, 20);
            
            // 激活状态的光环
            if (phaseSwitch.active) {
                this.ctx.fillStyle = colors[phaseSwitch.type];
                this.ctx.globalAlpha = 0.5;
                this.ctx.fillRect(phaseSwitch.x - 5, phaseSwitch.y - 5, 30, 30);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderTeleporters() {
        this.teleporters.forEach(teleporter => {
            // 根据相位要求改变传送门颜色
            const phaseColors = {
                'normal': '#FFFFFF',
                'shadow': '#8A2BE2', 
                'energy': '#00FFFF',
                'all': '#FF00FF'
            };
            
            const portalColor = phaseColors[teleporter.phase_required] || '#FF00FF';
            
            // 传送门�?
            this.ctx.strokeStyle = portalColor;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(teleporter.x + 10, teleporter.y + 10, 15, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 检查是否可�?
            const canUse = (!teleporter.phase_required || teleporter.phase_required === 'all' || 
                           teleporter.phase_required === this.currentPhase) &&
                          this.player.energy >= teleporter.energy_cost &&
                          (!teleporter.requires_key || this.gameState.hasKey) &&
                          (!teleporter.requires_power_core || this.gameState.hasPowerCore);
            
            if (!canUse) {
                // 不可用时显示为暗�?
                this.ctx.globalAlpha = 0.3;
            }
            
            // 传送门内部旋转效果
            const rotation = this.phaseTimer * 0.05;
            for (let i = 0; i < 8; i++) {
                const angle = rotation + (i / 8) * Math.PI * 2;
                this.ctx.fillStyle = portalColor;
                this.ctx.fillRect(
                    teleporter.x + 10 + Math.cos(angle) * 8,
                    teleporter.y + 10 + Math.sin(angle) * 8,
                    2, 2
                );
            }
            
            // 特殊传送门标识
            if (teleporter.requires_key) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('🗝️', teleporter.x + 25, teleporter.y + 15);
            }
            
            if (teleporter.requires_power_core) {
                this.ctx.fillStyle = '#00FFFF';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('⚡', teleporter.x + 25, teleporter.y + 15);
            }
            
            if (teleporter.final) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('🏆', teleporter.x + 25, teleporter.y + 15);
            }
            
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderPlayer() {
        if (!this.player) return;
        
        try {
            const p = this.player;
            
            // 相位状态的视觉效果
            if (this.currentPhase === 'shadow') {
                this.ctx.globalAlpha = 0.7;
            } else if (this.currentPhase === 'energy') {
                this.ctx.globalAlpha = 1;
                // 能量发光效果
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.fillRect(p.x - 3, p.y - 3, p.width + 6, p.height + 6);
            }
            
            // 月球漫步者主�?- 太空服风�?
            this.ctx.fillStyle = '#E6E6FA'; // 银白色太空服
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            
            // 头盔
            this.ctx.fillStyle = '#4169E1'; // 深蓝色头�?
            this.ctx.fillRect(p.x + 4, p.y, 16, 16);
            
            // 头盔面罩
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(p.x + 6, p.y + 2, 12, 12);
            
            // 眼睛发光
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.fillRect(p.x + 8, p.y + 6, 2, 2);
            this.ctx.fillRect(p.x + 14, p.y + 6, 2, 2);
            
            // 胸前的能量指示器
            const energyRatio = p.energy / p.maxEnergy;
            this.ctx.fillStyle = energyRatio > 0.5 ? '#00FF00' : energyRatio > 0.25 ? '#FFFF00' : '#FF0000';
            this.ctx.fillRect(p.x + 10, p.y + 20, 4, 8);
            
            // 太空背包
            this.ctx.fillStyle = '#696969';
            this.ctx.fillRect(p.x + 2, p.y + 16, 20, 8);
            
            // 脚步月尘效果
            if (p.state === 'walking' && p.onGround) {
                this.ctx.fillStyle = 'rgba(192, 192, 192, 0.5)';
                this.ctx.fillRect(p.x + Math.random() * p.width, p.y + p.height, 2, 2);
            }
            
            this.ctx.globalAlpha = 1;
        } catch (error) {
            console.error('玩家渲染错误:', error);
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
            // 能量�?
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(20, 20, 154, 18);
            const energyRatio = this.player.energy / this.player.maxEnergy;
            this.ctx.fillStyle = energyRatio > 0.5 ? '#00FFFF' : energyRatio > 0.25 ? '#FFFF00' : '#FF0000';
            this.ctx.fillRect(22, 22, 150 * energyRatio, 14);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`Energy: ${Math.floor(this.player.energy)}`, 25, 33);
            
            // 收集状�?
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`Energy Collected: ${this.energyCollected}`, 20, 60);
            
            // 控制提示
            this.ctx.fillStyle = '#CCCCCC';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('WASD: Move | E: Phase Shift | Q: Energy Pulse | F: Activate | R: Reset/Restart', 20, 280);
            this.ctx.fillText('🎯 策略: 巧妙使用相位切换和传送门组合，收集关键物品，解锁终点！', 20, 295);
        } catch (error) {
            console.error('UI渲染错误:', error);
        }
    }
    
    renderPhaseIndicator() {
        // 相位指示�?
        const phaseColors = {
            normal: '#FFFFFF',
            shadow: '#8A2BE2',
            energy: '#00FFFF'
        };
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(750, 20, 120, 40);
        
        this.ctx.fillStyle = phaseColors[this.currentPhase];
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`Phase: ${this.currentPhase.toUpperCase()}`, 760, 35);
        
        // 相位冷却指示
        if (this.player.phaseCooldown > 0) {
            this.ctx.fillStyle = '#FF6666';
            this.ctx.fillRect(760, 45, (30 - this.player.phaseCooldown), 5);
        }
    }
    
    renderSecretPlatforms() {
        if (!this.secretPlatforms) return;
        
        this.secretPlatforms.forEach(platform => {
            if (!this.isPlatformVisible(platform)) return;
            
            if (platform.type === 'secret') {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // 金色光芒效果
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                this.ctx.fillRect(platform.x - 2, platform.y - 2, platform.width + 4, platform.height + 4);
            } else if (platform.type === 'victory') {
                // 胜利平台 - 彩虹效果
                const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
                const pulse = Math.sin(this.phaseTimer * 0.2) * 0.5 + 0.5;
                
                colors.forEach((color, index) => {
                    this.ctx.fillStyle = color;
                    this.ctx.globalAlpha = pulse * 0.8;
                    this.ctx.fillRect(
                        platform.x + index * 2, 
                        platform.y - index, 
                        platform.width - index * 4, 
                        platform.height + index * 2
                    );
                });
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderWinConditions() {
        // 任务进度现在显示在侧边栏中，不再在游戏画面上渲染
        // 只保留胜利状态的全屏庆祝效果
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px monospace';
        //         this.ctx.fillText('🎯月球迷宫通关任务', 210, 40);
        
        /*
        const conditions = [
            { 
                text: `到达终点平台: ${this.achievedConditions.reachFinalPlatform ? '✅' : '❌'}`, 
                achieved: this.achievedConditions.reachFinalPlatform 
            },
            { 
                text: `收集关键物品: ${this.gameState.hasKey ? '🗝️' : '❌'} ${this.gameState.hasPowerCore ? '⚡' : '❌'}`, 
                achieved: this.achievedConditions.collectKeyItems 
            },
            { 
                text: `传送门精�? ${Object.keys(this.gameState.portalUsageCount).length}/5`, 
                achieved: this.achievedConditions.activateAllPortals 
            },
            { 
                text: `主要谜题: ${this.achievedConditions.solveMainPuzzle ? '�? : '�?}`, 
                achieved: this.achievedConditions.solveMainPuzzle 
            },
            { 
                text: `能量收集: ${this.energyCollected}/${this.winConditions.energyThreshold}`, 
                achieved: this.achievedConditions.energyThreshold 
            }
        ];
        
        this.ctx.font = '12px monospace';
        //         conditions.forEach((condition, index) => {
            this.ctx.fillStyle = condition.achieved ? '#00FF00' : '#CCCCCC';
            //             this.ctx.fillText(condition.text, 210, 65 + index * 18);
        });
        
        // 游戏状态信�?
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '11px monospace';
        */
        
        // 胜利状态
        if (this.gameWon) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
            this.ctx.fillRect(150, 180, 600, 100);
            
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 28px monospace';
            this.ctx.fillText('🎉 迷宫征服者！🎉', 200, 210);
            this.ctx.font = 'bold 16px monospace';
            this.ctx.fillText('你通过巧妙的策略和相位操控', 220, 235);
            this.ctx.fillText('成功征服了复杂的月球迷宫！', 230, 255);
            this.ctx.font = '14px monospace';
            this.ctx.fillText('按 R 键重新挑战更高难度', 280, 275);
        }
    }
    
    // 新增方法：获取游戏状态信息，供侧边栏使用
    getGameStatusInfo() {
        if (!this.achievedConditions || !this.gameState || !this.winConditions) {
            return {
                conditions: [],
                currentPhase: this.currentPhase || 'normal',
                puzzlesSolved: 0,
                energyCollected: this.energyCollected || 0,
                gameWon: false
            };
        }
        
        const conditions = [
            { 
                text: `到达终点平台: ${this.achievedConditions.reachFinalPlatform ? '✅' : '❌'}`, 
                achieved: this.achievedConditions.reachFinalPlatform 
            },
            { 
                text: `收集关键物品: ${this.gameState.hasKey ? '🗝️' : '❌'} ${this.gameState.hasPowerCore ? '⚡' : '❌'}`, 
                achieved: this.achievedConditions.collectKeyItems 
            },
            { 
                text: `传送门精通: ${Object.keys(this.gameState.portalUsageCount || {}).length}/5`, 
                achieved: this.achievedConditions.activateAllPortals 
            },
            { 
                text: `主要谜题: ${this.achievedConditions.solveMainPuzzle ? '✅' : '❌'}`, 
                achieved: this.achievedConditions.solveMainPuzzle 
            },
            { 
                text: `能量收集: ${this.energyCollected}/${this.winConditions.energyThreshold}`, 
                achieved: this.achievedConditions.energyThreshold 
            }
        ];
        
        return {
            title: '🎯 月球迷宫通关任务',
            conditions: conditions,
            currentPhase: this.currentPhase.toUpperCase(),
            puzzlesSolved: this.puzzlesSolved || 0,
            energyCollected: this.energyCollected || 0,
            gameWon: this.gameWon || false
        };
    }
}

// 🌙 Moon Walker Game Class Available for Game Manager
// Use: new MoonWalkerGame() to create an instance
console.log('�?MoonWalkerGame class loaded and ready');

// Debug: Make sure the class is available on window
window.MoonWalkerGame = MoonWalkerGame;
console.log('🔍 Debug: MoonWalkerGame assigned to window:', typeof window.MoonWalkerGame);
