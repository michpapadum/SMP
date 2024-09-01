
function actualExercise()
{
    if (actual)
    {
        alert("You have already recorded the exercise!");
        return;
    }
    setTimeout(function()
    {
        currlabel = 0;
        state='collecting';
        document.getElementById('updatethis').innerHTML = "Recording Exercise";
        setTimeout(function()
        {
          state='waiting';  
          document.getElementById('updatethis').innerHTML = "Not Collecting";
        },20000)
    },1000)
}

function falseData()
{
    if (falsedata == 6)
    {
        alert("Maximum Capacity of Inaccurate poses that can be added has been reached!");
        return;
    }
    setTimeout(function()
    {
        currlabel = falsedata;
        falsedata++;
        state='collecting';
        document.getElementById('updatethis').innerHTML = "Recording Inaccurate Poses";
        setTimeout(function()
        {
          state='waiting';  
          document.getElementById('updatethis').innerHTML = "Not Collecting";
        },20000)
    },1000)    
}

window.Submit = function()
{ 
    brain.normalizeData();
    brain.train({
    epochs:50
    },()=>{
        console.log('model trained');
        brain.save();
        window.location.href = "uplpage2.html";
    });
}
// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let actual = false;
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
let cheese = 5;

let vec = []; 
let xx;
let falsedata = 1;

function setup() 
{
    let canvas = createCanvas(640,480);
    canvas.parent('canvascont');
    canvas.id('acanvas');
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, function()
    {
      console.log('ready:))');
    });
    poseNet.on('pose', function(results) {
      poses = results;
    });
    poseNet.on('pose', gotPoses);
    
  let options = {
    inputs: 17,
    outputs: ((cheese*elmo) - 1),
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
}

let req = [[11,5,7],[12,6,8],[5,7,9],[6,8,10],[11,13,15],[12,14,16],[5,11,13],[6,12,14]];
let reqi = [[5,7],[6,8],[7,9],[8,10],[11,13],[12,14],[13,15],[14,16]];
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
        for (let ii = 0; ii < reqi.length; ii++)
        {
          let secval = [];
          for (let i = 0; i  < 2; i++)
          {
            secval.push([keyp[reqi[ii][i]].position.x, keyp[reqi[ii][i]].position.y]);
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
        targetLabel = currlabel.toString();
        brain.addData(compy,[targetLabel]);
        console.log(currlabel);
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
    if ((i < 8) || (i==myvalues.length - 1))
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
    else
    {
      currval = myvalues[i];
      let currgrad = ((currval[0][0] - currval[1][0])/ (currval[0][1] - currval[1][1]));
      retval.push(currgrad);
    }
  }
  return retval;
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
  let timmer = (20000/cheese);
  if (state=='collecting')
  {
    setTimeout(function()
    {
      if (currlabel == ((cheese-1) * elmo))
      {
        console.log('start of new exercise');
        currlabel = (currlabel%elmo);
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
}