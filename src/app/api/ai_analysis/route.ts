import { getAIAnalysis } from "@/app/libs/getAIAnalysis"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const appointment = await req.json()

    const result = await getAIAnalysis(appointment)

    return NextResponse.json({ result })
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 })
  }
}
