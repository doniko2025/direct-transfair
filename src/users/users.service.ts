// apps/backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import type { UserRole } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // 👇 important : on accepte le rôle
  create(email: string, passwordHash: string, role: UserRole): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
      },
    });
  }
}
