import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import z from "zod"
import { StructuredOutputParser } from "@langchain/core/output_parsers"

const appointmentAnalysisParser = StructuredOutputParser.fromZodSchema(
  z.object({
    summary: z.string().describe("A short medical summary"),
    judgment: z
      .enum(["Normal", "Monitor", "Critical"])
      .describe("Medical evaluation of the case"),
    reason: z.string().describe("Explanation for the judgment"),
  })
)

const templateString = `You are a medical assistant analyzing an appointment record.
Given the following details:

Symptoms: {symptoms}
Diagnosis: {diagnosis}
Instructions: {instructions}
Vitals:
- Blood Pressure: {bloodPressure}
- Heart Rate: {heartRate}
- Temperature: {temperature}
- Oxygen Saturation: {oxygenSaturation}

1. Briefly summarize the case.
2. Provide additional medical information including:
   - Recommended medicines
   - Dosages and frequency
   - Any lifestyle or dietary advice
   - An AI-generated prescription suitable for the case

3. Provide a final judgment: "Normal", "Monitor", or "Critical".

{format_instructions}`

export async function getAIAnalysis(appointment: any): Promise<any> {
  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.NEXT_GOOGLE_GEMINI_API_KEY!,
      temperature: 0,
      model: "gemini-2.5-flash",
    })

    const formatInstructions = appointmentAnalysisParser.getFormatInstructions()
    const prompt = PromptTemplate.fromTemplate(templateString)
    appointment = appointment.appointment

    const chain = RunnableSequence.from([
      {
        symptoms: () => appointment.symptoms || "Not provided",
        diagnosis: () => appointment.diagnosis || "Not provided",
        instructions: () => appointment.instructions || "Not provided",
        bloodPressure: () => appointment.bloodPressure || "Not provided",
        heartRate: () => appointment.heartRate?.toString() || "Not provided",
        temperature: () =>
          appointment.temperature?.toString() || "Not provided",
        oxygenSaturation: () =>
          appointment.oxygenSaturation?.toString() || "Not provided",
        format_instructions: () => formatInstructions,
      },
      prompt,
      model,
      async (response) => {
        try {
          console.log("Model response:", response.content)
          return await appointmentAnalysisParser.parse(response.content)
        } catch (error) {
          console.error("Parsing error:", error)
          return {
            summary: "Could not parse analysis",
            judgment: "Monitor",
            reason: "Error parsing model output.",
          }
        }
      },
    ])

    return await chain.invoke(appointment)
  } catch (error) {
    console.error("AI analysis error:", error)
    return {
      summary: "Analysis failed",
      judgment: "Monitor",
      reason: "Model invocation error",
    }
  }
}
