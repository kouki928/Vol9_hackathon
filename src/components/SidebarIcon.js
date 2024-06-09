import React from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function SidebarIcon(props) {
  const {userId} = props
  console.log(userId)
  return (
    <div className='SidebarIcon'>
      {/* <img src={AccountCircleIcon}></img> */}
      <div className='Icon'>
        < AccountCircleIcon />
      </div>
      <p>yourId : <br></br> {userId}</p>
    </div>
  )
}

export default SidebarIcon;
