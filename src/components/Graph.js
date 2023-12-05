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
import dayjs from "dayjs";
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

function Graph(props) {

    const { userTrainingData } = props;

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
        
    let WeekTrainingLabel = [];
    for (var i=0; i<7; i++){
        WeekTrainingLabel.push(dayjs().add(-i,"day").format("MM/DD"))
    }
    WeekTrainingLabel.reverse();

    let WeekAbsTrainingData = [];
    let WeekLegTrainingData = [];
    let WeekPectoralTrainingData = [];
    let TodayTrainingData = userTrainingData[dayjs().format("YYYY/MM/DD")]["training"]
    for (i=0; i<7; i++){
        if (userTrainingData[dayjs().add(-i,"day").format("YYYY/MM/DD")] !== undefined){
            TodayTrainingData = userTrainingData[dayjs().add(-i,"day").format("YYYY/MM/DD")]["training"]
            WeekAbsTrainingData.push(TodayTrainingData["AbsTraining"])
            WeekLegTrainingData.push(TodayTrainingData["LegTraining"])
            WeekPectoralTrainingData.push(TodayTrainingData["PectoralTraining"])
        }else{
            WeekAbsTrainingData.push(0)
            WeekLegTrainingData.push(0)
            WeekPectoralTrainingData.push(0)
        }
        
    }
    WeekAbsTrainingData.reverse();
    WeekLegTrainingData.reverse();
    WeekPectoralTrainingData.reverse();


    const TrainingData = [30,20,30,30,65,20,20,20,20,12,44,43]
    let keyDays = Object.keys(userTrainingData).reverse().reverse()

    /**累計用 */
    let AbsCumulativeSum = [0];
    let LegCumulativeSum = [0];
    let PectoralCumulativeSum = [0];
    keyDays.forEach((value,key) => {
        AbsCumulativeSum.push(AbsCumulativeSum[key] + userTrainingData[value].training.AbsTraining);
        LegCumulativeSum.push(LegCumulativeSum[key] + userTrainingData[value].training.LegTraining);
        PectoralCumulativeSum.push(PectoralCumulativeSum[key] + userTrainingData[value].training.PectoralTraining);
    })

    keyDays.reverse().push(0)
    keyDays.reverse()
        
    const BarData = {
        labels : WeekTrainingLabel,
        datasets: [
            {
                label: '上体起こし',
                data: WeekTrainingLabel.map((value,key) => WeekAbsTrainingData[key]),
                backgroundColor: 'rgb(255, 99, 132)',
            },
            {
                label: '腕立て伏せ',
                data: WeekTrainingLabel.map((value,key) => WeekPectoralTrainingData[key]),
                backgroundColor: 'rgb(75, 192, 192)',
            },
            {
                label: 'スクワット',
                data: WeekTrainingLabel.map((value,key) => WeekLegTrainingData[key]),
                backgroundColor: 'rgb(53, 162, 235)',
            },
        ]
    }

    let labels = [1,2,3,4,5,6,7,8,9,10,11,12];

    const LineData = {
        labels : keyDays,
        datasets : [
            {
                label: '上体起こし',
                data: keyDays.map((value,key) => AbsCumulativeSum[key]),
                backgroundColor: 'rgb(255, 99, 132)',
            },
            {
                label: '腕立て伏せ',
                data: keyDays.map((value,key) => PectoralCumulativeSum[key]),
                backgroundColor: 'rgb(75, 192, 192)',
            },
            {
                label: 'スクワット',
                data: keyDays.map((value,key) => LegCumulativeSum[key]),
                backgroundColor: 'rgb(53, 162, 235)',
            }
        ]
    }


    const CalgraphData = {
        labels: [1,2,3,4,5,6,7,8,9,10,11,12],
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