// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */
let currlabel = 0;
let adderyes = false;
let video;
let poseNet;
let pose;
let poses = [];
let skeleton;
let poseLabel = 'g';
let count = 0;
let lastLabel = '';
let poseLabelConfidence = 100;
let brain;
let state = 'waiting';
let targetLabel;
let elmo = 6;
let cheese = 2;

function keyPressed() {
  if (key == 's') {
      brain.saveData();
  } else {
    targetLabel = key;
    /*if (key == 'a')
    {
      targetLabel = '0';
    }
    else
    {
      targetLabel = '1';
    }*/
    setTimeout(function() {
        console.log('collecting');
        state = 'collecting';
        adderyes=false;
        setTimeout(function() {
            console.log('not collecting');
            state = 'waiting';
        }, 10000);//change to twenty
    }, 2000);
  }
  if (key=='n')
  {
    brain.loadData('frame2.json', dataReady);
  }
}

function setup() 
{
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, function()
    {
      select("#status").html("Model Loaded");
    });
    poseNet.on('pose', function(results) {
      poses = results;
    });
    poseNet.on('pose', gotPoses);
    
  let options = {
    inputs: 9,
    outputs: 2,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
      model: 'model1/model.json',
      metadata: 'model1/model_meta.json',
      weights:'model1/model.weights.bin',
    };
  
  /*brain.load(modelInfo, function()
  {
    console.log('pose classification ready!');
    classifyPose();
  });*/

  video.hide();
}



function classifyPose()
{
    //console.log('abcdefg');
    //console.log('hijklmnop',poseLabel);
    if (poses.length>0)
    {
      const pose = poses[0].pose;

      //
      let keyp = pose.keypoints;
      let inval = [];
      for(let i = 0; i < req.length; i++)
      {
        let secval = [];
        for (let ii = 0; ii < 3; ii++)
        {
          secval.push([keyp[req[i][ii]].position.x,keyp[req[i][ii]].position.y]);
        }
        inval.push(secval);
      }
  
      let secval = [];
      secval.push([keyp[0].position.x,keyp[0].position.y]);
      secval.push([keyp[2].position.x,keyp[2].position.y]);
      secval.push([keyp[5].position.x,keyp[5].position.y]);
      secval.push([keyp[6].position.x,keyp[6].position.y]);
  
      //console.log('jiuming');
      inval.push(secval);
  
      let compy = calang(inval);
    
      brain.classify(compy, gotResults);
    } else {
      setTimeout(classifyPose, 100);
    }
  }

function gotResults(error, results){
    poseLabel = results[0].label;
    poseLabelConfidence = results[0].confidence;
    classifyPose();
}


function dataReady() {
    brain.normalizeData();
    brain.train({
      epochs:50
    },finished);
} 
  
  
function finished() {
    console.log('model trained');
    brain.save();
}


function updateCount(poseLabel)
{
    fill(0,0,255);
    noStroke();
    textSize(100);
    textAlign(CENTER);
    text(count,width-60,height-420);
    fill(0,255,255);
    textSize(40);
    textAlign(CENTER);
    text("Confidence level =",width-300,height-50);
    text(Math.round(poseLabelConfidence*100)/100, width-80, height-50);
    if (lastLabel === 'L' && poseLabel==='0'){
      count++;
  
      updateDisplay();
      //console.log("count is:",count);
    }
    lastLabel=poseLabel;
  }

function updateDisplay()
{
    document.getElementById('exercise-count').innerText= count;
}

function dataReady() {
  brain.normalizeData();
  brain.train({
    epochs:50
  },finished);
}




function finished() {
  console.log('model trained');
  brain.save();
}


function gotResult(error, results) {
  if (results[0].confidence > 0.75)
  {
    poseLabel = results[0].label.toUpperCase();
  }
  classifyPose();
}

let req = [[11,5,7],[12,6,8],[5,7,9],[6,8,10],[11,13,15],[12,14,16],[5,11,13],[6,12,14]];
function gotPoses(poses)
{
    if (poses.length > 0)
    {
      let pose = poses[0].pose;
      skeleton = poses[0].skeleton;
      if (state == 'collecting') {
        let keyp = pose.keypoints;
        let inval = [];
        for(let i = 0; i < req.length; i++)
        {
          let secval = [];
          for (let ii = 0; ii < 3; ii++)
          {
            secval.push([keyp[req[i][ii]].position.x,keyp[req[i][ii]].position.y]);
          }
          inval.push(secval);
        }
  
        let secval = [];
        //nose, eye, leftshoulder,rightshoulder
        secval.push([keyp[0].position.x,keyp[0].position.y]);
        secval.push([keyp[2].position.x,keyp[2].position.y]);
        secval.push([keyp[5].position.x,keyp[5].position.y]);
        secval.push([keyp[6].position.x,keyp[6].position.y]);
  
        inval.push(secval);
        let compy = calang(inval);
        /*if (targetLabel == 'a')
        {
          targetLabel = 0;
        }
        else
        {
          targetLabel = 1;
        }*/
        targetLabel = currlabel.toString();
        brain.addData(compy,[targetLabel]);
        console.log(targetLabel);
      }
    }
}

function calang(myvalues)
{
  let currval = myvalues[myvalues.length - 1];
  //nose, eye, leftshould,rightshould
  let t1 = currval[3][0] - currval[2][0];
  t1/=2;
  let t2 = currval[1][0] - currval[0][0];
  t1 -= t2;

  let pushin = [currval[1],[currval[3][0] - t1,currval[3][1]],currval[3]];
  myvalues.pop();
  myvalues.push(pushin);
  

  //console.log('atp ok');
  let retval = [];
  for (let i = 0;i < (myvalues.length); i++)
  {
    let currang = 0;
    currval = myvalues[i];

    //up,down,side
    let y = currval[0][1]- currval[1][1];
    let x = currval[0][0] - currval[1][0]; 
    
    currang = atan2(y,x);
    
    y = currval[2][1] - currval[1][1];
    x = currval[2][0] - currval[1][0];

    currang -= (atan2(y,x));
    retval.push(currang);
  }
  return retval;
}






function modelLoaded()
{
    console.log('poseNet ready');
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
  drawKeypoints();

  if (adderyes == false && state == 'collecting')
  {
    adderyes=true;
    adder();
  }
  //drawSkeleton();
}

function adder()
{
  let timmer = (10000/cheese);
  if (state=='collecting')
  {
    setTimeout(function()
    {
      if (currlabel == ((cheese-1) * elmo))
      {
        console.log('start of new exercise');
        currlabel = 0;
      }
      else
      {
        currlabel += elmo;
      }
    },timmer);
  }
  setTimeout(function()
  {
    adderyes=false;
  },timmer);
}




// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }

  fill(255,0,255);
  noStroke();
  textSize(256);
  textAlign(CENTER);
  text(poseLabel,width/2, height/2);
  updateCount(poseLabel);
}


// A function to draw the skeletons
//pose.skeleton -> positions of all the parts (?)
function drawSkeleton() {
  if (pose)
  {
    for (let i = 0; i < poses.length; i++)
    {
      const skeleton = poses[i].skeleton;
      // For every skeleton, loop through all body connections
      for (let j = 0; j < skeleton.length; j ++) {
        const partA = skeleton[j][0];
        const partB = skeleton[j][1];
        stroke(255, 0, 0);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }


      for (let i = 0; i < poses.keypoints.length; i++)
      {
        let x = poses.keypoints[i].position.x;
        let y = poses.keypoints[i].position.y;
        fill(0);
        stroke(255);
        ellipse(x,y,16,16);
      }
    }






    if (pose) {
      for (let i = 0; i < skeleton.length; i ++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
          strokeWeight(2);
          stroke(0);
         
          line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          fill(0);
          stroke(255);
          ellipse(x, y, 16, 16);
      }
    }
  }
}


//extra
