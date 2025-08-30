// Trait system management
class Traits {
    static traitDefinitions = {
        // Basic traits (20%/18%/15%)
        speedy_1: { name: 'Speedy I', description: '+10% attack speed', rate: 20 },
        speedy_2: { name: 'Speedy II', description: '+20% attack speed', rate: 18 },
        speedy_3: { name: 'Speedy III', description: '+30% attack speed', rate: 15 },
        powerful_1: { name: 'Powerful I', description: '+10% damage', rate: 20 },
        powerful_2: { name: 'Powerful II', description: '+20% damage', rate: 18 },
        powerful_3: { name: 'Powerful III', description: '+30% damage', rate: 15 },
        distance_1: { name: 'Distance I', description: '+10% range', rate: 20 },
        distance_2: { name: 'Distance II', description: '+20% range', rate: 18 },
        distance_3: { name: 'Distance III', description: '+30% range', rate: 15 },
        
        // Advanced traits (5%)
        rage: { name: 'Rage', description: '+30% damage, +10% attack speed', rate: 5 },
        greed: { name: 'Greed', description: '+100% money gain when killing', rate: 5 },
        sniper: { name: 'Sniper', description: '+50% range', rate: 5 },
        
        // Legendary traits (1%)
        bloodthirsty: { name: 'Bloodthirsty', description: '+70% damage and speed, causes bleed', rate: 1 },
        poisoned: { name: 'Poisoned', description: '+40% range and speed, poison attack', rate: 1 },
        wrecking_ball: { name: 'Wrecking Ball', description: '+150% damage', rate: 1 },
        
        // Godly trait (0.1%)
        godly: { name: 'Godly', description: '+400% damage, +100% speed, +200% cost, limit 1 unit', rate: 0.1 }
    };

    static init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    static setupEventListeners() {
        // Apply trait button
        document.getElementById('apply-trait-btn').addEventListener('click', () => {
            this.applyRandomTrait();
        });

        // Reroll stats button  
        document.getElementById('reroll-stats-btn').addEventListener('click', () => {
            this.rerollStats();
        });

        // Back button
        document.getElementById('back-from-traits').addEventListener('click', () => {
            Utils.showScreen('main-menu');
        });
    }

    static applyRandomTrait() {
        const selectedUnit = Inventory.getSelectedUnit();
        
        if (!selectedUnit) {
            this.showTraitResult('Please select a unit from inventory first!', 'error');
            return;
        }

        if (gameState.player.traitChips < 1) {
            this.showTraitResult('Not enough trait chips!', 'error');
            return;
        }

        // Check if unit already has godly trait
        if (selectedUnit.traits.includes('godly')) {
            this.showTraitResult('This unit already has the Godly trait!', 'error');
            return;
        }

        const traitName = Utils.rollForTrait();
        const success = Units.applyTrait(selectedUnit, traitName);
        
        if (!success) {
            this.showTraitResult('Unit already has this trait!', 'error');
            return;
        }

        gameState.player.traitChips--;
        
        const traitInfo = this.traitDefinitions[traitName];
        this.showTraitResult(`Applied ${traitInfo.name}!`, traitName);
        
        this.updateDisplay();
        this.updateSelectedUnitDisplay();
        Inventory.updateUnitDisplay(selectedUnit);
        
        gameState.save();
        Utils.playSound('trait_applied');
        Utils.vibrate([100, 50, 100]);
    }

    static rerollStats() {
        const selectedUnit = Inventory.getSelectedUnit();
        
        if (!selectedUnit) {
            this.showTraitResult('Please select a unit from inventory first!', 'error');
            return;
        }

        if (gameState.player.statRerolls < 1) {
            this.showTraitResult('Not enough stat rerolls!', 'error');
            return;
        }

        const success = Units.rerollStats(selectedUnit, selectedUnit.templateName);
        
        if (success) {
            gameState.player.statRerolls--;
            this.showTraitResult('Stats rerolled!', 'success');
            this.updateDisplay();
            this.updateSelectedUnitDisplay();
            Inventory.updateUnitDisplay(selectedUnit);
            gameState.save();
            Utils.playSound('reroll');
            Utils.vibrate(100);
        } else {
            this.showTraitResult('Failed to reroll stats!', 'error');
        }
    }

    static showTraitResult(message, type) {
        // Create a temporary result display
        const selectedUnitDiv = document.getElementById('selected-unit');
        
        // Remove any existing result message
        const existingResult = selectedUnitDiv.querySelector('.trait-result');
        if (existingResult) {
            existingResult.remove();
        }

        const resultElement = Utils.createElement('div', 'trait-result', message);
        resultElement.style.padding = '10px';
        resultElement.style.marginTop = '10px';
        resultElement.style.borderRadius = '5px';
        resultElement.style.fontWeight = 'bold';

        if (type === 'error') {
            resultElement.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
            resultElement.style.color = '#e74c3c';
        } else if (type === 'success') {
            resultElement.style.backgroundColor = 'rgba(39, 174, 96, 0.3)';
            resultElement.style.color = '#27ae60';
        } else {
            // Trait specific styling
            resultElement.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
            resultElement.style.color = '#3498db';
            
            if (['bloodthirsty', 'poisoned', 'wrecking_ball'].includes(type)) {
                resultElement.style.color = '#9b59b6';
            } else if (type === 'godly') {
                resultElement.style.color = '#f1c40f';
                resultElement.style.textShadow = '0 0 10px rgba(241, 196, 15, 0.8)';
            }
        }

        selectedUnitDiv.appendChild(resultElement);

        // Remove result message after 3 seconds
        setTimeout(() => {
            if (resultElement.parentNode) {
                resultElement.remove();
            }
        }, 3000);
    }

    static updateDisplay() {
        const selectedUnit = Inventory.getSelectedUnit();
        const selectedUnitDiv = document.getElementById('selected-unit');
        
        // Update selected unit display
        this.updateSelectedUnitDisplay();

        // Update button states
        const applyBtn = document.getElementById('apply-trait-btn');
        const rerollBtn = document.getElementById('reroll-stats-btn');

        if (!selectedUnit) {
            applyBtn.disabled = true;
            rerollBtn.disabled = true;
            applyBtn.textContent = 'Select a unit first';
            rerollBtn.textContent = 'Select a unit first';
        } else {
            applyBtn.disabled = gameState.player.traitChips < 1;
            rerollBtn.disabled = gameState.player.statRerolls < 1;
            
            applyBtn.textContent = gameState.player.traitChips >= 1 
                ? `Apply Random Trait (${gameState.player.traitChips} chips)` 
                : 'Need more trait chips';
                
            rerollBtn.textContent = gameState.player.statRerolls >= 1 
                ? `Reroll Stats (${gameState.player.statRerolls} rerolls)` 
                : 'Need more rerolls';
        }

        // Update player stats in the UI
        document.getElementById('trait-chips').textContent = gameState.player.traitChips;
        document.getElementById('stat-rerolls').textContent = gameState.player.statRerolls;
    }

    static updateSelectedUnitDisplay() {
        const selectedUnit = Inventory.getSelectedUnit();
        const selectedUnitDiv = document.getElementById('selected-unit');
        
        // Clear previous content (except result messages)
        const resultMessage = selectedUnitDiv.querySelector('.trait-result');
        selectedUnitDiv.innerHTML = '';
        if (resultMessage) {
            selectedUnitDiv.appendChild(resultMessage);
        }

        if (!selectedUnit) {
            const noSelection = Utils.createElement('h3', '', 'Select a unit from inventory first');
            selectedUnitDiv.appendChild(noSelection);
            return;
        }

        // Unit info
        const unitInfo = Utils.createElement('div', 'selected-unit-info');
        
        const unitName = Utils.createElement('h3', '', selectedUnit.name);
        unitName.style.color = Utils.getRarityColor(selectedUnit.rarity);
        unitInfo.appendChild(unitName);

        const unitRarity = Utils.createElement('div', `rarity-${selectedUnit.rarity}`, 
            selectedUnit.rarity.toUpperCase());
        unitRarity.style.fontWeight = 'bold';
        unitRarity.style.marginBottom = '10px';
        unitInfo.appendChild(unitRarity);

        // Current stats
        const statsDiv = Utils.createElement('div', 'current-stats');
        const statsTitle = Utils.createElement('h4', '', 'Current Stats:');
        statsDiv.appendChild(statsTitle);

        const powerStat = Utils.createElement('div', '', 
            `Power: ${Utils.getStatRank(selectedUnit.stats.power)} (${selectedUnit.stats.power})`);
        const rangeStat = Utils.createElement('div', '', 
            `Range: ${Utils.getStatRank(selectedUnit.stats.range)} (${selectedUnit.stats.range})`);
        const speedStat = Utils.createElement('div', '', 
            `Speed: ${Utils.getStatRank(selectedUnit.stats.speed)} (${selectedUnit.stats.speed})`);

        statsDiv.appendChild(powerStat);
        statsDiv.appendChild(rangeStat);
        statsDiv.appendChild(speedStat);
        unitInfo.appendChild(statsDiv);

        // Current traits
        if (selectedUnit.traits && selectedUnit.traits.length > 0) {
            const traitsDiv = Utils.createElement('div', 'current-traits');
            traitsDiv.style.marginTop = '15px';
            
            const traitsTitle = Utils.createElement('h4', '', 'Current Traits:');
            traitsDiv.appendChild(traitsTitle);

            selectedUnit.traits.forEach(traitName => {
                const traitInfo = this.traitDefinitions[traitName];
                if (traitInfo) {
                    const traitElement = Utils.createElement('div', 'trait-display');
                    traitElement.innerHTML = `<strong>${traitInfo.name}</strong>: ${traitInfo.description}`;
                    traitElement.style.padding = '5px';
                    traitElement.style.margin = '5px 0';
                    traitElement.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
                    traitElement.style.borderRadius = '3px';
                    traitElement.style.fontSize = '12px';
                    
                    if (traitName === 'godly') {
                        traitElement.style.backgroundColor = 'rgba(241, 196, 15, 0.3)';
                        traitElement.style.border = '2px solid #f1c40f';
                    }
                    
                    traitsDiv.appendChild(traitElement);
                }
            });
            unitInfo.appendChild(traitsDiv);
        }

        selectedUnitDiv.appendChild(unitInfo);
    }

    static getTraitEffect(traitName, unit) {
        switch (traitName) {
            case 'speedy_1': return { attackSpeed: 1.1 };
            case 'speedy_2': return { attackSpeed: 1.2 };
            case 'speedy_3': return { attackSpeed: 1.3 };
            case 'powerful_1': return { damage: 1.1 };
            case 'powerful_2': return { damage: 1.2 };
            case 'powerful_3': return { damage: 1.3 };
            case 'distance_1': return { range: 1.1 };
            case 'distance_2': return { range: 1.2 };
            case 'distance_3': return { range: 1.3 };
            case 'rage': return { damage: 1.3, attackSpeed: 1.1 };
            case 'greed': return { moneyMultiplier: 2 };
            case 'sniper': return { range: 1.5 };
            case 'bloodthirsty': return { damage: 1.7, attackSpeed: 1.7, bleed: true };
            case 'poisoned': return { range: 1.4, attackSpeed: 1.4, poison: true };
            case 'wrecking_ball': return { damage: 2.5 };
            case 'godly': return { damage: 5, attackSpeed: 2, costMultiplier: 3, unique: true };
            default: return {};
        }
    }

    static getAllTraits() {
        return Object.keys(this.traitDefinitions);
    }

    static getTraitInfo(traitName) {
        return this.traitDefinitions[traitName] || null;
    }

    static canApplyTrait(unit, traitName) {
        if (unit.traits.includes(traitName)) return false;
        if (traitName === 'godly' && unit.traits.length > 0) return true; // Godly replaces all
        if (unit.traits.includes('godly') && traitName !== 'godly') return false;
        return true;
    }
}