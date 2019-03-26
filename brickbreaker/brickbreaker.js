//Get canvas and context objects
var canvas = document.getElementById("brickBreakerCanvas");
var ctx = canvas.getContext("2d");

//Display start message
ctx.font = "Bold 20px Arial";
ctx.fillStyle = "#0095DD";
ctx.fillText("Click or Press Spacebar to Start", (canvas.width / 2) - 155, (canvas.height / 2));

//Set ball and paddle settings
var ballRadius = 7;
var paddleHeight = 10;
var paddleWidth = 100;
var paddleX = (canvas.width-paddleWidth)/2;

//Set default positioning, speed, lives, and countdown length for game
var startX = canvas.width/2;
var startY = canvas.height-(ballRadius+15);
var startDX = 3.5;
var startMaxDX = 7;
var startDY = -3.5;
var startLives = 3;
var victoryDY = 20;
var countDownSeconds = 3;

//Set paddle speed
var paddleSpeed = 6;

//Set brick settings
var brickRowCount = 6;
var brickColumnCount = 9;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickSidePadding = 80;
var brickHeight = 15;
var brickWidth = (canvas.width - (brickSidePadding) - ((brickColumnCount - 1) * brickPadding)) / brickColumnCount;

//Initialize booleans
var gameStarted = false;
var rightPressed = false;
var leftPressed = false;
var dead = true;
var respawning = false;
var catching = false;
var victory = false;

//Initialize ball positioning and speed using default values
var x = startX;
var y = startY;
var dx = startDX;
var maxDX = startMaxDX;
var dy = startDY;

//Initialize score, lives, and countdown length
var score = 0;
var lives = startLives;
var secondsLeft = countDownSeconds;

//Define brick array variable and variable for storing countdown interval object
var countInterval;
var bricks = [];

initializeBricks();

//Set up brick array
function initializeBricks(){
    for(var c = 0; c < brickColumnCount; c++){
        bricks[c] = [];
        for(var r = 0; r < brickRowCount; r++){
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#00AAEE";
    ctx.fill();
    ctx.closePath();
}

function drawBricks(){
    for(var c = 0; c < brickColumnCount; c++){
        for(var r = 0; r < brickRowCount; r++){
            if(bricks[c][r].status == 1){
                var brickX = (c*(brickWidth + brickPadding)) + (brickSidePadding / 2);
                var brickY = (r*(brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                
                // Define brick color by row
                switch(r % 6){
                    case 0:
                        ctx.fillStyle = "#FF9E89";
                        break;
                    case 1:
                        ctx.fillStyle = "#7AEEE9";
                        break;
                    case 2:
                        ctx.fillStyle = "#A5EE7A";
                        break;
                    case 3:
                        ctx.fillStyle = "#EAEE7A";
                        break;
                    case 4:
                        ctx.fillStyle = "#FFC859";
                        break;
                    case 5:
                        ctx.fillStyle = "#EA7AEE";
                        break;
                    default:
                        ctx.fillStyle = "#00AAEE";
                }

                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

//Handle collision between ball and bricks
function collisionDetection(){
    for(var c = 0; c < brickColumnCount; c++){
        for(var r = 0; r < brickRowCount; r++){
            var b = bricks[c][r];
            if(b.status == 1){
                if(y + ballRadius > b.y && y - ballRadius < b.y + brickHeight && x + ballRadius > b.x && x - ballRadius < b.x + brickWidth){
                    if((y < b.y && dy >= 0) || (y > b.y + brickHeight && dy < 0)){
                        dy = -dy
                    }
                    if ((x < b.x && dx >= 0) || (x > b.x + brickWidth && dx < 0)){
                        dx = -dx
                    }
                    b.status = 0;
                    score++;
                }
            }
        }
    }
}

function drawScore(){
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives(){
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

//Display game over text
function gameOver(){
    ctx.font = "Bold 20px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Game Over", (canvas.width / 2) - 55, canvas.height - 100);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("press spacebar to try again", (canvas.width / 2) - 100, canvas.height - 80);
}

//Display victory text
function drawVictory(){
    ctx.font = "Bold 20px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Congrats, you win!", (canvas.width / 2) - 105, canvas.height / 2);
}

function countDown(){
    ctx.font = "Bold 20px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(secondsLeft, (canvas.width / 2) - 10, canvas.height - 30);
}

//Decrement function called for countdown
function decrement(){
    secondsLeft--;
}

//Full respawn sequence
function respawnSequence(){
    respawning = true;
    setTimeout(respawn, countDownSeconds * 1000);
    secondsLeft = countDownSeconds;
    countInterval = setInterval(decrement, 1000);
}

//Set values back to defaults and spawn ball
function respawn(){
    respawning = false;
    x = startX;
    y = startY;
    dx = startDX;
    maxDX = startMaxDX;
    dy = startDY;
    dead = false;
    clearInterval(countInterval);
}

//Reset bricks, score, lives and start respawn sequence
function restart(){
    initializeBricks();
    score = 0;
    lives = startLives;
    respawnSequence();
}

//Main game loop
function draw(){
    //Clear screen each tick
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if(respawning) countDown();
    if(victory) drawVictory();

    drawBricks();
    drawPaddle();
    drawScore();
    drawLives();

    //Move ball
    x += dx;
    y += dy;

    //Draw ball and handle collisions
    if (!dead){
        drawBall();
        collisionDetection();
        if(x + dx > canvas.width - ballRadius || x + dx < ballRadius){
            dx = -dx;
        }
        if(y + dy < ballRadius){
            dy = -dy;
        }
        //Handle ball collision with paddle
        if(y + dy > canvas.height - ballRadius - paddleHeight && x >= paddleX - (ballRadius / 2) && x <= paddleX + paddleWidth + (ballRadius / 2)){
            if(!catching){
                dy = -dy;

                //Update horizontal velocity based on where ball hits paddle
                var center = paddleX + (paddleWidth / 2.0);
                var mult = (x - center) / ((paddleWidth + ballRadius) / 2.0);
                catching = true;
                if(Math.abs(mult) > 0.3 && !victory){
                    dx = mult * maxDX;
                }
            }
        }
        //Handle ball collision with floor
        else if(y + dy > canvas.height - ballRadius + 2){
            if(!catching && !victory){
                lives--;
                dead = true;
                if(lives > 0){
                    respawnSequence();
                }
            } else if(victory){
                dy = -dy;
                if (Math.abs(dy) < victoryDY){
                    dy += Math.sign(dy) * 0.5;
                    dx += Math.sign(dx) * 0.5;
                }
            }
        } else{
            catching = false;
        }
    } else{
        //Display game over screen if player runs out of lives
        if(lives <= 0){
            gameOver();
        }
    }

    //Paddle controls
    if(rightPressed && paddleX < canvas.width - paddleWidth){
        paddleX += paddleSpeed;
    } else if(leftPressed && paddleX > 0){
        paddleX -= paddleSpeed;
    }

    //Display victory if player destroys all bricks
    if(score >= brickRowCount * brickColumnCount){
        victory = true;
    }
}

//Add listeners for keydown and keyup events
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
    //Set booleans when arrow key is pressed
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = true;
    } else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }

    //Start/restart game if space is pressed and conditions are met
    if ((e.key == " " || e.key == "Spacebar")){
        if (dead && lives <= 0){
            restart();
        } else if(!gameStarted){
            startGame();
        }
    }
}

function keyUpHandler(e){
    //Set booleans when arrow key is released
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = false;
    } else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

//Initial start game function
function startGame(){
    if(!gameStarted){
        var interval = setInterval(draw, 10);
        respawnSequence();
        gameStarted = true;
    }
}