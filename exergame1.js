let board;
let boardWidth = 640;
let boardHeight = 640;
let context;
let video;
let poseNet;
let firstPersonPose;
let firstPersonDetected = false;

// Define the redirection URL
const GAME_OVER_REDIRECT_URL = 'exergamesummary1.html'; // URL to redirect after game over

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Access the webcam
    video = document.createElement("video");
    video.width = boardWidth;
    video.height = boardHeight;
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();

            // Initialize PoseNet
            poseNet = ml5.poseNet(video, modelReady);
            poseNet.on('pose', function (results) {
                console.log('PoseNet results:', results); // Log all poses detected
                if (results.length > 0) {
                    firstPersonPose = results[0];
                    firstPersonDetected = true;
                }
            });

            requestAnimationFrame(update); // Call the update function
            setInterval(placePipes, 3000); // every 3 seconds
        })
        .catch((err) => {
            console.error("Error accessing webcam: ", err);
        });

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottom.png";
}

function modelReady() {
    console.log('PoseNet model loaded');
}

let birdWidth = 44;
let birdHeight = 34;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -3;
let gravity = 0.5;
let velocityY = 0;
let gameOver = false;
let score = 0;

function update() {
    if (gameOver) {
      // Redirect immediately to game summary page
      window.location.href = GAME_OVER_REDIRECT_URL;
      return; // Stop further drawing when game is over
    }

    // Clear the canvas
    context.clearRect(0, 0, board.width, board.height);

    // Save the current context
    context.save();

    // Flip the context horizontally
    context.translate(board.width, 0);
    context.scale(-1, 1);

    // Draw the webcam feed as the background
    context.drawImage(video, 0, 0, boardWidth, boardHeight);

    // Restore the context to its original state
    context.restore();

    // Update bird position based on user's nose position
    if (firstPersonDetected) {
        let nose = firstPersonPose.pose.keypoints.find(point => point.part === 'nose');
        if (nose && nose.score > 0.2) {
            console.log('Nose position:', nose.position.y);
            let mappedY = map(nose.position.y, 0, video.height, 0, boardHeight);
            console.log('Mapped y:', mappedY);
            birdY = mappedY;
        } else {
            console.log('Nose not found or low confidence');
        }
    } else {
        console.log('No pose detected');
    }

    // Apply gravity to bird
    birdY += gravity;
    bird.y = birdY;

    // Ensure bird stays within the canvas
    bird.y = Math.min(bird.y, boardHeight - bird.height);
    if (bird.y > boardHeight - bird.height) {
        gameOverFunction();
    }

    // Draw the bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw the pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // Move pipe left
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOverFunction();
        }
    }

    // Clear pipes that are off the screen
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    requestAnimationFrame(update); // Call update recursively
}

function gameOverFunction() {
    gameOver = true; // Set the game over state to true
    localStorage.setItem('finalScore', score);

}

function placePipes() {
    if (gameOver) {
        return;
    }

    // Calculate random position for top pipe
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    // Create top pipe
    let topPipe = {
        img: topPipeImg,
        x: boardWidth, // Start from the right edge
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(topPipe);

    // Create bottom pipe
    let bottomPipe = {
        img: bottomPipeImg,
        x: boardWidth, // Start from the right edge
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function map(value, start1, stop1, start2, stop2) {
    console.log(`Mapping value: ${value} from range [${start1}, ${stop1}] to range [${start2}, ${stop2}]`);
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
