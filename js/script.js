const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('finalScore');
const modal = document.getElementById('gameOverModal');

// 속도 지정
const fps = 10;
const tileSize = 20;
const tileCount = canvas.width / tileSize;

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
const highScoreElement = document.getElementById('highScore');
if (highScoreElement) highScoreElement.innerText = highScore;

let snakeX = 10;
let snakeY = 10;
let velocityX = 0;
let velocityY = 0;
let lastVelocityX = 0;
let lastVelocityY = 0;

let snakeTrail = [];
let tailLength = 5;

let appleX = 15;
let appleY = 15;

const maxLives = 3;
let lives = maxLives;
let isCrashed = false;
let gameInterval;

window.onload = function () {
    startGame();
    document.addEventListener("keydown", keyPush);
};

function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / fps);
}

function gameLoop() {
    if (!isCrashed) {
        update();
    }
    draw();
}

function update() {
    snakeX += velocityX;
    snakeY += velocityY;

    lastVelocityX = velocityX;
    lastVelocityY = velocityY;

    // 1. 벽 충돌 체크
    if (snakeX < 0 || snakeX > tileCount - 1 || snakeY < 0 || snakeY > tileCount - 1) {
        if (snakeX < 0) snakeX = 0;
        if (snakeX > tileCount - 1) snakeX = tileCount - 1;
        if (snakeY < 0) snakeY = 0;
        if (snakeY > tileCount - 1) snakeY = tileCount - 1;

        handleCrash();
        return;
    }

    // 2. 자기 몸 충돌 체크
    for (let i = 0; i < snakeTrail.length; i++) {
        if (snakeTrail[i].x === snakeX && snakeTrail[i].y === snakeY) {
            if (tailLength > 5) {
                handleCrash();
                return;
            }
        }
    }

    // 3. 이동 경로 저장
    snakeTrail.push({ x: snakeX, y: snakeY });
    while (snakeTrail.length > tailLength) {
        snakeTrail.shift();
    }

    // 4. 사과(점수) 먹기
    if (appleX === snakeX && appleY === snakeY) {
        tailLength++;
        score += 10;
        scoreElement.innerText = score;
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
    }
}

// 5. 뱀 그리기 함수
function draw() {
    // 배경
    ctx.fillStyle = "#0f3460";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. 몸통 및 꼬리 
    for (let i = 0; i < snakeTrail.length; i++) {
        // 기본은 파란색
        ctx.fillStyle = "#4db5ff";

        // 평소 상태일 때만 배열열의 마지막을 흰색 머리로 칠함
        // 충돌 상태일 때는 배열에 있는 모든 것을 몸통(파란색)으로 둠
        if (!isCrashed && i === snakeTrail.length - 1) {
            ctx.fillStyle = "#fff";
        }

        ctx.fillRect(snakeTrail[i].x * tileSize, snakeTrail[i].y * tileSize, tileSize - 2, tileSize - 2);
    }

    // 충돌 상태일 때만 머리를 빨간색

    if (isCrashed) {
        ctx.fillStyle = "#ff4757";
        ctx.fillRect(snakeX * tileSize, snakeY * tileSize, tileSize - 2, tileSize - 2);
    }

    // 사과(점수)
    ctx.fillStyle = "#e94560";
    ctx.beginPath();
    ctx.arc(appleX * tileSize + tileSize / 2, appleY * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function handleCrash() {
    if (isCrashed) return;

    isCrashed = true;
    lives--;
    livesElement.innerText = lives + " / " + maxLives;

    // 애니메이션 리셋
    canvas.classList.remove('blink');
    void canvas.offsetWidth;
    canvas.classList.add('blink');

    if (lives <= 0) {
        draw();
        setTimeout(gameOver, 500);
    } else {
        setTimeout(() => {
            canvas.classList.remove('blink');
            resetSnakePosition();
            isCrashed = false;
            lastVelocityX = 0;
            lastVelocityY = 0;
        }, 1000);
    }
}

function resetSnakePosition() {
    snakeX = 10;
    snakeY = 10;
    velocityX = 0;
    velocityY = 0;
    snakeTrail = [];
    tailLength = 5;

    draw();
}

function gameOver() {
    clearInterval(gameInterval);
    finalScoreElement.innerText = score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        if (highScoreElement) highScoreElement.innerText = highScore;
    }

    modal.classList.remove('hidden');
}

function resetGame() {
    lives = maxLives;
    livesElement.innerText = lives + " / " + maxLives;
    score = 0;
    scoreElement.innerText = 0;

    isCrashed = false;
    canvas.classList.remove('blink');

    resetSnakePosition();
    lastVelocityX = 0;
    lastVelocityY = 0;

    modal.classList.add('hidden');
    startGame();
}

function keyPush(evt) {
    if (isCrashed) return;

    switch (evt.keyCode) {
        case 37: if (lastVelocityX !== 1) { velocityX = -1; velocityY = 0; } break;
        case 38: if (lastVelocityY !== 1) { velocityX = 0; velocityY = -1; } break;
        case 39: if (lastVelocityX !== -1) { velocityX = 1; velocityY = 0; } break;
        case 40: if (lastVelocityY !== -1) { velocityX = 0; velocityY = 1; } break;
    }
}