import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import VideocamIcon from '@mui/icons-material/Videocam';

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
        title : "詳細設定",
        icon  : <SettingsIcon />,
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
        title : "詳細設定",
        icon  : <SettingsIcon />,
    },
    "/training" : {
        title : "トレーニング",
        icon  : <VideocamIcon />
    }
}