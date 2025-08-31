// Unit definitions and logic
class Unit {
    static unitTemplates = {
        kaneki: {
            name: 'Dark Ghoul',
            rarity: 'common',
            maxPlacement: 5,
            cost: 50,
            baseStats: { power: 5, range: 3, speed: 7 },
            abilities: [
                { name: 'Basic Punch', level: 1, maxLevel: 3 },
                { name: 'Ghoul Transform', level: 1, maxLevel: 3 },
                { name: 'Kagune Dash', level: 1, maxLevel: 3 },
                { name: 'Rapid Thrust', level: 1, maxLevel: 10 }
            ]
        },
        goku: {
            name: 'Saiyan Warrior',
            rarity: 'legendary',
            maxPlacement: 2,
            cost: 500,
            baseStats: { power: 25, range: 8, speed: 15 },
            abilities: [
                { name: 'Ki Blast', level: 1, maxLevel: 3 },
                { name: 'Super Form', level: 1, maxLevel: 3 },
                { name: 'Blue Form', level: 1, maxLevel: 3 },
                { name: 'Ultra Instinct', level: 1, maxLevel: 10 }
            ]
        },
        luffy: {
            name: 'Rubber Pirate',
            rarity: 'legendary',
            maxPlacement: 2,
            cost: 450,
            baseStats: { power: 22, range: 6, speed: 18 },
            abilities: [
                { name: 'Gum Pistol', level: 1, maxLevel: 3 },
                { name: 'Gear Second', level: 1, maxLevel: 3 },
                { name: 'Gear Fourth', level: 1, maxLevel: 3 },
                { name: 'Gear Fifth', level: 1, maxLevel: 10 }
            ]
        },
        naruto: {
            name: 'Nine-Tails Host',
            rarity: 'legendary',
            maxPlacement: 2,
            cost: 480,
            baseStats: { power: 20, range: 7, speed: 20 },
            abilities: [
                { name: 'Shadow Clone', level: 1, maxLevel: 3 },
                { name: 'Rasengan', level: 1, maxLevel: 3 },
                { name: 'Sage Mode', level: 1, maxLevel: 3 },
                { name: 'Kurama Mode', level: 1, maxLevel: 10 }
            ]
        },
        ichigo: {
            name: 'Soul Reaper',
            rarity: 'epic',
            maxPlacement: 3,
            cost: 300,
            baseStats: { power: 18, range: 5, speed: 16 },
            abilities: [
                { name: 'Sword Slash', level: 1, maxLevel: 3 },
                { name: 'Bankai Release', level: 1, maxLevel: 3 },
                { name: 'Hollow Mask', level: 1, maxLevel: 3 },
                { name: 'Final Form', level: 1, maxLevel: 10 }
            ]
        },
        jotaro: {
            name: 'Stand User',
            rarity: 'epic',
            maxPlacement: 3,
            cost: 280,
            baseStats: { power: 16, range: 4, speed: 12 },
            abilities: [
                { name: 'Star Punch', level: 1, maxLevel: 3 },
                { name: 'Ora Rush', level: 1, maxLevel: 3 },
                { name: 'Time Stop', level: 1, maxLevel: 3 },
                { name: 'Star Platinum', level: 1, maxLevel: 10 }
            ]
        },
        eren: {
            name: 'Titan Shifter',
            rarity: 'epic',
            maxPlacement: 3,
            cost: 320,
            baseStats: { power: 19, range: 3, speed: 8 },
            abilities: [
                { name: 'Blade Strike', level: 1, maxLevel: 3 },
                { name: 'Titan Form', level: 1, maxLevel: 3 },
                { name: 'Hardening', level: 1, maxLevel: 3 },
                { name: 'Founding Power', level: 1, maxLevel: 10 }
            ]
        },
        vegeta: {
            name: 'Saiyan Prince',
            rarity: 'legendary',
            maxPlacement: 2,
            cost: 520,
            baseStats: { power: 24, range: 7, speed: 17 },
            abilities: [
                { name: 'Galick Gun', level: 1, maxLevel: 3 },
                { name: 'Super Saiyan', level: 1, maxLevel: 3 },
                { name: 'Majin Form', level: 1, maxLevel: 3 },
                { name: 'Ultra Ego', level: 1, maxLevel: 10 }
            ]
        },
        zoro: {
            name: 'Three Sword Style',
            rarity: 'rare',
            maxPlacement: 4,
            cost: 200,
            baseStats: { power: 15, range: 4, speed: 13 },
            abilities: [
                { name: 'Single Slash', level: 1, maxLevel: 3 },
                { name: 'Three Sword', level: 1, maxLevel: 3 },
                { name: 'Asura Form', level: 1, maxLevel: 3 },
                { name: 'King of Hell', level: 1, maxLevel: 10 }
            ]
        },
        speedwagon: {
            name: 'Speed Wagon',
            rarity: 'uncommon',
            maxPlacement: 3,
            cost: 100,
            baseStats: { power: 1, range: 1, speed: 1 },
            isSupport: true,
            moneyGeneration: 2,
            abilities: [
                { name: 'Encourage', level: 1, maxLevel: 3 },
                { name: 'Foundation', level: 1, maxLevel: 3 },
                { name: 'Rich Support', level: 1, maxLevel: 3 },
                { name: 'Money Rain', level: 1, maxLevel: 10 }
            ]
        }
    };

    static createUnit(templateName, rarity = null) {
        const template = this.unitTemplates[templateName];
        if (!template) {
            console.error(`Unit template not found: ${templateName}`);
            return null;
        }

        const unit = {
            id: Utils.getRandomInt(1000, 9999) + Date.now(),
            templateName: templateName,
            name: template.name,
            rarity: rarity || template.rarity,
            maxPlacement: template.maxPlacement,
            cost: template.cost,
            isSupport: template.isSupport || false,
            moneyGeneration: template.moneyGeneration || 0,
            stats: this.generateStats(template.baseStats, rarity || template.rarity),
            abilities: Utils.deepClone(template.abilities),
            traits: [],
            lastAttack: 0,
            target: null,
            animationFrame: 0,
            update: this.updateUnit.bind(null),
            render: this.renderUnit.bind(null),
            attack: this.attackUnit.bind(null),
            findTarget: this.findTarget.bind(null),
            applyTrait: this.applyTrait.bind(null),
            rerollStats: this.rerollStats.bind(null)
        };

        return unit;
    }

    static generateStats(baseStats, rarity) {
        const rarityMultipliers = {
            common: { min: 0.8, max: 1.2 },
            uncommon: { min: 1.0, max: 1.4 },
            rare: { min: 1.2, max: 1.6 },
            epic: { min: 1.4, max: 1.8 },
            legendary: { min: 1.6, max: 2.0 },
            mythical: { min: 1.8, max: 2.5 }
        };

        const multiplier = rarityMultipliers[rarity] || rarityMultipliers.common;

        return {
            power: Math.max(0, Math.floor(baseStats.power * Utils.getRandomFloat(multiplier.min, multiplier.max))),
            range: Math.max(0, Math.floor(baseStats.range * Utils.getRandomFloat(multiplier.min, multiplier.max))),
            speed: Math.max(0, Math.floor(baseStats.speed * Utils.getRandomFloat(multiplier.min, multiplier.max)))
        };
    }

    static updateUnit(unit, enemies) {
        if (!unit.placed) return;

        const now = Date.now();

        if (unit.isSupport && unit.moneyGeneration > 0) {
            if (now - unit.lastAttack > 1000) {
                let moneyAmount = unit.moneyGeneration;
                unit.traits.forEach(trait => {
                    if (trait === 'greed') moneyAmount *= 2;
                });
                gameState.gainYen(moneyAmount); // Uses global gameState (safe since loaded)
                unit.lastAttack = now;
            }
 return;
        }

        if (!unit.target || unit.target.health <= 0 || !enemies.includes(unit.target)) {
            unit.target = unit.findTarget(enemies);
        }

        if (unit.target) {
            const distance = Utils.calculateDistance(unit.x, unit.y, unit.target.x, unit.target.y);
            const range = unit.stats.range * 30;

            if (distance <= range) {
                const attackSpeed = 1000 / Math.max(1, unit.stats.speed);
                if (now - unit.lastAttack > attackSpeed) {
                    unit.attack(unit.target);
                    unit.lastAttack = now;
                }
            }
        }

        unit.animationFrame = (unit.animationFrame + 1) % 60;
    }

    static findTarget(unit, enemies) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        const range = unit.stats.range * 30;

        enemies.forEach(enemy => {
            const distance = Utils.calculateDistance(unit.x, unit.y, enemy.x, unit.y);
            if (distance <= range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });

        return closestEnemy;
    }

    static attackUnit(unit, target) {
        if (!target || target.health <= 0) return;

        let damage = unit.stats.power;

        unit.traits.forEach(trait => {
            switch (trait) {
                case 'powerful_1': damage *= 1.1; break;
                case 'powerful_2': damage *= 1.2; break;
                case 'powerful_3': damage *= 1.3; break;
                case 'rage': damage *= 1.3; break;
                case 'bloodthirsty': damage *= 1.7; break;
                case 'wrecking_ball': damage *= 2.5; break;
                case 'godly': damage *= 5.0; break;
            }
        });

        const currentAbility = unit.abilities[Math.min(3, Math.floor(unit.animationFrame / 15))];
        if (currentAbility) {
            damage *= (1 + currentAbility.level * 0.2);
        }

        target.takeDamage(Math.floor(damage));

        unit.traits.forEach(trait => {
            if (trait === 'bloodthirsty') {
                target.applyEffect('bleed', 3000);
            }
            if (trait === 'poisoned') {
                target.applyEffect('poison', 5000);
            }
        });

        Utils.playSound('attack');
    }

    static renderUnit(unit, ctx) {
        if (!unit.placed) return;

        ctx.fillStyle = Utils.getRarityColor(unit.rarity);
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, 15, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(unit.name.substring(0, 3).toUpperCase(), unit.x, unit.y + 3);

        if (unit.target || unit === gameState.selectedUnit) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(unit.x, unit.y, unit.stats.range * 30, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (unit.target && !unit.isSupport) {
            const now = Date.now();
            if (now - unit.lastAttack < 200) {
                ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(unit.x, unit.y);
                ctx.lineTo(unit.target.x, unit.target.y);
                ctx.stroke();
            }
        }

        if (unit.isSupport) {
            ctx.fillStyle = '#f1c40f';
            ctx.font = '12px Arial';
            ctx.fillText('$', unit.x, unit.y - 20);
        }
    }

    static applyTrait(unit, traitName) {
        if (unit.traits.includes(traitName)) return false;

        if (traitName === 'godly') {
            unit.traits = ['godly'];
            unit.cost *= 3;
        } else if (!unit.traits.includes('godly')) {
            unit.traits.push(traitName);
        }

        return true;
    }

    static rerollStats(unit, templateName) {
        const template = this.unitTemplates[templateName];
        if (!template) return false;

        unit.stats = this.generateStats(template.baseStats, unit.rarity);
        return true;
    }

    static getUnitsByRarity(rarity) {
        const unitsByRarity = {
            common: ['kaneki'],
            uncommon: ['speedwagon'],
            rare: ['zoro'],
            epic: ['ichigo', 'jotaro', 'eren'],
            legendary: ['goku', 'luffy', 'naruto', 'vegeta'],
            mythical: ['goku', 'luffy', 'naruto']
        };

        return unitsByRarity[rarity] || [];
    }

    static rollRandomUnit() {
        const rarity = Utils.rollForRarity();
        const availableUnits = this.getUnitsByRarity(rarity);

        if (availableUnits.length === 0) {
            return this.createUnit('kaneki', 'common');
        }

        const selectedTemplate = Utils.getRandomElement(availableUnits);
        return this.createUnit(selectedTemplate, rarity);
    }
}