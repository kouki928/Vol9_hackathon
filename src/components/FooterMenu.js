import React from 'react';
import { SidebarData } from './SidebarData';

function FooterMenu() {

    return (
        <div className='footer'>
            <div className='FooterWrapper'>
                {SidebarData.map((value,key) => {
                    return (
                        <div 
                            key={key}
                            className={window.location.pathname === value.link ? "CurrentPage" : "NotCurrentPage"}
                            onClick={() => {window.location.pathname = value.link}}>
                            <div className='FooterIcon'>{value.icon}</div>
                            <div className='FooterTitle'>{value.title}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default FooterMenu
