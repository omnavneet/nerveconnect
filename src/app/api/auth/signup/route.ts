// import { PrismaClient } from "@prisma/client"
// import bcrypt from "bcrypt"
// import { createJWT } from "../../../libs/auth"
// import { cookies } from "next/headers"
// import { NextResponse } from "next/server"

// const prisma = new PrismaClient()

// export async function POST(req: Request) {
//   const formData = await req.formData()
//   const name = formData.get("userName")?.toString() || ""
//   const userName = formData.get("userName")?.toString() || ""
//   const email = formData.get("email")?.toString() || ""
//   const password = formData.get("password")?.toString() || ""

//   const existing = await prisma.user.findUnique({ where: { email } })

//   if (existing) {
//     return NextResponse.json({ error: "User already exists" }, { status: 400 })
//   }

//   const hashedPassword = await bcrypt.hash(password, 10)

//   const user = await prisma.user.create({
//     data: { name, email, password: hashedPassword },
//   })

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
