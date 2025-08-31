class UI {
    static currentScreen = 'splash-screen';
    static gameCanvas = null;
    static gameCtx = null;
    static gameState = null;

    static init(gameState) {
        this.gameState = gameState;
        if (!this.gameState) {
            console.error('UI.init: gameState is undefined');
            return;
        }
        this.setupEventListeners();
        this.updatePlayerStats();
        this.showScreen('splash-screen');
    }

    static setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

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

        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        this.setupMapSelection();

        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('exit-game').addEventListener('click', () => {
            this.exitGame();
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

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
        if (!canvas) {
            console.error('Game canvas not found');
            return;
        }

        this.gameCanvas = canvas;
        this.gameCtx = canvas.getContext('2d');

        canvas.width = 800;
        canvas.height = 600;

        canvas.addEventListener('click', (event) => {
            if (!this.gameState || !this.gameState.game.isRunning) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.handleCanvasClick(x, y);
        });

        canvas.addEventListener('mousemove', (event) => {
            if (!this.gameState || !this.gameState.game.isRunning) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.handleCanvasHover(x, y);
        });

        if (this.gameState && typeof this.gameState.setCanvas === 'function') {
            this.gameState.setCanvas(canvas);
        } else {
            console.error('UI.setupGameCanvas: gameState.setCanvas is not available');
        }
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

        if (screenId === 'main-menu') {
            this.updatePlayerStats();
        }
    }

    static updatePlayerStats() {
        if (!this.gameState) return;
        document.getElementById('player-level').textContent = this.gameState.player.level;
        document.getElementById('player-xp').textContent = this.gameState.player.xp;
        document.getElementById('player-max-xp').textContent = this.gameState.getXPRequirement(this.gameState.player.level);
        document.getElementById('player-yen').textContent = Utils.formatNumber(this.gameState.player.yen);
        document.getElementById('trait-chips').textContent = this.gameState.player.traitChips;
        document.getElementById('stat-rerolls').textContent = this.gameState.player.statRerolls;
    }

    static startGame(mapName, difficulty) {
        if (!this.gameState) return;
        this.gameState.startGame(mapName, difficulty);
        this.showScreen('game-screen');
        this.setupGameUI();
    }

    static setupGameUI() {
        this.updateGameStats();
        this.setupUnitButtons();
    }

    static updateGameStats() {
        if (!this.gameState) return;
        document.getElementById('current-wave').textContent = this.gameState.game.wave;
        document.getElementById('lives').textContent = this.gameState.game.lives;
        document.getElementById('game-yen').textContent = Utils.formatNumber(this.gameState.game.gameYen);
    }

    static setupUnitButtons() {
        if (!this.gameState) return;
        const unitButtonsContainer = document.getElementById('unit-buttons');
        unitButtonsContainer.innerHTML = '';

        const availableUnits = this.gameState.getAvailableUnits();

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

            const info = Utils.createElement('div', 'unit-info');
            info.innerHTML = `Cost: ${unit.cost} | ${this.getPlacedCount(unit)}/${unit.maxPlacement}`;
            info.style.fontSize = '10px';
            button.appendChild(info);

            button.style.borderLeft = `4px solid ${Utils.getRarityColor(unit.rarity)}`;

            button.addEventListener('click', () => {
                this.selectUnitForPlacement(unit);
            });

            unitButtonsContainer.appendChild(button);
        });
    }

    static getPlacedCount(unit) {
        if (!this.gameState) return 0;
        return this.gameState.game.placedUnits.filter(placed => placed.templateName === unit.templateName).length;
    }

    static selectUnitForPlacement(unit) {
        if (!this.gameState) return;
        if (this.gameState.game.gameYen < unit.cost) {
            this.showGameMessage('Not enough yen!', 'error');
            return;
        }

        if (unit.traits.includes('godly')) {
            const godlyUnitsPlaced = this.gameState.game.placedUnits.filter(placed =>
                placed.traits && placed.traits.includes('godly')).length;
            if (godlyUnitsPlaced > 0) {
                this.showGameMessage('Only one godly unit allowed!', 'error');
                return;
            }
        }

        this.gameState.selectedUnitForPlacement = unit;
        this.gameCanvas.style.cursor = 'crosshair';

        document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.unit-btn').classList.add('selected');

        this.showGameMessage(`Click to place ${unit.name}`, 'info');
    }

    static handleCanvasClick(x, y) {
        if (!this.gameState || !this.gameState.selectedUnitForPlacement) return;

        const unit = this.gameState.selectedUnitForPlacement;

        if (!Maps.isValidPlacement(x, y, this.gameState.game.currentMap)) {
            this.showGameMessage('Cannot place unit here!', 'error');
            return;
        }

        if (this.checkUnitOverlap(x, y)) {
            this.showGameMessage('Too close to another unit!', 'error');
            return;
        }

        this.gameState.game.gameYen -= unit.cost;
        const placedUnit = this.gameState.placeUnit(unit, x, y);

        this.showGameMessage(`${unit.name} placed!`, 'success');
        this.updateGameStats();
        this.setupUnitButtons();

        this.gameState.selectedUnitForPlacement = null;
        this.gameCanvas.style.cursor = 'default';
    }

    static handleCanvasHover(x, y) {
        if (!this.gameState || !this.gameState.selectedUnitForPlacement) return;

        const ctx = this.gameCtx;
        ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.gameState.render();

        const unit = this.gameState.selectedUnitForPlacement;

        ctx.fillStyle = Utils.getRarityColor(unit.rarity);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, unit.stats.range * 30, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
    }

    static checkUnitOverlap(x, y) {
        if (!this.gameState) return false;
        return this.gameState.game.placedUnits.some(unit => {
            const distance = Utils.calculateDistance(x, y, unit.x, unit.y);
            return distance < 30;
        });
    }

    static togglePause() {
        if (!this.gameState) return;
        this.gameState.pauseGame();
        document.getElementById('pause-btn').textContent = this.gameState.game.isPaused ? 'Resume' : 'Pause';
    }

    static exitGame() {
        if (!this.gameState) return;
        const stats = this.gameState.endGame();
        this.showScreen('game-over');

        document.getElementById('final-wave').textContent = stats.wave;
        document.getElementById('enemies-defeated').textContent = stats.enemiesDefeated;
        document.getElementById('yen-earned').textContent = stats.yenEarned;
        document.getElementById('xp-gained').textContent = stats.xpGained;

        this.updatePlayerStats();
    }

    static startGameLoop() {
        if (!this.gameState) return;
        const gameLoop = () => {
            if (!this.gameState.game.isRunning || this.gameState.game.isPaused) return;

            this.gameState.update();
            this.renderGame();
            this.updateGameStats();

            if (this.gameState.game.lives <= 0) {
                this.exitGame();
                return;
            }

            this.gameState.game.gameLoop = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        setTimeout(() => {
            if (this.gameState.game.isRunning) {
                Enemies.spawnWave(1, this.gameState.game.currentMap, this.gameState.game.difficulty);
            }
        }, 1000);
    }

    static renderGame() {
        if (!this.gameState) return;
        this.gameState.render();
    }

    static showGameMessage(message, type) {
        const messageBox = Utils.createElement('div', `game-message ${type}`, message);
        this.gameCanvas.parentNode.appendChild(messageBox);

        setTimeout(() => {
            messageBox.remove();
        }, 2000);
    }
}