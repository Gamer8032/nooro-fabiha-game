// ---------------- Canvas Setup ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make canvas full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---------------- Load Images ----------------
const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const bgImg = new Image();
bgImg.src = "background.png";

// ---------------- Load Audio ----------------
const flapSound = new Audio("flap.wav");
const scoreSound = new Audio("score.wav");
const bgMusic = new Audio("background.mp3");
const gameOverSound = new Audio("gameover.wav");

// Audio settings
bgMusic.loop = true;
bgMusic.volume = 0.3;

// ---------------- Game Variables ----------------
let birdX = canvas.width * 0.15;
let birdY = canvas.height / 2;
let birdVelocity = 0;

let gravity = 0.22;
let flapStrength = -5.8;

let pipes = [];
let pipeWidth = 60;
let pipeGap = canvas.height * 0.25; // proportional gap
let pipeSpeed = 2;
let frameCount = 0;

let score = 0;
let gameOver = false;
let musicStarted = false;

// ---------------- Player Input ----------------
document.addEventListener("keydown", flap);
canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", flap); // mobile touch support

function flap() {
    if (!musicStarted) {
        bgMusic.play().catch(() => {});
        musicStarted = true;
    }
    if (!gameOver) {
        birdVelocity = flapStrength;
        birdVelocity -= 1.2;
        flapSound.play();
    } else {
        restartGame();
    }
}

// ---------------- Spawn Pipes ----------------
function spawnPipe() {
    let topHeight = Math.random() * (canvas.height * 0.6) + canvas.height * 0.1;
    let bottomY = topHeight + pipeGap;
    pipes.push({ x: canvas.width, topHeight, bottomY, passed: false });
}

// ---------------- Restart Game ----------------
function restartGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0;
    gameOver = false;

    gameOverSound.pause();
    gameOverSound.currentTime = 0;

    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
}

// ---------------- Update Game ----------------
function update() {
    if (gameOver) return;

    frameCount++;
    if (frameCount % 110 === 0) spawnPipe();

    // Bird physics
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Collision with ceiling/floor
    if (birdY > canvas.height - 15 || birdY < 0) {
        endGame();
    }

    // Move pipes
    pipes.forEach(pipe => pipe.x -= pipeSpeed);

    // Collision and scoring
    pipes.forEach(pipe => {
        if (
            birdX + 15 > pipe.x &&
            birdX - 15 < pipe.x + pipeWidth &&
            (birdY - 15 < pipe.topHeight || birdY + 15 > pipe.bottomY)
        ) {
            endGame();
        }

        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
            score++;
            pipe.passed = true;
            scoreSound.play();
        }
    });

    // Remove offscreen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

// ---------------- End Game ----------------
function endGame() {
    if (!gameOver) {
        bgMusic.pause();
        gameOverSound.currentTime = 0;
        gameOverSound.play();
    }
    gameOver = true;
}

// ---------------- Draw Everything ----------------
function draw() {
    // Background
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Pipes
    pipes.forEach(pipe => {
        // Top pipe flipped
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

    // Score
    ctx.fillStyle = "white";
    ctx.font = "32px Arial Black";
    ctx.textAlign = "center";
    ctx.fillText(score, canvas.width / 2, 50);

    // Game Over
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "gold";
        ctx.font = "50px 'Times New Roman'";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);

        ctx.fillStyle = "white";
        ctx.font = "28px 'Times New Roman'";
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

        ctx.font = "20px Arial";
        ctx.fillText("Tap or Press Any Key to Restart", canvas.width / 2, canvas.height / 2 + 50);
    }
}

// ---------------- Wait for all images to load ----------------
let imagesLoaded = 0;
const totalImages = 3;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        loop(); // start game loop after all images are ready
    }
}

birdImg.onload = imageLoaded;
pipeImg.onload = imageLoaded;
bgImg.onload = imageLoaded;

// ---------------- Game Loop ----------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
