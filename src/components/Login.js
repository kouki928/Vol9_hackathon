import React, {useState, useRef } from 'react'
import { db, auth } from '../App';
import { where, collection, getDocs, query, setDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut,
    createUserWithEmailAndPassword, onAuthStateChanged, } from "firebase/auth"

function Login() {

    // const userList = 
    const [active, setActive] = useState(false);
    const [UserId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [SecondPassword, setSecondPassword] = useState("");
    const [Title, setTitle] = useState("ログイン");

    const genderRef = useRef(null);
    const trainingRef = useRef(null);
    const targetRef = useRef(null);

    const classToggle = () => {
        setActive(!active);
        if (Title === "ログイン"){
            setTitle("ユーザー登録");
        }else{
            setTitle("ログイン");
        }
        
    }

    const LoginCheck = async () => {
        const querySnapshot = await getDocs(query(collection(db, "User"), where("UserId","==",UserId),where("password","==",password)));

        if (querySnapshot.docs.length === 1){
            localStorage.setItem("Login", "yes");
            localStorage.setItem("UserId", UserId);
            window.location.pathname = "/";
        }else{
            alert("ユーザーIDかパスワードが間違っています。");
        }
    }

    const RegistCheck = async () => {
        const querySnapshot = await getDocs(query(collection(db, "User"), where("UserId","==",UserId)));

        if (querySnapshot.docs.length === 0 && password === SecondPassword) {
            await setDoc(doc(db, "User", UserId), {
                "UserId" : UserId,
                "password" : password
            });
            localStorage.setItem("Login", "yes");
            localStorage.setItem("UserId", UserId);

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

            localStorage.setItem("base", base)

            window.location.pathname = "/"
        }else if (password !== SecondPassword){
            alert("パスワードが一致しません");
        }else {
            alert("そのユーザーIDは利用できません。別のものを登録してください。")
        }
    }

    /**Email認証 ------------------------------------------------------------
     * Emailとpasswordでログインが出来るようにする。
     * Firebaseで動かす。
     ---------------------------------------------------------------------- */
    const signUp = async (event) => {
        try {
            event.preventDefault()
      
            // const email = 
            const password = el.inputPassword.value
            await createUserWithEmailAndPassword(auth, email, password)
          } catch (err) {
            el.errorMessage.innerHTML = err.message
            console.error(err)
          }
    }

    return (
    <div className='Form'><div className='wrap'>
        <form>
            <div>
                <label htmlFor="inputEmail">E-mail</label>
                <input type="email" name="inputEmail" id="inputEmail"></input>
            </div>
            <div>
                <label htmlFor="inputPassword">Password</label>
                <input type="password" name="inputPassword" id="inputPassword"></input>
            </div>
            <button type="submit" id="buttonSignin" aria-describedby="errorMessage" onClick={signIn}>Sign in</button>
            <p> or </p>
            <button type="button" id="buttonSignup" aria-describedby="errorMessage" onClick={signUp(this
                )}>Sign up</button>
            <p id="errorMessage"></p>
        </form>
{/* 
        <h1>How to sign in with email and password using Firebase Auth</h1>
        <section id="sectionSignin">
            <h2>Sign in / Sign up</h2>
            <form>
                <button type="submit" id="buttonSignin">Sign in</button>
            </form>
        </section>
        <section id="sectionUser">
            <h2>User information</h2>
            <dl>
                <dt>uid</dt>
                <dd id="uid"></dd>
            </dl>
        </section>
        <section id="sectionSignout">
            <h2>Sign out</h2>
            <button type="button" id="buttonSignout">Sign out</button>
        </section> */}

        {/* <h2>{Title}</h2>

        <label className='InputLabel'>ユーザーID : </label>
        <input type='text' className='LoginUser' id='UserId' 
            value={UserId}
            onChange={(event) => setUserId(event.target.value)} required>
        </input>

        <br></br>
        
        <label className='InputLabel'>パスワード : </label>
        <input type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)} required>
        </input>

        <div id={active ? "" : "active"} className='SignIn'>
            <div className='GuideButton'>
            <div onClick={LoginCheck} className='LoginButton'>ログイン</div>
            <div onClick={classToggle} className='LRToggle'>ユーザー登録はこちら</div></div>
        </div> */}
        
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
                <div className='LoginButton' onClick={RegistCheck}> ユーザー登録</div>
                <div onClick={classToggle} className='LRToggle'>ログインはこちら</div>
            </div>
        </div>
    </div></div>
    )
}


export default Login
