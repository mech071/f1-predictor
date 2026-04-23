"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function Page() {
  const [name, setName] = useState("")
  const [uniqueId, setUniqueId] = useState("")
  const [loading, setLoading] = useState(true)
  const [stop, setstop] = useState(false)
  const [positions, setPositions] = useState(Array(5).fill(""))
  const [race, setRace] = useState(null)
  const [submitted, setsubmitted] = useState(false)
  const [wrongAccount, setWrongAccount] = useState(false)
  const handleChange = (index, value) => {
    const updated = [...positions]
    updated[index] = value
    setPositions(updated)
  }
  const router = useRouter()
  const raceData = async () => {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json")
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
  }
  const alrVoted = async () => {
    const res = await fetch("/api/predict/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uniqueId,
        racename: race?.name
      })
    })
    const data = await res.json()
    setsubmitted(data.submitted)
  }
  useEffect(() => {
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
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])
  useEffect(() => {
    if (uniqueId && race?.name) {
      alrVoted()
    }
  }, [uniqueId, race])
  const submit = async () => {
    if (!uniqueId) return

    setstop(true)

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueId,
          name,
          predictions: positions,
          racename: race?.name,
          round: race?.round
        })
      })
      const data = await res.json()
      console.log(data)
      if (res.ok) {
        setsubmitted(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setstop(false)
    }
  }
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#15151E] text-white flex flex-col items-center px-4 md:px-10">
      <h1 className="text-2xl md:text-3xl font-bold mt-8 md:mt-10 text-center">
        {loading ? "Loading..." : `Hello ${name}`}
      </h1>

      <div className="flex flex-col md:flex-row flex-1 w-full mt-6 gap-6 md:gap-10">

        <div className="flex-1 flex items-center justify-center">
          {submitted ? (
            <div className="bg-[#1c1c28] p-5 md:p-6 rounded-xl shadow-lg w-full max-w-md border border-[#2a2a3a] text-center flex flex-col gap-3">
              <h2 className="text-lg md:text-xl font-semibold text-rose-200">
                Your prediction has been recorded
              </h2>

              {race && (
                <p className="text-sm text-rose-300">
                  Round {race.round} {race.name}
                </p>
              )}

              <p className="text-sm text-rose-300">
                Check back after the race finishes to see your results.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="bg-[#1c1c28] p-5 md:p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-[#2a2a3a]"
            >
              <h2 className="text-lg md:text-xl font-semibold text-center text-amber-300">
                Predict Your Top 5
              </h2>

              {race && (
                <div className="flex flex-col gap-1 text-sm text-center">
                  <p className="font-medium text-yellow-300/90">
                    Round {race.round}: {race.name}
                  </p>
                  <p className="text-yellow-200 mt-1">{race.timeIST}</p>
                </div>
              )}

              {[1, 2, 3, 4, 5].map((pos, i) => (
                <div key={pos} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-300">
                    Position {pos}
                  </label>
                  <input
                    required
                    className="p-2 rounded bg-[#15151E] border border-[#2a2a3a] focus:outline-none focus:border-blue-500 text-sm md:text-base"
                    placeholder={`Enter driver for P${pos}`}
                    value={positions[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="mt-2 bg-red-600 hover:bg-red-700 transition rounded p-2 font-medium cursor-pointer text-sm md:text-base"
                disabled={stop}
              >
                {stop ? "Submitting" : "Submit your predictions"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}