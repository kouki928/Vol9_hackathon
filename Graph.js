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
import { Line } from 'react-chartjs-2';
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
 * - 1日ごとの筋トレ達成率
 * - 消費カロリー
 */

function Graph(props) {

    const { userTrainingData, personalData, weights } = props;

    const weight = Math.round(personalData.weight);

    // デイリー達成率グラフのオプション
    const RateOption = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'デイリー達成率',
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                max: 100, // ここで最大値を100に設定
                min: 0
            },
        },
    };

    // 消費カロリーグラフのオプション
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
                min: 0,
            },
        },
    };

    // 直近7日間の曜日ラベルを生成
    let WeekTrainingLabel = [];
    for (let i = 0; i < 7; i++) {
        WeekTrainingLabel.push(dayjs().add(-i, "day").format("MM/DD"));
    }
    WeekTrainingLabel.reverse();

    // デイリー達成率に使用する配列の作成 ------------------------------------------------------------------------------------
    // 直近7日間のトレーニングデータを取得し、各種目ごとに配列に整形
    let WeekAbsTrainingData = [];
    let WeekLegTrainingData = [];
    let WeekPectoralTrainingData = [];
    let TodayTrainingData = userTrainingData[dayjs().format("YYYY/MM/DD")]["training"];
    for (let i = 0; i < 7; i++) {
        if (userTrainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")] !== undefined) {
            TodayTrainingData = userTrainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")]["training"];
            WeekAbsTrainingData.push(TodayTrainingData["AbsTraining"]);
            WeekLegTrainingData.push(TodayTrainingData["LegTraining"]);
            WeekPectoralTrainingData.push(TodayTrainingData["PectoralTraining"]);
        } else {
            WeekAbsTrainingData.push(0);
            WeekLegTrainingData.push(0);
            WeekPectoralTrainingData.push(0);
        }
    }
    WeekAbsTrainingData.reverse();
    WeekLegTrainingData.reverse();
    WeekPectoralTrainingData.reverse();

    // 直近7日間の目標回数を取得し、各種目ごとに配列に整形
    let WeekAbsTargetData = [];
    let WeekLegTargetData = [];
    let WeekPectoralTargetData = [];
    let TodayTargetData = userTrainingData[dayjs().format("YYYY/MM/DD")]["target"];
    for (let i = 0; i < 7; i++) {
        if (userTrainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")] !== undefined) {
            TodayTargetData = userTrainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")]["target"];
            WeekAbsTargetData.push(TodayTargetData["AbsTraining"]);
            WeekLegTargetData.push(TodayTargetData["LegTraining"]);
            WeekPectoralTargetData.push(TodayTargetData["PectoralTraining"]);
        } else {
            WeekAbsTargetData.push(0);
            WeekLegTargetData.push(0);
            WeekPectoralTargetData.push(0);
        }
    }
    WeekAbsTargetData.reverse();
    WeekLegTargetData.reverse();
    WeekPectoralTargetData.reverse();

    // 一日ごとの達成率を算出＆配列に格納
    let RateData = [];
    for (let i = 0; i < 7; i++) {
        let dayTrainingSum = WeekAbsTrainingData[i] + WeekLegTrainingData[i] + WeekPectoralTrainingData[i];
        let dayTargetSum = WeekAbsTargetData[i] + WeekLegTargetData[i] + WeekPectoralTargetData[i];
        if (dayTargetSum !== 0) {
            RateData.push(Math.round((dayTrainingSum / dayTargetSum * 100) * 10) / 10);
        } else {
            RateData.push(0)
        }
    }
    RateData.reverse();

    // デイリー達成率グラフの作成
    const trainingRate = {
        labels: WeekTrainingLabel,
        datasets: [
            {
                label: "達成率（％）",
                data: WeekTrainingLabel.map((value, key) => RateData[key]),
                backgroundColor: 'rgb(70, 100, 255)',
            }
        ]
    }
    // デイリー達成率終了 --------------------------------------------------------------------------------------------------



    // 消費カロリーに使用する配列の作成 ------------------------------------------------------------------------------------
    // 直近7日間の1日ごとの合計運動時間を取得し、各種目ごとに配列に整形
    let WeekAbsTotalTimeData = [];
    let WeekLegTotalTimeData = [];
    let WeekPectoralTotalTimeData = [];
    let TodayTotalTimeData = userTrainingData[dayjs().format("YYYY/MM/DD")]["totalTime"];
    for (let i = 0; i < 7; i++) {
        if (userTrainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")] !== undefined) {
            TodayTotalTimeData = userTrainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")]["totalTime"];
            WeekAbsTotalTimeData.push(TodayTotalTimeData["AbsTraining"]);
            WeekLegTotalTimeData.push(TodayTotalTimeData["LegTraining"]);
            WeekPectoralTotalTimeData.push(TodayTotalTimeData["PectoralTraining"]);
        } else {
            WeekAbsTotalTimeData.push(0);
            WeekLegTotalTimeData.push(0);
            WeekPectoralTotalTimeData.push(0);
        }
    }
    WeekAbsTotalTimeData.reverse();
    WeekLegTotalTimeData.reverse();
    WeekPectoralTotalTimeData.reverse();

    // 一日ごとの消費カロリーを算出＆配列に格納
    /** 消費カロリーの計算方法
     * METs　×　体重（kg）　×　時間　×　1.05　＝　消費カロリー（kcal） */
    let CalData = [];
    let AbsCalData;
    let LegCalData;
    let PectoralCalData;
    let METs = 3.5; // 仮
    let WeekWeightData = [];
    let lastValidWeight = null;
    // 直近７日間の体重を取得
    for (let i = 0; i < 7; i++) {
        const currentWeight = weights[dayjs().subtract(i, 'day').format('YYYY/MM/DD')];
        if (currentWeight !== undefined) {
            WeekWeightData.push(Math.round(currentWeight));
        } else {
            WeekWeightData.push(Math.round(weight));
        }
    }
    WeekWeightData.reverse();

    for (let i = 0; i < 7; i++) {
        AbsCalData = METs * WeekWeightData[i] * ((WeekAbsTotalTimeData[i]) / 3600) * 1.05;
        LegCalData = METs * WeekWeightData[i] * ((WeekLegTotalTimeData[i]) / 3600) * 1.05;
        PectoralCalData = METs * WeekWeightData[i] * ((WeekPectoralTotalTimeData[i]) / 3600) * 1.05;
        CalData.push(Math.round((AbsCalData + LegCalData + PectoralCalData) * 10) / 10);
    }

    // 消費カロリーグラフの作成
    const CalgraphData = {
        labels: WeekTrainingLabel,
        datasets: [
            {
                label: "消費カロリー（kcal）",
                data: WeekTrainingLabel.map((value, key) => CalData[key]),
                backgroundColor: 'rgb(255, 99, 132)',
            },
        ],
    };
    // デイリー達成率終了 --------------------------------------------------------------------------------------------------

    // JSXの返却
    return (
        <div className="GraphContents Main">
            <div className="GraphContent">
                <Line options={RateOption} data={trainingRate} height={300} width={500} />
            </div>
            <div className="GraphContent">
                <Line options={CalgraphOption} data={CalgraphData} height={300} width={500} />
            </div>
        </div>
    );
}

export default Graph;