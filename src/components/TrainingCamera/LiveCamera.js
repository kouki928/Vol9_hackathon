/**Import ------------------------------------------------------------
 * 以下のような形式で取得する。
 * import { 関数 or 変数名 } from "url"
 * また、別の場所でも使いたい場合は export を変数や関数の前に付ける
 ------------------------------------------------------------------ */
import React, { Component, useContext } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../App';


/** PoseDetection ----------------------------------------------------------
 * Componentクラスを継承したクラス。クラスである意味は特になく、検索結果の産物
 * React内で変数のデータを共有するには useContext, useState という機能が使われるが、
 * Class内では両方使用できないため注意。代わりに、 static ... で定義している。
 -------------------------------------------------------------------------- */
class PoseDetection extends Component {

  // ここでuseContextを使えるようにしている。
  static contextType = useContext;

  // Pythonでいう init のようなもの。this. = self. くらいの認識
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.model = poseDetection.SupportedModels.MoveNet;
    this.width = window.innerWidth > 900 ? 640 : 320;
    this.height = window.innerWidth > 900 ? 480 : 240;
    this.trainingType = new URL(decodeURI(window.location.href)).searchParams.get("classification");

    /** ------------------------------------------------------------------------------------------------------ 
     * this.state はclass内で大きな意味を持つ。
     * 通常、html上での変化でclass内の値を変更できないが、ここに定義した変数は自由に変更できる。
     * --------------------------------------------------------------------------------------------------------- */
    this.state = {
      count : JSON.parse(localStorage.getItem("userTrainingData"))[dayjs().format("YYYY/MM/DD")]["training"][this.trainingType],
      buttonText : "中断する"
    }

    this.flag = false
  }

  /** conmonentDidMount --------------------------------------------------------------------------
   * 関数での useEffect(() => {}) と同じ意味をもつ。
   * つまりは、クラスが生成された時に1回だけ実行される。
   * ここではカメラを起動し、起動中ずっと行われる処理を定義している。
   * ------------------------------------------------------------------------------------------- */
  async componentDidMount() {

    // video Element
    const video = this.videoRef.current;
    // canvas Element
    const canvas = this.canvasRef.current;

    /**calculateAngleWithin180 --------------------------------------------------------------------------
     * webカメラから得た座標情報を基に角度を計算する関数。
    --------------------------------------------------------------------------------------------------*/
    const calculateAngleWithin180 = (Ax, Ay, Bx, By, Cx, Cy) => {
      const angleAB = Math.atan2(Ay - By, Ax - Bx);
      const angleBC = Math.atan2(Cy - By, Cx - Bx);
      let angle = Math.abs(Math.round((angleBC - angleAB) * 180 / Math.PI));

      if (angle > 180) {
        angle = 360 - angle;
      }
      return angle;
    }
    

    /**muscle_counter ------------------------------------------------------------------------------------
     * localStorageに保存したカウントを上昇させる。
     * keypointsには各部位の座標データが保存されている。
     * また、whichの値によって筋トレの種類が決定される。
     --------------------------------------------------------------------------------------------------- */
    const muscle_counter = (goal_count, which, keypoints) => {
      
      let angle = null;
      let average_score = 0;
      let right_average_score = 0
      let left_average_score = 0
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


      if (which === "PectoralTraining") {
        right_average_score = (
          keypoints.keypoints[6].score + 
          keypoints.keypoints[8].score +
          keypoints.keypoints[10].score
        ) / 3
        left_average_score = (
          keypoints.keypoints[5].score + 
          keypoints.keypoints[7].score +
          keypoints.keypoints[9].score
        ) / 3
        if (left_average_score <= right_average_score) {
          average_score = right_average_score
          angle = calculateAngleWithin180(
            keypoints.keypoints[6].x, keypoints.keypoints[6].y,
            keypoints.keypoints[8].x, keypoints.keypoints[8].y,
            keypoints.keypoints[10].x, keypoints.keypoints[10].y,
          );
        }
        else {
          average_score = left_average_score
          angle = calculateAngleWithin180(
            keypoints.keypoints[5].x, keypoints.keypoints[5].y,
            keypoints.keypoints[7].x, keypoints.keypoints[7].y,
            keypoints.keypoints[9].x, keypoints.keypoints[9].y,
          );
        }

        if (this.flag === false && angle > 160 && average_score > 0.6){
          this.flag = true
        }else if (this.flag === true && angle < 90 && average_score > 0.6){
          localStorage.setItem("count", countRef+1);
          this.flag = false
          console.log("count", countRef+1)
        }

      // 腹筋
      } else if (which === "AbsTraining") {
        right_average_score = (
          keypoints.keypoints[6].score + 
          keypoints.keypoints[12].score +
          keypoints.keypoints[14].score
        ) / 3
        left_average_score = (
          keypoints.keypoints[5].score + 
          keypoints.keypoints[11].score +
          keypoints.keypoints[13].score
        ) / 3
        if (left_average_score <= right_average_score) {
          average_score = right_average_score
          angle = calculateAngleWithin180(
            keypoints.keypoints[6].x, keypoints.keypoints[6].y,
            keypoints.keypoints[12].x, keypoints.keypoints[12].y,
            keypoints.keypoints[14].x, keypoints.keypoints[14].y,
          );
        }
        else {
          average_score = left_average_score
          angle = calculateAngleWithin180(
            keypoints.keypoints[5].x, keypoints.keypoints[5].y,
            keypoints.keypoints[11].x, keypoints.keypoints[11].y,
            keypoints.keypoints[13].x, keypoints.keypoints[13].y,
          );
        }

        if (this.flag === false && angle > 130 && average_score > 0.6){
          this.flag = true
        }else if (this.flag === true && angle < 60 && average_score > 0.6){
          localStorage.setItem("count", countRef+1);
          this.flag = false
          console.log("count", countRef+1)
        }

      // 足筋
      } else if (which === "LegTraining") {
        right_average_score = (
          keypoints.keypoints[12].score + 
          keypoints.keypoints[14].score +
          keypoints.keypoints[16].score
        ) / 3
        left_average_score = (
          keypoints.keypoints[11].score + 
          keypoints.keypoints[13].score +
          keypoints.keypoints[15].score
        ) / 3
        if (left_average_score <= right_average_score) {
          average_score = right_average_score
          angle = calculateAngleWithin180(
            keypoints.keypoints[12].x, keypoints.keypoints[12].y,
            keypoints.keypoints[14].x, keypoints.keypoints[14].y,
            keypoints.keypoints[16].x, keypoints.keypoints[16].y,
          );
        }
        else {
          average_score = left_average_score
          angle = calculateAngleWithin180(
            keypoints.keypoints[11].x, keypoints.keypoints[11].y,
            keypoints.keypoints[13].x, keypoints.keypoints[13].y,
            keypoints.keypoints[15].x, keypoints.keypoints[15].y,
          );
        }

        if (this.flag === false && angle > 160 && average_score > 0.6){
          this.flag = true
        }else if (this.flag === true && angle < 100 && average_score > 0.6){
          localStorage.setItem("count", countRef+1);
          this.flag = false
          console.log("count", countRef+1)
        }
      }
    }
  

    /**createDetector ----------------------------------------------------------------------------------
     * 姿勢検出器を生成する。
     * ここでは TensorFlow の movenet を利用している。
    -------------------------------------------------------------------------------------------------- */
    const createDetector  = async () => {
      const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
      const detector = await poseDetection.createDetector(this.model, detectorConfig);
      return detector
    }

    /** setupCamera ------------------------------------------------------------------------------------
     * stream で camera で取得する情報を指定して生成。
     * 正直よくわかっていないが、ここを弄る必要は感じない。
    -------------------------------------------------------------------------------------------------- */
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

    // tensorFlowを利用するためのセットアップ ------------------------------------------- //
    tf.setBackend('webgpu');
    await tf.ready();

    const detector = createDetector(); // 検出器
    const userTrainingData = JSON.parse(localStorage.getItem("userTrainingData")) // トレーニング情報
    const Today = dayjs().format("YYYY/MM/DD") // 今日の日付
    localStorage.setItem("count", this.state.count) // 何回筋トレしたかの情報
    

    /** detectPose --------------------------------------------------------- 
     * カメラの情報を基に姿勢を検知する関数。
     * video に現在映っている情報、canvas にはcanvasElementが入っている。
     * 姿勢検知した座標の点を canvas に描き、video と重ねる事で表示が実現されている。
     * ----------------------------------------------------------------------- */
    const detectPose = async (video, canvas, detector) =>  {

      // canvasに書き込むためのelement
      const ctx = canvas.getContext('2d');
      
      // videoセットアップ
      const videoElement = await setupCamera();
      video.play();

      /**detect ---------------------------------------------------------------------
       * 姿勢を検出し、poses 変数に格納する。
       * drawImage, drawKeypoints, drawSkeleton はそれぞれ下で定義されている。
       * 意味は、video と canvas の座標を重ねる, keypoint を描写する , 座標を繋ぐ線を描写する。
      -----------------------------------------------------------------------------------  */
      const detect = async (video, ctx, detector) => {
        const poses = await (await detector).estimatePoses(video);
        ctx.clearRect(0, 0, this.width, this.height);
        
        // 座標データを描写 ------------------------------------------------------------------
        if (poses.length !== 0){
          drawImage(video, ctx)
          drawKeypoints(poses[0], ctx)
          drawSkeleton(poses[0], ctx)

          // 座標データを基に筋トレできているかを判定 & カウント ----------------------------------------------
          muscle_counter(userTrainingData[Today]["target"][this.trainingType], this.trainingType, poses[0])
        }

        /* ---------------------------------------------------------------------------------
        * 実質的な while 文である
        * カメラに新しく情報が追加されると、detect 関数が実行される
        ------------------------------------------------------------------------------------ */
        requestAnimationFrame(() => detect(video, ctx, detector));
      }

      /* detect関数終わり --------------------------------------------------------------------------------- */

      // detectPose関数の中で detect関数が実行されている。
      // つまり、detectPoseが実行されないと、姿勢検出とポイント描写は行われない。
      detect(videoElement, ctx, detector);
      
    }

    /** detectPose終わり ----------------------------------------------------------------------------------- */

    // 座標を指定して、video と重ねてcanvasを表示させる
    const drawImage = (video, ctx) => {
      ctx.drawImage(video, 0, 0, this.width, this.height);
    }

    // keypoint の点を canvas に書き込む関数
    const drawKeypoints = (keypoints, ctx) => {

      // keypointがそれぞれ何番なのかを取得
      const keypointInd = poseDetection.util.getKeypointIndexBySide(this.model);

      ctx.fillStyle = 'Red';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      const scaleFactorX = this.width / 640;
      const scaleFactorY = this.height / 480;

      // 右側なら orange , 左側なら green, それ以外なら red に染める
      for (var i=0; i<keypoints.keypoints.length; i++){

        if (keypointInd.right.includes(i)){
          ctx.fillStyle = 'Orange';
        }else if (keypointInd.left.includes(i)){
          ctx.fillStyle = "Green";
        }else{
          ctx.fillStyle = "Red";
        }
        
        // 信頼スコアが 0.3 以上の時のみ描写 ------------------------------------------
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

    // keypoint の点と点を繋ぐ線を描写 --------------------------------------------------------
    const drawSkeleton = (keypoints, ctx) => {
      const color = "Green";
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      const scaleFactorX = canvas.width / 640;
      const scaleFactorY = canvas.height / 480;
      
      // keypoint の pair を取得、このペアを線でつなぐ。
      poseDetection.util.getAdjacentPairs(this.model).forEach(([i,j]) => {
        const kp1 = keypoints.keypoints[i];
        const kp2 = keypoints.keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = 0.3;

        // 描写 --------------------------------------------------------
        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          ctx.beginPath();
          ctx.moveTo(scaleFactorX * kp1.x, scaleFactorY * kp1.y);
          ctx.lineTo(scaleFactorX * kp2.x, scaleFactorY * kp2.y);
          ctx.stroke();
        }
      });
    }
  
  // ここでdetectPoseが実行される。 -------------------------------------------
  detectPose(video, canvas, detector)
  
  }


  /* HTMLを返す -------------------------------------------------------------------------------- */
  render() {
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

          <div className='TrainingButton' onClick={
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