import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
  const { firebaseUid, name, uniqueId } = await request.json()
  const client = await clientPromise
  const db = client.db("F1Predictor")
  const collection = db.collection("users")
  const byFirebase = await collection.findOne({ firebaseUid })
  if (byFirebase) {
    return NextResponse.json({ message: "Login successful" }, { status: 200 })
  }
  const slot = await collection.findOne({ uniqueId })
  if (!slot) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 })
  }
  if (slot.firebaseUid && slot.firebaseUid !== firebaseUid) {
    return NextResponse.json({ message: "ID already used" }, { status: 403 })
  }
  await collection.updateOne(
    { uniqueId },
    { $set: { firebaseUid, name } }
  )

  return NextResponse.json({ message: "Login successful" }, { status: 200 })
}