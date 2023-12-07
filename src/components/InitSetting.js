
import React, {useState, useRef } from 'react'

function InitSetting() {
    const genderRef = useRef(null);
    const trainingRef = useRef(null);
    const targetRef = useRef(null);
    return (
        <div>
            <label className='InputLabel'>性別 : </label>
            <select ref={genderRef}>
                <option value={"男"}>男</option>
                <option value={"女"}>女</option>
                <option value={"その他"}>その他</option>
            </select>

            <label className='InputLabel'>運動頻度 : </label>
            <select ref={trainingRef}>
                <option value={"0"}>習慣化している</option>
                <option value={"1"}>偶に運動する（規則性はない）</option>
                <option value={"2"}>全くしない</option>
            </select>

            <label className='InputLabel'>トレーニング目的 : </label>
            <select ref={targetRef}>
                <option value={"筋肉量UP"}>筋肉量UP</option>
                <option value={"ダイエット"}>ダイエット（体重を減らす）</option>
                <option value={"健康維持"}>健康維持</option>
            </select>
        </div>
    )
}

export default InitSetting
