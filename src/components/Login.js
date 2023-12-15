import React, {useState } from 'react'
import { db, auth, provider } from '../index';
import { where, collection, getDocs, query,} from "firebase/firestore";
import { signInWithEmailAndPassword,
    createUserWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import SignInWithGoogle from "../images/SignInWithGoogle.png";
import SignUpWithGoogle from "../images/SignUpWithGoogle.png";

function Login() {

    const [active, setActive] = useState(false);
    const [password, setPassword] = useState("");
    const [SecondPassword, setSecondPassword] = useState("");
    const [Title, setTitle] = useState("ログイン");
    const [Email, setEmail] = useState("");


    // ユーザ登録とログインを切り替える。 --------------------------------------------------
    // useState で値が変わるたびに html の class が変更される
    // これによって画面切り替えを行っている 
    // -----------------------------------------------------------------------------------//
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

        createUserWithEmailAndPassword(auth, Email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;
            // const today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

            // let base = 30

            /**Userが既に存在するか判定 ------------------------------------------------- */
            getDocs(query(collection(db, "User"), where("UserId","==",uid)))
            .then(result => {
                if (result.docs.length !== 0) {

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
            <div onClick={classToggle} className='LRToggle'>新規登録はこちら</div></div>
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
                <div className='LoginButton' onClick={signUp}> 新規登録</div>
                <div onClick={classToggle} className='LRToggle'>ログインはこちら</div>
            </div>
        </div>
    </div></div>
    )
}


export default Login