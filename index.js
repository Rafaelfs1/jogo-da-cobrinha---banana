// Seletores do DOM
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const levelElement = document.querySelector(".level");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const statusShieldElement = document.querySelector(".status-shield");
const statusSpeedElement = document.querySelector(".status-speed");
const alertaefeitos = document.querySelector(".alert"); // <<< SEU SELETOR

// Variáveis de Estado do Jogo
let gameOver = false;
let setIntervalId;
let foodIntervalId;
let alertTimeoutId; // 

// Variáveis da Cobra
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let nextDirection = null;

// Variáveis da Fruta
let foodX, foodY;
let currentFruitKey;
let currentFruitEmoji;
let bonusFoods = [];

// Variáveis de Pontuação e Nível
let score = 0;
let level = 1;
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Variáveis de Efeitos (Power-ups)
let speed = 300;
let baseSpeed = 300;
let shieldCount = 0;
let isFoodHoming = false;

const fruits = {
    maça: "🍎",
    banana: "🍌",
    uva: "🍇",
    laranja: "🍊",
    morango: "🍓",
    kiwi: "🥝",
    manga: "🥭"
};

// --- FUNÇÕES PRINCIPAIS ---

const resetEffects = () => {
    if (speed !== baseSpeed) {
        speed = baseSpeed;
        clearInterval(setIntervalId);
        setIntervalId = setInterval(initGame, speed);
    }
    if (isFoodHoming) {
        clearInterval(foodIntervalId);
        isFoodHoming = false;
    }
    updateStatusUI();
};

const spawnNewFruit = () => {
    do {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
    } while (snakeBody.some(segment => segment[0] === foodX && segment[1] === foodY));

    const fruitKeys = Object.keys(fruits);
    currentFruitKey = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];
    currentFruitEmoji = fruits[currentFruitKey];

    if (currentFruitKey === 'laranja') {
        isFoodHoming = true;
        foodIntervalId = setInterval(moveHomingFood, speed * 2);
    }
};

// som de game over
const playTrilhaSound = () => {
    const gameOverSound = new Audio('asset/audio/jazz.mp3');
    gameOverSound.play();
};
const playCorrectSound = () => {
    const gameOverSound = new Audio('asset/audio/correct.mp3');
    gameOverSound.play();
};
const playWrongSound = () => {
    const gameOverSound = new Audio('asset/audio/wrong.mp3');
    gameOverSound.play();
};


const handleGameOver = () => {

    clearInterval(setIntervalId);
    clearInterval(foodIntervalId);
    alert("Game Over! Pressione OK para reiniciar...");
    
    location.reload();
};

const changeDirection = e => {
    if (e.key === "ArrowUp") nextDirection = { vx: 0, vy: -1 };
    else if (e.key === "ArrowDown") nextDirection = { vx: 0, vy: 1 };
    else if (e.key === "ArrowLeft") nextDirection = { vx: -1, vy: 0 };
    else if (e.key === "ArrowRight") nextDirection = { vx: 1, vy: 0 };
};

const updateStatusUI = () => {
    scoreElement.innerText = `Score: ${score}`;
    levelElement.innerText = `Level: ${level}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    statusShieldElement.innerText = '🛡️'.repeat(shieldCount);
    if (speed < baseSpeed) statusSpeedElement.innerText = '⚡⚡';
    else if (speed > baseSpeed) statusSpeedElement.innerText = '🐢';
    else statusSpeedElement.innerText = '⚡';
};


// --- LÓGICA DOS EFEITOS ---

const moveHomingFood = () => {
    if (!isFoodHoming) return;
    const dx = snakeX - foodX;
    const dy = snakeY - foodY;
    if (Math.abs(dx) > Math.abs(dy)) {
        foodX += Math.sign(dx);
    } else {
        foodY += Math.sign(dy);
    }
};

const spawnBonusFoods = () => {
    bonusFoods = [];
    for (let i = 0; i < 2; i++) {
        let bonusX, bonusY;
        do {
            bonusX = Math.floor(Math.random() * 30) + 1;
            bonusY = Math.floor(Math.random() * 30) + 1;
        } while (
            snakeBody.some(segment => segment[0] === bonusX && segment[1] === bonusY) ||
            bonusFoods.some(food => food.x === bonusX && food.y === bonusY)
        );
        bonusFoods.push({ x: bonusX, y: bonusY, emoji: '🍎' });
    }
};

const findSafeTurn = (currentX, currentY, wallHit) => {
    let possibleTurns = [];
    if (wallHit === 'top' || wallHit === 'bottom') {
        possibleTurns = [{ vx: -1, vy: 0 }, { vx: 1, vy: 0 }];
    } else if (wallHit === 'left' || wallHit === 'right') {
        possibleTurns = [{ vx: 0, vy: -1 }, { vx: 0, vy: 1 }];
    }
    const safeTurns = possibleTurns.filter(turn => {
        const nextX = currentX + turn.vx;
        const nextY = currentY + turn.vy;
        return !snakeBody.some(segment => segment[0] === nextX && segment[1] === nextY);
    });
    if (safeTurns.length > 0) {
        return safeTurns[Math.floor(Math.random() * safeTurns.length)];
    }
    return null;
};

// <<< NOVA FUNÇÃO PARA MOSTRAR O ALERTA >>>
const showAlert = (message) => {
    // Limpa qualquer alerta anterior para evitar que ele suma antes da hora
    clearTimeout(alertTimeoutId);

    alertaefeitos.innerText = message;
    alertaefeitos.classList.add('show'); // Adiciona a classe para mostrar com fade in

    // Define um tempo para esconder o alerta
    alertTimeoutId = setTimeout(() => {
        alertaefeitos.classList.remove('show');
    }, 2000); // O alerta ficará visível por 2 segundos
}

// <<< applyFruitEffect AGORA TAMBÉM CHAMA OS ALERTAS >>>
const applyFruitEffect = (fruitKey) => {
    switch (fruitKey) {
        case 'maça':
            playCorrectSound();// Nenhuma mensagem para a fruta padrão
            
        case 'banana':
            if (shieldCount < 3) {
                shieldCount++;
                
                showAlert("Escudo Ativado! 🛡️");
            } else {
                showAlert("Máximo de escudos atingido!");
            }
            break;
        case 'uva':
            speed = baseSpeed + 100;
            clearInterval(setIntervalId);
            setIntervalId = setInterval(initGame, speed);
            showAlert("Mais lento... 🐢");
            break;
        case 'kiwi':
            if (baseSpeed > 150) {
                speed = baseSpeed - 100;
                clearInterval(setIntervalId);
                setIntervalId = setInterval(initGame, speed);
                showAlert("Velocidade aumentada! ⚡");
            }
            break;
        case 'morango':
            spawnBonusFoods();
            showAlert("Frutas Bônus! 🍎🍎");
            break;
        case 'manga':
            const tail = snakeBody.length > 0 ? snakeBody[snakeBody.length - 1] : [snakeX, snakeY];
            for (let i = 0; i < 4; i++) {
                snakeBody.push([...tail]);
            }
            showAlert("Super Crescimento! +5");
            break;
    }
    updateStatusUI();
    playCorrectSound();
};

const initGame = () => {
    if (gameOver) return handleGameOver();

    

    if (nextDirection) {
        const isMovingHorizontally = velocityX !== 0;
        const isMovingVertically = velocityY !== 0;
        if ((isMovingHorizontally && nextDirection.vy !== 0) || (isMovingVertically && nextDirection.vx !== 0) || (!isMovingHorizontally && !isMovingVertically)) {
            velocityX = nextDirection.vx;
            velocityY = nextDirection.vy;
        }
        nextDirection = null;
    }

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}">${currentFruitEmoji}</div>`;
    bonusFoods.forEach(food => {
        html += `<div class="food bonus" style="grid-area: ${food.y} / ${food.x}">${food.emoji}</div>`;
    });

    let nextX = snakeX + velocityX;
    let nextY = snakeY + velocityY;

    if (nextX <= 0 || nextX > 30 || nextY <= 0 || nextY > 30) {
        if (shieldCount > 0) {
            shieldCount--;
            showAlert("Escudo Usado!");
            let wallHit = '';
            if (nextY <= 0) wallHit = 'top';
            else if (nextY > 30) wallHit = 'bottom';
            else if (nextX <= 0) wallHit = 'left';
            else if (nextX > 30) wallHit = 'right';
            const safeTurn = findSafeTurn(snakeX, snakeY, wallHit);
            if (safeTurn) {
                velocityX = safeTurn.vx;
                velocityY = safeTurn.vy;
                nextX = snakeX + velocityX;
                nextY = snakeY + velocityY;
            } else {
                gameOver = true;
            }
        } else {
            gameOver = true;
        }
    }

    for (let i = 1; i < snakeBody.length; i++) {
        if (nextX === snakeBody[i][0] && nextY === snakeBody[i][1]) {
            if (shieldCount > 0) {
                shieldCount--;
                showAlert("Escudo Usado!");
            } else {
                gameOver = true;
            }
        }
    }

    if (gameOver) return handleGameOver();

    snakeX = nextX;
    snakeY = nextY;

    if (snakeX === foodX && snakeY === foodY) {
        resetEffects();
        applyFruitEffect(currentFruitKey);
        snakeBody.push([foodY, foodX]);
        score++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        spawnNewFruit();
    }
    for (let i = bonusFoods.length - 1; i >= 0; i--) {
        if (snakeX === bonusFoods[i].x && snakeY === bonusFoods[i].y) {
            snakeBody.push([bonusFoods[i].y, bonusFoods[i].x]);
            score++;
            highScore = score >= highScore ? score : highScore;
            localStorage.setItem("high-score", highScore);
            bonusFoods.splice(i, 1);
        }
    }

    const oldLevel = level;
    level = Math.floor(score / 5) + 1;
    if (level > oldLevel && baseSpeed > 50) {
        baseSpeed -= 20;
        if (speed === baseSpeed + 20) {
            speed = baseSpeed;
            clearInterval(setIntervalId);
            setIntervalId = setInterval(initGame, speed);
        }
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length > 0) {
        snakeBody[0] = [snakeX, snakeY];
    } else {
        snakeBody.push([snakeX, snakeY]);
    }

    // <<< LÓGICA DE DESENHO FINAL E CORRIGIDA >>>
    for (let i = 0; i < snakeBody.length; i++) {
        const [segmentX, segmentY] = snakeBody[i];

        let segmentClass = '';
        let angle = 0;

        // --- LÓGICA DE ROTAÇÃO FINAL ---

        if (i === 0) { // É A CABEÇA
            segmentClass = 'snake-head';
            // Base da imagem: aponta para a DIREITA (conforme seu código que funcionou)
            if (velocityX === 1) angle = 0;
            else if (velocityX === -1) angle = 180;
            else if (velocityY === 1) angle = 90;
            else if (velocityY === -1) angle = -90;
        }
        else if (i === snakeBody.length - 1 && snakeBody.length > 1) { // É A CAUDA
            segmentClass = 'snake-tail';
            const segmentBeforeTail = snakeBody[i - 1];
            const [beforeX, beforeY] = segmentBeforeTail;

            // Base da imagem: aponta para a DIREITA (para ser consistente)
            // A cauda deve apontar para longe do corpo
            if (beforeY < segmentY) angle = -90;    // Corpo está em cima, cauda aponta para BAIXO
            else if (beforeY > segmentY) angle = 90; // Corpo está embaixo, cauda aponta para CIMA
            else if (beforeX < segmentX) angle = 180;   // Corpo está à esquerda, cauda aponta para a DIREITA
            else if (beforeX > segmentX) angle = 0; // Corpo está à direita, cauda aponta para a ESQUERDA
        }
        else { // É O CORPO
            const prevSegment = snakeBody[i + 1];
            const nextSegment = snakeBody[i - 1];
            const [prevX, prevY] = prevSegment;
            const [nextX, nextY] = nextSegment;

            const toNextX = nextX - segmentX;
            const toNextY = nextY - segmentY;
            const fromPrevX = segmentX - prevX;
            const fromPrevY = segmentY - prevY;

            if (toNextX === fromPrevX && toNextY === fromPrevY) { // É um segmento RETO
                segmentClass = 'snake-body-straight';
                // Base da imagem: HORIZONTAL
                // <<< CORREÇÃO CRÍTICA AQUI >>>
                // A rotação do corpo reto depende da sua própria orientação, não da velocidade da cabeça.
                if (fromPrevY === 0) { // Se não há movimento vertical entre os segmentos, é horizontal
                    angle = 0;
                } else { // Se não, é vertical
                    angle = 90;
                }
            } else { // É uma CURVA
                segmentClass = 'snake-body-turn';

                // --- LÓGICA DE ROTAÇÃO FINAL (baseada na sua observação) ---
                // Sua imagem base `corpo_curva.png` tem a forma '┌' (Baixo-Direita).

                // PASSO A: Descobrir de onde a cobra veio para chegar neste segmento
                let fromDirection = '';
                if (fromPrevX === 1) fromDirection = 'RIGHT';
                else if (fromPrevX === -1) fromDirection = 'LEFT';
                else if (fromPrevY === 1) fromDirection = 'DOWN';
                else if (fromPrevY === -1) fromDirection = 'UP';

                // PASSO B: Descobrir para onde a cobra vai a partir deste segmento
                let toDirection = '';
                if (toNextX === 1) toDirection = 'RIGHT';
                else if (toNextX === -1) toDirection = 'LEFT';
                else if (toNextY === 1) toDirection = 'DOWN';
                else if (toNextY === -1) toDirection = 'UP';

                // PASSO C: Aplicar a rotação correta

                // --- Giros em Sentido ANTI-HORÁRIO (Estes estavam corretos) ---
                if ((fromDirection === 'DOWN' && toDirection === 'RIGHT') || (fromDirection === 'LEFT' && toDirection === 'UP')) {
                    // Precisa da forma: ┌ (Baixo-Direita)
                    angle = 180; // Imagem original, sem rotação.
                } else if ((fromDirection === 'RIGHT' && toDirection === 'DOWN') || (fromDirection === 'UP' && toDirection === 'LEFT') ){
                    // Precisa da forma: ┌ (Baixo-Direita)
                    angle = 0; // Imagem original, sem rotação.
                }
                else if ((fromDirection === 'RIGHT' && toDirection === 'UP') || (fromDirection === 'DOWN' && toDirection === 'LEFT')) {
                    // Precisa da forma: ┘ (Cima-Direita)
                    angle = 90;
                }
                else if ((fromDirection === 'UP' && toDirection === 'RIGHT') || (fromDirection === 'LEFT' && toDirection === 'DOWN') ) {
                    // Precisa da forma: ┘ (Cima-Direita)
                    angle = -90;
                }
            }
        }

        if (i === 0 && shieldCount > 0) {
            segmentClass += ' shielded';
        }

        html += `<div class="${segmentClass}" style="grid-area: ${segmentY} / ${segmentX}; transform: rotate(${angle}deg);"></div>`;
    }

    playBoard.innerHTML = html;
    updateStatusUI();
};
// Inicia o Jogo
spawnNewFruit();

setIntervalId = setInterval(initGame, speed);
document.addEventListener("keyup", changeDirection);
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));