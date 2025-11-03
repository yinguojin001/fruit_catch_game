class FruitCatchGame {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.fruitInterval = null;
        this.gameSpeed = 2000; // 水果掉落间隔（毫秒）
        
        this.gameArea = document.getElementById('gameArea');
        this.basket = document.getElementById('basket');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.instructions = document.querySelector('.instructions');
        
        this.fruits = ['🍎', '🍌', '🍊'];
        this.bomb = '💣';
        
        this.init();
    }
    
    init() {
        this.setupControls();
        this.startGame();
        this.hideInstructions();
    }
    
    setupControls() {
        // 按钮控制
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        leftBtn.addEventListener('mousedown', () => this.moveBasket('left'));
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.moveBasket('left');
        });
        
        rightBtn.addEventListener('mousedown', () => this.moveBasket('right'));
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.moveBasket('right');
        });
        
        // 触摸控制
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.gameArea.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const centerX = rect.width / 2;
            
            if (x < centerX) {
                this.moveBasket('left');
            } else {
                this.moveBasket('right');
            }
        });
        
        // 鼠标控制
        this.gameArea.addEventListener('mousedown', (e) => {
            const rect = this.gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const centerX = rect.width / 2;
            
            if (x < centerX) {
                this.moveBasket('left');
            } else {
                this.moveBasket('right');
            }
        });
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.moveBasket('left');
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.moveBasket('right');
            }
        });
    }
    
    moveBasket(direction) {
        if (!this.gameRunning) return;
        
        const basketRect = this.basket.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        const currentLeft = basketRect.left - gameRect.left;
        const moveDistance = 30;
        
        if (direction === 'left' && currentLeft > 0) {
            this.basket.style.left = Math.max(0, currentLeft - moveDistance) + 'px';
        } else if (direction === 'right' && currentLeft < gameRect.width - basketRect.width) {
            this.basket.style.left = Math.min(gameRect.width - basketRect.width, currentLeft + moveDistance) + 'px';
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.updateDisplay();
        this.gameOverElement.style.display = 'none';
        
        // 开始掉落水果
        this.startFruitDropping();
        
        // 3秒后隐藏说明
        setTimeout(() => {
            this.hideInstructions();
        }, 3000);
    }
    
    startFruitDropping() {
        this.fruitInterval = setInterval(() => {
            if (this.gameRunning) {
                this.createFallingObject();
            }
        }, this.gameSpeed);
    }
    
    createFallingObject() {
        const isBomb = Math.random() < 0.2; // 20% 概率是炸弹
        const object = document.createElement('div');
        
        if (isBomb) {
            object.className = 'bomb';
            object.textContent = this.bomb;
        } else {
            object.className = 'fruit';
            const fruitType = this.fruits[Math.floor(Math.random() * this.fruits.length)];
            object.textContent = fruitType;
            
            // 根据水果类型添加特殊样式
            if (fruitType === '🍎') object.classList.add('apple');
            else if (fruitType === '🍌') object.classList.add('banana');
            else if (fruitType === '🍊') object.classList.add('orange');
        }
        
        // 随机水平位置
        const maxLeft = this.gameArea.offsetWidth - 30;
        object.style.left = Math.random() * maxLeft + 'px';
        
        // 设置掉落动画时间
        const fallTime = 3 + Math.random() * 2; // 3-5秒
        object.style.animationDuration = fallTime + 's';
        
        this.gameArea.appendChild(object);
        
        // 监听掉落完成
        setTimeout(() => {
            if (object.parentNode) {
                this.checkCollision(object);
                object.remove();
            }
        }, fallTime * 1000);
        
        // 点击事件
        object.addEventListener('click', () => {
            this.checkCollision(object);
            object.remove();
        });
    }
    
    checkCollision(object) {
        const basketRect = this.basket.getBoundingClientRect();
        const objectRect = object.getBoundingClientRect();
        
        // 检查是否碰撞
        const collision = !(
            objectRect.right < basketRect.left ||
            objectRect.left > basketRect.right ||
            objectRect.bottom < basketRect.top ||
            objectRect.top > basketRect.bottom
        );
        
        if (collision) {
            if (object.classList.contains('bomb')) {
                this.lives--;
                this.showMessage('💥 炸弹！', '#e74c3c');
                this.shakeScreen();
            } else {
                this.score += 10;
                this.showMessage('+10', '#27ae60');
                this.createParticles(objectRect);
            }
            
            this.updateDisplay();
            
            if (this.lives <= 0) {
                this.gameOver();
            }
        }
    }
    
    showMessage(text, color) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.position = 'absolute';
        message.style.color = color;
        message.style.fontSize = '24px';
        message.style.fontWeight = 'bold';
        message.style.pointerEvents = 'none';
        message.style.zIndex = '1000';
        message.style.animation = 'fadeOut 2s ease-out forwards';
        
        const basketRect = this.basket.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        message.style.left = (basketRect.left - gameRect.left + basketRect.width / 2) + 'px';
        message.style.top = (basketRect.top - gameRect.top - 20) + 'px';
        
        this.gameArea.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 2000);
    }
    
    createParticles(rect) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            
            const angle = (i / 5) * Math.PI * 2;
            const distance = 30;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            particle.style.animation = `particleMove 1s ease-out forwards`;
            particle.style.setProperty('--endX', endX + 'px');
            particle.style.setProperty('--endY', endY + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 1000);
        }
    }
    
    shakeScreen() {
        this.gameArea.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.gameArea.style.animation = '';
        }, 500);
    }
    
    hideInstructions() {
        this.instructions.classList.add('hidden');
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.fruitInterval);
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        
        // 清除所有掉落的对象
        const objects = this.gameArea.querySelectorAll('.fruit, .bomb');
        objects.forEach(obj => obj.remove());
    }
}

// 重启游戏函数
function restartGame() {
    const game = window.fruitGame;
    if (game) {
        game.startGame();
    }
}

// 页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    window.fruitGame = new FruitCatchGame();
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes particleMove {
        0% {
            transform: translate(0, 0);
            opacity: 1;
        }
        100% {
            transform: translate(var(--endX), var(--endY));
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
