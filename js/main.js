// Main game controller
class Game {
    constructor() {
        this.isInitialized = false;
        this.lastUpdate = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
    }

    async init() {
        if (this.isInitialized) return;

        console.log('🎮 Initializing Anime TD...');

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize all systems
            this.initializeSystems();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();

            this.isInitialized = true;
            console.log('✅ Anime TD initialized successfully!');

        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    initializeSystems() {
        // Initialize UI first (handles screen management)
        UI.init();
        
        // Initialize shop system
        Shop.init();
        
        // Initialize inventory system
        Inventory.init();
        
        // Initialize traits system
        Traits.init();

        // Set up auto-save
        this.setupAutoSave();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Set up visibility change handling
        this.setupVisibilityHandling();

        console.log('🔧 All systems initialized');
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showError(`Game error: ${event.error.message}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showError(`Promise error: ${event.reason}`);
        });
    }

    setupPerformanceMonitoring() {
        // Monitor frame rate
        let frameCount = 0;
        let lastFPSCheck = Date.now();

        const checkFPS = () => {
            frameCount++;
            const now = Date.now();
            
            if (now - lastFPSCheck >= 1000) { // Check every second
                const fps = frameCount;
                frameCount = 0;
                lastFPSCheck = now;
                
                if (fps < 30 && gameState.game.isRunning) {
                    console.warn('⚠️ Low FPS detected:', fps);
                }
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (gameState) {
                gameState.save();
                console.log('💾 Auto-saved game state');
            }
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            if (gameState) {
                gameState.save();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Prevent shortcuts during text input
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.code) {
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'Space':
                    if (gameState.game.isRunning) {
                        event.preventDefault();
                        UI.togglePause();
                    }
                    break;
                case 'KeyS':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        gameState.save();
                        UI.showNotification('Game saved!', 1000);
                    }
                    break;
                case 'KeyR':
                    if (gameState.game.isRunning && event.ctrlKey) {
                        event.preventDefault();
                        this.restartWave();
                    }
                    break;
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                    if (gameState.game.isRunning) {
                        const unitIndex = parseInt(event.code.slice(-1)) - 1;
                        this.selectUnitByIndex(unitIndex);
                    }
                    break;
            }
        });
    }

    handleEscapeKey() {
        if (gameState.game.isRunning) {
            if (gameState.selectedUnitForPlacement) {
                // Cancel unit placement
                gameState.selectedUnitForPlacement = null;
                UI.gameCanvas.style.cursor = 'default';
                document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('selected'));
                UI.showGameMessage('Placement cancelled', 'info');
            } else {
                // Pause/unpause game
                UI.togglePause();
            }
        } else {
            // Return to main menu from other screens
            if (UI.currentScreen !== 'main-menu') {
                UI.showScreen('main-menu');
            }
        }
    }

    selectUnitByIndex(index) {
        const availableUnits = gameState.getAvailableUnits();
        if (index < availableUnits.length) {
            const unit = availableUnits[index];
            UI.selectUnitForPlacement(unit);
        }
    }

    restartWave() {
        // Clear current enemies and restart current wave
        gameState.game.enemies = [];
        gameState.isSpawningEnemies = false;
        
        setTimeout(() => {
            Enemies.spawnWave(gameState.game.wave, gameState.game.currentMap, gameState.game.difficulty);
        }, 500);
        
        UI.showGameMessage('Wave restarted!', 'info');
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && gameState.game.isRunning && !gameState.game.isPaused) {
                // Auto-pause when tab becomes hidden
                UI.togglePause();
                UI.showGameMessage('Game paused (tab hidden)', 'info');
            }
        });
    }

    showError(message) {
        // Create error modal
        const errorModal = document.createElement('div');
        errorModal.style.position = 'fixed';
        errorModal.style.top = '0';
        errorModal.style.left = '0';
        errorModal.style.width = '100%';
        errorModal.style.height = '100%';
        errorModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        errorModal.style.zIndex = '10000';
        errorModal.style.display = 'flex';
        errorModal.style.alignItems = 'center';
        errorModal.style.justifyContent = 'center';

        const errorContent = document.createElement('div');
        errorContent.style.backgroundColor = '#2c3e50';
        errorContent.style.color = '#fff';
        errorContent.style.padding = '30px';
        errorContent.style.borderRadius = '10px';
        errorContent.style.maxWidth = '400px';
        errorContent.style.textAlign = 'center';

        errorContent.innerHTML = `
            <h3 style="color: #e74c3c; margin-bottom: 15px;">⚠️ Error</h3>
            <p style="margin-bottom: 20px;">${message}</p>
            <button onclick="location.reload()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Reload Game</button>
        `;

        errorModal.appendChild(errorContent);
        document.body.appendChild(errorModal);
    }

    // Development/Debug methods
    giveYen(amount = 1000) {
        if (typeof amount === 'number' && amount > 0) {
            gameState.gainYen(amount);
            UI.updatePlayerStats();
            UI.showNotification(`Added ${amount} yen!`);
            console.log(`💰 Added ${amount} yen`);
        }
    }

    giveXP(amount = 1000) {
        if (typeof amount === 'number' && amount > 0) {
            gameState.gainXP(amount);
            UI.updatePlayerStats();
            UI.showNotification(`Added ${amount} XP!`);
            console.log(`⭐ Added ${amount} XP`);
        }
    }

    giveTraitChips(amount = 10) {
        if (typeof amount === 'number' && amount > 0) {
            gameState.player.traitChips += amount;
            UI.updatePlayerStats();
            UI.showNotification(`Added ${amount} trait chips!`);
            console.log(`🎯 Added ${amount} trait chips`);
        }
    }

    unlockAllUnits() {
        const allUnitTypes = Object.keys(Units.unitTemplates);
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
        
        allUnitTypes.forEach(unitType => {
            rarities.forEach(rarity => {
                const unit = Units.createUnit(unitType, rarity);
                if (unit) {
                    gameState.addUnitToInventory(unit);
                }
            });
        });
        
        UI.showNotification('All units unlocked!');
        console.log('🔓 All units unlocked');
    }

    resetGame() {
        if (confirm('Are you sure you want to reset all progress?')) {
            gameState.reset();
            UI.updatePlayerStats();
            UI.showNotification('Game reset!');
            console.log('🔄 Game reset');
        }
    }

    // Performance optimization
    optimizePerformance() {
        // Limit enemy count for performance
        const maxEnemies = 50;
        if (gameState.game.enemies.length > maxEnemies) {
            gameState.game.enemies = gameState.game.enemies.slice(-maxEnemies);
        }

        // Clean up dead enemies more frequently
        gameState.game.enemies = gameState.game.enemies.filter(enemy => enemy.health > 0);

        // Reduce visual effects on low-end devices
        if (navigator.hardwareConcurrency <= 2) {
            // Simplified rendering for low-end devices
            this.lowEndMode = true;
        }
    }

    // Game statistics
    getGameStats() {
        return {
            player: {
                level: gameState.player.level,
                xp: gameState.player.xp,
                yen: gameState.player.yen,
                unitsOwned: gameState.player.inventory.length,
                traitChips: gameState.player.traitChips
            },
            session: {
                isRunning: gameState.game.isRunning,
                currentWave: gameState.game.wave,
                enemiesDefeated: gameState.game.enemiesDefeated,
                unitsPlaced: gameState.game.placedUnits.length
            }
        };
    }
}

// Initialize the game
const game = new Game();

// Start the game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => game.init());
} else {
    game.init();
}

// Make game object globally available for debugging
window.game = game;
window.gameState = gameState;
window.Utils = Utils;

// Console welcome message
console.log(`
🎮 ANIME TD - Tower Defense Game
================================

Debug Commands:
- game.giveYen(amount) - Add yen
- game.giveXP(amount) - Add XP  
- game.giveTraitChips(amount) - Add trait chips
- game.unlockAllUnits() - Unlock all units
- game.resetGame() - Reset all progress
- game.getGameStats() - Show game statistics

Game Controls:
- ESC - Pause/Cancel
- SPACE - Pause/Resume
- 1-5 - Quick select units
- Ctrl+S - Manual save

Have fun! 🚀
`);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, gameState, Utils, Units, Enemies, Maps, Shop, Inventory, Traits, UI };
}