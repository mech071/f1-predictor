import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    const { uniqueId, racename } = await request.json()
    const client = await clientPromise
    const db = client.db("F1Predictor")
    const collection = db.collection("predictions")
    const test = await collection.findOne({
        uniqueId,
        racename
    })
    const url = "https://api.jolpi.ca/ergast/f1/current/last/results.json"
    const res = await fetch(url)
    const data = await res.json()
    const results = data.MRData.RaceTable.Races[0].Results
    const actual = results.map(r => r.Driver.code)
    let score = 0

    for (let i = 0; i < test.predictions.length; i++) {
        if (test.predictions[i] === actual[i]) {
            score += 2
        }
    }
    return NextResponse.json({
        score
    })
}