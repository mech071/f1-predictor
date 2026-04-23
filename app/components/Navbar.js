"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiF1 } from "react-icons/si"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"

const Navbar = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])
  const handleLogout = async () => {
    await signOut(auth)
    setOpen(false)
    router.replace("/")
  }
  const handleClose = () => setOpen(false)
  return (
    <>
      <nav className="h-16  border-b border-white/10 bg-[#010a16]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-full sm:px-6">
          
          <Link href="/" className="flex items-center gap-3">
            <SiF1 className="text-7xl text-red-600" />
            <span className="text-2xl font-semibold tracking-wide text-black dark:text-white">
              F1Predictor
            </span>
          </Link>
          {!loading && user && (
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-md hover:bg-black/10 text-white cursor-pointer transition delay-100 dark:hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
      </nav>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#0f172a] text-white transform transition-transform duration-300 z-50 flex flex-col
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-semibold">Menu</span>
          <button onClick={handleClose} className='cursor-pointer hover:bg-white/10 p-2'>
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col p-4 gap-3 ">
          <Link href="/dashboard/results" onClick={handleClose} className="p-2 rounded hover:bg-white/10 transition delay-100">
            Results
          </Link>
          <Link href="/dashboard/standings" onClick={handleClose} className="p-2 rounded hover:bg-white/10 transition delay-100">
            Standings
          </Link>
          <Link href="/dashboard/history" onClick={handleClose} className="p-2 rounded hover:bg-white/10 transition delay-100">
            History
          </Link>
        </div>
        <div className="mt-auto p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-sm px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition delay-100 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 z-40 text-white cursor-pointer"
        />
      )}
    </>
  )
}

export default Navbar