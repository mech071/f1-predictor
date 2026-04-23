"use client"

import { useEffect, useState } from "react"

export default function Page() {
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/standings")
            if (!res.ok) throw new Error("Failed to fetch")
            const json = await res.json()
            setData(json)
        }
        fetchData().catch(console.error)
    }, [])

    if (!data) {
        return (<div className="min-h-[calc(100vh-64px)] bg-[#15151E] text-white flex items-center justify-center">
            Loading... </div>
        )
    }
    const getStyle = (rank) => {
        if (rank === 0)
            return "bg-yellow-500/20 border border-yellow-400 text-yellow-300 hover:bg-yellow-500/70"
        if (rank === 1)
            return "bg-gray-400/20 border border-gray-300 text-gray-200 hover:bg-gray-400/60"
        if (rank === 2)
            return "bg-orange-500/20 border border-orange-400 text-orange-300 hover:bg-orange-500/60"
        return "bg-[#1f1f2a] hover:bg-zinc-700"
    }
    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#15151E] text-white flex flex-col items-center p-6"> <h1 className="text-3xl font-bold mb-8 tracking-wide">
            Standings </h1>
            <div className="w-full max-w-md space-y-3">
                {data.map((player, i) => (
                    <div
                        key={player._id || player.name}
                        className={`flex justify-between items-center px-4 py-3 rounded-lg transition-all delay-100 duration-200 cursor-pointer ${getStyle(i)}`}
                    >
                        <span className="font-medium">
                            {i + 1}. {player.name}
                        </span>
                        <span className="font-semibold">{player.points}</span>
                    </div>
                ))}
            </div>
        </div>

    )
}
