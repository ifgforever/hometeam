import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, inviteCode, avatar } = await request.json();

    if (!name || !email || !password || !inviteCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { inviteCode: inviteCode.toUpperCase() } });
    if (!family) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const member = await prisma.member.create({
      data: {
        familyId: family.id,
        name,
        email,
        password: hashedPassword,
        role: 'member',
        avatar: avatar || '🙂',
      },
    });

    const token = generateToken(member.id);

    const response = NextResponse.json({
      member: { id: member.id, name: member.name, role: member.role },
      family: { id: family.id, name: family.name },
    }, { status: 201 });

    response.cookies.set('ht_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Join error:', error);
    return NextResponse.json({ error: 'Failed to join family' }, { status: 500 });
  }
}
