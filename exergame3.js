let video;
let poseNet;
let poses = [];
let fallingCircles = [];
let score = 0;

let startTime; // Variable to store the start time of the game
let gameDuration = 60000; // 1 minute in milliseconds
let elapsedTime = 0; // Elapsed time since the game started

let isGameOver = false; // Renamed variable to avoid conflict

// Define the redirection URL
const GAME_OVER_REDIRECT_URL = 'exergamesummary3.html'; // URL to redirect after game over

function setup() {
  createCanvas(640, 480);

  // Initialize video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element, show canvas only after it's drawn

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Create falling circles at random intervals
  setInterval(createFallingCircle, 2000); // Create a new falling circle every 2 seconds
}

function modelReady() {
  console.log('Model Loaded');
  startTime = millis(); // Start the game timer when the model is ready
}

function update() {
  if (isGameOver) {
    // Redirect immediately to game summary page
    window.location.href = GAME_OVER_REDIRECT_URL;
    return; // Stop further drawing when game is over
  }
}

function draw() {
  background(220);

  // Draw the video feed (flipped horizontally)
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  // Draw falling circles
  for (let i = fallingCircles.length - 1; i >= 0; i--) {
    let circle = fallingCircles[i];
    circle.update();
    circle.display();

    // Check collision with nose keypoints
    for (let j = 0; j < poses.length; j++) {
      let pose = poses[j].pose;
      let nose = pose.keypoints.find((kp) => kp.part === 'nose'); // Find nose keypoint

      if (nose && dist(nose.position.x, nose.position.y, circle.x, circle.y) < circle.radius) {
        score += circle.points;
        fallingCircles.splice(i, 1); // Remove the circle
      }
    }

    // Remove circles that have reached the bottom
    if (circle.y > height + circle.radius) {
      fallingCircles.splice(i, 1);
    }
  }

  // Display score
  translate(width, 0);
  scale(-1, 1);
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

// Function to create a new falling circle
function createFallingCircle() {
  let x = random(width);
  let y = -50; // Start above the canvas
  let colors = ['#FF0000', '#0000FF', '#FFFFFF', '#FFC0CB']; // Red, Blue, White, Pink
  let points = [5, 10, 15, 20]; // Corresponding points for each color
  let index = int(random(colors.length));
  let color = colors[index];
  let pointsValue = points[index];
  let radius = 25;
  let speed = random(5, 8); // Random speed

  let circle = new FallingCircle(x, y, radius, speed, color, pointsValue);
  fallingCircles.push(circle);
}

// Class for the falling circles
class FallingCircle {
  constructor(x, y, radius, speed, color, points) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.color = color;
    this.points = points;
  }

  update() {
    this.y += this.speed;
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }
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

