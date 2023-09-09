import React, { Component, useContext } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../App';

class PoseDetection extends Component {

  static contextType = useContext;

  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.model = poseDetection.SupportedModels.MoveNet;
    this.width = window.innerWidth > 900 ? 640 : 320;
    this.height = window.innerWidth > 900 ? 480 : 240;
    this.trainingType = new URL(decodeURI(window.location.href)).searchParams.get("classification");
    this.state = {
      count : JSON.parse(localStorage.getItem("userTrainingData"))[dayjs().format("YYYY/MM/DD")]["training"][this.trainingType],
      buttonText : "中断する"
    }
    this.flag = false
  }

  async componentDidMount() {

    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;

    const calculateAngleWithin180 = (Ax, Ay, Bx, By, Cx, Cy) => {
      const angleAB = Math.atan2(Ay - By, Ax - Bx);
      const angleBC = Math.atan2(Cy - By, Cx - Bx);
      let angle = Math.abs(Math.round((angleBC - angleAB) * 180 / Math.PI));

      if (angle > 180) {
        angle = 360 - angle;
      }
      return angle;
    }

    const muscle_counter = (goal_count, which, keypoints) => {
      
      let angle = null;
      let average_score = 0;
      let countRef = parseInt(localStorage.getItem("count"))
      this.setState({
        count : countRef
      })

      if (this.state.count === goal_count){
        this.setState({
          buttonText : "完了!"
        })
        return
      }

      // 必要なジョイントの座標を取得＆格納
  
      if (which === "PectoralTraining") {
        angle = calculateAngleWithin180(
          keypoints.keypoints[6].x, keypoints.keypoints[6].y,
          keypoints.keypoints[8].x, keypoints.keypoints[8].y,
          keypoints.keypoints[10].x, keypoints.keypoints[10].y,
        );

        average_score = (
          keypoints.keypoints[6].score + 
          keypoints.keypoints[8].score +
          keypoints.keypoints[10].score
        ) / 3
      } else if (which === "AbsTraining") {
        angle = calculateAngleWithin180(
          keypoints.keypoints[6].x, keypoints.keypoints[6].y,
          keypoints.keypoints[12].x, keypoints.keypoints[12].y,
          keypoints.keypoints[14].x, keypoints.keypoints[14].y,
        );

        average_score = (
          keypoints.keypoints[6].score + 
          keypoints.keypoints[12].score +
          keypoints.keypoints[14].score
        ) / 3

      } else if (which === "LegTraining") {
        angle = calculateAngleWithin180(
          keypoints.keypoints[12].x, keypoints.keypoints[12].y,
          keypoints.keypoints[14].x, keypoints.keypoints[14].y,
          keypoints.keypoints[16].x, keypoints.keypoints[16].y,
        );
        average_score = (
          keypoints.keypoints[12].score + 
          keypoints.keypoints[14].score +
          keypoints.keypoints[16].score
        ) / 3
      }


      if (this.flag === false && angle > 130 && average_score > 0.6){
        this.flag = true
      }else if (this.flag === true && angle < 60 && average_score > 0.6){
        localStorage.setItem("count", countRef+1);
        this.flag = false
        console.log("count", countRef+1)
      }

      // // カウンターを開始するための条件
      // if (!counting && angle !== null && angle > 100) {
      //   counting = true;
      //   console.log("Counting", counting)
      // }
      // // カウント条件
      // if (counting && angle !== null && angle < 90) {
      //   console.log("Flag", flag)
      //   flag = 1;
      // }
      // // セットの位置に戻したらカウント
      // if (this.counting && angle !== null && angle > 100 && flag === 1) {
      //   this.count++;
      //   console.log("Count", this.count)
      //   flag = 0; // カウント条件をリセット
      // }
    }
  

    const createDetector  = async () => {
      const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
      const detector = await poseDetection.createDetector(this.model, detectorConfig);
      return detector
    }

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ 'audio': false, 'video': true });
      const video = this.videoRef.current;
      video.srcObject = stream;

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
    };

    tf.setBackend('webgpu');
    await tf.ready();

    const detector = createDetector();
    const userTrainingData = JSON.parse(localStorage.getItem("userTrainingData"))
    const Today = dayjs().format("YYYY/MM/DD")
    localStorage.setItem("count", this.state.count)
    const detectPose = async (video, canvas, detector) =>  {

      const ctx = canvas.getContext('2d');
      
      const videoElement = await setupCamera();

      video.play();

      const detect = async (video, ctx, detector) => {
        const poses = await (await detector).estimatePoses(video);
        ctx.clearRect(0, 0, this.width, this.height);

        if (poses.length !== 0){
          drawImage(video, ctx)
          drawKeypoints(poses[0], ctx)
          drawSkeleton(poses[0], ctx)
          muscle_counter(userTrainingData[Today]["target"][this.trainingType], this.trainingType, poses[0])
        }
        requestAnimationFrame(() => detect(video, ctx, detector));
      }

      detect(videoElement, ctx, detector);
      
    }

    const drawImage = (video, ctx) => {
      ctx.drawImage(video, 0, 0, this.width, this.height);
    }

    const drawKeypoints = (keypoints, ctx) => {
      const keypointInd = poseDetection.util.getKeypointIndexBySide(this.model);

      ctx.fillStyle = 'Red';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      const scaleFactorX = this.width / 640;
      const scaleFactorY = this.height / 480;

      for (var i=0; i<keypoints.keypoints.length; i++){

        if (keypointInd.right.includes(i)){
          ctx.fillStyle = 'Orange';
        }else if (keypointInd.left.includes(i)){
          ctx.fillStyle = "Green";
        }else{
          ctx.fillStyle = "Red";
        }

        if (keypoints.keypoints[i].score >= 0.3) {
          const circle = new Path2D();
          circle.arc(
            scaleFactorX * keypoints.keypoints[i].x, 
            scaleFactorY * keypoints.keypoints[i].y, 5, 0, 2 * Math.PI);
          ctx.fill(circle);
          ctx.stroke(circle);
        }
      }
    }

    const drawSkeleton = (keypoints, ctx) => {
      const color = "Green";
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      const scaleFactorX = canvas.width / 640;
      const scaleFactorY = canvas.height / 480;

      poseDetection.util.getAdjacentPairs(this.model).forEach(([i,j]) => {
        const kp1 = keypoints.keypoints[i];
        const kp2 = keypoints.keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = 0.3;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          ctx.beginPath();
          ctx.moveTo(scaleFactorX * kp1.x, scaleFactorY * kp1.y);
          ctx.lineTo(scaleFactorX * kp2.x, scaleFactorY * kp2.y);
          ctx.stroke();
        }
      });
    }

  detectPose(video, canvas, detector)
  

  }

  // async componentDidUpdate() {

  //   const video = this.videoRef.current;
  //   const canvas = this.canvasRef.current;

  //   const calculateAngleWithin180 = (Ax, Ay, Bx, By, Cx, Cy) => {
  //     const angleAB = Math.atan2(Ay - By, Ax - Bx);
  //     const angleBC = Math.atan2(Cy - By, Cx - Bx);
  //     let angle = Math.abs(Math.round((angleBC - angleAB) * 180 / Math.PI));

  //     if (angle > 180) {
  //       angle = 360 - angle;
  //     }
  //     return angle;
  //   }

  //   const muscle_counter = (goal_count, which, keypoints) => {
  //     let angle = null;
  //     // 必要なジョイントの座標を取得＆格納
  
  //     if (which === "胸筋") {
  //       angle = calculateAngleWithin180(
  //         keypoints.keypoints[6].x, keypoints.keypoints[6].y,
  //         keypoints.keypoints[8].x, keypoints.keypoints[8].y,
  //         keypoints.keypoints[10].x, keypoints.keypoints[10].y,
  //       );
  //     } else if (which === "腹筋") {
  //       angle = calculateAngleWithin180(
  //         keypoints.keypoints[6].x, keypoints.keypoints[6].y,
  //         keypoints.keypoints[12].x, keypoints.keypoints[12].y,
  //         keypoints.keypoints[14].x, keypoints.keypoints[14].y,
  //       );
  //     } else if (which === "足筋") {
  //       angle = calculateAngleWithin180(
  //         keypoints.keypoints[12].x, keypoints.keypoints[12].y,
  //         keypoints.keypoints[14].x, keypoints.keypoints[14].y,
  //         keypoints.keypoints[16].x, keypoints.keypoints[16].y,
  //       );
  //     }
  
  //     console.log(angle);
  
  //     // カウンターを開始するための条件
  //     if (!this.counting && angle !== null && angle > 100) {
  //       this.counting = true;
  //       console.log("Counting", this.counting)
  //     }
  //     // カウント条件
  //     if (this.counting && angle !== null && angle < 90) {
  //       console.log("Flag", this.flag)
  //       this.flag = 1;
  //     }
  //     // セットの位置に戻したらカウント
  //     if (this.counting && angle !== null && angle > 100 && this.flag === 1) {
  //       this.count++;
  //       console.log("Count", this.count)
  //       this.flag = 0; // カウント条件をリセット
  //     }
  //     // 目標の数に達した場合は処理を終了
  //     if (this.count >= goal_count) {
  //       this.result = true;
  //       return this.result;
  //     }
  //   }
  

  //   const createDetector  = async () => {
  //     const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
  //     const detector = await poseDetection.createDetector(this.model, detectorConfig);
  //     return detector
  //   }

  //   const setupCamera = async () => {
  //     const stream = await navigator.mediaDevices.getUserMedia({ 'audio': false, 'video': true });
  //     const video = this.videoRef.current;
  //     video.srcObject = stream;

  //     return new Promise((resolve) => {
  //       video.onloadedmetadata = () => {
  //         resolve(video);
  //       };
  //     });
  //   };

  //   tf.setBackend('webgpu');
  //   await tf.ready();

  //   const detector = createDetector();
  //   const detectPose = async (video, canvas, detector) =>  {

  //     const ctx = canvas.getContext('2d');
      
  //     const videoElement = await setupCamera();

  //     video.play();

  //     const detect = async (video, ctx, detector) => {
  //       const poses = await (await detector).estimatePoses(video);
  //       ctx.clearRect(0, 0, this.width, this.height);
  //       // await ctx.translate(900, 0);
  //       // await ctx.scale(-1, 1);

  //       if (poses.length !== 0){
  //         drawImage(video, ctx)
  //         drawKeypoints(poses[0], ctx)
  //         drawSkeleton(poses[0], ctx)
  //         muscle_counter(this.count, this.trainingType, poses[0])
  //       }
  //       requestAnimationFrame(() => detect(video, ctx, detector));
  //     }

  //     detect(videoElement, ctx, detector);
      
  //   }

  //   const drawImage = (video, ctx) => {
  //     ctx.drawImage(video, 0, 0, this.width, this.height);
  //   }

  //   const drawKeypoints = (keypoints, ctx) => {
  //     const keypointInd = poseDetection.util.getKeypointIndexBySide(this.model);

  //     ctx.fillStyle = 'Red';
  //     ctx.strokeStyle = 'white';
  //     ctx.lineWidth = 2;

  //     const scaleFactorX = this.width / 640;
  //     const scaleFactorY = this.height / 480;

  //     for (var i=0; i<keypoints.keypoints.length; i++){

  //       if (keypointInd.right.includes(i)){
  //         ctx.fillStyle = 'Orange';
  //       }else if (keypointInd.left.includes(i)){
  //         ctx.fillStyle = "Green";
  //       }else{
  //         ctx.fillStyle = "Red";
  //       }

  //       if (keypoints.keypoints[i].score >= 0.3) {
  //         const circle = new Path2D();
  //         circle.arc(
  //           scaleFactorX * keypoints.keypoints[i].x, 
  //           scaleFactorY * keypoints.keypoints[i].y, 5, 0, 2 * Math.PI);
  //         ctx.fill(circle);
  //         ctx.stroke(circle);
  //       }
  //     }
  //   }

  //   const drawSkeleton = (keypoints, ctx) => {
  //     const color = "Green";
  //     ctx.fillStyle = color;
  //     ctx.strokeStyle = color;
  //     ctx.lineWidth = 4;

  //     const scaleFactorX = canvas.width / 640;
  //     const scaleFactorY = canvas.height / 480;

  //     poseDetection.util.getAdjacentPairs(this.model).forEach(([i,j]) => {
  //       const kp1 = keypoints.keypoints[i];
  //       const kp2 = keypoints.keypoints[j];

  //       // If score is null, just show the keypoint.
  //       const score1 = kp1.score != null ? kp1.score : 1;
  //       const score2 = kp2.score != null ? kp2.score : 1;
  //       const scoreThreshold = 0.3;

  //       if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
  //         ctx.beginPath();
  //         ctx.moveTo(scaleFactorX * kp1.x, scaleFactorY * kp1.y);
  //         ctx.lineTo(scaleFactorX * kp2.x, scaleFactorY * kp2.y);
  //         ctx.stroke();
  //       }
  //     });
  //   }

  // detectPose(video, canvas, detector)
  

  // }

  render() {
    // const {userTrainingData } = this.context
    // console.log(userTrainingData, "レンダー前 userTrainingData")

    // if (userTrainingData === {} || userTrainingData.length === 0) {
    //   return (<></>)
    // }else{
    //   console.log(userTrainingData, "{}じゃないときの処理")
    // }

    let userTrainingData = JSON.parse(localStorage.getItem("userTrainingData"))
    let userId = localStorage.getItem("UserId")

    return (
      <div className='Main'>
        <div className='CameraWrapper'>
          <canvas ref={this.canvasRef} width={this.width} height={this.height} className='canvas'/>
          <video ref={this.videoRef} autoPlay playsInline width={this.width} height={this.height} />

          <div className='TrainingCounter'>
            <div className='CounterHeader'>
              <h2>カウント</h2>
              <h2>目標</h2>
            </div>

            <div className='CounterBox'>
              <h2>{this.state.count}</h2>
              <h2>{userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType]}</h2>
            </div>
          </div>

          <div onClick={
            async () => {
              userTrainingData[dayjs().format("YYYY/MM/DD")]["training"][this.trainingType] = this.state.count
              localStorage.setItem("userTrainingData", JSON.stringify(userTrainingData))
              await setDoc(doc(collection(db, "TrainingData"), userId), {TrainingData : userTrainingData});
              window.location.href = "/"
            }
          }>{this.state.buttonText}</div>
        </div>
      </div>
    );
  }

}


PoseDetection.contextType = GlobalContext;
export default PoseDetection;