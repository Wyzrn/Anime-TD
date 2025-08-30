// Game state management
class GameState {
    constructor() {
        this.player = {
            level: 1,
            xp: 0,
            yen: 500, // Start with some yen
            traitChips: 0,
            statRerolls: 0,
            inventory: [],
            selectedUnit: null
        };

        this.game = {
            currentMap: null,
            difficulty: 'easy',
            wave: 1,
            lives: 20,
            gameYen: 0,
            enemiesDefeated: 0,
            placedUnits: [],
            enemies: [],
            isRunning: false,
            isPaused: false,
            gameLoop: null,
            canvas: null,
            ctx: null
        };

        this.difficulties = {
            easy: { multiplier: 1, lives: 20, rewards: 1 },
            medium: { multiplier: 1.5, lives: 15, rewards: 1.2 },
            hard: { multiplier: 2, lives: 10, rewards: 1.5 },
            expert: { multiplier: 3, lives: 8, rewards: 2 },
            godly: { multiplier: 4, lives: 5, rewards: 2.5 },
            impossible: { multiplier: 5, lives: 1, rewards: 3 }
        };

        this.load();
        this.addStartingUnit();
    }

    addStartingUnit() {
        if (this.player.inventory.length === 0) {
            const kaneki = Units.createUnit('kaneki', 'common');
            this.player.inventory.push(kaneki);
        }
    }

    getXPRequirement(level) {
        if (level <= 1) return 1000;
        if (level <= 2) return 5000;
        if (level <= 3) return 10000;
        if (level <= 4) return 15000;
        if (level <= 5) return 20000;
        if (level <= 10) return 20000 + (level - 5) * 5000;
        return 45000 + (level - 10) * 10000;
    }

    gainXP(amount) {
        this.player.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const required = this.getXPRequirement(this.player.level);
        if (this.player.xp >= required) {
            this.player.xp -= required;
            this.player.level++;
            this.player.traitChips++;
            this.player.statRerolls++;
            console.log(`Level up! Now level ${this.player.level}`);
            this.checkLevelUp(); // Check for multiple level ups
        }
    }

    gainYen(amount) {
        this.player.yen += Math.floor(amount);
        this.game.gameYen += Math.floor(amount);
    }

    spendYen(amount) {
        if (this.player.yen >= amount) {
            this.player.yen -= amount;
            return true;
        }
        return false;
    }

    addUnitToInventory(unit) {
        this.player.inventory.push(unit);
    }

    getAvailableUnits() {
        return this.player.inventory.filter(unit => {
            const placedCount = this.game.placedUnits.filter(placed => placed.id === unit.id).length;
            return placedCount < unit.maxPlacement;
        });
    }

    placeUnit(unit, x, y) {
        const placedUnit = {
            ...Utils.deepClone(unit),
            x: x,
            y: y,
            lastAttack: 0,
            target: null,
            animationFrame: 0,
            placed: true
        };
        
        this.game.placedUnits.push(placedUnit);
        return placedUnit;
    }

    removeUnit(unit) {
        const index = this.game.placedUnits.indexOf(unit);
        if (index > -1) {
            this.game.placedUnits.splice(index, 1);
        }
    }

    startGame(mapName, difficulty) {
        this.game.currentMap = mapName;
        this.game.difficulty = difficulty;
        this.game.wave = 1;
        this.game.lives = this.difficulties[difficulty].lives;
        this.game.gameYen = 0;
        this.game.enemiesDefeated = 0;
        this.game.placedUnits = [];
        this.game.enemies = [];
        this.game.isRunning = true;
        this.game.isPaused = false;
    }

    endGame() {
        this.game.isRunning = false;
        this.game.isPaused = false;
        
        if (this.game.gameLoop) {
            cancelAnimationFrame(this.game.gameLoop);
            this.game.gameLoop = null;
        }

        // Calculate rewards
        const difficultyMultiplier = this.difficulties[this.game.difficulty].rewards;
        const yenReward = Math.floor(this.game.enemiesDefeated * difficultyMultiplier);
        const xpReward = Math.floor(this.game.enemiesDefeated * difficultyMultiplier);
        const chipReward = Math.floor(this.game.wave / 10);
        const rerollReward = Math.floor(this.game.wave / 5);

        this.gainYen(yenReward);
        this.gainXP(xpReward);
        this.player.traitChips += chipReward;
        this.player.statRerolls += rerollReward;

        return {
            wave: this.game.wave,
            enemiesDefeated: this.game.enemiesDefeated,
            yenEarned: yenReward,
            xpGained: xpReward,
            chipsGained: chipReward,
            rerollsGained: rerollReward
        };
    }

    pauseGame() {
        this.game.isPaused = !this.game.isPaused;
    }

    save() {
        const saveData = {
            player: this.player,
            timestamp: Date.now()
        };
        Utils.saveToLocalStorage('animeTD_save', saveData);
    }

    load() {
        const saveData = Utils.loadFromLocalStorage('animeTD_save');
        if (saveData && saveData.player) {
            this.player = { ...this.player, ...saveData.player };
        }
    }

    reset() {
        this.player = {
            level: 1,
            xp: 0,
            yen: 500,
            traitChips: 0,
            statRerolls: 0,
            inventory: [],
            selectedUnit: null
        };
        this.addStartingUnit();
        this.save();
    }

    update() {
        if (!this.game.isRunning || this.game.isPaused) return;

        // Update enemies
        this.game.enemies.forEach(enemy => {
            enemy.update();
        });

        // Remove dead enemies
        this.game.enemies = this.game.enemies.filter(enemy => {
            if (enemy.health <= 0) {
                this.game.enemiesDefeated++;
                this.gainXP(1);
                this.gainYen(1);
                return false;
            }
            return true;
        });

        // Remove enemies that reached the end
        this.game.enemies = this.game.enemies.filter(enemy => {
            if (enemy.reachedEnd) {
                this.game.lives--;
                if (this.game.lives <= 0) {
                    this.endGame();
                }
                return false;
            }
            return true;
        });

        // Update placed units
        this.game.placedUnits.forEach(unit => {
            unit.update(this.game.enemies);
        });

        // Check for next wave
        if (this.game.enemies.length === 0 && !this.isSpawningEnemies) {
            this.startNextWave();
        }

        this.save();
    }

    startNextWave() {
        this.game.wave++;
        setTimeout(() => {
            Enemies.spawnWave(this.game.wave, this.game.currentMap, this.game.difficulty);
        }, 2000); // 2 second delay between waves
    }

    render() {
        if (!this.game.ctx) return;

        const ctx = this.game.ctx;
        const canvas = this.game.canvas;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw map background
        Maps.drawMap(ctx, this.game.currentMap);

        // Draw path
        Maps.drawPath(ctx, this.game.currentMap);

        // Draw placed units
        this.game.placedUnits.forEach(unit => {
            unit.render(ctx);
        });

        // Draw enemies
        this.game.enemies.forEach(enemy => {
            enemy.render(ctx);
        });

        // Draw projectiles (if any)
        this.renderProjectiles(ctx);
    }

    renderProjectiles(ctx) {
        // Placeholder for projectile rendering
        // This would be implemented when adding projectile system
    }

    setCanvas(canvas) {
        this.game.canvas = canvas;
        this.game.ctx = canvas.getContext('2d');
    }
}

// Global game state instance
const gameState = new GameState();