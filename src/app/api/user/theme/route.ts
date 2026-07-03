import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '../../../../lib/db';
import User from '../../../../models/User';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { theme } = await req.json();
    if (theme !== 'light' && theme !== 'dark') {
      return NextResponse.json({ message: 'Invalid theme value' }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    await User.findByIdAndUpdate(userId, { theme });

    return NextResponse.json({ message: 'Theme updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
