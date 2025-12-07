// apps/backend/src/users/users.service.ts
// apps/backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import type { UserRole } from '../auth/dto/register.dto';

type UserExtraFields = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressNumber?: string;
  addressStreet?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  nationality?: string;
  birthDate?: string;
  birthPlace?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------
  // 🔹 FIND BY EMAIL
  // ---------------------------------------------------------
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ---------------------------------------------------------
  // 🔹 FIND BY ID
  // ---------------------------------------------------------
  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // ---------------------------------------------------------
  // 🔹 CREATE USER (avec éventuels champs KYC)
  //
  // extra = { firstName, lastName, phone, addressNumber, ... }
  // ---------------------------------------------------------
  create(
    email: string,
    passwordHash: string,
    role: UserRole,
    clientId: number,
    extra: UserExtraFields = {},
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
        clientId,        // 🔗 lien vers le tenant (Client)
        ...extra,        // tous les champs KYC éventuels
      },
    });
  }
}
