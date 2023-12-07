import React, {useState, useRef } from 'react'
import { db, auth, provider } from '../index';
import { where, collection, getDocs, query, setDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword,
    createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

import dayjs from "dayjs";
import SignInWithGoogle from "../images/SignInWithGoogle.png";
import SignUpWithGoogle from "../images/SignUpWithGoogle.png";

function Login() {

    // const userList = 
    const [active, setActive] = useState(false);
    // const [UserId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [SecondPassword, setSecondPassword] = useState("");
    const [Title, setTitle] = useState("ログイン");
    const [Email, setEmail] = useState("");
    // const [AuthPassword, setAuthPassword] = useState("");

    
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

        // let base = 0;
        // let goals = {
        //     "筋肉量UP" : 30,
        //     "ダイエット" : 20,
        //     "健康維持" : 10
        // }
        // let frecency = {
        //     "0" : 10,
        //     "1" : 5,
        //     "2" : 0
        // }
        // if (genderRef.current.value === "男"){
        //     base += 10
        // }
        // base += goals[targetRef.current.value]
        // base += frecency[trainingRef.current.value]

        createUserWithEmailAndPassword(auth, Email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;
            const today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

            let base = 30

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

    const googleSignIn = async () => {

        signInWithRedirect(auth, provider)
        
        // signInWithPopup(auth, provider)
        // .then((result) => {
        //     // This gives you a Google Access Token. You can use it to access the Google API.
        //     const credential = GoogleAuthProvider.credentialFromResult(result);
        //     const token = credential.accessToken;
        //     // The signed-in user info.
        //     const user = result.user;

        //     console.log(token, user)
        //     // IdP data available using getAdditionalUserInfo(result)
        //     // ...
        // }).catch((error) => {
        //     // Handle Errors here.
        //     const errorCode = error.code;
        //     const errorMessage = error.message;
        //     // The email of the user's account used.
        //     const email = error.customData.email;
        //     // The AuthCredential type that was used.
        //     const credential = GoogleAuthProvider.credentialFromError(error);

        //     console.log(errorMessage)
        //     // ...
        // });
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
            <div onClick={googleSignIn}><img src={SignInWithGoogle} alt='Google' className='googleImage'></img></div>
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
            

            <div onClick={googleSignIn}><img src={SignUpWithGoogle} alt='Google' className='googleImage'></img></div>


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