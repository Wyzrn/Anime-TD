// UI management and interactions
class UI {
    static currentScreen = 'splash-screen';
    static gameCanvas = null;
    static gameCtx = null;

    static init() {
        this.setupEventListeners();
        this.updatePlayerStats();
        this.showScreen('splash-screen');
    }

    static setupEventListeners() {
        // Splash screen
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Main menu buttons
        document.getElementById('play-btn').addEventListener('click', () => {
            this.showScreen('map-selection');
        });

        document.getElementById('shop-btn').addEventListener('click', () => {
            this.showScreen('shop-screen');
            Shop.updateDisplay();
        });

        document.getElementById('inventory-btn').addEventListener('click', () => {
            this.showScreen('inventory-screen');
            Inventory.render();
        });

        document.getElementById('traits-btn').addEventListener('click', () => {
            this.showScreen('traits-screen');
            Traits.updateDisplay();
        });

        // Map selection
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        this.setupMapSelection();

        // Game screen
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('exit-game').addEventListener('click', () => {
            this.exitGame();
        });

        // Game over screen
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Setup canvas
        this.setupGameCanvas();
    }

    static setupMapSelection() {
        const mapCards = document.querySelectorAll('.map-card');
        mapCards.forEach(card => {
            const mapName = card.dataset.map;
            const difficultyButtons = card.querySelectorAll('[data-difficulty]');
            
            difficultyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const difficulty = button.dataset.difficulty;
                    this.startGame(mapName, difficulty);
                });
            });
        });
    }

    static setupGameCanvas() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        this.gameCanvas = canvas;
        this.gameCtx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Setup click handler for unit placement
        canvas.addEventListener('click', (event) => {
            if (!gameState.game.isRunning) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.handleCanvasClick(x, y);
        });

        // Setup hover for placement preview
        canvas.addEventListener('mousemove', (event) => {
            if (!gameState.game.isRunning) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.handleCanvasHover(x, y);
        });

        gameState.setCanvas(canvas);
    }

    static showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }

        // Update UI based on screen
        if (screenId === 'main-menu') {
            this.updatePlayerStats();
        }
    }

    static updatePlayerStats() {
        document.getElementById('player-level').textContent = gameState.player.level;
        document.getElementById('player-xp').textContent = gameState.player.xp;
        document.getElementById('player-max-xp').textContent = gameState.getXPRequirement(gameState.player.level);
        document.getElementById('player-yen').textContent = Utils.formatNumber(gameState.player.yen);
        document.getElementById('trait-chips').textContent = gameState.player.traitChips;
        document.getElementById('stat-rerolls').textContent = gameState.player.statRerolls;
    }

    static startGame(mapName, difficulty) {
        gameState.startGame(mapName, difficulty);
        this.showScreen('game-screen');
        this.setupGameUI();
        this.startGameLoop();
    }

    static setupGameUI() {
        this.updateGameStats();
        this.setupUnitButtons();
    }

    static updateGameStats() {
        document.getElementById('current-wave').textContent = gameState.game.wave;
        document.getElementById('lives').textContent = gameState.game.lives;
        document.getElementById('game-yen').textContent = Utils.formatNumber(gameState.game.gameYen);
    }

    static setupUnitButtons() {
        const unitButtonsContainer = document.getElementById('unit-buttons');
        unitButtonsContainer.innerHTML = '';

        const availableUnits = gameState.getAvailableUnits();
        
        if (availableUnits.length === 0) {
            const noUnits = Utils.createElement('div', 'no-units', 'No units available!');
            noUnits.style.padding = '10px';
            noUnits.style.textAlign = 'center';
            unitButtonsContainer.appendChild(noUnits);
            return;
        }

        availableUnits.forEach(unit => {
            const button = Utils.createElement('button', 'unit-btn', unit.name);
            button.dataset.unitId = unit.id;
            
            // Add cost and placement info
            const info = Utils.createElement('div', 'unit-info');
            info.innerHTML = `Cost: ${unit.cost} | ${this.getPlacedCount(unit)}/${unit.maxPlacement}`;
            info.style.fontSize = '10px';
            button.appendChild(info);

            // Style based on rarity
            button.style.borderLeft = `4px solid ${Utils.getRarityColor(unit.rarity)}`;

            button.addEventListener('click', () => {
                this.selectUnitForPlacement(unit);
            });

            unitButtonsContainer.appendChild(button);
        });
    }

    static getPlacedCount(unit) {
        return gameState.game.placedUnits.filter(placed => placed.templateName === unit.templateName).length;
    }

    static selectUnitForPlacement(unit) {
        if (gameState.game.gameYen < unit.cost) {
            this.showGameMessage('Not enough yen!', 'error');
            return;
        }

        // Check godly trait limitation
        if (unit.traits.includes('godly')) {
            const godlyUnitsPlaced = gameState.game.placedUnits.filter(placed => 
                placed.traits && placed.traits.includes('godly')).length;
            if (godlyUnitsPlaced > 0) {
                this.showGameMessage('Only one godly unit allowed!', 'error');
                return;
            }
        }

        gameState.selectedUnitForPlacement = unit;
        this.gameCanvas.style.cursor = 'crosshair';
        
        // Highlight selected button
        document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.unit-btn').classList.add('selected');

        this.showGameMessage(`Click to place ${unit.name}`, 'info');
    }

    static handleCanvasClick(x, y) {
        if (!gameState.selectedUnitForPlacement) return;

        const unit = gameState.selectedUnitForPlacement;
        
        // Check if placement is valid
        if (!Maps.isValidPlacement(x, y, gameState.game.currentMap)) {
            this.showGameMessage('Cannot place unit here!', 'error');
            return;
        }

        // Check for unit overlap
        if (this.checkUnitOverlap(x, y)) {
            this.showGameMessage('Too close to another unit!', 'error');
            return;
        }

        // Place the unit
        gameState.game.gameYen -= unit.cost;
        const placedUnit = gameState.placeUnit(unit, x, y);
        
        this.showGameMessage(`${unit.name} placed!`, 'success');
        this.updateGameStats();
        this.setupUnitButtons(); // Refresh available units
        
        // Clear selection
        gameState.selectedUnitForPlacement = null;
        this.gameCanvas.style.cursor = 'default';
        document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('selected'));

        Utils.playSound('place_unit');
        Utils.vibrate(100);
    }

    static checkUnitOverlap(x, y) {
        const minDistance = 40; // Minimum distance between units
        return gameState.game.placedUnits.some(unit => {
            const distance = Utils.calculateDistance(x, y, unit.x, unit.y);
            return distance < minDistance;
        });
    }

    static handleCanvasHover(x, y) {
        if (!gameState.selectedUnitForPlacement) return;

        // Show placement preview
        this.placementPreview = { x, y, valid: Maps.isValidPlacement(x, y, gameState.game.currentMap) };
    }

    static showGameMessage(message, type = 'info') {
        // Create floating message
        const messageDiv = Utils.createElement('div', 'game-message', message);
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.fontWeight = 'bold';

        switch (type) {
            case 'error':
                messageDiv.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
                messageDiv.style.color = 'white';
                break;
            case 'success':
                messageDiv.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
                messageDiv.style.color = 'white';
                break;
            default:
                messageDiv.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
                messageDiv.style.color = 'white';
        }

        document.body.appendChild(messageDiv);

        // Remove message after 2 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 2000);
    }

    static startGameLoop() {
        const gameLoop = () => {
            if (!gameState.game.isRunning) return;

            gameState.update();
            this.renderGame();
            this.updateGameStats();

            if (gameState.game.lives <= 0) {
                this.endGame();
                return;
            }

            gameState.game.gameLoop = requestAnimationFrame(gameLoop);
        };

        gameLoop();
        
        // Start first wave after a delay
        setTimeout(() => {
            if (gameState.game.isRunning) {
                Enemies.spawnWave(1, gameState.game.currentMap, gameState.game.difficulty);
            }
        }, 1000);
    }

    static renderGame() {
        if (!this.gameCtx) return;

        gameState.render();

        // Draw placement preview
        if (this.placementPreview && gameState.selectedUnitForPlacement) {
            this.drawPlacementPreview();
        }

        // Draw UI overlays
        this.drawGameOverlays();
    }

    static drawPlacementPreview() {
        const ctx = this.gameCtx;
        const preview = this.placementPreview;
        const unit = gameState.selectedUnitForPlacement;

        if (!preview || !unit) return;

        // Draw unit preview
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        if (preview.valid && !this.checkUnitOverlap(preview.x, preview.y)) {
            ctx.fillStyle = 'rgba(39, 174, 96, 0.8)'; // Green for valid
        } else {
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)'; // Red for invalid
        }

        ctx.beginPath();
        ctx.arc(preview.x, preview.y, 15, 0, 2 * Math.PI);
        ctx.fill();

        // Draw range indicator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(preview.x, preview.y, unit.stats.range * 30, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }

    static drawGameOverlays() {
        const ctx = this.gameCtx;

        // Draw wave indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 120, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Wave ${gameState.game.wave}`, 20, 35);

        // Draw lives
        ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
        ctx.fillRect(10, 60, 80, 30);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`♥ ${gameState.game.lives}`, 20, 80);

        // Draw enemy count
        ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
        ctx.fillRect(10, 100, 100, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Enemies: ${gameState.game.enemies.length}`, 15, 120);
    }

    static togglePause() {
        gameState.pauseGame();
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = gameState.game.isPaused ? 'Resume' : 'Pause';
    }

    static exitGame() {
        const result = gameState.endGame();
        this.showGameOverScreen(result);
    }

    static endGame() {
        const result = gameState.endGame();
        this.showGameOverScreen(result);
    }

    static showGameOverScreen(result) {
        // Update game over stats
        document.getElementById('final-wave').textContent = result.wave;
        document.getElementById('enemies-defeated').textContent = result.enemiesDefeated;
        document.getElementById('yen-earned').textContent = Utils.formatNumber(result.yenEarned);
        document.getElementById('xp-gained').textContent = Utils.formatNumber(result.xpGained);

        this.showScreen('game-over');
        this.updatePlayerStats();

        Utils.playSound('game_over');
    }

    static updateUI() {
        if (this.currentScreen === 'main-menu') {
            this.updatePlayerStats();
        } else if (this.currentScreen === 'game-screen') {
            this.updateGameStats();
        } else if (this.currentScreen === 'shop-screen') {
            Shop.updateDisplay();
        } else if (this.currentScreen === 'inventory-screen') {
            Inventory.render();
        } else if (this.currentScreen === 'traits-screen') {
            Traits.updateDisplay();
        }
    }

    static addScreenTransition(fromScreen, toScreen) {
        // Add smooth transitions between screens
        const from = document.getElementById(fromScreen);
        const to = document.getElementById(toScreen);

        if (from) {
            from.style.transition = 'opacity 0.3s ease-out';
            from.style.opacity = '0';
            setTimeout(() => {
                from.classList.add('hidden');
            }, 300);
        }

        if (to) {
            to.classList.remove('hidden');
            to.style.transition = 'opacity 0.3s ease-in';
            to.style.opacity = '0';
            setTimeout(() => {
                to.style.opacity = '1';
            }, 50);
        }
    }

    static showNotification(message, duration = 3000) {
        const notification = Utils.createElement('div', 'notification', message);
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
        notification.style.color = 'white';
        notification.style.padding = '15px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '1000';
        notification.style.maxWidth = '300px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                notification.style.transition = 'transform 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }

    static createProgressBar(current, max, width = 100) {
        const progressBar = Utils.createElement('div', 'progress-bar');
        progressBar.style.width = width + 'px';
        progressBar.style.height = '10px';
        progressBar.style.backgroundColor = 'rgba(0,0,0,0.3)';
        progressBar.style.borderRadius = '5px';
        progressBar.style.overflow = 'hidden';

        const progressFill = Utils.createElement('div', 'progress-fill');
        progressFill.style.width = Math.max(0, Math.min(100, (current / max) * 100)) + '%';
        progressFill.style.height = '100%';
        progressFill.style.backgroundColor = current / max > 0.5 ? '#27ae60' : current / max > 0.25 ? '#f39c12' : '#e74c3c';
        progressFill.style.borderRadius = '5px';
        progressFill.style.transition = 'width 0.3s ease';

        progressBar.appendChild(progressFill);
        return progressBar;
    }
}