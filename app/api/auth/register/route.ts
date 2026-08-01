import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken, generateInviteCode } from '@/lib/auth';
import { seedBadges } from '@/lib/badges';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, familyName, avatar } = await request.json();

    if (!name || !email || !password || !familyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    await seedBadges();

    const inviteCode = generateInviteCode();
    const hashedPassword = await hashPassword(password);

    const family = await prisma.family.create({
      data: {
        name: familyName,
        inviteCode,
        members: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'parent',
            avatar: avatar || '👤',
          },
        },
      },
      include: { members: true },
    });

    const member = family.members[0];
    const token = generateToken(member.id);

    const response = NextResponse.json({
      member: { id: member.id, name: member.name, role: member.role },
      family: { id: family.id, name: family.name, inviteCode: family.inviteCode },
    }, { status: 201 });

    response.cookies.set('ht_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
