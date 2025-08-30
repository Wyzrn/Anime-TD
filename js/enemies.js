// Enemy definitions and spawning logic
class Enemies {
    static enemyTemplates = {
        // Dragon Ball enemies
        dragonball: {
            basic: { name: 'Saibaman', health: 20, speed: 2, reward: 1 },
            strong: { name: 'Frieza Soldier', health: 50, speed: 1.5, reward: 3 },
            elite: { name: 'Ginyu Force', health: 100, speed: 2.5, reward: 5 },
            boss: { name: 'Cell Jr', health: 300, speed: 1, reward: 15 }
        },
        // Naruto enemies
        naruto: {
            basic: { name: 'Rogue Ninja', health: 25, speed: 2.2, reward: 1 },
            strong: { name: 'Sound Four', health: 60, speed: 1.8, reward: 3 },
            elite: { name: 'Akatsuki Member', health: 120, speed: 2.3, reward: 5 },
            boss: { name: 'Tailed Beast', health: 350, speed: 0.8, reward: 15 }
        },
        // Bleach enemies
        bleach: {
            basic: { name: 'Hollow', health: 22, speed: 2.1, reward: 1 },
            strong: { name: 'Arrancar', health: 55, speed: 1.7, reward: 3 },
            elite: { name: 'Espada', health: 110, speed: 2.4, reward: 5 },
            boss: { name: 'Menos Grande', health: 320, speed: 0.9, reward: 15 }
        },
        // One Piece enemies
        onepiece: {
            basic: { name: 'Marine Grunt', health: 18, speed: 2.3, reward: 1 },
            strong: { name: 'Pirate Captain', health: 45, speed: 2, reward: 3 },
            elite: { name: 'Shichibukai', health: 95, speed: 2.6, reward: 5 },
            boss: { name: 'Yonko Commander', health: 280, speed: 1.2, reward: 15 }
        },
        // JoJo enemies
        jojo: {
            basic: { name: 'Stand User', health: 28, speed: 1.9, reward: 1 },
            strong: { name: 'Pillar Man', health: 65, speed: 1.6, reward: 3 },
            elite: { name: 'DIO Follower', health: 115, speed: 2.2, reward: 5 },
            boss: { name: 'Ultimate Being', health: 400, speed: 1.1, reward: 15 }
        },
        // Attack on Titan enemies
        aot: {
            basic: { name: 'Pure Titan', health: 35, speed: 1.5, reward: 1 },
            strong: { name: 'Abnormal Titan', health: 70, speed: 1.9, reward: 3 },
            elite: { name: 'Shifter Titan', health: 130, speed: 2.1, reward: 5 },
            boss: { name: 'Colossal Titan', health: 450, speed: 0.7, reward: 15 }
        }
    };

    static createEnemy(mapName, type, wave, difficulty = 'easy') {
        const template = this.enemyTemplates[mapName]?.[type];
        if (!template) return null;

        const difficultyMultiplier = gameState.difficulties[difficulty].multiplier;
        const waveMultiplier = 1 + (wave - 1) * 0.1; // 10% more health per wave

        const enemy = {
            id: Utils.getRandomInt(1000, 9999) + Date.now(),
            name: template.name,
            type: type,
            maxHealth: Math.floor(template.health * difficultyMultiplier * waveMultiplier),
            health: Math.floor(template.health * difficultyMultiplier * waveMultiplier),
            speed: template.speed,
            reward: Math.floor(template.reward * difficultyMultiplier),
            
            // Position and movement
            x: -30, // Start off-screen
            y: 300, // Middle of screen
            targetX: 0,
            targetY: 0,
            pathIndex: 0,
            reachedEnd: false,
            
            // Effects
            effects: {},
            
            // Visual
            animationFrame: 0,
            
            // Methods
            update: this.updateEnemy.bind(null),
            render: this.renderEnemy.bind(null),
            takeDamage: this.takeDamage.bind(null),
            applyEffect: this.applyEffect.bind(null),
            updateEffects: this.updateEffects.bind(null)
        };

        return enemy;
    }

    static spawnWave(waveNumber, mapName, difficulty) {
        gameState.isSpawningEnemies = true;
        
        const enemies = [];
        const baseCount = Math.min(5 + Math.floor(waveNumber / 2), 20); // Max 20 enemies per wave
        
        // Determine enemy composition based on wave
        for (let i = 0; i < baseCount; i++) {
            let enemyType = 'basic';
            
            // Higher waves spawn stronger enemies
            if (waveNumber >= 5 && Math.random() < 0.3) enemyType = 'strong';
            if (waveNumber >= 10 && Math.random() < 0.2) enemyType = 'elite';
            if (waveNumber >= 15 && i === 0 && Math.random() < 0.15) enemyType = 'boss';
            
            const enemy = this.createEnemy(mapName, enemyType, waveNumber, difficulty);
            if (enemy) {
                enemies.push(enemy);
            }
        }
        
        // Spawn enemies with delay
        enemies.forEach((enemy, index) => {
            setTimeout(() => {
                gameState.game.enemies.push(enemy);
                if (index === enemies.length - 1) {
                    gameState.isSpawningEnemies = false;
                }
            }, index * 500); // 0.5 second between each enemy
        });
    }

    static updateEnemy(enemy) {
        if (enemy.health <= 0) return;

        // Update effects
        enemy.updateEffects();

        // Get path for current map
        const path = Maps.getPath(gameState.game.currentMap);
        if (!path || path.length === 0) return;

        // Move along path
        if (enemy.pathIndex < path.length) {
            const target = path[enemy.pathIndex];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 10) {
                enemy.pathIndex++;
                if (enemy.pathIndex >= path.length) {
                    enemy.reachedEnd = true;
                }
            } else {
                const moveSpeed = enemy.speed * 2; // Convert to pixels per frame
                enemy.x += (dx / distance) * moveSpeed;
                enemy.y += (dy / distance) * moveSpeed;
            }
        }

        enemy.animationFrame = (enemy.animationFrame + 1) % 60;
    }

    static renderEnemy(enemy, ctx) {
        if (enemy.health <= 0) return;

        // Enemy body
        let color = '#e74c3c'; // Red for basic
        if (enemy.type === 'strong') color = '#f39c12'; // Orange
        if (enemy.type === 'elite') color = '#9b59b6'; // Purple
        if (enemy.type === 'boss') color = '#2c3e50'; // Dark blue

        // Apply effect colors
        if (enemy.effects.poison) color = '#27ae60'; // Green tint for poison
        if (enemy.effects.bleed) color = '#8b0000'; // Dark red for bleed

        ctx.fillStyle = color;
        ctx.beginPath();
        
        // Different shapes for different types
        if (enemy.type === 'boss') {
            ctx.arc(enemy.x, enemy.y, 25, 0, 2 * Math.PI); // Larger circle
        } else if (enemy.type === 'elite') {
            // Diamond shape
            ctx.save();
            ctx.translate(enemy.x, enemy.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-12, -12, 24, 24);
            ctx.restore();
        } else {
            ctx.arc(enemy.x, enemy.y, 12, 0, 2 * Math.PI); // Regular circle
        }
        
        ctx.fill();

        // Health bar
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - 25, barWidth, barHeight);

        // Health
        ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - 25, barWidth * healthPercent, barHeight);

        // Enemy name (abbreviated)
        ctx.fillStyle = '#fff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        const displayName = enemy.name.length > 6 ? enemy.name.substring(0, 6) : enemy.name;
        ctx.fillText(displayName, enemy.x, enemy.y + 3);

        // Effect indicators
        let effectY = enemy.y + 20;
        if (enemy.effects.poison) {
            ctx.fillStyle = '#27ae60';
            ctx.fillText('P', enemy.x - 10, effectY);
        }
        if (enemy.effects.bleed) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('B', enemy.x + 10, effectY);
        }
    }

    static takeDamage(enemy, damage) {
        enemy.health -= damage;
        if (enemy.health < 0) enemy.health = 0;

        // Visual feedback
        enemy.damageFlash = 10; // Flash red for 10 frames
    }

    static applyEffect(enemy, effectType, duration) {
        enemy.effects[effectType] = {
            duration: duration,
            startTime: Date.now()
        };
    }

    static updateEffects(enemy) {
        const now = Date.now();
        
        Object.keys(enemy.effects).forEach(effectType => {
            const effect = enemy.effects[effectType];
            const elapsed = now - effect.startTime;
            
            if (elapsed >= effect.duration) {
                delete enemy.effects[effectType];
                return;
            }

            // Apply effect damage
            if (effectType === 'poison') {
                // Poison does 5% max health per second
                if (elapsed % 1000 < 50) { // Roughly every second
                    const poisonDamage = Math.max(1, Math.floor(enemy.maxHealth * 0.05));
                    enemy.health -= poisonDamage;
                }
            }
            
            if (effectType === 'bleed') {
                // Bleed does 3% max health per second
                if (elapsed % 1000 < 50) { // Roughly every second
                    const bleedDamage = Math.max(1, Math.floor(enemy.maxHealth * 0.03));
                    enemy.health -= bleedDamage;
                }
            }
        });
    }

    static getEnemyTypeByWave(wave) {
        if (wave >= 20 && Math.random() < 0.3) return 'boss';
        if (wave >= 15 && Math.random() < 0.4) return 'elite';
        if (wave >= 10 && Math.random() < 0.5) return 'strong';
        if (wave >= 5 && Math.random() < 0.4) return 'strong';
        return 'basic';
    }

    static getWaveComposition(wave) {
        const composition = {
            basic: 0,
            strong: 0,
            elite: 0,
            boss: 0
        };

        const totalEnemies = Math.min(5 + Math.floor(wave / 2), 25);
        
        // Boss waves (every 10 waves)
        if (wave % 10 === 0) {
            composition.boss = 1;
            composition.elite = Math.floor(totalEnemies * 0.3);
            composition.strong = Math.floor(totalEnemies * 0.4);
            composition.basic = totalEnemies - composition.boss - composition.elite - composition.strong;
        } else {
            // Regular waves
            if (wave >= 15) {
                composition.elite = Math.floor(totalEnemies * 0.2);
            }
            if (wave >= 5) {
                composition.strong = Math.floor(totalEnemies * 0.3);
            }
            composition.basic = totalEnemies - composition.elite - composition.strong;
        }

        return composition;
    }

    static spawnAdvancedWave(waveNumber, mapName, difficulty) {
        gameState.isSpawningEnemies = true;
        
        const composition = this.getWaveComposition(waveNumber);
        const enemies = [];

        // Create enemies based on composition
        ['boss', 'elite', 'strong', 'basic'].forEach(type => {
            for (let i = 0; i < composition[type]; i++) {
                const enemy = this.createEnemy(mapName, type, waveNumber, difficulty);
                if (enemy) {
                    enemies.push(enemy);
                }
            }
        });

        // Shuffle enemies for variety
        for (let i = enemies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
        }

        // Spawn with staggered timing
        enemies.forEach((enemy, index) => {
            setTimeout(() => {
                gameState.game.enemies.push(enemy);
                if (index === enemies.length - 1) {
                    gameState.isSpawningEnemies = false;
                }
            }, index * 300); // 0.3 seconds between enemies
        });
    }
}