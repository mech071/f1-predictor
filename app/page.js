"use client"

import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth"
import { auth, provider } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { motion } from "motion/react"

export default function Home() {
  const router = useRouter()
  const [uid, setUid] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)

  const loadingTexts = [
    "Box,box...",
    "We are checking...",
    "Contacting the world champion hotline...",
    "Waiting for Stroll to finish the race...",
    "Lights out and away we go..."
  ]

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && allowed) {
        router.replace("/dashboard")
      }
    })
    return () => unsub()
  }, [router, allowed])
  useEffect(() => {
    if (videoReady) return
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [videoReady])

  const handleLogin = async () => {
    setError("")

    if (!uid) {
      setError("Please enter your UID")
      return
    }

    try {
      setLoading(true)

      const result = await signInWithPopup(auth, provider)

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          uniqueId: uid,
          name: result.user.displayName,
        }),
      })

      let data = {}
      try {
        data = await res.json()
      } catch {}

      if (!res.ok) {
        await signOut(auth)
        setError(data.message || "Wrong account used")
        setLoading(false)
        return
      }

      setAllowed(true)
      router.replace("/dashboard")
    } catch (err) {
      console.error(err)
      setError("Login failed. Try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700 ${
          videoReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="mt-6 text-sm sm:text-base text-gray-300">
          {loadingTexts[loadingTextIndex]}
        </p>
      </div>
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => {
          setTimeout(() => setVideoReady(true), 300)
        }}
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/New 2026 F1 Opening Titles - FORMULA 1 (1080p, h264, youtube).mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-10" />
      <div className="relative z-20 text-white">
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4 sm:gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight"
          >
            F1 Predictor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-sm sm:text-base md:text-xl text-gray-300 max-w-md"
          >
            Introducing PWC - Predictor's World Championship
          </motion.p>
        </section>
        <section className="min-h-screen flex items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md border border-white/10 bg-zinc-900/60 backdrop-blur-md p-5 sm:p-6 md:p-8 shadow-lg flex flex-col gap-5 sm:gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Enter UID</label>
              <input
                value={uid}
                onChange={(e) => {
                  setError("")
                  setUid(e.target.value.replace(/\s/g, ""))
                }}
                className="bg-zinc-800 px-3 sm:px-4 py-2.5 rounded outline-none focus:ring-1 focus:ring-white/30 text-sm sm:text-base"
              />
            </div>
            {error && (
              <div className="text-red-500">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition rounded cursor-pointer
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-black"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              <FcGoogle className="text-xl" />
              {loading ? "Signing in..." : "Login with Google"}
            </button>
          </motion.div>
        </section>

      </div>
    </div>
  )
}