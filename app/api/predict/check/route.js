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
  if(test) {
    return NextResponse.json(
    {submitted: true}
  )
  }
  return NextResponse.json(
    {submitted: false}
  )
}