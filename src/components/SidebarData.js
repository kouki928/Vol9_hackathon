import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export const SidebarData = [
    {
        title : "ホーム",
        icon  : <HomeIcon />,
        link  : "/",
    },
    {
        title : "カレンダー",
        icon  : <CalendarMonthIcon />,
        link  : "/calendar"
    },
    
    {
        title : "グラフ",
        icon  : <BarChartIcon />,
        link  : "/graph"
    },
    {
        title : "特典",
        icon  : <LocalOfferIcon />,
        link  : "/setting"
    },
]

export const HamburgerMenuData = {
    "/" : {
        title : "ホーム",
        icon  : <HomeIcon />,
    },
    "/calendar" : {
        title : "カレンダー",
        icon  : <CalendarMonthIcon />,
    },
    "/graph" : {
        title : "グラフ",
        icon  : <BarChartIcon />,
    },
    "/setting" : {
        title : "特典",
        icon  : <LocalOfferIcon />,
    },
    "/training" : {
        title : "トレーニング",
        icon  : <VideocamIcon />
    },
    // "/training%3Fclassification=%E8%83%B8%E7%AD%8B" : {
    //     title : "トレーニング",
    //     icon  : <VideocamIcon />
    // },
    // "/training%3Fclassification=%E8%B6%B3%E7%AD%8B" : {
    //     title : "トレーニング",
    //     icon  : <VideocamIcon />
    // }
}