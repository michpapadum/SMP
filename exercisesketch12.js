// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let brain;
let poseLabel = 'g';
let count = 0;
let lastLabel = '';
let poseLabelConfidence = 100;

//let state = 'waiting';
//let targetLabel;

function keyPressed(){
 // if (key == 's'){
  //  brain.saveData();
 // } else {
  //targetLabel = key;
 // console.log(targetLabel);
 // setTimeout(function(){
   // console.log('collecting');
   // state='collecting';
   // setTimeout(function(){
     // console.log('not collecting');
     // state = 'waiting';
   // },5000);
  //},5000);
//}
}

function setup() {
  speakText("stretch your left leg out and bend down.");
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
  });

  let options = {
    inputs: 34,
    outputs: 2, 
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model (6).json',
    metadata: 'model/model_meta (6).json',
    weights: 'model/model.weights (6).bin',
  };
  brain.load(modelInfo, brainLoaded);
  
  //brain.load('',modelReady);
  //brain.loadData('tmc.json',dataReady);
  // Hide the video element, and just show the canvas
  video.hide();
}

function brainLoaded(){
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose(){
  if (poses.length>0){
    const pose = poses[0].pose;
    let inputs = [];
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      let x = pose.keypoints[j].position.x;
      let y = pose.keypoints[j].position.y;
      inputs.push(x);
      inputs.push(y);
    }
  
    brain.classify(inputs, gotResults);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResults(error, results){
  poseLabel = results[0].label;
  poseLabelConfidence = results[0].confidence;
  //console.log(results[0].confidence);
  classifyPose();
}

function dataReady(){
  //console.log('data ready');
  brain.normalizeData();
  brain.train({epochs: 50},finished);
}

function finished(){
  //console.log('model trained');
  //brain.save();
}

function modelReady() {
  select("#status").html("Model Loaded");
}

function draw() {
  translate(video.width,0);
  scale(-1,1);
  image(video, 0, 0, video.width, video.height);

  translate(width, 0);
  scale(-1, 1)
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  //drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  /*let inputs = [];
  
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      let x = pose.keypoints[j].position.x;
      let y = pose.keypoints[j].position.y;
      inputs.push(x);
      inputs.push(y);
     
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }

    }
    //let target = [targetLabel];
    //brain.addData(inputs, target);
    
  }
    */
  fill(255,0,255);
  noStroke();
  textSize(256);
  textAlign(CENTER, CENTER);
  text(poseLabel,width/2, height/2);
  updateCount(poseLabel);
  //text(count,200,100);
}

// call the start counting
function updateCount(poseLabel){
  //console.log(poseLabel);
  //console.log(count);
  //console.log('lastLabel');s
  fill(0,0,255);
  noStroke();
  textSize(100);
  textAlign(TOP);
  text(count,width-60,height-420);
  fill(0,255,255);
  textSize(40);
  textAlign(BOTTOM);
  text("Confidence level =",width-300,height-50);
  text(Math.round(poseLabelConfidence*100)/100, width-80, height-50);
  if (lastLabel === 'g' && poseLabel==='0'){
    count++;

    updateDisplay();
    console.log("count is:",count);

    if (count >= 5) {

      window.location.href="exercisesummary11.html"
    }
  }
  lastLabel=poseLabel;
}

function updateDisplay(){
  document.getElementById('exercise-count').innerText= count;
 // document.getElementById('confidence-level').innerText= Math.round(poseLabelConfidence*100)/100;
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}