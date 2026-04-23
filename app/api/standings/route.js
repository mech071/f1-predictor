import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
  const client = await clientPromise
  const db = client.db("F1Predictor")
  const collection = db.collection("standings")

  const data = await collection.find({}).sort({ points: -1 }).toArray();
  return NextResponse.json(data)
}