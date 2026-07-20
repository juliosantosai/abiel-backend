import { PrismaClient } from "@prisma/client";

async function seedAgent() {
  const prisma = new PrismaClient();

  try {
    // Create or update agent for empresa-1 with echo-capability
    const agent = await prisma.agent.upsert({
      where: { id: "agent-echo-1" },
      create: {
        id: "agent-echo-1",
        empresaId: "empresa-1",
        name: "Echo Agent",
        description: "Simple echo agent for testing capability pattern",
        status: "ACTIVE",
        definition: {
          type: "echo",
          version: "1.0.0",
        },
        settings: {
          responseDelay: 0,
          includeOriginalMessage: true,
        },
        metadata: {
          capabilities: ["echo-capability"],
          createdFor: "testing",
        },
      },
      update: {
        name: "Echo Agent",
        description: "Simple echo agent for testing capability pattern",
        status: "ACTIVE",
        definition: {
          type: "echo",
          version: "1.0.0",
        },
        settings: {
          responseDelay: 0,
          includeOriginalMessage: true,
        },
        metadata: {
          capabilities: ["echo-capability"],
          updatedAt: new Date().toISOString(),
        },
      },
    });

    console.log("✓ Echo agent seeded:", agent);
    
    // Verify agent was created/updated
    const savedAgent = await prisma.agent.findUnique({
      where: { id: "agent-echo-1" },
    });
    
    console.log("✓ Agent verified in database:", {
      id: savedAgent?.id,
      name: savedAgent?.name,
      status: savedAgent?.status,
      empresaId: savedAgent?.empresaId,
    });
  } catch (error) {
    console.error("Error seeding agent:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAgent().catch(console.error);
