import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    const client = await clientPromise
    const db = client.db("F1Predictor")
    const predictionsCollection = db.collection("predictions")
    const standingsCollection = db.collection("standings")
    const url = "https://api.jolpi.ca/ergast/f1/current/last/results.json"
    const res = await fetch(url)
    const data = await res.json()
    const results = data.MRData.RaceTable.Races[0].Results
    const actual = results.slice(0, 5).map(r => r.Driver.code)
    const latestRace = data.MRData.RaceTable.Races[0]
    const raceName = latestRace.raceName
    const predictions = await predictionsCollection.find({
        racename: raceName,
        scored: { $ne: true }
    }).toArray()
    for (const userPrediction of predictions) {
        let score = 0
        for (let i = 0; i < 5; i++) {
            if (userPrediction.predictions[i] === actual[i]) {
                score += 2
            } else if (actual.includes(userPrediction.predictions[i])) {
                score += 1
            }
        }
        await standingsCollection.updateOne(
            { uniqueId: userPrediction.uniqueId },
            { $inc: { points: score } }
        )
        await predictionsCollection.updateOne(
            { _id: userPrediction._id },
            { $set: { scored: true } }
        )
    }
    return NextResponse.json({
        success: true,
        processedUsers: predictions.length
    })
}