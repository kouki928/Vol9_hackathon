import React from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function SidebarIcon() {
  const UserId = localStorage.getItem("UserId")
  return (
    <div className='SidebarIcon'>
      {/* <img src={AccountCircleIcon}></img> */}
      <div className='Icon'>
        < AccountCircleIcon />
      </div>
      <p>yourId : {UserId}</p>
    </div>
  )
}

export default SidebarIcon;
