// ---------------- Canvas Setup ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

// Audio Settings
bgMusic.loop = true;
bgMusic.volume = 0.3;

// ---------------- Game Variables ----------------
let birdX = 80;
let birdY = 250;
let birdVelocity = 0;

// Easier mobile controls:
let gravity = 0.22;        // Smooth falling
let flapStrength = -5.8;   // Smooth controlled flap

let pipes = [];
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 2;
let frameCount = 0;

let score = 0;
let gameOver = false;
let musicStarted = false;

// ---------------- Player Input ----------------
document.addEventListener("keydown", flap);
canvas.addEventListener("click", flap);

function flap() {
    if (!musicStarted) {
        bgMusic.play().catch(() => {});
        musicStarted = true;
    }

    if (!gameOver) {
        birdVelocity = flapStrength;
        birdVelocity -= 1.2; // smoother boost
        flapSound.play();
    } else {
        restartGame();
    }
}

// ---------------- Spawn Pipes ----------------
function spawnPipe() {
    let topHeight = Math.random() * 250 + 80; // balanced spacing
    let bottomY = topHeight + pipeGap;
    pipes.push({ x: canvas.width, topHeight, bottomY, passed: false });
}

// ---------------- Restart Game ----------------
function restartGame() {
    birdY = 250;
    birdVelocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0;
    gameOver = false;

    // Stop game over sound
    gameOverSound.pause();
    gameOverSound.currentTime = 0;

    // Restart music
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

    // Collide with ceiling or floor
    if (birdY > canvas.height - 15 || birdY < 0) {
        endGame();
    }
