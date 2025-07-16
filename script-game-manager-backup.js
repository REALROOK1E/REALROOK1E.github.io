// Game Manager - Handles switching between different games
class GameManager {
    constructor() {
        this.currentGame = null;
        this.availableGames = {
            moonwalker: {
                name: "Moon Walker",
                script: "script-moon-walker.js",
                class: "MoonWalkerGame",
                info: "moonwalkerInfo",
                controls: "moonwalkerControls"
            },
            iwbtg: {
                name: "I Wanna Be The Guy",
                script: "script-iwbtg-style.js", 
                class: "IWannaBeTheGuyGame",
                info: "iwbtgInfo",
                controls: "iwbtgControls"
            }
        };
        this.gameInstance = null;
        this.statusUpdateInterval = null;
        
        // Debug: Check if game classes are available
        console.log('Checking game class availability:');
        Object.entries(this.availableGames).forEach(([key, game]) => {
            const isAvailable = typeof window[game.class] === 'function';
            console.log(`${game.name} (${game.class}): ${isAvailable ? 'AVAILABLE' : 'NOT FOUND'}`);
            if (!isAvailable) {
                console.log(`Expected class: ${game.class}, Type found: ${typeof window[game.class]}`);
            }
        });
        
        this.setupEventListeners();
        this.switchGame('moonwalker');
    }

    setupEventListeners() {
        const gameSelector = document.getElementById('gameSelector');
        const startButton = document.getElementById('startGame');
        const infoButton = document.getElementById('gameInfoBtn');
        
        if (gameSelector) {
            gameSelector.addEventListener('change', (e) => {
                const selectedGame = e.target.value;
                if (selectedGame) {
                    this.switchGame(selectedGame);
                }
            });
        }

        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startSelectedGame();
            });
        }

        if (infoButton) {
            infoButton.addEventListener('click', () => {
                const currentText = infoButton.textContent;
                if (currentText === 'GAME INFO') {
                    infoButton.textContent = 'HIDE INFO';
                } else {
                    infoButton.textContent = 'GAME INFO';
                }
                
                // Find and toggle info sections
                const infoSections = document.querySelectorAll('.game-info');
                infoSections.forEach(section => {
                    if (section.style.display === 'none' || !section.style.display) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
                
                this.updateGameInfo();
            });
        }
    }

    switchGame(gameType) {
        console.log(`Switching to game: ${gameType}`);
        
        // Stop current game if running
        if (this.gameInstance && this.gameInstance.stop) {
            this.gameInstance.stop();
        }
        
        // Clear canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Reset canvas style
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#0a0815');
            gradient.addColorStop(0.5, '#1a1530'); 
            gradient.addColorStop(1, '#2a2550');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add placeholder text
            ctx.fillStyle = '#6a5acd';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Select a game to start', canvas.width / 2, canvas.height / 2);
            ctx.font = '16px monospace';
            ctx.fillText('Choose from the dropdown above', canvas.width / 2, canvas.height / 2 + 30);
        }
        
        this.currentGame = gameType;
        this.updateGameInfo();
        this.updateGameControls();
    }

    updateGameInfo() {
        // Hide all game info sections
        Object.values(this.availableGames).forEach(game => {
            const infoElement = document.getElementById(game.info);
            if (infoElement) {
                infoElement.style.display = 'none';
            }
        });

        // Show current game info
        const currentGameConfig = this.availableGames[this.currentGame];
        if (currentGameConfig) {
            const infoElement = document.getElementById(currentGameConfig.info);
            if (infoElement) {
                infoElement.style.display = 'block';
            }
        }
    }

    updateGameControls() {
        // Update the existing control-info div content instead of hiding/showing sections
        const controlsDiv = document.querySelector('.game-controls .control-info');
        if (!controlsDiv) return;
        
        const currentGameConfig = this.availableGames[this.currentGame];
        if (!currentGameConfig) return;
        
        if (this.currentGame === 'moonwalker') {
            controlsDiv.innerHTML = `
                <strong>🌙 MOON WALKER - Phase Exploration Game</strong><br>
                <div class="controls-grid">
                    <span><strong>WASD:</strong> Move & Low-Gravity Jump</span> | 
                    <span><strong>E:</strong> Phase Shift</span> | 
                    <span><strong>Q:</strong> Energy Pulse</span><br>
                    <span><strong>Space:</strong> Space Jump</span> | 
                    <span><strong>R:</strong> Reset Phase</span> | 
                    <span><strong>F:</strong> Activate Devices</span>
                </div>
                <div class="game-features" style="margin-top: 10px; font-size: 0.9em;">
                    🌙 Lunar Environment | 🔄 Phase Switching | ⚡ Energy Puzzles | 🚀 Low Gravity Physics | 🌀 Teleportation | 🔮 Dimensional Exploration
                </div>
            `;
        } else if (this.currentGame === 'iwbtg') {
            controlsDiv.innerHTML = `
                <strong>🍎 I WANNA BE THE GUY - Extreme Platformer</strong><br>
                <div class="controls-grid">
                    <span><strong>A/D:</strong> Move Left/Right</span> | 
                    <span><strong>W:</strong> Jump</span> | 
                    <span><strong>S:</strong> Double Jump</span><br>
                    <span><strong>R:</strong> Restart</span> | 
                    <span><strong>Space:</strong> Save State</span> | 
                    <span><strong>ESC:</strong> Pause</span>
                </div>
                <div class="game-features" style="margin-top: 10px; font-size: 0.9em;">
                    💀 Extreme Difficulty | 🍎 Surprise Traps | ⚡ Frame-Perfect Jumps | 💥 Instant Death | 🎯 Pixel Precision | 😡 Rage Inducing
                </div>
            `;
        }
    }

    async startSelectedGame() {
        const gameConfig = this.availableGames[this.currentGame];
        if (!gameConfig) {
            console.error('No game selected');
            return;
        }

        console.log(`Starting game: ${gameConfig.name}`);

        try {
            // Stop current game if running
            if (this.gameInstance && this.gameInstance.stop) {
                this.gameInstance.stop();
            }

            // Check if game class is available (scripts are preloaded in HTML)
            let GameClass = window[gameConfig.class];
            
            if (!GameClass) {
                console.log(`Game class ${gameConfig.class} not found, attempting to load...`);
                GameClass = window[gameConfig.class];
            }
            
            if (GameClass && typeof GameClass === 'function') {
                console.log(`Creating instance of ${gameConfig.class}`);
                this.gameInstance = new GameClass();
                console.log(`${gameConfig.name} started successfully!`);
                
                // Start game status updater
                this.startStatusUpdater();
                
                // Update UI to show game is running
                const startButton = document.getElementById('startGame');
                if (startButton) {
                    startButton.textContent = 'RESTART GAME';
                }
            } else {
                console.error(`Game class ${gameConfig.class} not found or not a constructor`);
                console.log('Available window objects:', Object.keys(window).filter(key => key.includes('Game')));
                
                // Try to show helpful error message
                const canvas = document.getElementById('gameCanvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#ff4444';
                    ctx.font = 'bold 20px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('Game failed to load', canvas.width / 2, canvas.height / 2);
                    ctx.font = '14px monospace';
                    ctx.fillText(`Class ${gameConfig.class} not found`, canvas.width / 2, canvas.height / 2 + 25);
                }
            }
        } catch (error) {
            console.error('Failed to start game:', error);
            
            // Show error on canvas
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Error starting game', canvas.width / 2, canvas.height / 2);
                ctx.font = '14px monospace';
                ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 25);
            }
        }
    }

    getCurrentGame() {
        return this.currentGame;
    }

    isGameRunning() {
        return this.gameInstance !== null;
    }

    stopCurrentGame() {
        if (this.gameInstance) {
            this.gameInstance.stop();
            this.gameInstance = null;
            
            // Stop status updater
            this.stopStatusUpdater();
            
            // Clear game status info
            const statusContainer = document.getElementById('game-status-info');
            if (statusContainer) {
                statusContainer.remove();
            }
            
            // Reset start button
            const startButton = document.getElementById('startGame');
            if (startButton) {
                startButton.textContent = 'START GAME';
            }
        }
    }

    // 新增方法：更新游戏状态信息到侧边栏
    updateGameStatus() {
        if (!this.gameInstance) return;
        
        // 查找游戏状态信息容器
        let statusContainer = document.getElementById('game-status-info');
        if (!statusContainer) {
            // 如果不存在，创建一个新的容器
            const sidebar = document.querySelector('.game-sidebar');
            if (sidebar) {
                statusContainer = document.createElement('div');
                statusContainer.id = 'game-status-info';
                statusContainer.className = 'game-status-section';
                statusContainer.style.cssText = `
                    margin-top: 15px;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 8px;
                    border: 1px solid #333;
                `;
                sidebar.appendChild(statusContainer);
            }
        }
        
        if (!statusContainer) return;
        
        // 根据游戏类型更新状态信息
        if (this.currentGame === 'moonwalker' && this.gameInstance.getGameStatusInfo) {
            const statusInfo = this.gameInstance.getGameStatusInfo();
            
            let statusHTML = `
                <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px; font-size: 14px;">
                    ${statusInfo.title || '🎯 月球迷宫通关任务'}
                </div>
            `;
            
            // 添加任务条件
            statusInfo.conditions.forEach(condition => {
                const color = condition.achieved ? '#00FF00' : '#CCCCCC';
                statusHTML += `
                    <div style="color: ${color}; font-size: 11px; margin-bottom: 3px;">
                        ${condition.text}
                    </div>
                `;
            });
            
            // 添加游戏状态信息
            statusHTML += `
                <div style="margin-top: 10px; font-size: 11px;">
                    <div style="color: #FFFF00;">当前相位: ${statusInfo.currentPhase}</div>
                    <div style="color: #FFFF00;">谜题进度: ${statusInfo.puzzlesSolved}/6</div>
                    <div style="color: #00FFFF;">能量收集: ${statusInfo.energyCollected}</div>
                </div>
            `;
            
            // 如果游戏胜利，显示特殊消息
            if (statusInfo.gameWon) {
                statusHTML += `
                    <div style="color: #FFD700; font-weight: bold; margin-top: 10px; text-align: center; font-size: 12px;">
                        🎉 迷宫征服者！🎉
                    </div>
                `;
            }
            
            statusContainer.innerHTML = statusHTML;
        } else if (this.currentGame === 'iwbtg') {
            // IWBTG 游戏状态信息
            statusContainer.innerHTML = `
                <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px; font-size: 14px;">
                    🍎 I Wanna Be The Guy 挑战
                </div>
                <div style="color: #CCCCCC; font-size: 11px;">
                    <div>难度级别: EXTREME</div>
                    <div>死亡次数: 统计中...</div>
                    <div>当前进度: 继续努力！</div>
                </div>
            `;
        }
    }

    // 启动游戏状态更新循环
    startStatusUpdater() {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
        }
        
        this.statusUpdateInterval = setInterval(() => {
            this.updateGameStatus();
        }, 500); // 每500ms更新一次状态
    }

    // 停止游戏状态更新
    stopStatusUpdater() {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
            this.statusUpdateInterval = null;
        }
    }
}

// Initialize game manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        window.gameManager = new GameManager();
        console.log('Game Manager initialized');
    }, 100);
});
