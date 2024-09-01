import { initializeApp, getApp} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {ref} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
//import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js"; 
import { getFirestore,  doc, updateDoc, arrayUnion, setDoc, getDoc, increment  } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js"; 
const firebaseConfig = {
  apiKey: "AIzaSyAbRnaxAm0jlT7XZLhD6-H6yu8K_DBMBXs",
  authDomain: "smp-24rgss08-32e9d.firebaseapp.com",
  databaseURL: "https://smp-24rgss08-32e9d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smp-24rgss08-32e9d",
  storageBucket: "smp-24rgss08-32e9d.appspot.com",
  messagingSenderId: "95759036563",
  appId: "1:95759036563:web:8303c21f7311e00c5a9d66",
  measurementId: "G-GYEMHP4RYZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
let meta_read;
let weights_read;
let model_read;
let reader1,reader2,reader3;
let meta,weights,model;
let dbx;
let currfileno;

//autoruns when load :))
window.onload = async function()
{
    //firestore stuff:

    //doc -> creates a reference to file general data in collection others: setDoc takes the reference n puts uploaded num:0 in it
    //setDoc(doc(db,"Others","GeneralData"),{"UploadedNum":0});
    const referer = doc(db,"Others","GeneralData");
    let thedocument = await getDoc(referer);

    //console.log(thedocument.data());
    /*if (!userDoc.exists()) 
    {
        await setDoc(userDocRef, { progress: [] });
    }
    if (!(userDoc.data().hasOwnProperty('UploadedNum')))
    {
    await setDoc(userDocRef, {"UploadedNum" : 0}, { merge: true });
    }*/
    
    //userDoc = await getDoc(userDocRef);
    await updateDoc(referer, {"UploadedNum" : increment(1)});
    currfileno = thedocument.data().UploadedNum;
    console.log("currfileno: ",currfileno);
}


let nama,user,userarr;
window.UploadedFiles = async function()
{
    nama = document.getElementById('exname').value;
    user = document.getElementById('username').value;
    userarr = user.split(" ");
    //console.log(userarr);
    //console.log(nama);
    //ignore:
    //extracts property "Dropbox" from whatevs is stored in "Dropbox" in require('dropbox')
    //require : executes code in node.js dropbox main file then returns basically all the objects exported from there -> itc the class 'Dropbox' is taken from the object containing all the objects returned (help this is complicated :''))
    //^^same thing for these
    //node fetch is basically web fetch but u specifically need to download it 

    //a token u need to access stuff (encrypt this or smth if u hv time, its prolly not vv safe to have it explicitly stated)
    const ACCESS_TOKEN = 'sl.B8FaXSCdG3OhRdx3_p6BH9E_3Zw6ofj9QU-bH_ZcHs6zI7LrODwTsFhSN2ABdiaRQAUYL7kp9IQ66vkxk3y2op7RRPbfKu_9cCAjiexDx6HPRrF2YIzp5HdEfool7nVEGCgB5fBcBM8RMX4';

    dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN});
    //creating a new dropbox class! -> Dropbox is a namespace, inside which is the class Dropbox :')


    meta = document.getElementById('form1').files[0];
    weights = document.getElementById('form2').files[0];
    model = document.getElementById('form3').files[0];
    

    reader1 = new FileReader(); 
    reader2 = new FileReader();
    reader3 = new FileReader();
    //await does not work for functions which do not have promises
    /*let meta_read = reader1.readAsText(meta);
    let model_read = reader2.readAsText(model);
    let weights_read = reader3.readAsArrayBuffer(weights);*/
    reader1.onload = donereading1;
    reader2.onload = donereading2;
    reader3.onload = donereading3;
    reader1.readAsText(meta);
    /*let meta_read = await plzread(reader1, meta,0);
    let model_read = await plzread(reader1,model,0);
    let weights_read = await plzread(reader1,weights,1);*/
    //File Reader is a class :OO
}

function donereading1(event)
{
    meta_read = event.target.result;
    //contents of file assigned to meta read :))
    reader2.readAsText(model);
}

function donereading2(event)
{
    model_read = event.target.result;
    reader3.readAsArrayBuffer(weights);
}

async function donereading3(event)
{
    weights_read = event.target.result;
    //console.log(meta_read,model_read,weights_read);


    /*fs.readFile(filePath, (err, fileContent) => {
        //err is the error message (obvi)
        //filecontent is..... the file content!!
        if (err) {
            alert('Error uploading data, please try again later!');
            console.error('Error reading file:', err);
            return;
        }*/

    //filesUpload : a promise in the class Dropbox
    //-> resolves to response or error :)
    //NOTE: the path name HAS to start with slash, even if its not in a folder :oo
    dbx.filesUpload({ path: '/meta'+currfileno+'.json', contents: meta_read })
    .then((response) => {
        console.log('File uploaded successfully :)', response);
    })
    .catch((error) => {
        console.error('Error uploading file :(', error);
    });

    dbx.filesUpload({ path: '/model'+ currfileno +'.json', contents: model_read })
    .then((response) => {
        console.log('File uploaded successfully :)', response);
    })
    .catch((error) => {
        console.error('Error uploading file :(', error);
    });

    dbx.filesUpload({ path: '/model'+ currfileno + '.weights.bin', contents: weights_read })
    .then((response) => {
        console.log('File uploaded successfully :)', response);
    })
    .catch((error) => {
        console.error('Error uploading file :(', error);
    });

    let genref =  doc(db,"Others","GeneralData");
    let gendoc = await getDoc(genref);
    let astring = 'exercise' + currfileno.toString();
    await updateDoc(genref,{[astring]:nama});

    for (let auser of userarr)
    {
        console.log('auser',auser);
        let tempref = doc(db,"users",auser);


        let tempdoc = await getDoc(tempref);
        console.log('tempdoc:',tempdoc);
        if (!tempdoc.exists())
        {
            alert("ERROR: User with ID "+ auser + "does not exist");
            continue;
        }

        if (!tempdoc.data().hasOwnProperty('personal_exercises'))
        {
            await setDoc(tempref,{'personal_exercises':{}});
        }

        await updateDoc(tempref,{'personal_exercises':arrayUnion(currfileno)});
    }

    window.location.href = "done.html";
}
