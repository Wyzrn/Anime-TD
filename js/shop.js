// Shop and inventory system
class Shop {
    static rollCost = 500;

    static init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    static setupEventListeners() {
        // Roll button
        document.getElementById('roll-btn').addEventListener('click', () => {
            this.rollForUnit();
        });

        // Back button
        document.getElementById('back-from-shop').addEventListener('click', () => {
            Utils.showScreen('main-menu');
        });
    }

    static rollForUnit() {
        if (!gameState.spendYen(this.rollCost)) {
            this.showRollResult('Not enough yen!', 'error');
            return;
        }

        const unit = Units.rollRandomUnit();
        gameState.addUnitToInventory(unit);
        
        this.showRollResult(`Got ${unit.name}!`, unit.rarity);
        this.updateDisplay();
        
        // Save game state
        gameState.save();
        
        Utils.playSound('roll');
        Utils.vibrate([50, 100, 50]);
    }

    static showRollResult(message, type) {
        const resultDiv = document.getElementById('roll-result');
        resultDiv.innerHTML = '';
        
        const messageElement = Utils.createElement('div', 'roll-message', message);
        
        if (type !== 'error') {
            messageElement.classList.add(`rarity-${type}`);
            messageElement.style.fontWeight = 'bold';
            messageElement.style.textTransform = 'uppercase';
        } else {
            messageElement.style.color = '#e74c3c';
        }
        
        resultDiv.appendChild(messageElement);
        
        // Add sparkle effect for rare units
        if (['epic', 'legendary', 'mythical'].includes(type)) {
            this.addSparkleEffect(resultDiv);
        }
    }

    static addSparkleEffect(container) {
        for (let i = 0; i < 10; i++) {
            const sparkle = Utils.createElement('div', 'sparkle');
            sparkle.style.position = 'absolute';
            sparkle.style.width = '4px';
            sparkle.style.height = '4px';
            sparkle.style.background = '#fff';
            sparkle.style.borderRadius = '50%';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animation = 'sparkle 1s ease-out forwards';
            
            container.style.position = 'relative';
            container.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000);
        }
    }

    static updateDisplay() {
        // Update yen display
        const yenElements = document.querySelectorAll('#player-yen, #game-yen');
        yenElements.forEach(el => {
            el.textContent = Utils.formatNumber(gameState.player.yen);
        });

        // Update roll button state
        const rollBtn = document.getElementById('roll-btn');
        if (gameState.player.yen < this.rollCost) {
            rollBtn.disabled = true;
            rollBtn.textContent = `Need ${this.rollCost} Yen`;
        } else {
            rollBtn.disabled = false;
            rollBtn.textContent = `Roll for Unit (${this.rollCost} Yen)`;
        }
    }

    static getRarityInfo() {
        return {
            common: { rate: 60, color: '#bdc3c7' },
            uncommon: { rate: 25, color: '#27ae60' },
            rare: { rate: 15, color: '#3498db' },
            epic: { rate: 5, color: '#9b59b6' },
            legendary: { rate: 1, color: '#f39c12' },
            mythical: { rate: 0.01, color: '#e74c3c' }
        };
    }

    static simulateRolls(count = 100) {
        const results = {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythical: 0
        };

        for (let i = 0; i < count; i++) {
            const rarity = Utils.rollForRarity();
            results[rarity]++;
        }

        console.log(`Roll simulation (${count} rolls):`, results);
        return results;
    }
}

// Inventory management
class Inventory {
    static selectedUnit = null;

    static init() {
        this.setupEventListeners();
        this.render();
    }

    static setupEventListeners() {
        document.getElementById('back-from-inventory').addEventListener('click', () => {
            Utils.showScreen('main-menu');
        });
    }

    static render() {
        const inventoryGrid = document.getElementById('inventory-grid');
        inventoryGrid.innerHTML = '';

        if (gameState.player.inventory.length === 0) {
            const emptyMessage = Utils.createElement('div', 'empty-inventory', 'No units yet! Visit the shop to get your first unit.');
            emptyMessage.style.gridColumn = '1 / -1';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            inventoryGrid.appendChild(emptyMessage);
            return;
        }

        gameState.player.inventory.forEach(unit => {
            const unitCard = this.createUnitCard(unit);
            inventoryGrid.appendChild(unitCard);
        });
    }

    static createUnitCard(unit) {
        const card = Utils.createElement('div', 'unit-card');
        card.style.borderColor = Utils.getRarityColor(unit.rarity);
        
        if (this.selectedUnit === unit) {
            card.classList.add('selected');
        }

        // Unit name
        const name = Utils.createElement('h4', '', unit.name);
        card.appendChild(name);

        // Rarity
        const rarity = Utils.createElement('div', `unit-rarity rarity-${unit.rarity}`, unit.rarity);
        card.appendChild(rarity);

        // Stats
        const statsDiv = Utils.createElement('div', 'unit-stats-container');
        
        const powerStat = Utils.createElement('div', 'unit-stats', 
            `Power: ${Utils.getStatRank(unit.stats.power)} (${unit.stats.power})`);
        const rangeStat = Utils.createElement('div', 'unit-stats', 
            `Range: ${Utils.getStatRank(unit.stats.range)} (${unit.stats.range})`);
        const speedStat = Utils.createElement('div', 'unit-stats', 
            `Speed: ${Utils.getStatRank(unit.stats.speed)} (${unit.stats.speed})`);
        
        statsDiv.appendChild(powerStat);
        statsDiv.appendChild(rangeStat);
        statsDiv.appendChild(speedStat);
        card.appendChild(statsDiv);

        // Traits
        if (unit.traits && unit.traits.length > 0) {
            const traitsDiv = Utils.createElement('div', 'unit-traits');
            const traitsLabel = Utils.createElement('div', 'traits-label', 'Traits:');
            traitsDiv.appendChild(traitsLabel);
            
            unit.traits.forEach(trait => {
                const traitElement = Utils.createElement('div', 'trait-item', 
                    trait.replace(/_/g, ' ').toUpperCase());
                traitsDiv.appendChild(traitElement);
            });
            card.appendChild(traitsDiv);
        }

        // Support unit indicator
        if (unit.isSupport) {
            const supportLabel = Utils.createElement('div', 'support-indicator', 
                `💰 Generates ${unit.moneyGeneration} yen/sec`);
            supportLabel.style.color = '#f1c40f';
            supportLabel.style.fontSize = '10px';
            card.appendChild(supportLabel);
        }

        // Abilities
        const abilitiesDiv = Utils.createElement('div', 'unit-abilities');
        const abilitiesLabel = Utils.createElement('div', 'abilities-label', 'Abilities:');
        abilitiesDiv.appendChild(abilitiesLabel);
        
        unit.abilities.slice(0, 2).forEach(ability => { // Show first 2 abilities
            const abilityElement = Utils.createElement('div', 'ability-item', 
                `${ability.name} (Lv.${ability.level})`);
            abilityElement.style.fontSize = '10px';
            abilitiesDiv.appendChild(abilityElement);
        });
        card.appendChild(abilitiesDiv);

        // Click handler
        card.addEventListener('click', () => {
            this.selectUnit(unit);
        });

        return card;
    }

    static selectUnit(unit) {
        // Remove previous selection
        document.querySelectorAll('.unit-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        this.selectedUnit = unit;
        gameState.player.selectedUnit = unit;
        
        // Add selection to clicked card
        event.target.closest('.unit-card').classList.add('selected');
        
        Utils.playSound('select');
        Utils.vibrate(50);
    }

    static getSelectedUnit() {
        return this.selectedUnit;
    }

    static clearSelection() {
        this.selectedUnit = null;
        gameState.player.selectedUnit = null;
        document.querySelectorAll('.unit-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }

    static removeUnit(unit) {
        const index = gameState.player.inventory.indexOf(unit);
        if (index > -1) {
            gameState.player.inventory.splice(index, 1);
            if (this.selectedUnit === unit) {
                this.clearSelection();
            }
            this.render();
            gameState.save();
        }
    }

    static updateUnitDisplay(unit) {
        // Re-render the inventory to show updated unit stats
        this.render();
    }

    static sortInventory(sortBy = 'rarity') {
        const rarityOrder = ['mythical', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
        
        switch (sortBy) {
            case 'rarity':
                gameState.player.inventory.sort((a, b) => {
                    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                });
                break;
            case 'name':
                gameState.player.inventory.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'power':
                gameState.player.inventory.sort((a, b) => b.stats.power - a.stats.power);
                break;
        }
        
        this.render();
    }

    static getInventoryStats() {
        const stats = {
            total: gameState.player.inventory.length,
            byRarity: {},
            averageLevel: 0
        };

        gameState.player.inventory.forEach(unit => {
            stats.byRarity[unit.rarity] = (stats.byRarity[unit.rarity] || 0) + 1;
        });

        return stats;
    }

    static init() {
        this.setupEventListeners();
        console.log('Shop initialized');
    }

    static setupEventListeners() {
        const buyUnitBtn = document.getElementById('buy-unit-btn');
        if (!buyUnitBtn) {
            console.error('Shop.setupEventListeners: buy-unit-btn not found');
            return;
        }
        buyUnitBtn.addEventListener('click', () => {
            console.log('Buy unit clicked');
            // Placeholder: Implement unit purchase logic
        });
    }

    static updateDisplay() {
        console.log('Shop UI updated');
    }
}