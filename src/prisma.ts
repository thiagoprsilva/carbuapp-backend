// Garantir que o prisma sempre sabe qual banco usar

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();