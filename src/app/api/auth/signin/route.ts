// import { PrismaClient } from "@prisma/client"
// import { comparePasswords, createJWT } from "../../../libs/auth"
// import { cookies } from "next/headers"
// import { NextResponse } from "next/server"

// const prisma = new PrismaClient()

// export async function POST(req: Request) {
//   const formData = await req.formData()
//   const userName = formData.get("userName")?.toString() || ""
//   const password = formData.get("password")?.toString() || ""

//   const user = await prisma.user.findFirst({ where: { name: userName } })
//   if (!user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 })
//   }

//   const isValid = await comparePasswords(password, user.password)
//   if (!isValid) {
//     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//   }

//   const token = createJWT(user)
//   const cookieStore = await cookies()
//   cookieStore.set("auth_token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     maxAge: 7 * 24 * 60 * 60,
//   })

//   return NextResponse.json({ token })
// }
