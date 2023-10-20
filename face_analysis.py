# 表情認識
import cv2
import numpy as np

# モジュール読み込み
from openvino.inference_engine import IECore

# IEコアの初期化
ie = IECore()

#モデルの準備（顔検出）
model_face = 'C:/Users/iriku/Desktop/VSCode/大学/地域共創/open_model_zoo/tools/downloader/intel/face-detection-retail-0004/FP32/face-detection-retail-0004.xml'
weights_face = 'C:/Users/iriku/Desktop/VSCode/大学/地域共創/open_model_zoo/tools/downloader/intel/face-detection-retail-0004/FP32/face-detection-retail-0004.bin'

#モデルの準備（感情分類）
model_emotion = 'C:/Users/iriku/Desktop/VSCode/大学/地域共創/open_model_zoo/tools/downloader/intel/emotions-recognition-retail-0003/FP32/emotions-recognition-retail-0003.xml'
weights_emotion = 'C:/Users/iriku/Desktop/VSCode/大学/地域共創/open_model_zoo/tools/downloader/intel/emotions-recognition-retail-0003/FP32/emotions-recognition-retail-0003.bin'

# モデルの読み込み（顔検出）
net_face = ie.read_network(model=model_face, weights=weights_face)
exec_net_face = ie.load_network(network=net_face, device_name='CPU')

# モデルの読み込み（感情分類）
net_emotion = ie.read_network(model=model_emotion, weights=weights_emotion)
exec_net_emotion = ie.load_network(network=net_emotion, device_name='CPU')

# 入出力データのキー取得
input_blob_face = next(iter(net_face.input_info))
out_blob_face = next(iter(net_face.outputs))

input_blob_emotion = next(iter(net_emotion.input_info))
out_blob_emotion = next(iter(net_emotion.outputs))

# カメラ準備
cap = cv2.VideoCapture(0)

# メインループ
while True:
    ret, frame = cap.read()

    if ret == False:
      break

    # 入力データフォーマットへ変換
    img = cv2.resize(frame, (300, 300)) # サイズ変更
    img = img.transpose((2, 0, 1))      # HWC > CHW
    img = np.expand_dims(img, axis=0)   # 次元合せ

    # 推論実行
    out = exec_net_face.infer({input_blob_face: img})

    # 出力から必要なデータのみ取り出し
    out = out[out_blob_face]
    out = np.squeeze(out) #サイズ1の次元を全て削除

    # 検出されたすべての顔領域に対して１つずつ処理
    for detection in out:
        # conf値の取得
        confidence = float(detection[2])

        # バウンディングボックス座標を入力画像のスケールに変換
        xmin = int(detection[3] * frame.shape[1])
        ymin = int(detection[4] * frame.shape[0])
        xmax = int(detection[5] * frame.shape[1])
        ymax = int(detection[6] * frame.shape[0])

        # conf値が0.5より大きい場合のみ感情推論とバウンディングボックス表示
        if confidence > 0.5:
           # 顔検出領域は入力画像範囲内に補正(特にminは補正しないとエラーになる可能性)
            if xmin < 0:
                xmin = 0
            if ymin < 0:
                ymin = 0
            if xmax > frame.shape[1]:
                xmax = frame.shape[1]
            if ymax > frame.shape[0]:
                ymax = frame.shape[0]

            # 顔領域のみ切り出し
            frame_face = frame[ymin:ymax, xmin:xmax]

            # 入力データフォーマットへ変換
            img = cv2.resize(frame_face, (64, 64))   # サイズ変更
            img = img.transpose((2, 0, 1))    # HWC > CHW
            img = np.expand_dims(img, axis=0) # 次元合せ

            # 推論実行
            out = exec_net_emotion.infer({input_blob_emotion: img})

            # 出力から必要なデータのみ取り出し
            out = out[out_blob_emotion]
            out = np.squeeze(out) #不要な次元の削減

            # 出力値が最大のインデックスを得る
            index_max = np.argmax(out)

            # 各感情の文字列をリスト化
            list_emotion = ['neutral', 'happy', 'sad', 'surprise', 'anger']

            # 文字列描画
            cv2.putText(frame, list_emotion[index_max], (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 4)

            # バウンディングボックス表示
            cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color=(240, 180, 0), thickness=3)

            # 棒グラフ表示
            str_emotion = ['neu', 'hap', 'sad', 'sur', 'ang']
            text_x = 10
            text_y = frame.shape[0] - 180
            rect_x = 80
            rect_y = frame.shape[0] - 200
            for i in range(5):
                cv2.putText(frame, str_emotion[i], (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 1, (240, 180, 0), 2)
                cv2.rectangle(frame, (rect_x, rect_y), (rect_x + int(300 * out[i]), rect_y + 20), color=(240, 180, 0), thickness=-1)
                text_y = text_y + 40
                rect_y = rect_y + 40

            # １つの顔で終了
            break

    # 画像表示
    cv2.imshow('frame', frame)

    # 何らかのキーが押されたら終了
    key = cv2.waitKey(1)
    if key != -1:
        break

# 終了処理
cap.release()
cv2.destroyAllWindows()