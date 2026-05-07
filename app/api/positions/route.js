import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
    const { uniqueId, racename } = await request.json()
    const client = await clientPromise
    const db = client.db("F1Predictor")
    const collection = db.collection("predictions")
    const predictions = await collection.findOne(
        {
            uniqueId,
            racename
        }
    )
    const url = "https://api.jolpi.ca/ergast/f1/current/last/results.json"
    const res = await fetch(url)
    const data = await res.json()
    const results = data.MRData.RaceTable.Races[0].Results
    const actual = results.slice(0, 5).map(r => r.Driver.code)
    let arr = []
    for (let i = 0; i < 5; i++) {
        if (predictions.predictions[i] === actual[i]) {
            arr[i]=2
        } else if (actual.includes(predictions.predictions[i])) {
            arr[i]=1
        }
        else arr[i]=0
    }
    return NextResponse.json(
        {
            message: "Successful",
            result: arr,
        },
        { status: 200 }
    )
}