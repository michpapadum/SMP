let video;
let poseNet;
let poses = [];
let circleX, circleY;
let circleR = 40; // Radius of the animated circle
let circleSpeed = 5; // Speed of the circle's movement
let circleVerticalDirection = 0; // Vertical direction of circle movement: -1 for up, 1 for down
let circleHorizontalDirection = 0; // Horizontal direction of circle movement: -1 for left, 1 for right
let cakeX, cakeY; // Cake position
let cakeWidth = 80; // Width of the cake
let cakeHeight = 60; // Height of the cake
let cakeMoving = false; // Flag to check if cake is currently moving
let score = 0;

let startTime; // Variable to store the start time of the game
let gameDuration = 60000; // 1 minute in milliseconds
let elapsedTime = 0;

let isGameOver = false; // Renamed variable to avoid conflict

// Define the redirection URL
const GAME_OVER_REDIRECT_URL = 'exergamesummary2.html'; // URL to redirect after game over

function setup() {
  createCanvas(640, 480);
  
  // Initialize video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // Hide the video element, and just show the canvas
  video.hide();

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Position the animated circle at the bottom center initially
  circleX = width / 2;
  circleY = height - circleR;

  // Initialize cake position
  cakeX = 100;
  cakeY = 400;

  // Initialize the start time
  startTime = millis();
}

function modelReady() {
  console.log('Model Loaded');
}

function update() {
  if (isGameOver) {
    // Redirect immediately to game summary page
    window.location.href = GAME_OVER_REDIRECT_URL;
    return; // Stop further drawing when game is over
  }
}

function draw() {
  background(200); // Clear the canvas

  // Draw the video feed (flipped horizontally)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Draw cake
  drawCake(cakeX, cakeY, cakeWidth, cakeHeight);

  // Draw keypoints for left and right wrists
  drawKeypoints();
  
  // Draw animated circle
  drawAnimateCircle();
  
  // Move the circle based on interaction with keypoints
  moveCircle();

  // Check if the circle touches the cake
  checkCakeCollision();

  // Display score
  textSize(24);
  fill(255, 0, 255);
  noStroke();
  text("Score: " + score, width - 120, 30);

  // Update elapsed time
  elapsedTime = millis() - startTime;

  // Calculate remaining time
  let remainingTime = gameDuration - elapsedTime;
  let seconds = Math.ceil(remainingTime / 1000);

  // Display countdown timer
  textAlign(CENTER);
  textSize(32);
  fill(255, 0, 0);
  text("Time: " + (seconds > 0 ? seconds : 0) + "s", width / 2, 50);

  // Check if game duration (1 minute) has passed
  if (elapsedTime >= gameDuration) {
    // Game over logic
    gameOver();
  }
}

// Function to draw a cake at (x, y) with given width and height
function drawCake(x, y, w, h) {
  fill(255, 223, 186); // Light brown for cake body
  noStroke();
  rect(x - w / 2, y - h / 2, w, h); // Cake body

  fill(255, 105, 180); // Pink for frosting
  rect(x - w / 2, y - h / 2 - h / 4, w, h / 4); // Cake frosting

  fill(255, 255, 0); // Yellow for candle flame
  ellipse(x, y - h / 2 - h / 4 - 10, 10, 20); // Candle flame

  fill(0); // Black for candle
  rect(x - 2, y - h / 2 - h / 4 - 20, 4, 20); // Candle
}

// Function to check collision between circle and cake
function checkCakeCollision() {
  let d = dist(circleX, circleY, cakeX, cakeY);

  // If the circle's distance to the cake center is less than or equal to the circle's radius plus half the cake's width or height
  if (d <= circleR + cakeWidth / 2 || d <= circleR + cakeHeight / 2) {
    // Circle touches the cake, initiate movement of the cake to a random position
    if (!cakeMoving) {
      cakeMoving = true;
      moveCakeToRandomPosition();
      Fscore();
    }
  }
}

// Function to draw keypoints detected by PoseNet for left and right wrists
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    // Filter keypoints for left and right wrists
    let leftWrist = pose.keypoints.find((kp) => kp.part === 'leftWrist');
    let rightWrist = pose.keypoints.find((kp) => kp.part === 'rightWrist');
    
    // Draw a circle at left wrist position
    if (leftWrist) {
      fill(255, 0, 0); // Red color for left wrist
      noStroke();
      let leftWristX = width - leftWrist.position.x; // Adjust for flipped video
      ellipse(leftWristX, leftWrist.position.y, 10, 10);
      // Check collision with circle for vertical and horizontal movement
      checkCircleCollision(leftWristX, leftWrist.position.y);
    }

    // Draw a circle at right wrist position
    if (rightWrist) {
      fill(0, 0, 255); // Blue color for right wrist
      noStroke();
      let rightWristX = width - rightWrist.position.x; // Adjust for flipped video
      ellipse(rightWristX, rightWrist.position.y, 10, 10);
      // Check collision with circle for vertical and horizontal movement
      checkCircleCollision(rightWristX, rightWrist.position.y);
    }
  }
}

// Function to draw the animated circle
function drawAnimateCircle() {
  // Draw circle at (circleX, circleY) with diameter 2*circleR
  fill(255, 255, 0); // Yellow color
  noStroke();
  circle(circleX, circleY, 2 * circleR);
}

// Function to check collision between keypoints and animated circle
function checkCircleCollision(kpX, kpY) {
  // Distance between keypoint and circle center
  let d = dist(kpX, kpY, circleX, circleY);

  // Vertical movement:
  // If keypoint touches the circle at the bottom
  if (d <= circleR && kpY > circleY) {
    circleVerticalDirection = -1; // Move circle up
  }
  // If keypoint touches the circle at the top
  else if (d <= circleR && kpY < circleY) {
    circleVerticalDirection = 1; // Move circle down
  }

  // Horizontal movement:
  // If keypoint touches the circle on the left
  if (d <= circleR && kpX < circleX) {
    circleHorizontalDirection = -1; // Move circle left
  }
  // If keypoint touches the circle on the right
  else if (d <= circleR && kpX > circleX) {
    circleHorizontalDirection = 1; // Move circle right
  }
}

// Function to continuously move the circle up and down based on interactions
function moveCircle() {
  // Move circle vertically based on direction and speed
  circleY += circleVerticalDirection * circleSpeed;

  // Move circle horizontally based on direction and speed
  circleX += circleHorizontalDirection * circleSpeed;

  // Constrain circleY to stay within canvas bounds vertically
  circleY = constrain(circleY, circleR, height - circleR);

  // Constrain circleX to stay within canvas bounds horizontally
  circleX = constrain(circleX, circleR, width - circleR);
}

// Function to move the cake to a random position after collision
function moveCakeToRandomPosition() {
  // Generate random coordinates within canvas bounds
  cakeX = random(cakeWidth / 2, width - cakeWidth / 2);
  cakeY = random(cakeHeight / 2, height - cakeHeight / 2);

  // Reset flag after moving the cake
  cakeMoving = false;
}

function Fscore() {
  score += 10;
}

// Function to calculate distance from a point (px, py) to a line segment (x1, y1) - (x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let len2 = dx * dx + dy * dy;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = constrain(t, 0, 1);
  let nearestX = x1 + t * dx;
  let nearestY = y1 + t * dy;
  let distSq = (px - nearestX) * (px - nearestX) + (py - nearestY) * (py - nearestY);
  return sqrt(distSq);
}

// Function to handle game over
function gameOver() {
  // Stop any game logic here (optional)
  noLoop(); // Stop the draw loop

  // Display final score
  textSize(32);
  fill(255, 0, 0);
  textAlign(CENTER);
  text("Game Over!", width / 2, height / 2 - 50);
  text("Final Score: " + score, width / 2, height / 2);

  // Store final score in local storage
  localStorage.setItem('finalScore', score);

  // Redirect to game summary page
  setTimeout(() => {
    window.location.href = GAME_OVER_REDIRECT_URL;
  }, 2000); // Wait for 2 seconds before redirecting to allow users to see the score
}
