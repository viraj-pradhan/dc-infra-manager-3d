import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || !email.includes('@') || password.trim().length < 6) {
      return NextResponse.json(
        { message: 'Invalid email or password (min 6 characters).' },
        { status: 422 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists!' },
        { status: 422 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      theme: 'light',
    });

    return NextResponse.json(
      { message: 'User created successfully!', userId: newUser._id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
