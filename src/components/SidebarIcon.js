import React from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function SidebarIcon() {
  return (
    <div className='SidebarIcon'>
      {/* <img src={AccountCircleIcon}></img> */}
      <div className='Icon'>
        < AccountCircleIcon />
      </div>
      <p>yourId : Null</p>
    </div>
  )
}

export default SidebarIcon;
