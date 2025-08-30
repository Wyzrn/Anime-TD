// Map definitions and rendering
class Maps {
    static mapData = {
        dragonball: {
            name: 'Dragon Ball Arena',
            theme: 'desert',
            backgroundColor: '#f4d03f',
            pathColor: '#e67e22',
            path: [
                { x: 0, y: 300 },
                { x: 200, y: 300 },
                { x: 200, y: 150 },
                { x: 400, y: 150 },
                { x: 400, y: 450 },
                { x: 600, y: 450 },
                { x: 600, y: 200 },
                { x: 800, y: 200 }
            ]
        },
        naruto: {
            name: 'Hidden Leaf Village',
            theme: 'forest',
            backgroundColor: '#27ae60',
            pathColor: '#8b4513',
            path: [
                { x: 0, y: 400 },
                { x: 150, y: 400 },
                { x: 150, y: 200 },
                { x: 350, y: 200 },
                { x: 350, y: 500 },
                { x: 550, y: 500 },
                { x: 550, y: 100 },
                { x: 800, y: 100 }
            ]
        },
        bleach: {
            name: 'Soul Society',
            theme: 'spirit',
            backgroundColor: '#8e44ad',
            pathColor: '#ecf0f1',
            path: [
                { x: 0, y: 250 },
                { x: 150, y: 250 },
                { x: 150, y: 400 },
                { x: 300, y: 400 },
                { x: 300, y: 150 },
                { x: 500, y: 150 },
                { x: 500, y: 350 },
                { x: 650, y: 350 },
                { x: 650, y: 200 },
                { x: 800, y: 200 }
            ]
        },
        onepiece: {
            name: 'Grand Line',
            theme: 'ocean',
            backgroundColor: '#3498db',
            pathColor: '#f39c12',
            path: [
                { x: 0, y: 350 },
                { x: 100, y: 350 },
                { x: 100, y: 200 },
                { x: 250, y: 200 },
                { x: 250, y: 450 },
                { x: 400, y: 450 },
                { x: 400, y: 150 },
                { x: 550, y: 150 },
                { x: 550, y: 400 },
                { x: 700, y: 400 },
                { x: 700, y: 250 },
                { x: 800, y: 250 }
            ]
        },
        jojo: {
            name: 'Bizarre Town',
            theme: 'urban',
            backgroundColor: '#e74c3c',
            pathColor: '#f1c40f',
            path: [
                { x: 0, y: 300 },
                { x: 200, y: 300 },
                { x: 200, y: 100 },
                { x: 400, y: 100 },
                { x: 400, y: 500 },
                { x: 600, y: 500 },
                { x: 600, y: 300 },
                { x: 800, y: 300 }
            ]
        },
        aot: {
            name: 'Wall Maria',
            theme: 'fortress',
            backgroundColor: '#95a5a6',
            pathColor: '#34495e',
            path: [
                { x: 0, y: 300 },
                { x: 100, y: 300 },
                { x: 100, y: 450 },
                { x: 300, y: 450 },
                { x: 300, y: 150 },
                { x: 500, y: 150 },
                { x: 500, y: 400 },
                { x: 700, y: 400 },
                { x: 700, y: 250 },
                { x: 800, y: 250 }
            ]
        }
    };

    static getPath(mapName) {
        return this.mapData[mapName]?.path || [];
    }

    static drawMap(ctx, mapName) {
        const mapInfo = this.mapData[mapName];
        if (!mapInfo) return;

        // Draw background
        ctx.fillStyle = mapInfo.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw theme-specific decorations
        this.drawThemeDecorations(ctx, mapInfo.theme, mapName);
    }

    static drawPath(ctx, mapName) {
        const mapInfo = this.mapData[mapName];
        if (!mapInfo || !mapInfo.path) return;

        const path = mapInfo.path;
        
        // Draw path background (wider)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 42;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        // Draw main path
        ctx.strokeStyle = mapInfo.pathColor;
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        // Draw path centerline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw start and end markers
        this.drawStartEnd(ctx, path, mapInfo.pathColor);
    }

    static drawStartEnd(ctx, path, pathColor) {
        if (path.length === 0) return;

        // Start marker
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('START', path[0].x, path[0].y + 4);

        // End marker
        const endPoint = path[path.length - 1];
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('END', endPoint.x, endPoint.y + 4);
    }

    static drawThemeDecorations(ctx, theme, mapName) {
        const canvas = ctx.canvas;
        const time = Date.now() * 0.001; // For animations

        switch (theme) {
            case 'desert':
                this.drawDesertTheme(ctx, time);
                break;
            case 'forest':
                this.drawForestTheme(ctx, time);
                break;
            case 'spirit':
                this.drawSpiritTheme(ctx, time);
                break;
            case 'ocean':
                this.drawOceanTheme(ctx, time);
                break;
            case 'urban':
                this.drawUrbanTheme(ctx, time);
                break;
            case 'fortress':
                this.drawFortressTheme(ctx, time);
                break;
        }
    }

    static drawDesertTheme(ctx, time) {
        // Sand dunes
        ctx.fillStyle = 'rgba(244, 164, 96, 0.5)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 200) + Math.sin(time + i) * 20;
            const y = 400 + Math.cos(time * 0.5 + i) * 30;
            ctx.beginPath();
            ctx.ellipse(x, y, 80, 30, 0, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Floating rocks
        ctx.fillStyle = 'rgba(139, 69, 19, 0.7)';
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = 50 + Math.sin(time + i) * 10;
            ctx.fillRect(x, y, 15, 10);
        }
    }

    static drawForestTheme(ctx, time) {
        // Trees
        ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = 500 + Math.sin(time * 0.3 + i) * 5;
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, 2 * Math.PI);
            ctx.fill();
            
            // Tree trunk
            ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
            ctx.fillRect(x - 5, y, 10, 30);
            ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
        }

        // Leaves floating
        ctx.fillStyle = 'rgba(50, 205, 50, 0.8)';
        for (let i = 0; i < 20; i++) {
            const x = (time * 30 + i * 40) % (ctx.canvas.width + 50);
            const y = 100 + Math.sin(time + i) * 20;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time + i);
            ctx.fillRect(-3, -1, 6, 2);
            ctx.restore();
        }
    }

    static drawSpiritTheme(ctx, time) {
        // Spirit particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const size = 2 + Math.sin(time * 2 + i) * 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Glowing orbs
        for (let i = 0; i < 5; i++) {
            const x = 100 + i * 150 + Math.sin(time + i) * 50;
            const y = 200 + Math.cos(time * 0.7 + i) * 100;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    static drawOceanTheme(ctx, time) {
        // Waves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const y = 100 + i * 100;
            ctx.moveTo(0, y);
            for (let x = 0; x <= ctx.canvas.width; x += 20) {
                const waveY = y + Math.sin((x * 0.01) + time + i) * 20;
                ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }

        // Bubbles
        ctx.fillStyle = 'rgba(173, 216, 230, 0.7)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = (time * 50 + i * 30) % (ctx.canvas.height + 50);
            const size = 3 + Math.sin(time + i) * 2;
            ctx.beginPath();
            ctx.arc(x, ctx.canvas.height - y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    static drawUrbanTheme(ctx, time) {
        // Buildings silhouette
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < 10; i++) {
            const x = i * 80;
            const height = 150 + Math.random() * 200;
            ctx.fillRect(x, ctx.canvas.height - height, 70, height);
        }

        // Windows
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            if (Math.sin(time + i) > 0) {
                ctx.fillRect(x, y, 4, 6);
            }
        }

        // Neon signs
        const colors = ['#ff00ff', '#00ff00', '#ffff00', '#ff0000'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[i % colors.length];
            const x = 50 + i * 150;
            const y = 100 + Math.sin(time * 2 + i) * 20;
            ctx.fillRect(x, y, 60, 20);
        }
    }

    static drawFortressTheme(ctx, time) {
        // Wall segments
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        for (let i = 0; i < 8; i++) {
            const x = i * 100;
            const height = 80 + Math.sin(i) * 20;
            ctx.fillRect(x, 50, 90, height);
            
            // Crenellations
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(x + j * 30, 30, 20, 30);
            }
        }

        // Watchtowers
        ctx.fillStyle = 'rgba(52, 73, 94, 0.8)';
        for (let i = 0; i < 3; i++) {
            const x = 200 + i * 200;
            ctx.fillRect(x - 15, 10, 30, 120);
            ctx.fillRect(x - 20, 10, 40, 20); // Roof
        }

        // Flags
        ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
        for (let i = 0; i < 3; i++) {
            const x = 200 + i * 200;
            const y = 10 + Math.sin(time * 3 + i) * 5;
            ctx.fillRect(x + 15, y, 25, 15);
        }
    }

    static isValidPlacement(x, y, mapName) {
        const path = this.getPath(mapName);
        if (!path || path.length === 0) return true;

        // Check if placement is too close to path
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            
            const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < 50) { // 50 pixel buffer around path
                return false;
            }
        }

        // Check boundaries
        if (x < 30 || x > 770 || y < 30 || y > 570) {
            return false;
        }

        return true;
    }

    static distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return Utils.calculateDistance(px, py, x1, y1);
        }
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Utils.calculateDistance(px, py, projX, projY);
    }

    static getMapList() {
        return Object.keys(this.mapData);
    }

    static getMapInfo(mapName) {
        return this.mapData[mapName] || null;
    }
}