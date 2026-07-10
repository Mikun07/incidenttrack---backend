import { prisma } from "../../src/lib/prisma.js";

export async function resetDatabase() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.actionItem.deleteMany(),
    prisma.postmortem.deleteMany(),
    prisma.incidentTimelineEntry.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany()
  ]);
}
