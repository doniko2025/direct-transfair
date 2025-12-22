// apps/backend/prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  try {
    // bcrypt (si installé)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require("bcrypt");
    return bcrypt.hash(plain, 10);
  } catch {
    // bcryptjs fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcryptjs = require("bcryptjs");
    return bcryptjs.hash(plain, 10);
  }
}

async function main() {
  const tenantCode = "DONIKO";
  const tenantName = "DONIKO";

  // 1) Tenant / Client
  const client = await prisma.client.upsert({
    where: { code: tenantCode },
    update: { name: tenantName },
    create: { code: tenantCode, name: tenantName },
  });

  // 2) Users seed (admin + user)
  const adminEmail = "admin@doniko.local";
  const userEmail = "user@doniko.local";

  const adminPasswordPlain = "Admin2025!";
  const userPasswordPlain = "User2025!";

  const [adminHash, userHash] = await Promise.all([
    hashPassword(adminPasswordPlain),
    hashPassword(userPasswordPlain),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      password: adminHash,
      clientId: client.id,
      firstName: "Admin",
      lastName: "DONIKO",
    },
    create: {
      email: adminEmail,
      password: adminHash,
      role: "ADMIN",
      clientId: client.id,
      firstName: "Admin",
      lastName: "DONIKO",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      role: "USER",
      password: userHash,
      clientId: client.id,
      firstName: "User",
      lastName: "DONIKO",
    },
    create: {
      email: userEmail,
      password: userHash,
      role: "USER",
      clientId: client.id,
      firstName: "User",
      lastName: "DONIKO",
    },
  });

  console.log("✅ Seed OK");
  console.log("Tenant:", { code: client.code, id: client.id });
  console.log("Admin:", { email: admin.email, role: admin.role });
  console.log("User:", { email: user.email, role: user.role });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
