"use client"
import React, { useEffect, useState } from 'react'
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

const Page = () => {
  const [race, setRace] = useState(null)
  const [results, setResults] = useState([])
  const [predictions, setPredictions] = useState([])
  const [name, setName] = useState("")
  const [uniqueId, setUniqueId] = useState("")
  const [loading, setLoading] = useState(true)
  const [positionStatus, setPositionStatus] = useState([])
  const router = useRouter()

  useEffect(() => {
    const raceData = async () => {
      try {
        const res = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json")
        const data = await res.json()

        const r = data.MRData.RaceTable.Races[0]

        const utcDate = new Date(`${r.date}T${r.time}`)
        const istDate = utcDate.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short"
        })

        setRace({
          round: r.round,
          name: r.raceName,
          circuit: r.Circuit.circuitName,
          location: `${r.Circuit.Location.locality}, ${r.Circuit.Location.country}`,
          timeIST: istDate
        })

        setResults(r.Results.slice(0, 5))
      } catch (err) {
        console.error("Error fetching race data:", err)
      }
    }

    raceData()

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/")
        return
      }

      try {
        const res = await fetch("/api/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseUid: user.uid,
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setName(data.name)
          setUniqueId(data.uniqueId)
        }
      } catch (err) {
        console.error("User fetch failed:", err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [router])

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!uniqueId || !race?.name) return

      try {
        const res = await fetch("/api/predict/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uniqueId,
            racename: race.name
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setPredictions(data.predictions)
        }
      } catch (err) {
        console.error("Prediction fetch failed:", err)
      }
    }

    const bgchecker = async () => {
      if (!uniqueId || !race?.name) return

      try {
        const res = await fetch("/api/positions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uniqueId,
            racename: race.name
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setPositionStatus(data.result)
        }
      } catch (err) {
        console.error("Position fetch failed:", err)
      }
    }

    fetchPredictions()
    bgchecker()

  }, [uniqueId, race])

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#15151E] text-white flex flex-col items-center p-6">

      <h2 className="text-3xl font-bold mb-8 tracking-wide">
        Race Results
      </h2>

      {race && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-amber-300">
            Round {race.round}: {race.name}
          </h2>
        </div>
      )}

      <div className="w-full max-w-3xl">
        <div className="space-y-2">
          {results.map((driver) => (
            <div
              key={driver.position}
              className="bg-[#1F1F2E] px-4 py-3 rounded-lg flex justify-between items-center shadow-md"
            >
              <div>
                <p className="md:text-lg font-semibold">
                  P{driver.position} - {driver.Driver.givenName} {driver.Driver.familyName}
                </p>
                <p className="text-gray-400">
                  {driver.Constructor.name}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-400">
                  {driver.points} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-amber-300 mt-10 mb-4 text-3xl tracking-wide">
        Your Predictions
      </h1>

      <div className="w-full max-w-3xl mt-4">
        <div className="space-y-2">
          {predictions.map((driver, index) => {
            const status = Array.isArray(positionStatus)
              ? positionStatus[index] ?? 0
              : 0

            const bgColor =
              status === 2
                ? "bg-green-900"
                : status === 1
                  ? "bg-yellow-400/60"
                  : "bg-red-600/60"

            return (
              <div
                key={index}
                className={`${bgColor} px-4 py-3 rounded-lg flex justify-between items-center shadow-md`}
              >
                <p className="text-lg font-semibold">
                  P{index + 1} - {driver}
                </p>

                <p className="text-xl font-bold">
                  +{status}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Page