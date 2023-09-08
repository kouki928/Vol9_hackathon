import React, { Component, useContext, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';

class PoseDetection extends Component {

  static contextType = useContext;

  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.model = poseDetection.SupportedModels.MoveNet;
    this.width = window.innerWidth > 900 ? 640 : 320;
    this.height = window.innerWidth > 900 ? 480 : 240;
  }

  async componentDidMount() {

    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;

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
    const detectPose = async (video, canvas, detector) =>  {

      const ctx = canvas.getContext('2d');
      
      const videoElement = await setupCamera();

      video.play();

      const detect = async (video, ctx, detector) => {
        const poses = await (await detector).estimatePoses(video);
        ctx.clearRect(0, 0, this.width, this.height);
        // await ctx.translate(900, 0);
        // await ctx.scale(-1, 1);

        if (poses.length !== 0){
          drawImage(video, ctx)
          drawKeypoints(poses[0], ctx)
          drawSkeleton(poses[0], ctx)
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

  render() {
    const {userTrainingData} = this.context
    console.log(userTrainingData[dayjs().format("YYYY/MM/DD")])
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
              <h2>{}</h2>
              <h2>{}</h2>
            </div>

          </div>
        </div>
      </div>
    );
  }

}


PoseDetection.contextType = GlobalContext;
export default PoseDetection;