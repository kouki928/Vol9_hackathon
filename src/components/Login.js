import React, {useState, useRef } from 'react'
import { db, auth } from '../index';
import { where, collection, getDocs, query, setDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword,
    createUserWithEmailAndPassword, } from "firebase/auth";

import dayjs from "dayjs";

function Login() {

    // const userList = 
    const [active, setActive] = useState(false);
    // const [UserId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [SecondPassword, setSecondPassword] = useState("");
    const [Title, setTitle] = useState("ログイン");
    const [Email, setEmail] = useState("");
    // const [AuthPassword, setAuthPassword] = useState("");

    const genderRef = useRef(null);
    const trainingRef = useRef(null);
    const targetRef = useRef(null);
    // const EmailRef = useRef(null);
    

    const classToggle = () => {
        setActive(!active);
        if (Title === "ログイン"){
            setTitle("ユーザー登録");
        }else{
            setTitle("ログイン");
        }
        
    }

    /**Email認証 ------------------------------------------------------------
     * Emailとpasswordでログインが出来るようにする。
     * Firebaseで動かす。
     ---------------------------------------------------------------------- */
    const signUp = async () => {

        if (password !== SecondPassword) {
            alert("invalid password")
            return 0;
        }

        let base = 0;
        let goals = {
            "筋肉量UP" : 30,
            "ダイエット" : 20,
            "健康維持" : 10
        }
        let frecency = {
            "0" : 10,
            "1" : 5,
            "2" : 0
        }
        if (genderRef.current.value === "男"){
            base += 10
        }
        base += goals[targetRef.current.value]
        base += frecency[trainingRef.current.value]

        createUserWithEmailAndPassword(auth, Email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;
            const today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

            /**Userが既に存在するか判定 ------------------------------------------------- */
            getDocs(query(collection(db, "User"), where("UserId","==",uid)))
            .then(result => {
                if (result.docs.length === 0) {
                    setDoc(doc(db, "TrainingData", uid), {
                        TrainingData : {
                            [today] : {
                                target : {
                                    AbsTraining : base,
                                    LegTraining : base,
                                    PectoralTraining : base,
                                },
                                training : {
                                    AbsTraining : 0,
                                    LegTraining : 0,
                                    PectoralTraining : 0,
                                },
                                totalTime : {
                                    AbsTraining : 0,
                                    LegTraining : 0,
                                    PectoralTraining : 0
                                }
                            }
                        },
                    })
                }else{
                    alert("input other uid or pass.")
                }
            })
            
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage)
            console.log(errorCode,errorMessage)
        })
    }

    const signIn = async () => {
        signInWithEmailAndPassword(auth, Email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user.uid);
            console.log(auth.currentUser)
            // window.location.pathname = "/calender/"
            // alert("Login!")
            
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorCode,errorMessage)
            console.log(errorCode,errorMessage)
        })
    }

    return (
    <div className='Form'><div className='wrap'>

        <h2>{Title}</h2>

        <label className='InputLabel' >メールアドレス : </label>
        <input type='text' className='LoginUser' id='UserId' 
            value={Email}
            onChange={(event) => setEmail(event.target.value)} required>
        </input>

        <br></br>
        
        <label className='InputLabel'>パスワード : </label>
        <input type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)} required>
        </input>



        <div id={active ? "" : "active"} className='SignIn'>
            <div className='GuideButton'>
            <div onClick={signIn} className='LoginButton'>ログイン</div>
            <div onClick={classToggle} className='LRToggle'>ユーザー登録はこちら</div></div>
        </div>
        
        {/* ユーザー登録用フォーム追加 */}
        <div id={active ? "active" : ""} className='SignIn'>
            <label className='InputLabel'>パスワード(確認用) : </label>
            <input type='password' className='SecondPassword'
                value={SecondPassword}
                onChange={(event) => setSecondPassword(event.target.value)} required>
            </input>

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

            <div className='GuideButton'>
                <div className='LoginButton' onClick={signUp}> ユーザー登録</div>
                <div onClick={classToggle} className='LRToggle'>ログインはこちら</div>
            </div>
        </div>
    </div></div>
    )
}


export default Login




    // const LoginCheck = async () => {
    //     const querySnapshot = await getDocs(query(collection(db, "User"), where("UserId","==",UserId),where("password","==",password)));

    //     if (querySnapshot.docs.length === 1){
    //         localStorage.setItem("Login", "yes");
    //         localStorage.setItem("UserId", UserId);
    //         window.location.pathname = "/";
    //     }else{
    //         alert("ユーザーIDかパスワードが間違っています。");
    //     }
    // }

    // const RegistCheck = async () => {
    //     const querySnapshot = await getDocs(query(collection(db, "User"), where("UserId","==",UserId)));

    //     if (querySnapshot.docs.length === 0 && password === SecondPassword) {
    //         await setDoc(doc(db, "User", UserId), {
    //             "UserId" : UserId,
    //             "password" : password
    //         });
    //         localStorage.setItem("Login", "yes");
    //         localStorage.setItem("UserId", UserId);

    //         let base = 0;
    //         let goals = {
    //             "筋肉量UP" : 30,
    //             "ダイエット" : 20,
    //             "健康維持" : 10
    //         }
    //         let frecency = {
    //             "0" : 10,
    //             "1" : 5,
    //             "2" : 0
    //         }
    //         if (genderRef.current.value === "男"){
    //             base += 10
    //         }
    //         base += goals[targetRef.current.value]
    //         base += frecency[trainingRef.current.value]

    //         localStorage.setItem("base", base)

    //         window.location.pathname = "/"
    //     }else if (password !== SecondPassword){
    //         alert("パスワードが一致しません");
    //     }else {
    //         alert("そのユーザーIDは利用できません。別のものを登録してください。")
    //     }
    // }