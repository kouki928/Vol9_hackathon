// import * as ort from "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/esm/ort.min.js";
// ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0-dev.20231129-38b640c797/dist/";

// export async function getData() {
//     try {
//         // create a new session and load the specific model.
//         //
//         // the model in this example contains a single MatMul node
//         // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
//         // it has 1 output: 'c'(float32, 3x3)
//         const session = await ort.InferenceSession.create('./userInfo_Pmodel.onnx');

//         const data = {

//             "APreviousDayCompletion": 0,
//             "APreviousDayTarget": 0,
//             "AWeeklyCompletion": 0,
//             "Age": "22",
//             "Frequency": "Moderate",
//             "Gender": "Male",
//             "Goal": "HealthMaintenance",
//             "Height": "168",
//             "LPreviousDayCompletion": 0,
//             "LPreviousDayTarget": 0,
//             "LWeeklyCompletion": 0,
//             "PPreviousDayCompletion": 0,
//             "PPreviousDayTarget": 0,
//             "PWeeklyCompletion": 0,
//             "Weight": "58"

//         }

//         const goal_bmi = {
//             "Male": { "MuscleStrength": 25.0, "WeightLoss": 22.0, "HealthMaintenance": 24.0 },
//             "Female": { "MuscleStrength": 23.0, "WeightLoss": 20.0, "HealthMaintenance": 22.0 }
//         };
      
//         // 辞書から必要な情報を取得
//         const Gender = data["Gender"];
//         const Frequency = data["Frequency"];
//         const Age = parseInt(data["Age"]);
//         const Goal = data["Goal"];
//         const Height = parseInt(data["Height"]);
//         const Weight = parseFloat(data["Weight"]);
      
//         // 目標BMIから理想体重を計算
//         const ideal_bmi = goal_bmi[Gender][Goal];
//         const idealWeight = Math.round(ideal_bmi * (Height / 100) ** 2, 1);
      
//         // 文字列を数値に置換
//         const gender_mapping = { "Male": 1, "Female": 2, "Other": 3 };
//         const goal_mapping = { "MuscleStrength": 1, "WeightLoss": 2, "HealthMaintenance": 3 };
//         const frequency_mapping = { "Low": 1, "Moderate": 2, "High": 3 };
//         const mappedGender = gender_mapping[Gender] || Gender;
//         const mappedGoal = goal_mapping[Goal] || Goal;
//         const mappedFrequency = frequency_mapping[Frequency] || Frequency;

//         // ALPを数値に変換
//         const APreviousDayCompletion = parseFloat(data["APreviousDayCompletion"]);
//         const AWeeklyCompletion = parseFloat(data["AWeeklyCompletion"]);
//         const APreviousDayTarget = parseFloat(data["APreviousDayTarget"]);
//         const LPreviousDayCompletion = parseFloat(data["LPreviousDayCompletion"]);
//         const LWeeklyCompletion = parseFloat(data["LWeeklyCompletion"]);
//         const LPreviousDayTarget = parseFloat(data["LPreviousDayTarget"]);
//         const PPreviousDayCompletion = parseFloat(data["PPreviousDayCompletion"]);
//         const PWeeklyCompletion = parseFloat(data["PWeeklyCompletion"]);
//         const PPreviousDayTarget = parseFloat(data["PPreviousDayTarget"]);

//         const new_data = new Float32Array([mappedGender, mappedFrequency, Age, mappedGoal, Height, Weight, idealWeight, APreviousDayCompletion, AWeeklyCompletion, APreviousDayTarget, LPreviousDayCompletion, LWeeklyCompletion, LPreviousDayTarget, PPreviousDayCompletion, PWeeklyCompletion, PPreviousDayTarget]);

//         console.log(session, "session")

//         // prepare inputs. a tensor need its corresponding TypedArray as data
//         // const dataA = Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
//         // const dataB = Float32Array.from([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
//         const tensorA = new ort.Tensor('float32', new_data, [1, 16]);
//         // const tensorB = new ort.Tensor('float32', dataB, [4, 3]);

//         // prepare feeds. use model input names as keys.
//         const feeds = { X: tensorA };

//         console.log(feeds, "feeds")

//         // feed inputs and run
//         const results = await session.run(feeds);

//         console.log(results, "results")

//         // read from results
//         const dataC = results.variable.data;
//         // document.write(`data of result tensor 'c': ${dataC}`)

//     } catch (e) {
//         // document.write(`failed to inference ONNX model: ${e}.`);
//     }
// }

// getData()