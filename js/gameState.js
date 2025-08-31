class GameState {
    constructor() {
        this.player = {
            level: 1,
            xp: 0,
            yen: 1000,
            traitChips: 0,
            statRerolls: 0,
            unlockedUnits: ['kaneki'],
        };

        this.game = {
            isRunning: false,
            isPaused: false,
            wave: 1,
            lives: 10,
            gameYen: 1000,
            enemies: [],
            placedUnits: [],
            currentMap: null,
            difficulty: null,
            gameLoop: null
        };

        this.selectedUnitForPlacement = null;
        this.canvas = null;
    }

    setCanvas(canvas) {
        this.canvas = canvas;
    }

    startGame(mapName, difficulty) {
        this.game.isRunning = true;
        this.game.isPaused = false;
        this.game.wave = 1;
        this.game.lives = 10;
        this.game.gameYen = 1000;
        this.game.enemies = [];
        this.game.placedUnits = [];
        this.game.currentMap = mapName;
        this.game.difficulty = difficulty;

        this.save();
    }

    pauseGame() {
        this.game.isPaused = !this.game.isPaused;
    }

    endGame() {
        this.game.isRunning = false;
        cancelAnimationFrame(this.game.gameLoop);

        const stats = {
            wave: this.game.wave,
            enemiesDefeated: this.game.enemies.filter(enemy => enemy.health <= 0).length,
            yenEarned: this.game.gameYen,
            xpGained: this.game.wave * 100
        };

        this.player.xp += stats.xpGained;
        this.player.yen += stats.yenEarned;

        this.checkLevelUp();
        this.save();

        return stats;
    }

    checkLevelUp() {
        while (this.player.xp >= this.getXPRequirement(this.player.level)) {
            this.player.xp -= this.getXPRequirement(this.player.level);
            this.player.level++;
            this.player.traitChips += 5;
            this.player.statRerolls += 1;

            if (this.player.level % 5 === 0) {
                this.unlockRandomUnit();
            }
        }
    }

    getXPRequirement(level) {
        return 100 * level;
    }

    unlockRandomUnit() {
        const lockedUnits = Object.keys(Unit.unitTemplates).filter(unit => !this.player.unlockedUnits.includes(unit));
        if (lockedUnits.length > 0) {
            const randomUnit = Utils.getRandomElement(lockedUnits);
            this.player.unlockedUnits.push(randomUnit);
        }
    }

    getAvailableUnits() {
        return this.player.unlockedUnits.map(unitId => {
            const template = Unit.unitTemplates[unitId];
            if (!template) {
                console.error(`Unit template not found for ID: ${unitId}`);
                return null;
            }
            return {
                ...template,
                id: Utils.getRandomInt(1000, 9999),
                stats: Unit.generateUnitStats(template.rarity)
            };
        }).filter(unit => unit !== null);
    }

    placeUnit(unit, x, y) {
        const placedUnit = Unit.createUnit(unit, x, y);
        if (!placedUnit) {
            console.error('Failed to create unit');
            return null;
        }
        this.game.placedUnits.push(placedUnit);
        return placedUnit;
    }

    update() {
        if (!this.game.isRunning || this.game.isPaused) return;

        this.game.enemies.forEach(enemy => {
            enemy.update();
            if (enemy.reachedEnd) {
                this.game.lives--;
                this.game.enemies = this.game.enemies.filter(e => e !== enemy);
            }
        });

        this.game.placedUnits.forEach(unit => {
            unit.update(this.game.enemies);
        });

        this.game.wave = Math.max(this.game.wave, Math.floor(this.game.enemies.length / 10) + 1);
    }

    render() {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        Maps.drawMap(ctx, this.game.currentMap);
        Maps.drawPath(ctx, this.game.currentMap);

        this.game.enemies.forEach(enemy => {
            enemy.render(ctx);
        });

        this.game.placedUnits.forEach(unit => {
            unit.render(ctx);
        });
    }

    save() {
        Utils.saveToLocalStorage('gameState', {
            player: this.player,
            game: {
                wave: this.game.wave,
                lives: this.game.lives,
                gameYen: this.game.gameYen,
                currentMap: this.game.currentMap,
                difficulty: this.game.difficulty
            }
        });
    }

    load() {
        const data = Utils.loadFromLocalStorage('gameState');
        if (data) {
            this.player = data.player;
            this.game.wave = data.game.wave;
            this.game.lives = data.game.lives;
            this.game.gameYen = data.game.gameYen;
            this.game.currentMap = data.game.currentMap;
            this.game.difficulty = data.game.difficulty;
        }
    }

    giveYen(amount) {
        this.player.yen += amount;
        this.game.gameYen += amount;
        this.save();
    }

    giveXP(amount) {
        this.player.xp += amount;
        this.checkLevelUp();
        this.save();
    }

    giveTraitChips(amount) {
        this.player.traitChips += amount;
        this.save();
    }

    unlockAllUnits() {
        this.player.unlockedUnits = Object.keys(Unit.unitTemplates);
        this.save();
    }

    resetGame() {
        this.player = {
            level: 1,
            xp: 0,
            yen: 1000,
            traitChips: 0,
            statRerolls: 0,
            unlockedUnits: ['kaneki']
        };
        this.game = {
            isRunning: false,
            isPaused: false,
            wave: 1,
            lives: 10,
            gameYen: 1000,
            enemies: [],
            placedUnits: [],
            currentMap: null,
            difficulty: null,
            gameLoop: null
        };
        this.save();
    }

    getGameStats() {
        return {
            playerLevel: this.player.level,
            playerXP: this.player.xp,
            playerYen: this.player.yen,
            traitChips: this.player.traitChips,
            statRerolls: this.player.statRerolls,
            wave: this.game.wave,
            lives: this.game.lives,
            gameYen: this.game.gameYen
        };
    }
}

const gameState = new GameState();