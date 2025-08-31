class Game {
    constructor() {
        this.isRunning = false;
    }

    init() {
        if (typeof gameState === 'undefined') {
            console.error('Game.init: gameState is undefined');
            return;
        }
        this.initializeSystems();
        console.log('🎮 Game initialized');
    }

    initializeSystems() {
        UI.init(gameState);
        Shop.init();
        Inventory.init();
        Traits.init();
        this.setupAutoSave();
        this.setupKeyboardShortcuts();
        this.setupVisibilityHandling();
        console.log('🔧 All systems initialized');
    }

    setupAutoSave() {
        setInterval(() => {
            if (gameState.game.isRunning) {
                gameState.save();
            }
        }, 30000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (UI.currentScreen === 'game-screen' && !gameState.game.isPaused) {
                if (event.key === 'p' || event.key === 'P') {
                    UI.togglePause();
                }
            }
        });
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && gameState.game.isRunning && !gameState.game.isPaused) {
                UI.togglePause();
            }
        });
    }
}

console.log(`🎮 ANIME TD - Tower Defense Game
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

Have fun! 🚀`);

const game = new Game();
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initializing Anime TD...');
    game.init();
});