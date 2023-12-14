/**Import ------------------------------------------------------------
 * 以下のような形式で取得する。
 * import { 関数 or 変数名 } from "url"
 * また、別の場所でも使いたい場合は export を変数や関数の前に付ける
------------------------------------------------------------------ */
import React, { Component, useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../index';

import Up from "../../images/Up.png";
import Down from "../../images/Down.png";
import CREAR from "../../images/CREAR.png";
import macho from "../../images/macho.png";

import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, clamp } from "@mediapipe/drawing_utils";
import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_NEUTRAL, POSE_LANDMARKS_RIGHT } from "@mediapipe/pose/pose";
import { transform } from 'typescript';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

/** PoseDetection ----------------------------------------------------------
* Componentクラスを継承したクラス。クラスである意味は特になく、検索結果の産物
* React内で変数のデータを共有するには useContext, useState という機能が使われるが、
* Class内では両方使用できないため注意。代わりに、 static ... で定義している。
-------------------------------------------------------------------------- */
class PoseDetection extends Component {

  // ここでuseContextを使えるようにしている。
  static contextType = GlobalContext;

  // Pythonでいう init のようなもの。this. = self. くらいの認識
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    // this.testCanvasRef = React.createRef();
    this.testwidth = window.innerWidth > 900 ? 640 : 320;
    this.testheight = window.innerWidth > 900 ? 480 : 240;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.trainingType = new URL(decodeURI(window.location.href)).searchParams.get("classification");

    /** ------------------------------------------------------------------------------------------------------ 
    * this.state はclass内で大きな意味を持つ。
    * 通常、html上での変化でclass内の値を変更できないが、ここに定義した変数は自由に変更できる。
    * --------------------------------------------------------------------------------------------------------- */
    this.state = {
      count: props.userTrainingData[dayjs().format("YYYY/MM/DD")]["training"][this.trainingType],
      buttonText: "中断する",
      totalTime: props.userTrainingData[dayjs().format("YYYY/MM/DD")]["totalTime"][this.trainingType],
      orientation: window.screen.orientation,
    }
    this.frameCount = 0;
    this.angleList = [];
    this.flag = false;
    this.angle = 0;
    this.stopTimeCount = 0;
    this.beforCount = null;

    this.config = { position: [0, 0], size: [0, 0] };
    this.upConfig = { position: [0, 0], size: [0, 0] };
    this.downConfig = { position: [0, 0], size: [0, 0] };
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
    // const testCTX = this.testCanvasRef.current.getContext("2d");
    // testCTX.scale(-1,1)
    out5.style.transform = "scaleX(-1)";
    const canvasCtx5 = out5.getContext('2d');
    const canvasCtx5RestCount = out5.getContext('2d');
    // canvasCtx5.rotate((90 * Math.PI) / 180)
    const userTrainingData = this.props.userTrainingData
    const Today = dayjs().format("YYYY/MM/DD") // 今日の日付
    const trainingType = this.trainingType

    this.props.onChangeStyle(true);

    // 画像を宣言
    const udImage = new Image();
    udImage.className = "udImage";
    const CImage = new Image();
    CImage.className = "CImage";
    udImage.onload = () => {
      canvasCtx5.scale(-1, 1);
      canvasCtx5.drawImage(udImage, ...this.config.position, ...this.config.size);
      canvasCtx5.scale(-1, 1);
    };
    // CREARの詳細設定
    let CConfig;
    if (this.trainingType === "LegTraining") {
      CConfig = { position: [-360, 250], size: [350, 150] };
    } else {
      CConfig = { position: [-500, 120], size: [350, 150] };
    }
    CImage.onload = () => {
      canvasCtx5.scale(-1, 1);
      canvasCtx5.drawImage(CImage, ...CConfig.position, ...CConfig.size);
      canvasCtx5.scale(-1, 1);
    };


    /** 画角メモ
     * 1. 縦横比率を計算する 
     * 2. 計算結果に基づいて、縦 or 横に合わせて画面を切り取る。
     * 3. 切り取ったモノをcanvasサイズに拡大する
     * 
     * canvas のサイズは画面いっぱい広がっているものとする。
     * 縦4,横2の画面、 縦2, 横3のカメラがあったとする。縦に合わせたいから、縦で比率を計算する。
     * 2 / 4 = 0.75 0.5倍にすればよいことが分かった。縦は videoのサイズ 2に 横は 縦横比を維持するために、canvas横に0.5かけて 1
     * カメラから 縦2, 横1 の画面を切り取る。3/2 = 1.5 - 0.5 = 1  1+1で2なので、 1 ~ 2の横と 縦 2を撮る。
     * これを canvas のサイズに拡大して張り付けて終了
     */



    // 描写のためのカメラ調整パラメータ
    // カメラサイズ / 2 - 描写したいサイズ /2
    const cx = window.innerWidth;
    const cy = window.innerHeight;
    const rate = this.trainingType === "LegTraining" ? video5.height / cy : video5.width / cx // カメラとcanvasの比率
    const gap = this.trainingType === "LegTraining" ? rate * cx : rate * cy// 最大を取らない方の幅
    const sx = this.trainingType === "LegTraining" ? video5.width / 2 - gap / 2 : 0;
    const sy = this.trainingType === "LegTraining" ? 0 : video5.height / 2 - gap / 2;
    const sWidth = this.trainingType === "LegTraining" ? gap : video5.width;
    const sHeight = this.trainingType === "LegTraining" ? video5.height : gap
    const dx = this.trainingType === "LegTraining" ? 0 : 0
    const dy = this.trainingType === "LegTraining" ? 0 : 0
    const dWidth = this.trainingType === "LegTraining" ? cx : cx
    const dHeight = this.trainingType === "LegTraining" ? cy : cy;

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

    // 残り回数描画関数（フェードアウト実装）
    const fadeOutText = (startTime) => {
      let animationId;
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const duration = 1000; // 1秒間のアニメーション
      const opacity = Math.min(1, elapsed / duration);
      canvasCtx5RestCount.globalAlpha = 1 - opacity;
      // テキストの描画
      canvasCtx5RestCount.scale(-1, 1);
      canvasCtx5RestCount.fillStyle = "#ff4000";
      canvasCtx5RestCount.font = "350px Arial";
      let restCount = userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count;
      if (this.trainingType === "LegTraining") {    // 縦画面対応
        if (restCount / 10 < 10) {
          canvasCtx5RestCount.fillText(`${restCount}`, -285, 450);
        } else {
          canvasCtx5RestCount.fillText(`${restCount}`, -380, 450);
        }
      } else {                                      // 横画面対応
        if (restCount / 10 < 10) {
          canvasCtx5RestCount.fillText(`${restCount}`, -400, 315);
        } else {
          canvasCtx5RestCount.fillText(`${restCount}`, -540, 315);
        }
      }
      if (elapsed < duration) {
        animationId = requestAnimationFrame(() => fadeOutText(startTime));
      } else {
        canvasCtx5RestCount.globalAlpha = 1.0; // 透過度を初期化
      }
      canvasCtx5RestCount.scale(-1, 1);
    }

    // const drawCount = (count) => {
    //   canvasCtx5.scale(-1, 1);
    //   canvasCtx5.fillStyle = "#FF0000"; // 赤色のフォント
    //   canvasCtx5.font = "100px Arial"; // フォントサイズと種類
    //   canvasCtx5.fillText(`${count}`, -480, 220); // 現在の回数を描画
    //   canvasCtx5.scale(-1, 1);

    //   // 0.5秒後に描画をクリア
    //   setTimeout(() => {
    //     canvasCtx5.clearRect(-480, 220 - 100, 300, 150); // 描画をクリアする範囲を調整する可能性があります
    //   }, 500); // 500ミリ秒（0.5秒）後に実行
    // };

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

      if (this.state.count === goal_count) {
        CImage.src = CREAR;
        this.setState({
          buttonText: "完了!"
        })
        return
      }

      // 腕立て伏せ
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
            this.flag = true;
            this.stopTimeCount = 0;
          } else if (this.flag === true && this.angle < 90 && average_score > 0.6) {
            if (this.beforCount !== this.state.count) {
              fadeOutText(Date.now());
              this.beforCount = this.state.count;
            }
            this.setState({ count: this.state.count + 1 })
            // drawCount(this.state.count);
            this.flag = false;
            this.stopTimeCount = 0;
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
          if (this.flag === false && this.angle > 130 && average_score > 0.6) {
            this.flag = true;
            this.stopTimeCount = 0;
          } else if (this.flag === true && this.angle < 60 && average_score > 0.6) {
            if (this.beforCount !== this.state.count) {
              fadeOutText(Date.now());
              this.beforCount = this.state.count;
            }
            this.setState({ count: this.state.count + 1 })
            // drawCount(this.state.count);
            this.flag = false;
            this.stopTimeCount = 0;
          }
          // 初期化
          this.angleList = [];
          this.frameCount = 0;
        }

        // スクワット
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
          if (this.flag === false && this.angle > 150 && average_score > 0.6) {
            this.flag = true;
            this.stopTimeCount = 0;
          } else if (this.flag === true && this.angle < 100 && average_score > 0.6) {
            if (this.beforCount !== this.state.count) {
              fadeOutText(Date.now());
              this.beforCount = this.state.count;
            }
            this.setState({ count: this.state.count + 1 })
            // drawCount(this.state.count);
            this.flag = false;
            this.stopTimeCount = 0;
          }
          // 初期化
          this.angleList = [];
          this.frameCount = 0;
        }
      }

      // 縦画面対応 ------------------------
      canvasCtx5.scale(-1, 1);

      // UpとDownの詳細設定
      if (which === "LegTraining") {
        this.upConfig = { position: [-160, 510], size: [150, 150] };
        this.downConfig = { position: [-200, 510], size: [200, 200] };
      } else {
        this.upConfig = { position: [-180, 230], size: [150, 150] };
        this.downConfig = { position: [-210, 230], size: [200, 200] };
      }
      this.config = this.flag ? this.downConfig : this.upConfig;
      udImage.src = this.flag ? Down : Up;

      if (which === "LegTraining") {
        canvasCtx5.fillStyle = "#FFFFFF"; // 白色のフォント
        canvasCtx5.font = "40px Arial"; // フォントサイズと種類
        canvasCtx5.fillText("残り", -340, 540);
        if ((userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count) / 10 <= 10) {
          canvasCtx5.font = "120px Arial"; // フォントサイズと種類
          canvasCtx5.fillText(`${userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count}`, -335, 645);
        } else {
          canvasCtx5.font = "120px Arial"; // フォントサイズと種類
          canvasCtx5.fillText(`${userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count}`, -367, 645);
        }
      }
      // 横画面対応 ------------------------
      else {
        canvasCtx5.fillStyle = "#FFFFFF"; // 白色のフォント
        canvasCtx5.font = "40px Arial"; // フォントサイズと種類
        canvasCtx5.fillText("残り", -605, 270);
        if ((userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count) / 10 <= 10) {
          canvasCtx5.font = "120px Arial"; // フォントサイズと種類
          canvasCtx5.fillText(`${userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count}`, -605, 365);
        } else {
          canvasCtx5.font = "120px Arial"; // フォントサイズと種類
          canvasCtx5.fillText(`${userTrainingData[dayjs().format("YYYY/MM/DD")]["target"][this.trainingType] - this.state.count}`, -630, 365);
        }
      }
      canvasCtx5.scale(-1, 1);

      // // 経過時間を描画
      // canvasCtx5.scale(-1, 1);
      // canvasCtx5.fillStyle = "#FF0000"; // 赤色のフォント
      // canvasCtx5.font = "90px Arial"; // フォントサイズと種類
      // let timeString = this.state.totalTime.toString();
      // if (timeString.length === 1) {
      //   canvasCtx5.fillText(`${this.state.totalTime}`, -120, 470); // 経過時間を描画      
      // } else if (timeString.length === 2) {
      //   canvasCtx5.fillText(`${this.state.totalTime}`, -160, 470); // 経過時間を描画
      // } else if (timeString.length === 3) {
      //   canvasCtx5.fillText(`${this.state.totalTime}`, -210, 470); // 経過時間を描画
      // } else if (timeString.length === 4) {
      //   canvasCtx5.fillText(`${this.state.totalTime}`, -260, 470); // 経過時間を描画
      // }
      // canvasCtx5.fillText(`s`, -50, 470); // 経過時間を描画
      // canvasCtx5.scale(-1, 1);

      // // ストップ時間カウント
      // canvasCtx5.scale(-1, 1);
      // // canvasCtx5.rotate(90);
      // canvasCtx5.fillStyle = "#FF0000"; // 赤色のフォント
      // canvasCtx5.font = "100px Arial"; // フォントサイズと種類
      // canvasCtx5.fillText(`${this.stopTimeCount}`, -480, 275); // 停止時間を描画
      // canvasCtx5.scale(-1, 1);
      // // canvasCtx5.rotate(-90)
    }

    /** detectPose --------------------------------------------------------- 
    * カメラの情報を基に姿勢を検知する関数。
    * video に現在映っている情報、canvas にはcanvasElementが入っている。
    * 姿勢検知した座標の点を canvas に描き、video と重ねる事で表示が実現されている。
    * ----------------------------------------------------------------------- */
    const detectPose = async () => {

      let timer;
      // ストップウォッチを開始する関数
      const startStopwatch = () => {
        this.stopTimeCount++;
        if (this.stopTimeCount <= 5) {
          this.state.totalTime++;
        }
        timer = setTimeout(startStopwatch, 1000);
      };

      function zColor(data) { // ポーズのz座標から色を生成する関数
        const z = clamp(data.from.z + 0.5, 0, 1);
        return `rgba(255, 49, 80, 1)`;
      }

      function onResultsPose(results) { // ポーズ検出の結果を処理する関数

        canvasCtx5.save(); // キャンバスの状態を保存
        canvasCtx5.clearRect(0, 0, canvasCtx5.width, canvasCtx5.height); // キャンバスをクリア

        canvasCtx5RestCount.save(); // キャンバスの状態を保存
        canvasCtx5RestCount.clearRect(0, 0, canvasCtx5.width, canvasCtx5.height); // キャンバスをクリア

        // if (trainingType !== "LegTraining") {
        //   // canvasCtx5.rotate(-90)
        // }

        // const Image = results.image.getImageData()

        canvasCtx5.drawImage(results.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight,); // 画像を描画
        // canvasCtx5.drawImage(results.image, 0, 0, out5.width, out5.height, ); // 画像を描画

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
              0, `rgba(255, 132, 0)`);
            gradient.addColorStop(
              1.0, `rgba(255, 160, 72)`);
            return gradient;
          }
        });

        // ポーズの各部位ごとに異なる色でランドマークを描画
        drawLandmarks(
          canvasCtx5,
          Object.values(POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
          { color: zColor, fillColor: '#ffa048' }
        );
        drawLandmarks(
          canvasCtx5,
          Object.values(POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
          { color: zColor, fillColor: '#ffa048' }
        );
        drawLandmarks(
          canvasCtx5,
          Object.values(POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
          { color: zColor, fillColor: '#ffa048' }
        );




        canvasCtx5.restore(); // キャンバスの状態を復元

        // fix
        // testCTX.restore();
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
        width: window.innerWidth, // カメラの幅
        height: window.innerWidth / 4 * 3 // カメラの高さ
      });
      camera.start(); // カメラを起動
      // ストップウォッチを開始
      startStopwatch();
    }
    /** detectPose終わり ----------------------------------------------------------------------------------- */

    // ここでdetectPoseが実行される。 -------------------------------------------
    detectPose()

    if (this.trainingType !== "LegTraining") {
      this.canvasRef.current.style.transform = "rotate(90)"
    }

    return () => {
      this.canvasRef.current.style.transform = "rotate(270)"
    }

  }

  /* HTMLを返す -------------------------------------------------------------------------------- */
  render() {
    const userTrainingData = this.props.userTrainingData
    const userId = this.props.userId
    const cx = window.innerWidth > 900 ? window.innerWidth - 250 : window.innerWidth;
    const cy = window.innerWidth > 900 ? window.innerHeight : window.innerHeight;

    const width = window.innerWidth;
    const height = width / 4 * 3


    return (
      <div className='Main'>
        <div className='CameraWrapper'>
          <div className='batsu' onClick={
            async () => {
              userTrainingData[dayjs().format("YYYY/MM/DD")]["training"][this.trainingType] = this.state.count
              userTrainingData[dayjs().format("YYYY/MM/DD")]["totalTime"][this.trainingType] = this.state.totalTime

              // localStorage.setItem("userTrainingData", JSON.stringify(userTrainingData))
              await updateDoc(doc(collection(db, "TrainingData"), userId), { TrainingData: userTrainingData });
              this.props.onChangeStyle(false);
              window.location.href = "/"
            }
          }>
            ✕
          </div>
          <canvas ref={this.canvasRef} width={cx} height={cy} className='canvas' />
          <video ref={this.videoRef} autoPlay playsInline width={width} height={height} />

          {/* <canvas ref={this.testCanvasRef} width={this.testwidth} height={this.testheight} className='canvas' /> */}

          {/* <div className='TrainingCounter'>
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
              userTrainingData[dayjs().format("YYYY/MM/DD")]["totalTime"][this.trainingType] = this.state.totalTime

              // localStorage.setItem("userTrainingData", JSON.stringify(userTrainingData))
              await updateDoc(doc(collection(db, "TrainingData"), userId), { TrainingData: userTrainingData });
              this.props.onChangeStyle(false);
              window.location.href = "/"
            }
          }>{this.state.buttonText}</div> */}
        </div>
      </div>
    );
  }

}


PoseDetection.contextType = GlobalContext;
export default PoseDetection;