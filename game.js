const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const startButton = document.getElementById('start-button');
const backToMenuButton = document.getElementById('back-to-menu-button');
const restartButton = document.getElementById('restart-button');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');
const winScoreElement = document.getElementById('win-score');

let score = 0;
let lives = 3;
let gameLoop;

const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    width: 100,
    height: 10,
    speed: 8
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 8,
    speed: 5,
    dx: 3,
    dy: -3
};

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffff';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#00ffff';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = `hsl(${c * 30 + r * 20}, 100%, 50%)`;
                ctx.fill();
                ctx.closePath();

                // 3D effect
                ctx.beginPath();
                ctx.moveTo(brickX, brickY + brickHeight);
                ctx.lineTo(brickX + 5, brickY + brickHeight + 5);
                ctx.lineTo(brickX + brickWidth + 5, brickY + brickHeight + 5);
                ctx.lineTo(brickX + brickWidth, brickY + brickHeight);
                ctx.fillStyle = `hsl(${c * 30 + r * 20}, 100%, 30%)`;
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo(brickX + brickWidth, brickY);
                ctx.lineTo(brickX + brickWidth + 5, brickY + 5);
                ctx.lineTo(brickX + brickWidth + 5, brickY + brickHeight + 5);
                ctx.lineTo(brickX + brickWidth, brickY + brickHeight);
                ctx.fillStyle = `hsl(${c * 30 + r * 20}, 100%, 40%)`;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    let remainingBricks = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                remainingBricks++;
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    scoreElement.textContent = `Score: ${score}`;
                    remainingBricks--;
                }
            }
        }
    }
    if (remainingBricks === 0) {
        winGame();
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        score++;
        scoreElement.textContent = `Score: ${score}`;
    }

    // Bottom collision
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        livesElement.textContent = `Lives: ${lives}`;
        if (lives === 0) {
            gameOver();
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 50;
            ball.dx = 3;
            ball.dy = -3;
            paddle.x = canvas.width / 2 - paddle.width / 2;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    movePaddle();
    moveBall();
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function startGame() {
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    score = 0;
    lives = 3;
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${lives}`;
    resetBricks();
    resetBallAndPaddle();
    gameLoop = setInterval(draw, 10);
}

function gameOver() {
    clearInterval(gameLoop);
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = `Your Score: ${score}`;
}

function winGame() {
    clearInterval(gameLoop);
    gameScreen.classList.add('hidden');
    winScreen.classList.remove('hidden');
    winScoreElement.textContent = `Your Score: ${score}`;
}

function resetBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
}

function resetBallAndPaddle() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 3;
    ball.dy = -3;
    paddle.x = canvas.width / 2 - paddle.width / 2;
}

startButton.addEventListener('click', startGame);
backToMenuButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
});
restartButton.addEventListener('click', startGame);
