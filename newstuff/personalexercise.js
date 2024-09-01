let exerno;
// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
===  */

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
let falsedata = 0;
const ACCESS_TOKEN = 'sl.B8FaXSCdG3OhRdx3_p6BH9E_3Zw6ofj9QU-bH_ZcHs6zI7LrODwTsFhSN2ABdiaRQAUYL7kp9IQ66vkxk3y2op7RRPbfKu_9cCAjiexDx6HPRrF2YIzp5HdEfool7nVEGCgB5fBcBM8RMX4';
let metalink,weightslink,modellink;
let dbx;
dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN});

async function secondset()
{
    let thelink = '/meta' + exerno +'.JSON';
    await dbx.filesGetTemporaryLink({path: thelink})
    .then(function(response)
    {
        metalink = response.result.link;
        //console.log('direct: ',response.result.link);
    })
    .catch(function(error)
    {
        console.log(error);
    });

    thelink = '/model' + exerno +'.JSON';
    await dbx.filesGetTemporaryLink({path: thelink})
    .then(function(response)
    {
        modellink = response.result.link;
        console.log('direct: ',response.result.link);
    })
    .catch(function(error)
    {
        console.log(error);
    });

    thelink = '/model' + exerno +'.weights.bin';
    await dbx.filesGetTemporaryLink({path: thelink})
    .then(function(response)
    {
        weightslink = response.result.link;
        console.log('direct: ',response.result.link);
    })
    .catch(function(error)
    {
        console.log(error);
    });

    console.log('the links:',metalink,modellink,weightslink);

    let options = 
    {
        inputs: 17,
        outputs: ((cheese*elmo) - 1),
        task: 'classification',
        debug: true
    }

    brain = ml5.neuralNetwork(options);
    const modelInfo = {
        model: modellink,
        metadata: metalink,
        weights:weightslink,
    };
    
    brain.load(modelInfo, function()
    {
        console.log('pose classification ready!');
        classifyPose();
    });
}

function setup() 
{
    exerno = localStorage.getItem("CurrentExercise");

    console.log('checkpoint');

    secondset();
    //console.log('this is the file to be retrieved: ', thelink);

    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, function()
    {
      console.log('model loaded! :)');
    });
    poseNet.on('pose', function(results) {
      poses = results;
    });
}


function classifyPose()
{
  if (poses.length>0)
  {
    let pose = poses[0].pose;
    skeleton = poses[0].skeleton;
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

    brain.classify(compy, gotResults);
  } else {
    setTimeout(classifyPose, 100);
  }
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
    if (vec.length >= (cheese - 1) && (vec[0] == 0 && vec[vec.length - 1] == ((cheese-1) * elmo))){
      count++;
      vec = [];
  
      updateDisplay();
    }
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




function binsearch(vector, nummy)
{
    let hi = vector.length, lo = 0, mid;
    
    let ans = vector.length;
    while (lo <= hi)
    {
        mid = Math.floor((lo + hi)/2);
        if (vector[mid] >= nummy)
        {
            ans = mid;
            hi = mid - 1;
        }
        else
        {
            lo  = mid + 1;
        }
    }
    return ans;
}


function smth(blackcurrantjam)
{   
    //console.log(blackcurrantjam);
    if (blackcurrantjam == undefined || (blackcurrantjam % 6 != 0))return;
    xx = blackcurrantjam;
    
    let iter = binsearch(vec,xx);
    if (iter == vec.length)
    {
        vec.push(xx);
    }
    else
    {
        vec[iter] = xx;
    }
    console.log(vec);
}


function gotResults(error, results) {
  poseLabelConfidence = results[0].confidence;
  if (results[0].confidence > 0.75)
  {
    //console.log(currat,(results[0].label - 6));
    poseLabel = results[0].label.toUpperCase();

    smth(results[0].label);
  }
  classifyPose();
}

let req = [[11,5,7],[12,6,8],[5,7,9],[6,8,10],[11,13,15],[12,14,16],[5,11,13],[6,12,14]];
let reqi = [[5,7],[6,8],[7,9],[8,10],[11,13],[12,14],[13,15],[14,16]];
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
  let timmer = (20000/cheese);
  if (state=='collecting')
  {
    setTimeout(function()
    {
      if (currlabel == ((cheese-1) * elmo))
      {
        console.log('start of new exercise');
        currlabel = falsedata;
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
let currat = 0;


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
