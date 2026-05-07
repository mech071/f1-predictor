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
    return NextResponse.json(
        {
            message: "Successful",
            predictions: predictions.predictions,
        },
        { status: 200 }
    )
}