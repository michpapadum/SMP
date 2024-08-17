let troo = false;
let video;
let poseNet;
let pose;
let poses = [];
let skeleton;
let beiande;
let currlabel = 0;
let endofexercise = 0;
let elmo = 6;


let brain;
let state = 'waiting';
let targetLabel;
let testvid;

let currat = 0;

/*document.getElementById("subform").addEventListener('submit',smthup);
function smthup()
{
  console.log('form submitted');
}*/


function keyPressed() {
  beiande = key; 
  if (key == 'r')
  {
    setTimeout(function() {
        console.log('collecting');
        state = 'collecting';
        setTimeout(function() {
            console.log('not collecting');
            state = 'waiting';
        }, 20000); //wait then run 
    }, 2000);
    setTimeout(function()
    {
      brain.saveData("traindata");
    },23000);
  }
  if (key =='n')
  {
    let trainingstuff= {
      batchSize:1,
      epochs: 50,
    }
    brain.loadData('traindata.json',function()
    {
      brain.normalizeData();
      brain.train(trainingstuff,whiletraining,function(){console.log('ok')});
    });
    brain.save();
    console.log('done');
  }
}

function whiletraining(epochs,loss)
{
  console.log('baca ini: ',epochs,loss);
}

let req = [[11,5,7],[12,6,8],[5,7,9],[6,8,10],[11,13,15],[12,14,16],[5,11,13],[6,12,14]];
function gotPoses(poses)
{
  if (poses.length > 0)
  {
    console.log(' detected!:)');
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state=='collecting')
    {
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
      console.log(compy);
      brain.addData(compy,[currlabel]);
    }
}
}

let cheese = 9;
function adder()
{
  if (state=='collecting')
  {
    setTimeout(function()
    {
      if (currlabel == (cheese * elmo))
      {
        console.log('start of new exercise');
        currlabel = 0;
      }
      else
      {
        //console.log('before ',currlabel);
        currlabel += elmo;
        //console.log('after ',currlabel);
      }
    },1000);
  }
  //console.log('false');
  setTimeout(function()
  {
    adderyes=false;
  },1000);
}
 
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, function(){console.log('posenet ready')});
  poseNet.on('pose', gotPoses);
  //console.log('yay3');
 
  const options = {
    epochs:50,
    inputs: 9,
    outputs: 25,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);

  const modelInfo = {
    model: 'model1/model.json',
    metadata: 'model1/model_meta.json',
    weights: 'model1/model.weights.bin',
  };

  //console.log('yay4s');
  brain.load(modelInfo, function()
  {
    console.log('model ready!:)');
  });
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
  //console.log('checkpojnt 1');
  return retval;
}
  
let count = 0;
function classifyPose()
{
  if (poses.length > 0)
  {
    let pose = poses[0].pose;
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

    //console.log('pls work:\')');
    //nose, eye, leftshoulder,rightshoulder
    let secval = [];
    secval.push([keyp[0].position.x,keyp[0].position.y]);
    secval.push([keyp[2].position.x,keyp[2].position.y]);
    secval.push([keyp[5].position.x,keyp[5].position.y]);
    secval.push([keyp[6].position.x,keyp[6].position.y]);

    //console.log('jiuming');
    inval.push(secval);

    let compy = calang(inval);
    //console.log(compy.length);
    //console.log('compy',compy);
    brain.classify(compy,gotResults)
  }
}

function gotResults(error,results)
{
  console.log(error);
  console.log('results',results);
  console.log(results[0].label);
  let t1 = results[0].label;
  let t2 = results[0].confidence;
  if (t1 == currat && t2 > 0.75)
  {
    currat += elmo;
    updateCount();
  }
}

let adderyes = false;

function draw() {
  translate(video.width,0);
  scale(-1,1);
  image(video, 0, 0, video.width, video.height);
  drawKeypoints();
  drawSkeleton();
  if (adderyes == false)
  {
    adderyes=true;
    adder();
  }
}

function drawKeypoints() {
    for (let i = 0; i < poses.length; i += 1) 
    {
      const pose = poses[i].pose;
      for (let j = 0; j < pose.keypoints.length; j += 1) 
      {
        const keypoint = pose.keypoints[j];
        if (keypoint.score > 0.2) {
          fill(255, 0, 0);
          noStroke();
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        }
      }
    }
}

function drawSkeleton() 
{
  for (let i = 0; i < poses.length; i+=1)
  {
    const pose = poses[i].pose.keypoints;
    let tt = [];
    for (let j = 0; j < req.length; j+=1) 
    {
      for (let i = 0; i < 3; i++)
      {
        tt.push(pose[req[j][i]]);
      }
    }
    stroke(255, 0, 0);
    line(tt[0].position.x, tt[0].position.y, tt[1].position.x, tt[1].position.y);
    line(tt[1].position.x,tt[1].position.y,tt[2].position.x,tt[2].position.y);
  }
}


function updateCount(poseLabel){
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
  if (currat == (6*25)){
    count++;
    count = 0;

    updateDisplay();
    console.log("count is:",count);
  }
}

function updateDisplay(){
  document.getElementById('exercise-count').innerText= count;
 // document.getElementById('confidence-level').innerText= Math.round(poseLabelConfidence*100)/100;
}