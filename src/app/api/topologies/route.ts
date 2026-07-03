import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '../../../lib/db';
import Topology from '../../../models/Topology';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    const topologies = await Topology.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(topologies);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, devices, links } = await req.json();

    if (!name || !devices || !links) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    const newTopology = await Topology.create({
      userId,
      name,
      devices,
      links,
    });

    return NextResponse.json(newTopology, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing id' }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // Delete only if it belongs to the authenticated user
    const deleted = await Topology.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json({ message: 'Topology not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Topology deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
