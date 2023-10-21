// MediaPipeのPoseモデルを使用してポーズを検出
// HTML要素の取得
const video5 = document.getElementsByClassName('input_video5')[0]; // Webカメラの映像を表示するための要素
const out5 = document.getElementsByClassName('output5')[0]; // ポーズ検出の結果を表示するための要素
const controlsElement5 = document.getElementsByClassName('control5')[0]; // コントロールパネルを表示するための要素
const canvasCtx5 = out5.getContext('2d'); // キャンバスコンテキストを取得

// FPS (Frames Per Second) コントロールの設定
const fpsControl = new FPS(); // フレームレートを制御するオブジェクトを生成

// スピナー（読み込み中アイコン）の処理
const spinner = document.querySelector('.loading'); // スピナー要素を取得
spinner.ontransitionend = () => { // トランジションが終了すると非表示にする処理
  spinner.style.display = 'none';
};

// カラー関数 `zColor` の定義
function zColor(data) { // ポーズのz座標から色を生成する関数
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

// `onResultsPose` 関数の定義
function onResultsPose(results) { // ポーズ検出の結果を処理する関数
  document.body.classList.add('loaded'); // ページの読み込みが完了したことを示すクラスを追加
  fpsControl.tick(); // フレームレートを更新

  canvasCtx5.save(); // キャンバスの状態を保存
  canvasCtx5.clearRect(0, 0, out5.width, out5.height); // キャンバスをクリア
  canvasCtx5.drawImage(results.image, 0, 0, out5.width, out5.height); // 画像を描画

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
    // `muscle_counter` 関数の呼び出し
    muscle_counter(10, "PectoralTraining");
  }, // カメラのフレーム受け取り時にポーズ検出を行う設定
  width: 480, // カメラの幅
  height: 480 // カメラの高さ
});
camera.start(); // カメラを起動

// コントロールパネルの設定
new ControlPanel(controlsElement5, {
  selfieMode: true,
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
})
  .add([
    new StaticText({ title: 'MediaPipe Pose' }),
    fpsControl,
    new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new Toggle({ title: 'Upper-body Only', field: 'upperBodyOnly' }),
    new Toggle({ title: 'Smooth Landmarks', field: 'smoothLandmarks' }),
    new Slider({
      title: 'Min Detection Confidence',
      field: 'minDetectionConfidence',
      range: [0, 1],
      step: 0.01
    }),
    new Slider({
      title: 'Min Tracking Confidence',
      field: 'minTrackingConfidence',
      range: [0, 1],
      step: 0.01
    }),
  ])
  .on(options => {
    video5.classList.toggle('selfie', options.selfieMode);
    pose.setOptions(options);
  }); // コントロールパネルの設定と、オプション変更時の処理

  const video = this.videoRef.current;
  const canvas = this.canvasRef.current;

  // 角度計算関数
  const calculateAngleWithin180 = (Ax, Ay, Az, Bx, By, Bz, Cx, Cy, Cz) => {
    // ベクトルaを計算
    const vAx = Ax - Bx;
    const vAy = Ay - By;
    const vAz = Az - Bz;
    // ベクトルbを計算
    const vBx = Cx - Bx;
    const vBy = Cy - By;
    const vBz = Cz - Bz;
    // ベクトルaとベクトルbの内積を計算
    const dotAB = vAx * vBx + vAy * vBy + vAz * vBz;
    // ベクトルaの大きさを計算
    const sizeA = Math.sqrt(vAx * vAx + vAy * vAy + vAz * vAz);
    // ベクトルbの大きさを計算
    const sizeB = Math.sqrt(vBx * vBx + vBy * vBy + vBz * vBz);
    // cosθが1に非常に近い場合0度として扱う
    if (sizeA * sizeB === 0) {
        return 0;
    } else {
        // ベクトルaとベクトルbのなす角のcosθを計算
        let cosTheta = dotAB / (sizeA * sizeB);
        // cosθが[-1, 1]の範囲外になる可能性があるため、範囲内にクリップ
        cosTheta = Math.min(1, Math.max(-1, cosTheta));
        // ベクトルaとベクトルbのなす角のラジアンを計算
        let angleRad = Math.acos(cosTheta);
        // ベクトルaとベクトルbのなす角を度数法に変換
        let angleDeg = (180 / Math.PI) * angleRad;
        // 計算された角度を返す
        console.log(Math.round(angleDeg));
        return Math.round(angleDeg);
    }
  };

// 筋トレカウンター関数
const muscle_counter = (goal_count, which) => {
  // 各キーポイントを取得
  const rightShoulder = results.poseLandmarks[POSE_LANDMARKS_RIGHT_SHOULDER];
  const leftShoulder = results.poseLandmarks[POSE_LANDMARKS_LEFT_SHOULDER];
  const leftElbow = results.poseLandmarks[POSE_LANDMARKS_LEFT_ELBOW];
  const rightElbow = results.poseLandmarks[POSE_LANDMARKS_RIGHT_ELBOW];
  const leftWrist = results.poseLandmarks[POSE_LANDMARKS_LEFT_WRIST];
  const rightWrist = results.poseLandmarks[POSE_LANDMARKS_RIGHT_WRIST];
  const leftHip = results.poseLandmarks[POSE_LANDMARKS_LEFT_HIP];
  const rightHip = results.poseLandmarks[POSE_LANDMARKS_RIGHT_HIP];
  const leftKnee = results.poseLandmarks[POSE_LANDMARKS_LEFT_KNEE];
  const rightKnee = results.poseLandmarks[POSE_LANDMARKS_RIGHT_KNEE];
  const leftAnkle = results.poseLandmarks[POSE_LANDMARKS_LEFT_ANKLE];
  const rightAnkle = results.poseLandmarks[POSE_LANDMARKS_RIGHT_ANKLE];
  
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
  // 胸筋
  if (which === "PectoralTraining") {
    right_average_score = (
      rightShoulder.inFrameLikelihood + 
      rightElbow.inFrameLikelihood +
      rightWrist.inFrameLikelihood
    ) / 3
    left_average_score = (
      leftShoulder.inFrameLikelihood + 
      leftElbow.inFrameLikelihood +
      leftWrist.inFrameLikelihood
    ) / 3
    if (left_average_score <= right_average_score) {
      average_score = right_average_score
      angle = calculateAngleWithin180(
        rightShoulder.x, rightShoulder.y, rightShoulder.z,
        rightElbow.x, rightElbow.y, rightElbow.z,
        rightWrist.x, rightWrist.y, rightWrist.z,
      );
    }
    else {
      average_score = left_average_score
      angle = calculateAngleWithin180(
        leftShoulder.x, leftShoulder.y, leftShoulder.z,
        leftElbow.x, leftElbow.y, leftElbow.z,
        leftWrist.x, leftWrist.y, leftWrist.z,
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
      rightShoulder.inFrameLikelihood + 
      rightHip.inFrameLikelihood +
      rightKnee.inFrameLikelihood
    ) / 3
    left_average_score = (
      leftShoulder.inFrameLikelihood + 
      leftHip.inFrameLikelihood +
      leftKnee.inFrameLikelihood
    ) / 3
    if (left_average_score <= right_average_score) {
      average_score = right_average_score
      angle = calculateAngleWithin180(
        rightShoulder.x, rightShoulder.y, rightShoulder.z,
        rightHip.x, rightHip.y, rightHip.z,
        rightKnee.x, rightKnee.y, rightKnee.z,
      );
    }
    else {
      average_score = left_average_score
      angle = calculateAngleWithin180(
        leftShoulder.x, leftShoulder.y, leftShoulder.z,
        leftHip.x, leftHip.y, leftHip.z,
        leftKnee.x, leftKnee.y, leftKnee.z,
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
      rightShoulder.inFrameLikelihood + 
      rightHip.inFrameLikelihood +
      rightAnkle.inFrameLikelihood
    ) / 3
    left_average_score = (
      leftShoulder.inFrameLikelihood + 
      leftHip.inFrameLikelihood +
      leftAnkle.inFrameLikelihood
    ) / 3
    if (left_average_score <= right_average_score) {
      average_score = right_average_score
      angle = calculateAngleWithin180(
        rightShoulder.x, rightShoulder.y, rightShoulder.z,
        rightHip.x, rightHip.y, rightHip.z,
        rightAnkle.x, rightAnkle.y, rightAnkle.z,
      );
    }
    else {
      average_score = left_average_score
      angle = calculateAngleWithin180(
        leftShoulder.x, leftShoulder.y, leftShoulder.z,
        leftHip.x, leftHip.y, leftHip.z,
        leftAnkle.x, leftAnkle.y, leftAnkle.z,
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
  if (this.state.count === goal_count) {
    this.setState({
      buttonText: "完了!"
    });
  }
}

// `muscle_counter` 関数の呼び出し
// muscle_counter(10, "PectoralTraining");