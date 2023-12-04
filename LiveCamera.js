/**Import ------------------------------------------------------------
 * 以下のような形式で取得する。
 * import { 関数 or 変数名 } from "url"
 * また、別の場所でも使いたい場合は export を変数や関数の前に付ける
 ------------------------------------------------------------------ */
import React, { Component, useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../App';

import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, clamp } from "@mediapipe/drawing_utils";
import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_NEUTRAL, POSE_LANDMARKS_RIGHT } from "@mediapipe/pose/pose";

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
    this.width = window.innerWidth > 900 ? 640 : 320;
    this.height = window.innerWidth > 900 ? 480 : 240;
    this.trainingType = new URL(decodeURI(window.location.href)).searchParams.get("classification");

    /** ------------------------------------------------------------------------------------------------------ 
     * this.state はclass内で大きな意味を持つ。
     * 通常、html上での変化でclass内の値を変更できないが、ここに定義した変数は自由に変更できる。
     * --------------------------------------------------------------------------------------------------------- */
    this.state = {
      count: JSON.parse(localStorage.getItem("userTrainingData"))[dayjs().format("YYYY/MM/DD")]["training"][this.trainingType],
      buttonText: "中断する"
    }
    this.frameCount = 0;
    this.angleList = [];
    this.flag = false
    this.angle = 0;
  }

  /** conmonentDidMount --------------------------------------------------------------------------
   * 関数での useEffect(() => {}) と同じ意味をもつ。
   * つまりは、クラスが生成された時に1回だけ実行される。
   * ここではカメラを起動し、起動中ずっと行われる処理を定義している。
   * ------------------------------------------------------------------------------------------- */
  async componentDidMount() {

    // video Element
    const video5 = this.videoRef.current;
    // canvas Element
    const out5 = this.canvasRef.current;
    out5.style.transform = "scaleX(-1)";
    const canvasCtx5 = out5.getContext('2d');

    /**calculateAngleWithin180 --------------------------------------------------------------------------
    * webカメラから得た座標情報を基に角度を計算する関数。
    --------------------------------------------------------------------------------------------------*/
    const calculateAngleWithin180 = (Ax, Ay, Az, Bx, By, Bz, Cx, Cy, Cz) => {
      const vA = [Ax - Bx, Ay - By, Az - Bz];
      const vB = [Cx - Bx, Cy - By, Cz - Bz];
      const sizeA = Math.sqrt(vA.reduce((sum, v) => sum + v ** 2, 0));
      const sizeB = Math.sqrt(vB.reduce((sum, v) => sum + v ** 2, 0));
      const inner = vA.reduce((sum, v, i) => sum + v * vB[i], 0);
      const cosTheta = inner / (sizeA * sizeB);
      const theta = Math.acos(cosTheta) * (180 / Math.PI);
      return Math.round(theta);
    }

    /**muscle_counter ------------------------------------------------------------------------------------
    * localStorageに保存したカウントを上昇させる。
    * keypointsには各部位の座標データが保存されている。
    * また、whichの値によって筋トレの種類が決定される。
    --------------------------------------------------------------------------------------------------- */
    const muscle_counter = (goal_count, results) => {

      let which = new URL(decodeURI(window.location.href)).searchParams.get("classification");
      let angle = null;
      let average_score = 0;
      let right_average_score = 0
      let left_average_score = 0
      let countRef = parseInt(localStorage.getItem("count"))
      this.setState({
        count: countRef
      })

      if (this.state.count === goal_count) {
        canvasCtx5.scale(-1, 1);
        canvasCtx5.fillStyle = "#FF0000"; // 赤色のフォント
        canvasCtx5.font = "100px Arial"; // フォントサイズと種類
        canvasCtx5.fillText(`CLEAR`, -480, 275); // 指示を描画
        canvasCtx5.scale(-1, 1);
        this.setState({
          buttonText: "完了!"
        })
        return
      }

      // 胸筋
      if (which === "PectoralTraining") {

        right_average_score = (
          results.poseLandmarks[12].visibility +
          results.poseLandmarks[14].visibility +
          results.poseLandmarks[16].visibility
        ) / 3
        left_average_score = (
          results.poseLandmarks[11].visibility +
          results.poseLandmarks[13].visibility +
          results.poseLandmarks[15].visibility
        ) / 3
        if (left_average_score <= right_average_score) {
          average_score = right_average_score
          angle = calculateAngleWithin180(
            results.poseLandmarks[12].x, results.poseLandmarks[12].y, results.poseLandmarks[12].z,
            results.poseLandmarks[14].x, results.poseLandmarks[14].y, results.poseLandmarks[14].z,
            results.poseLandmarks[16].x, results.poseLandmarks[16].y, results.poseLandmarks[16].z,
          );
        }
        else {
          average_score = left_average_score
          angle = calculateAngleWithin180(
            results.poseLandmarks[11].x, results.poseLandmarks[11].y, results.poseLandmarks[11].z,
            results.poseLandmarks[13].x, results.poseLandmarks[13].y, results.poseLandmarks[13].z,
            results.poseLandmarks[15].x, results.poseLandmarks[15].y, results.poseLandmarks[15].z,
          );
        }
        // 格納＆カウント
        this.angleList.push(angle);
        this.frameCount += 1;

        // 毎秒/２ごとに角度を平均化
        if (20 <= this.frameCount) {
          // 平均
          let sum = this.angleList.reduce(function (sum, element) {
            return sum + element;
          }, 0);
          this.angle = sum / this.frameCount;
          this.angle = Math.round(this.angle);
          // 判定
          if (this.flag === false && this.angle > 120 && average_score > 0.6) {
            this.flag = true
          } else if (this.flag === true && this.angle < 90 && average_score > 0.6) {
            localStorage.setItem("count", countRef + 1);
            this.flag = false
            console.log("count", countRef + 1)
          }
          // 初期化
          this.angleList = [];
          this.frameCount = 0;
        }

        // 腹筋
      } else if (which === "AbsTraining") {
        right_average_score = (
          results.poseLandmarks[11].visibility +
          results.poseLandmarks[23].visibility +
          results.poseLandmarks[25].visibility
        ) / 3
        left_average_score = (
          results.poseLandmarks[12].visibility +
          results.poseLandmarks[24].visibility +
          results.poseLandmarks[26].visibility
        ) / 3
        if (left_average_score <= right_average_score) {
          average_score = right_average_score
          angle = calculateAngleWithin180(
            results.poseLandmarks[11].x, results.poseLandmarks[11].y, results.poseLandmarks[11].z,
            results.poseLandmarks[23].x, results.poseLandmarks[23].y, results.poseLandmarks[23].z,
            results.poseLandmarks[25].x, results.poseLandmarks[25].y, results.poseLandmarks[25].z,
          );
        }
        else {
          average_score = left_average_score
          angle = calculateAngleWithin180(
            results.poseLandmarks[12].x, results.poseLandmarks[12].y, results.poseLandmarks[12].z,
            results.poseLandmarks[24].x, results.poseLandmarks[24].y, results.poseLandmarks[24].z,
            results.poseLandmarks[26].x, results.poseLandmarks[26].y, results.poseLandmarks[26].z,
          );
        }
        // 格納＆カウント
        this.angleList.push(angle);
        this.frameCount += 1;

        // 毎秒/２ごとに角度を平均化
        if (20 <= this.frameCount) {
          // 平均
          let sum = this.angleList.reduce(function (sum, element) {
            return sum + element;
          }, 0);
          this.angle = sum / this.frameCount;
          this.angle = Math.round(this.angle);
          // 判定
          if (this.flag === false && angle > 130 && average_score > 0.6) {
            this.flag = true
          } else if (this.flag === true && angle < 60 && average_score > 0.6) {
            localStorage.setItem("count", countRef + 1);
            this.flag = false
            console.log("count", countRef + 1)
          }
          // 初期化
          this.angleList = [];
          this.frameCount = 0;
        }

        // 足筋
      } else if (which === "LegTraining") {
        right_average_score = (
          results.poseLandmarks[23].visibility +
          results.poseLandmarks[25].visibility +
          results.poseLandmarks[27].visibility
        ) / 3
        left_average_score = (
          results.poseLandmarks[24].visibility +
          results.poseLandmarks[26].visibility +
          results.poseLandmarks[28].visibility
        ) / 3
        if (left_average_score <= right_average_score) {
          average_score = right_average_score
          angle = calculateAngleWithin180(
            results.poseLandmarks[23].x, results.poseLandmarks[23].y, results.poseLandmarks[23].z,
            results.poseLandmarks[25].x, results.poseLandmarks[25].y, results.poseLandmarks[25].z,
            results.poseLandmarks[27].x, results.poseLandmarks[27].y, results.poseLandmarks[27].z,
          );
        }
        else {
          average_score = left_average_score
          angle = calculateAngleWithin180(
            results.poseLandmarks[24].x, results.poseLandmarks[24].y, results.poseLandmarks[24].z,
            results.poseLandmarks[26].x, results.poseLandmarks[26].y, results.poseLandmarks[26].z,
            results.poseLandmarks[28].x, results.poseLandmarks[28].y, results.poseLandmarks[28].z,
          );
        }
        // 格納＆カウント
        this.angleList.push(angle);
        this.frameCount += 1;

        // 毎秒/２ごとに角度を平均化
        if (20 <= this.frameCount) {
          // 平均
          let sum = this.angleList.reduce(function (sum, element) {
            return sum + element;
          }, 0);
          this.angle = sum / this.frameCount;
          this.angle = Math.round(this.angle);
          // 判定
          if (this.flag === false && angle > 150 && average_score > 0.6) {
            this.flag = true
          } else if (this.flag === true && angle < 100 && average_score > 0.6) {
            localStorage.setItem("count", countRef + 1);
            this.flag = false
            console.log("count", countRef + 1)
          }
          // 初期化
          this.angleList = [];
          this.frameCount = 0;
        }
      }
      // 画像内に描画
      canvasCtx5.fillStyle = "#FFFFFF"; // 白色のフォント
      canvasCtx5.font = "60px Arial"; // フォントサイズと種類
      canvasCtx5.scale(-1, 1);
      canvasCtx5.fillText(`Angle: ${this.angle}°`, -630, 50); // 角度を描画
      if (this.flag == true) {
        canvasCtx5.fillStyle = "#0000FF"; // 青色のフォント
        canvasCtx5.font = "60px Arial"; // フォントサイズと種類
        canvasCtx5.fillText(`DOWN`, -200, 50); // 指示を描画
        canvasCtx5.fillStyle = "#FFFFFF"; // 白色のフォント
      } else {
        canvasCtx5.fillStyle = "#FF0000"; // 赤色のフォント
        canvasCtx5.font = "60px Arial"; // フォントサイズと種類
        canvasCtx5.fillText(`UP`, -150, 50); // 指示を描画
        canvasCtx5.fillStyle = "#FFFFFF"; // 白色のフォント
      }
      canvasCtx5.font = "70px Arial"; // フォントサイズと種類
      canvasCtx5.fillText(`残り ${userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count} 回`, -330, 470);
      canvasCtx5.scale(-1, 1);
    }

    const userTrainingData = JSON.parse(localStorage.getItem("userTrainingData")) // トレーニング情報
    const Today = dayjs().format("YYYY/MM/DD") // 今日の日付
    localStorage.setItem("count", this.state.count) // 何回筋トレしたかの情報

    /** detectPose --------------------------------------------------------- 
     * カメラの情報を基に姿勢を検知する関数。
     * video に現在映っている情報、canvas にはcanvasElementが入っている。
     * 姿勢検知した座標の点を canvas に描き、video と重ねる事で表示が実現されている。
     * ----------------------------------------------------------------------- */
    const detectPose = async () => {
      function zColor(data) { // ポーズのz座標から色を生成する関数
        const z = clamp(data.from.z + 0.5, 0, 1);
        return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
      }

      function onResultsPose(results) { // ポーズ検出の結果を処理する関数

        // console.log(results)

        canvasCtx5.save(); // キャンバスの状態を保存
        canvasCtx5.clearRect(0, 0, video5.width, video5.height); // キャンバスをクリア
        canvasCtx5.drawImage(results.image, 0, 0, out5.width, out5.height); // 画像を描画

        if (results.poseLandmarks === null || results.poseLandmarks === undefined) {
          return 0;
        }

        // 座標データを基に筋トレできているかを判定 & カウント ----------------------------------------------
        muscle_counter(userTrainingData[Today]["target"][new URL(decodeURI(window.location.href)).searchParams.get("classification")], results);

        // ポーズの接続線やランドマークを描画
        drawConnectors(
          canvasCtx5, results.poseLandmarks, POSE_CONNECTIONS, {
          color: (data) => {
            const x0 = out5.width * data.from.x;
            const y0 = out5.height * data.from.y;
            const x1 = out5.width * data.to.x;
            const y1 = out5.height * data.to.y;

            const z0 = clamp(data.from.z + 0.5, 0, 1);
            const z1 = clamp(data.to.z + 0.5, 0, 1);

            const gradient = canvasCtx5.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop(
              0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
            gradient.addColorStop(
              1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
            return gradient;
          }
        });

        // ポーズの各部位ごとに異なる色でランドマークを描画
        drawLandmarks(
          canvasCtx5,
          Object.values(POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
          { color: zColor, fillColor: '#FF0000' }
        );
        drawLandmarks(
          canvasCtx5,
          Object.values(POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
          { color: zColor, fillColor: '#00FF00' }
        );
        drawLandmarks(
          canvasCtx5,
          Object.values(POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
          { color: zColor, fillColor: '#AAAAAA' }
        );

        canvasCtx5.restore(); // キャンバスの状態を復元
      }

      // MediaPipe Pose モデルの設定
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
        }
      }); // MediaPipe Poseモデルのインスタンスを生成
      pose.onResults(onResultsPose); // ポーズ検出の結果が利用可能になったときに関数を呼び出す設定

      // カメラの設定
      const camera = new Camera(video5, {
        onFrame: async () => {
          await pose.send({ image: video5 });
        }, // カメラのフレーム受け取り時にポーズ検出を行う設定
        width: 600, // カメラの幅
        height: 480 // カメラの高さ
      });
      camera.start(); // カメラを起動
    }

    // `onResultsPose` 関数の定義

    /** detectPose終わり ----------------------------------------------------------------------------------- */

    // ここでdetectPoseが実行される。 -------------------------------------------
    detectPose()
  }


  /* HTMLを返す -------------------------------------------------------------------------------- */
  render() {
    let userTrainingData = JSON.parse(localStorage.getItem("userTrainingData"))
    let userId = localStorage.getItem("UserId")

    return (
      <div className='Main'>
        <div className='CameraWrapper'>
          <canvas ref={this.canvasRef} width={this.width} height={this.height} className='canvas' />
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
              await setDoc(doc(collection(db, "TrainingData"), userId), { TrainingData: userTrainingData });
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