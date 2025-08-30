// Utility functions for the game
class Utils {
    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static getStatRank(value) {
        const ranks = ['F-', 'F', 'F+', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+', 'SS-', 'SS', 'SS+', 'SSS-', 'SSS', 'SSS+', 'Z-', 'Z', 'Z+', 'GODLY'];
        return ranks[Math.min(value, ranks.length - 1)];
    }

    static getStatValue(rank) {
        const ranks = ['F-', 'F', 'F+', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+', 'SS-', 'SS', 'SS+', 'SSS-', 'SSS', 'SSS+', 'Z-', 'Z', 'Z+', 'GODLY'];
        return ranks.indexOf(rank);
    }

    static rollForRarity() {
        const roll = Math.random() * 100;
        
        if (roll < 0.01) return 'mythical';
        if (roll < 1) return 'legendary';
        if (roll < 5) return 'epic';
        if (roll < 15) return 'rare';
        if (roll < 25) return 'uncommon';
        return 'common';
    }

    static rollForTrait() {
        const roll = Math.random() * 100;
        
        if (roll < 0.1) return 'godly';
        if (roll < 1) return Utils.getRandomElement(['bloodthirsty', 'poisoned', 'wrecking_ball']);
        if (roll < 5) return Utils.getRandomElement(['rage', 'greed', 'sniper']);
        if (roll < 15) return Utils.getRandomElement(['speedy_3', 'powerful_3', 'distance_3']);
        if (roll < 18) return Utils.getRandomElement(['speedy_2', 'powerful_2', 'distance_2']);
        return Utils.getRandomElement(['speedy_1', 'powerful_1', 'distance_1']);
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    static createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return defaultValue;
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static getRarityColor(rarity) {
        const colors = {
            'common': '#bdc3c7',
            'uncommon': '#27ae60',
            'rare': '#3498db',
            'epic': '#9b59b6',
            'legendary': '#f39c12',
            'mythical': '#e74c3c'
        };
        return colors[rarity] || '#bdc3c7';
    }

    static playSound(soundName) {
        // Placeholder for sound system
        console.log(`Playing sound: ${soundName}`);
    }

    static vibrate(pattern = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
}