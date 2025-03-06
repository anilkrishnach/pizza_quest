document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const GRID_SIZE = 20; // Size of each grid cell in pixels
    const GRID_WIDTH = 20; // Number of cells horizontally
    const GRID_HEIGHT = 20; // Number of cells vertically
    const GAME_SPEED = 150; // Milliseconds between game updates
    
    // Game variables
    let dragon = []; // Array of dragon segments (formerly snake)
    let dragonBall = null; // Dragon ball position (formerly food)
    let direction = 'right'; // Initial direction
    let nextDirection = 'right';
    let gameInterval = null;
    let score = 0;
    let gameRunning = false;
    let dragonBallColors = ['#F7DC6F', '#F39C12', '#E67E22', '#D35400', '#C0392B', '#9B59B6', '#8E44AD']; // Dragon ball colors
    let currentBallColor = 0; // Index for current dragon ball color
    
    // Image objects
    const dragonHeadImg = new Image();
    const dragonBodyImg = new Image();
    const dragonBallImg = new Image();
    const backgroundImg = new Image();
    
    // Set image sources
    dragonHeadImg.src = 'images/dr.jpg'; // Using dr.jpg from images folder
    dragonBodyImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjRkY2QjM1IiBkPSJNNDgwIDMyMGMwIDg4LjM2Ni03MS42MzQgMTYwLTE2MCAxNjBIMTYwQzcxLjYzNCA0ODAgMCA0MDguMzY2IDAgMzIwVjE5MkMwIDEwMy42MzQgNzEuNjM0IDMyIDE2MCAzMmgxNjBjODguMzY2IDAgMTYwIDcxLjYzNCAxNjAgMTYwdjEyOHoiLz48cGF0aCBmaWxsPSIjRjdDNTlGIiBkPSJNMzg0IDI1NmMwIDE3LjY3My0xNC4zMjcgMzItMzIgMzJIMTYwYy0xNy42NzMgMC0zMi0xNC4zMjctMzItMzIgMC0xNy42NzMgMTQuMzI3LTMyIDMyLTMyaDE5MmMxNy42NzMgMCAzMiAxNC4zMjcgMzIgMzJ6Ii8+PC9zdmc+';
    dragonBallImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNGN0RDNkYiIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIvPjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNjAgMTYwYy0xNy42NzMgMC0zMiAxNC4zMjctMzIgMzIgMCAxNy42NzMgMTQuMzI3IDMyIDMyIDMyIDE3LjY3MyAwIDMyLTE0LjMyNyAzMi0zMiAwLTE3LjY3My0xNC4zMjctMzItMzItMzJ6bTE5MiAwYy0xNy42NzMgMC0zMiAxNC4zMjctMzIgMzIgMCAxNy42NzMgMTQuMzI3IDMyIDMyIDMyIDE3LjY3MyAwIDMyLTE0LjMyNyAzMi0zMiAwLTE3LjY3My0xNC4zMjctMzItMzItMzJ6Ii8+PHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTI1NiA5NmMtOC44MzcgMC0xNiA3LjE2My0xNiAxNnM3LjE2MyAxNiAxNiAxNiAxNi03LjE2MyAxNi0xNi03LjE2My0xNi0xNi0xNnptLTk2IDk2Yy04LjgzNyAwLTE2IDcuMTYzLTE2IDE2czcuMTYzIDE2IDE2IDE2IDE2LTcuMTYzIDE2LTE2LTcuMTYzLTE2LTE2LTE2em0xOTIgMGMtOC44MzcgMC0xNiA3LjE2My0xNiAxNnM3LjE2MyAxNiAxNiAxNiAxNi03LjE2MyAxNi0xNi03LjE2My0xNi0xNi0xNnptLTk2IDk2Yy04LjgzNyAwLTE2IDcuMTYzLTE2IDE2czcuMTYzIDE2IDE2IDE2IDE2LTcuMTYzIDE2LTE2LTcuMTYzLTE2LTE2LTE2eiIvPjwvc3ZnPg==';
    backgroundImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIj48cmVjdCBmaWxsPSIjODdDRUVCIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIvPjwvc3ZnPg=='; // Plain sky blue background
    
    // DOM elements
    const gameCanvas = document.getElementById('game-canvas');
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    console.log('Initializing game canvas...');
    
    // Initialize Construct JS canvas
    const canvas = new Construct({
        container: gameCanvas,
        width: GRID_WIDTH * GRID_SIZE,
        height: GRID_HEIGHT * GRID_SIZE
    });
    
    console.log('Canvas initialized:', canvas);
    
    // Initialize game
    function initGame() {
        console.log('Initializing game...');
        // Clear any existing game elements
        canvas.clear();
        
        // Reset game variables
        dragon = [];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = '0';
        currentBallColor = Math.floor(Math.random() * dragonBallColors.length);
        
        // Create initial dragon (3 segments)
        for (let i = 0; i < 3; i++) {
            dragon.unshift({
                x: Math.floor(GRID_WIDTH / 2) - i,
                y: Math.floor(GRID_HEIGHT / 2)
            });
        }
        
        console.log('Initial dragon:', JSON.stringify(dragon));
        
        // Create dragon ball
        createDragonBall();
        
        console.log('Dragon ball created:', JSON.stringify(dragonBall));
        
        // Draw initial game state
        drawGame();
        console.log('Game initialized successfully');
    }
    
    // Create dragon ball at random position
    function createDragonBall() {
        let ballX, ballY;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        
        // Keep generating positions until we find one not occupied by the dragon
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            ballX = Math.floor(Math.random() * GRID_WIDTH);
            ballY = Math.floor(Math.random() * GRID_HEIGHT); // Now balls can appear anywhere since we have a plain background
            
            validPosition = true;
            
            // Check if position overlaps with dragon
            for (const segment of dragon) {
                if (segment.x === ballX && segment.y === ballY) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        // If we couldn't find a valid position, just place dragon ball somewhere
        if (!validPosition) {
            ballX = 0;
            ballY = 0;
        }
        
        // Cycle to next dragon ball color
        currentBallColor = (currentBallColor + 1) % dragonBallColors.length;
        
        dragonBall = { 
            x: ballX, 
            y: ballY,
            color: dragonBallColors[currentBallColor]
        };
    }
    
    // Draw the game (dragon and dragon ball)
    function drawGame() {
        console.log('Drawing game...');
        // Clear canvas
        canvas.clear();
        
        // Draw background
        canvas.drawImage({
            image: backgroundImg,
            x: 0,
            y: 0,
            width: GRID_WIDTH * GRID_SIZE,
            height: GRID_HEIGHT * GRID_SIZE
        });
        
        // Draw dragon
        dragon.forEach((segment, index) => {
            if (index === 0) {
                // Draw dragon head with rotation based on direction
                let rotation = 0;
                switch(direction) {
                    case 'up': rotation = 270; break;
                    case 'down': rotation = 90; break;
                    case 'left': rotation = 180; break;
                    case 'right': rotation = 0; break;
                }
                
                canvas.drawImage({
                    image: dragonHeadImg,
                    x: segment.x * GRID_SIZE - GRID_SIZE/2, // Adjust position to center the head
                    y: segment.y * GRID_SIZE - GRID_SIZE/2,
                    width: GRID_SIZE * 2, // Make the head larger
                    height: GRID_SIZE * 2,
                    rotation: rotation,
                    rotationCenterX: segment.x * GRID_SIZE + GRID_SIZE/2,
                    rotationCenterY: segment.y * GRID_SIZE + GRID_SIZE/2
                });
            } else {
                // Draw dragon body
                canvas.drawImage({
                    image: dragonBodyImg,
                    x: segment.x * GRID_SIZE,
                    y: segment.y * GRID_SIZE,
                    width: GRID_SIZE,
                    height: GRID_SIZE
                });
            }
        });
        
        // Draw dragon ball
        if (dragonBall) {
            // Apply color tint to the dragon ball
            canvas.drawImage({
                image: dragonBallImg,
                x: dragonBall.x * GRID_SIZE,
                y: dragonBall.y * GRID_SIZE,
                width: GRID_SIZE,
                height: GRID_SIZE,
                tint: dragonBall.color
            });
        }
        console.log('Game drawn successfully');
    }
    
    // Update game state
    function updateGame() {
        console.log('Updating game...');
        try {
            // Update direction
            direction = nextDirection;
            
            // Calculate new head position
            const head = { ...dragon[0] };
            
            switch (direction) {
                case 'up':
                    head.y -= 1;
                    break;
                case 'down':
                    head.y += 1;
                    break;
                case 'left':
                    head.x -= 1;
                    break;
                case 'right':
                    head.x += 1;
                    break;
            }
            
            console.log('New head position:', JSON.stringify(head));
            
            // Check for collisions with walls
            const hitWall = 
                head.x < 0 || 
                head.x >= GRID_WIDTH || 
                head.y < 0 || 
                head.y >= GRID_HEIGHT;
            
            if (hitWall) {
                console.log('Wall collision detected!');
                gameOver();
                return;
            }
            
            // Check for collisions with self
            const hitSelf = dragon.some(segment => 
                segment.x === head.x && segment.y === head.y
            );
            
            if (hitSelf) {
                console.log('Self collision detected!');
                gameOver();
                return;
            }
            
            // Add new head
            dragon.unshift(head);
            
            // Check if dragon ate dragon ball
            if (head.x === dragonBall.x && head.y === dragonBall.y) {
                console.log('Dragon ball consumed!');
                // Increase score
                score += 10;
                scoreElement.textContent = score;
                
                // Create new dragon ball
                createDragonBall();
                
                // Special effect for eating dragon ball (could add animation here)
            } else {
                // Remove tail if no dragon ball was eaten
                dragon.pop();
            }
            
            // Draw updated game
            drawGame();
            console.log('Game updated successfully');
        } catch (error) {
            console.error('Error in updateGame:', error);
            gameOver();
        }
    }
    
    // Game over function
    function gameOver() {
        console.log('Game over!');
        clearInterval(gameInterval);
        gameRunning = false;
        
        // Show game over message
        canvas.text({
            x: (GRID_WIDTH * GRID_SIZE) / 2,
            y: (GRID_HEIGHT * GRID_SIZE) / 2,
            text: 'GAME OVER',
            fill: '#F44336',
            font: 'bold 24px Arial',
            align: 'center'
        });
        
        // Update button states
        startBtn.disabled = true;
        restartBtn.disabled = false;
    }
    
    // Start game function
    function startGame() {
        console.log('Starting game...');
        if (!gameRunning) {
            initGame();
            gameRunning = true;
            
            // Use setTimeout for the first update to ensure everything is initialized
            setTimeout(() => {
                gameInterval = setInterval(updateGame, GAME_SPEED);
            }, 500);
            
            // Update button states
            startBtn.disabled = true;
            restartBtn.disabled = false;
            console.log('Game started successfully');
        }
    }
    
    // Restart game function
    function restartGame() {
        console.log('Restarting game...');
        clearInterval(gameInterval);
        startGame();
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        console.log('Key pressed:', e.key);
        
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
        
        console.log('New direction:', nextDirection);
        
        // Prevent default behavior for arrow keys (scrolling)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    // Initialize the canvas with a welcome message
    console.log('Displaying welcome message...');
    
    // Draw background for welcome screen
    canvas.drawImage({
        image: backgroundImg,
        x: 0,
        y: 0,
        width: GRID_WIDTH * GRID_SIZE,
        height: GRID_HEIGHT * GRID_SIZE
    });
    
    // Draw dragon head for welcome screen
    canvas.drawImage({
        image: dragonHeadImg,
        x: (GRID_WIDTH * GRID_SIZE) / 2 - 40,
        y: (GRID_HEIGHT * GRID_SIZE) / 2 - 80,
        width: 80,
        height: 80
    });
    
    canvas.text({
        x: (GRID_WIDTH * GRID_SIZE) / 2,
        y: (GRID_HEIGHT * GRID_SIZE) / 2,
        text: 'Dragon Ball Hunt',
        fill: '#FF4500',
        font: 'bold 20px Arial',
        align: 'center'
    });
    
    canvas.text({
        x: (GRID_WIDTH * GRID_SIZE) / 2,
        y: (GRID_HEIGHT * GRID_SIZE) / 2 + 30,
        text: 'Press Start to Play',
        fill: '#333',
        font: '16px Arial',
        align: 'center'
    });
    console.log('Welcome message displayed');
}); 