import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  UserRole,
  TicketStatus,
  TicketPriority,
  CommentVisibility,
  ActivityAction,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting database seed...");

  await db.activityLog.deleteMany();
  await db.comment.deleteMany();
  await db.ticket.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  const adminPassword = await hashPassword("admin123");
  const agentPassword = await hashPassword("agent123");
  const customerPassword = await hashPassword("customer123");

  const admin = await db.user.create({
    data: {
      email: "admin@example.com",
      name: "Alice Admin",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const agent1 = await db.user.create({
    data: {
      email: "agent1@example.com",
      name: "Bob Agent",
      password: agentPassword,
      role: UserRole.AGENT,
    },
  });

  const agent2 = await db.user.create({
    data: {
      email: "agent2@example.com",
      name: "Carol Support",
      password: agentPassword,
      role: UserRole.AGENT,
    },
  });

  const customer1 = await db.user.create({
    data: {
      email: "customer1@example.com",
      name: "David Customer",
      password: customerPassword,
      role: UserRole.CUSTOMER,
    },
  });

  const customer2 = await db.user.create({
    data: {
      email: "customer2@example.com",
      name: "Eva User",
      password: customerPassword,
      role: UserRole.CUSTOMER,
    },
  });

  console.log("👥 Created users");

  const categories = await Promise.all([
    db.category.create({ data: { name: "Technical Issue", color: "#EF4444" } }),
    db.category.create({ data: { name: "Billing", color: "#F59E0B" } }),
    db.category.create({ data: { name: "Feature Request", color: "#3B82F6" } }),
    db.category.create({ data: { name: "Account", color: "#8B5CF6" } }),
    db.category.create({ data: { name: "General Inquiry", color: "#6B7280" } }),
  ]);

  console.log("📂 Created categories");

  const ticketData: Array<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdById: string;
    assignedToId?: string;
    categoryId: string;
    createdAt: Date;
    resolvedAt?: Date;
  }> = [
    {
      title: "Cannot login to my account",
      description:
        "I have been trying to login for the past 2 hours but keep getting 'invalid credentials' error even though I am sure my password is correct. I tried resetting it but the reset email never arrived.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      createdById: customer1.id,
      categoryId: categories[3].id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      title: "Application crashes when uploading large files",
      description:
        "Every time I try to upload a file larger than 10MB, the application freezes and then crashes. I have tried with Chrome, Firefox and Edge - same result. This is blocking my workflow.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      createdById: customer2.id,
      assignedToId: agent1.id,
      categoryId: categories[0].id,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Incorrect charge on my invoice",
      description:
        "I was charged $99 instead of $49 for my monthly subscription. I am on the Basic plan and this has happened for the second time this month. Please investigate and refund the difference.",
      status: TicketStatus.WAITING_FOR_CUSTOMER,
      priority: TicketPriority.HIGH,
      createdById: customer1.id,
      assignedToId: agent2.id,
      categoryId: categories[1].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Request for dark mode",
      description:
        "Would it be possible to add a dark mode option to the interface? Working late at night the bright white background is quite straining on the eyes. Many users in the community forum have also requested this.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      createdById: customer2.id,
      categoryId: categories[2].id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Export to PDF not working",
      description:
        "The export to PDF button does nothing when clicked. I need to export my monthly reports urgently for a client meeting tomorrow.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      createdById: customer1.id,
      assignedToId: agent1.id,
      categoryId: categories[0].id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      title: "How to add team members?",
      description:
        "I purchased a Team plan but cannot figure out how to invite my colleagues. The documentation is not very clear on this. Can you walk me through the steps?",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      createdById: customer2.id,
      assignedToId: agent2.id,
      categoryId: categories[4].id,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Two-factor authentication not sending SMS",
      description:
        "I enabled 2FA on my account but the verification SMS never arrives. I have checked my phone number is correct. Without this I cannot access my account at all.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      createdById: customer1.id,
      assignedToId: agent2.id,
      categoryId: categories[3].id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      title: "API rate limit too restrictive",
      description:
        "We are building an integration and hitting the 100 requests/hour limit constantly. For our use case we need at least 1000 requests/hour. Is there an enterprise tier or a way to increase limits?",
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      createdById: customer2.id,
      categoryId: categories[2].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const tickets = await Promise.all(ticketData.map((data) => db.ticket.create({ data })));

  console.log("🎫 Created tickets");

  const appCrashTicket = tickets[1];

  await db.comment.create({
    data: {
      ticketId: appCrashTicket.id,
      authorId: agent1.id,
      body: "Hi! I can reproduce this issue on our end. It appears to be related to the file processing timeout. We are investigating.",
      visibility: CommentVisibility.PUBLIC,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  });

  await db.comment.create({
    data: {
      ticketId: appCrashTicket.id,
      authorId: agent1.id,
      body: "Internal note: This is hitting the 30s lambda timeout. Need to move file processing to background job. Estimate 2-3 days.",
      visibility: CommentVisibility.INTERNAL,
      createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
    },
  });

  await db.comment.create({
    data: {
      ticketId: appCrashTicket.id,
      authorId: customer2.id,
      body: "Thank you for looking into this! Any update on the timeline? This is really blocking us.",
      visibility: CommentVisibility.PUBLIC,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
  });

  const billingTicket = tickets[2];

  await db.comment.create({
    data: {
      ticketId: billingTicket.id,
      authorId: agent2.id,
      body: "I have reviewed your account and can see the discrepancy. Could you please confirm the last 4 digits of the credit card charged so I can escalate the refund?",
      visibility: CommentVisibility.PUBLIC,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("💬 Created comments");

  await db.activityLog.create({
    data: {
      ticketId: appCrashTicket.id,
      userId: admin.id,
      action: ActivityAction.TICKET_CREATED,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  await db.activityLog.create({
    data: {
      ticketId: appCrashTicket.id,
      userId: admin.id,
      action: ActivityAction.ASSIGNED_TO_CHANGED,
      metadata: { agentName: agent1.name },
      createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  });

  await db.activityLog.create({
    data: {
      ticketId: appCrashTicket.id,
      userId: agent1.id,
      action: ActivityAction.STATUS_CHANGED,
      metadata: { from: "OPEN", to: "IN_PROGRESS" },
      createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
    },
  });

  console.log("📋 Created activity logs");

  console.log("\n✅ Seed completed successfully!");
  console.log(`   - ${await db.user.count()} users`);
  console.log(`   - ${await db.category.count()} categories`);
  console.log(`   - ${await db.ticket.count()} tickets`);
  console.log(`   - ${await db.comment.count()} comments`);
  console.log(`   - ${await db.activityLog.count()} activity logs`);
  console.log("\n🔑 Demo credentials:");
  console.log("   Admin:    admin@example.com    / admin123");
  console.log("   Agent:    agent1@example.com   / agent123");
  console.log("   Customer: customer1@example.com / customer123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
