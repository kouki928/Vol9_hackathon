import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar,Line } from 'react-chartjs-2';
// import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


/**
 * 表示したいグラフ：
 * - 筋トレ回数（種類ごとに色分けした累積回数を表示するグラフ）/ 
 * - 消費カロリー
 * - 累計積み上げグラフ
 */

function Graph() {

    const BarOptions = {
        plugins: {
            title: {
                display: true,
                text: '筋トレ回数',
            },
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    

    const LineOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
            display: true,
            text: '累計回数',
          },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    const CalgraphOption = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
            display: true,
            text: '推定消費カロリー',
          },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };
        
    const labels = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

    const TrainingData = [
        10, 20, 30, 40, 50, 60, 70, 60, 50, 40, 30, 20
    ];

    let CumulativeSum = [];
    for (var i=0; i < TrainingData.length; i++) {
        if (i === 0){
            CumulativeSum.push(TrainingData[i]);
        }else {
            CumulativeSum.push(CumulativeSum[i-1]+TrainingData[i]);
        }
    }


        
    const BarData = {
        labels,
        datasets: [
            {
                label: '腹筋',
                data: labels.map((value,key) => TrainingData[key]),
                backgroundColor: 'rgb(255, 99, 132)',
            },
            {
                label: '腕立て伏せ',
                data: labels.map((value,key) => TrainingData[key]),
                backgroundColor: 'rgb(75, 192, 192)',
            },
            {
                label: 'スクワッド',
                data: labels.map((value,key) => TrainingData[key]),
                backgroundColor: 'rgb(53, 162, 235)',
            },
            {
                label : "背筋",
                data : labels.map((value,key) => TrainingData[key]),
                backgroundColor: "rgb(12, 100, 240)",
            }
        ]
    }

    const LineData = {
        labels : [1,2,3,4,5,6,7,8,9,10,11,12],
        datasets : [
            {
                label: '腹筋',
                data: labels.map((value,key) => CumulativeSum[key]),
                backgroundColor: 'rgb(255, 99, 132)',
            },
            {
                label: '腕立て伏せ',
                data: labels.map((value,key) => TrainingData[key]),
                backgroundColor: 'rgb(75, 192, 192)',
            },
            {
                label: 'スクワッド',
                data: labels.map((value,key) => TrainingData[key]),
                backgroundColor: 'rgb(53, 162, 235)',
            },
            {
                label : "背筋",
                data : labels.map((value,key) => TrainingData[key]),
                backgroundColor: "rgb(12, 100, 240)",
            }
        ]
    }

    const CalgraphData = {
        labels,
        datasets : [
            {
                label : "消費カロリー",
                data : labels.map((value,key) => TrainingData[key]),
                backgroundColor: 'rgb(255, 99, 132)',
            }
        ]
    }

    return (
        <div className="GraphContents Main">
            <div className="GraphContent">
                <Bar options={BarOptions} data={BarData} height={300} width={500}/>
            </div>
            <div className="GraphContent">
                <Line options={LineOptions} data={LineData} height={300} width={500}/>
            </div>
            <div className="GraphContent">
                <Line options={CalgraphOption} data={CalgraphData} height={300} width={500}/>
            </div>
        </div>
    )

}

export default Graph