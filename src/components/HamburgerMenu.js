import React, {useState} from 'react'
import { HamburgerMenuData } from './SidebarData'
import Sidebar from './Sidebar';

function HamburgerMenu() {

    const PageData = HamburgerMenuData[window.location.pathname];
    const [active, setActive] = useState(false);

    const classToggle = () => {
        setActive(!active)
    }

    const logOut = () => {
        localStorage.setItem("Login", "no");
        window.location.reload();
    }

  return (
    <>
    <div className='header'>
        <div className='HamburgerMenu'>
            <div
                className='nav-toggle'
                id={active ? "active" : ""}
                onClick={classToggle}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        <div className='headerIcon'>{PageData["icon"]}</div>
        <div className='headerTitle'>{PageData["title"]}</div>
        <div className='headerLogout' onClick={logOut}>ログアウト</div>
    </div>
    <div className='Subbar' id={active ? "active" : ""}>
        <div className='overlay' onClick={classToggle}>
            <Sidebar />
        </div>
    </div>
    </>
  )
}

export default HamburgerMenu
