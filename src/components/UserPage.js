import React, { useState, useRef } from 'react'
import { db } from '..';
import { updateDoc, collection, doc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);


function UserPage(props) {
    const {personalData, userId} = props;

    const [height, setHeight] = useState(personalData.height);
    const [weight, setWeight] = useState(personalData.weight);
    const [age, setAge] = useState(personalData.age);

    const genderRef = useRef(personalData.gender);
    const trainingRef = useRef(personalData.frequency);
    const targetRef = useRef(personalData.goal);

    const savePersonalData = () => {

        const data = {
            height : height,
            weight : weight,
            age : age,
            gender : genderRef.current.value,
            frequency : trainingRef.current.value,
            target : targetRef.current.value
        }
        // console.log(data)

        updateDoc(doc(collection(db,"TrainingData"), userId), {
            personalData : data,
        }).then(() => {
            MySwal.fire("変更完了","","success")
        })
    }

    const getWeight = async () => {
        const ip = "10.77.112.45"
        const url = `http://${ip}:8000/`

        const response = await fetch(url, {
            mode: 'no-cors'
          }); // リクエスト先のURLを適切に変更

        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(result)
        // fetch(url, {
        //     method : "GET",
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
                
        //     }),
        // }).then(response => response.json()).then((result) => {
        //     console.log(result)
        // })
    }

    const inputFont = {
        fontSize: '20px',
    }

    const topStyle = {
        fontSize: '20px',
        margin: '15px',
    }

    const inputLabelStyle = {
        marginLeft: '20px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    };

    const inputStyle = {
        fontSize: '18px',
        marginLeft: '30px',
        width: '250px',
        textAlign: 'center',
    };

    const buttonStyle = {
        padding: '5px 40px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
    };

    return (

        <div className='Main'>
            <h2 style={topStyle}>ユーザ情報を変更できます。</h2>
            <div style={inputLabelStyle}>
                <label className='InputLabel' style={inputFont}>身長 : </label>
                <input
                    type='number'
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    style={inputStyle}
                    required
                ></input>
            </div>

            <div style={inputLabelStyle}>
                <label className='InputLabel' style={inputFont}>体重 : </label>
                <input
                    type='number'
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    style={inputStyle}
                    required
                ></input>
            </div>

            <div style={inputLabelStyle}>
                <label className='InputLabel' style={inputFont}>年齢 : </label>
                <input
                    type='number'
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    style={inputStyle}
                    required
                ></input>
            </div>

            <div style={inputLabelStyle}>
                <label className='InputLabel' style={inputFont}>性別 : </label>
                <select ref={genderRef} className='InputLabel' style={inputStyle}>
                    <option value={'男'}>男</option>
                    <option value={'女'}>女</option>
                    <option value={'その他'}>その他</option>
                </select>
            </div>

            <div style={inputLabelStyle}>
                <label className='InputLabel' style={inputFont}>頻度 : </label>
                <select ref={trainingRef} className='InputLabel' style={inputStyle}>
                    <option value={'0'}>習慣化している</option>
                    <option value={'1'}>たまに運動する</option>
                    <option value={'2'}>全くしない</option>
                </select>
            </div>

            <div style={inputLabelStyle}>
                <label className='InputLabel' style={inputFont}>目的 : </label>
                <select ref={targetRef} className='InputLabel' style={inputStyle}>
                    <option value={'筋肉量UP'}>筋肉量UP</option>
                    <option value={'ダイエット'}>ダイエット</option>
                    <option value={'健康維持'}>健康維持</option>
                </select>
            </div>

            <button className='LoginButton' type='submit' onClick={savePersonalData} style={buttonStyle}>
                設定
            </button>
        </div>
    )
}

export default UserPage
