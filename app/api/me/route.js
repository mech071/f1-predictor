import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
  const { firebaseUid } = await request.json()

  const client = await clientPromise
  const db = client.db("F1Predictor")
  const collection = db.collection("users")

  const user = await collection.findOne({ firebaseUid })

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    name: user.name,
    uniqueId: user.uniqueId
  })
}