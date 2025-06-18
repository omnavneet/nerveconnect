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

// src/app/api/auth/signup/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email.' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log(user);
    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[SIGNUP_ERROR]', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
