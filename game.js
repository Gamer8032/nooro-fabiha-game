// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const bgImg = new Image();
bgImg.src = "background.png";

// Load sounds
const flapSound = new Audio("flap.wav");
const scoreSound = new Audio("score.wav");
const bgMusic = new Audio("background.mp3");
const gameOverSound = new Audio("gameover.wav"); // Game Over sound
bgMusic.loop = true;
bgMusic.volume = 0.3;

// Game variables
let birdX = 80;
let birdY = 250;
let birdVelocity = 0;
let gravity = 0.4;
let flapStrength = -7;

let pipes = [];
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 2;
let frameCount = 0;

let score = 0;
let gameOver = false;
let musicStarted = false;

// Player input
document.addEventListener("keydown", flap);
canvas.addEventListener("click", flap);

function flap() {
    if (!musicStarted) {
        bgMusic.play().catch(() => {});
        musicStarted = true;
    }

    if (!gameOver) {
        birdVelocity = flapStrength;
        flapSound.play();
    } else {
        restartGame();
    }
}

// Spawn pipes
function spawnPipe() {
    const topHeight = Math.random() * 300 + 50;
    const bottomY = topHeight + pipeGap;
    pipes.push({ x: canvas.width, topHeight, bottomY, passed: false });
}

// Restart game
function restartGame() {
    birdY = 250;
    birdVelocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0;
    gameOver = false;

    // Stop Game Over sound immediately
    gameOverSound.pause();
    gameOverSound.currentTime = 0;

    // Restart background music from beginning
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
}

// Update game state
function update() {
    if (gameOver) return;

    frameCount++;
    if (frameCount % 120 === 0) spawnPipe();

    // Bird physics
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Ceiling/floor collision
    if (birdY < 0) birdY = 0;
    if (birdY > canvas.height - 15) {
        birdY = canvas.height - 15;
        if (!gameOver) {
            bgMusic.pause();
            gameOverSound.play();
        }
        gameOver = true;
    }

    // Move pipes, check collision & scoring
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Collision
        if (
            birdX + 15 > pipe.x &&
            birdX - 15 < pipe.x + pipeWidth &&
            (birdY - 15 < pipe.topHeight || birdY + 15 > pipe.bottomY)
        ) {
            if (!gameOver) {
                bgMusic.pause();
                gameOverSound.play();
            }
            gameOver = true;
        }

        // Scoring
        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
            score++;
            pipe.passed = true;
            scoreSound.play();
        }
    });

    // Remove offscreen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

// Draw game
function draw() {
    // Background
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Pipes
    pipes.forEach(pipe => {
        // Top pipe (flipped)
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight / 2);
        ctx.scale(1, -1);
        ctx.drawImage(pipeImg, -pipeWidth / 2, -pipe.topHeight / 2, pipeWidth, pipe.topHeight);
        ctx.restore();

        // Bottom pipe
        ctx.drawImage(pipeImg, pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    });

    // Bird
    ctx.drawImage(birdImg, birdX - 15, birdY - 15, 30, 30);

    // Score (top-left with Roman font & subtle shadow)
    ctx.font = "30px 'Times New Roman', serif";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(`Score: ${score}`, 10, 40);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Game Over screen with translucent overlay
    if (gameOver) {
        // Translucent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text styling
        ctx.fillStyle = "black";
        ctx.textAlign = "center";

        ctx.font = "60px 'Times New Roman', serif";
        ctx.fillText("Game Over!", canvas.width / 2, 250);

        ctx.font = "40px 'Times New Roman', serif";
        ctx.fillText(`Total Score: ${score}`, canvas.width / 2, 320);

        ctx.font = "20px 'Times New Roman', serif";
        ctx.fillText("Press any key / tap to restart", canvas.width / 2, 370);

        ctx.textAlign = "start"; // reset alignment
    }
}

// Main game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
