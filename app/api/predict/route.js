import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
  const { predictions, name, uniqueId, racename } = await request.json()
  const client = await clientPromise
  const db = client.db("F1Predictor")
  const collection = db.collection("predictions")
  await collection.updateOne(
    { uniqueId },
    {
      $set: {
        racename,
        name,
        predictions,
      }
    },
    { upsert: true }
  )
  return NextResponse.json(
    { message: "Successful" },
    { status: 200 }
  )
}