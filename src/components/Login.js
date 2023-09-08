import React, {useState } from 'react'
import { db } from '../App';
import { where, collection, getDocs, query, setDoc, doc } from "firebase/firestore";

function Login() {

    // const userList = 
    const [active, setActive] = useState(false);
    const [UserId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [SecondPassword, setSecondPassword] = useState("");
    const [Title, setTitle] = useState("ログイン");

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
            window.location.pathname = "/"
        }else if (password !== SecondPassword){
            alert("パスワードが一致しません");
        }else {
            alert("そのユーザーIDは利用できません。別のものを登録してください。")
        }
    }

    return (
    <div className='Form'><div className='wrap'>

        <h2>{Title}</h2>

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
        </div>
        
        {/* ユーザー登録用フォーム追加 */}
        <div id={active ? "active" : ""} className='SignIn'>
            <label className='InputLabel'>パスワード(確認用) : </label>
            <input type='password' className='SecondPassword'
                value={SecondPassword}
                onChange={(event) => setSecondPassword(event.target.value)} required>
            </input>

            <div className='GuideButton'>
                <div className='LoginButton' onClick={RegistCheck}> ユーザー登録</div>
                <div onClick={classToggle} className='LRToggle'>ログインはこちら</div>
            </div>
        </div>
    
    </div></div>
    )
}


export default Login
