# Snake Game using Construct JS

A classic Snake game built with HTML, CSS, and JavaScript using a custom implementation of the Construct JS library.

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Running the Game

There are two ways to run the game:

### Method 1: Using the Node.js server

1. Start the server:
   ```
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Method 2: Opening the HTML file directly

You can also open the `index.html` file directly in your browser.

## About the Construct JS Implementation

This project uses a custom browser-compatible implementation of the Construct JS library (`js/lib/construct-browser.js`). The original Construct JS library is designed for Node.js environments, but our implementation provides the necessary functionality for the snake game in a browser environment.

## Testing Construct JS

To verify that the Construct JS implementation is working correctly, you can open the `test.html` file in your browser. This will display a simple canvas with shapes drawn using our Construct JS implementation.

## Features

- Classic snake gameplay
- Score tracking
- Game controls with arrow keys
- Start and restart functionality
- Responsive design

## How to Play

1. Click the "Start Game" button to begin
2. Use the arrow keys to control the snake:
   - ↑ (Up Arrow): Move up
   - ↓ (Down Arrow): Move down
   - ← (Left Arrow): Move left
   - → (Right Arrow): Move right
3. Eat the red food to grow the snake and increase your score
4. Avoid hitting the walls or the snake's own body
5. When the game is over, click "Restart" to play again

## Game Logic

- The game is played on a 20x20 grid
- The snake starts with 3 segments and moves to the right
- Each time the snake eats food, it grows by one segment and the score increases by 10
- The game ends when the snake hits a wall or itself

## Troubleshooting

If you encounter issues with the game:

1. Make sure you have run `npm install` to install the dependencies
2. Check that the path to the library in `index.html` is correct
3. Try the test page (`test.html`) to verify that the Construct JS implementation is working

## License

This project is open source and available for personal and educational use. 