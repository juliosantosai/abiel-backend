import { describe, it, expect } from "vitest";
import { createAgentRequest } from "../../src/shared/ai/agent-request";
import { createAgentResponse } from "../../src/shared/ai/agent-response";
import { createAgentResult } from "../../src/shared/ai/agent-result";
import { AgentRuntimeError } from "../../src/shared/ai/agent-runtime-error";
import type { AgentRuntime } from "../../src/shared/ai/agent-runtime";

describe("AgentRuntime contract", () => {
  it("creates immutable request/response/result objects and serializes", () => {
    const req = createAgentRequest({ tenantId: "t1", agentId: "a1", input: "hello" });
    expect(Object.isFrozen(req)).toBe(true);
    // serialization
    const json = JSON.parse(JSON.stringify(req));
    expect(json.tenantId).toBe("t1");

    const res = createAgentResponse({ output: "ok", usage: { tokens: 10 } });
    expect(Object.isFrozen(res)).toBe(true);
    const result = createAgentResult({ success: true, response: res });
    expect(Object.isFrozen(result)).toBe(true);
    const rjson = JSON.parse(JSON.stringify(result));
    expect(rjson.success).toBe(true);
  });

  it("AgentRuntime interface shape and behavior expectations", async () => {
    // create a mock object that satisfies the interface for testing the contract
    const mock: AgentRuntime = {
      execute: async (request) => {
        return createAgentResult({ success: true, response: createAgentResponse({ output: `echo:${request.input}` }) });
      },
      supports: (caps) => caps.includes("CHAT"),
      health: async () => ({ status: "ok" }),
      shutdown: async () => {},
    };

    expect(mock.supports(["CHAT"]).valueOf()).toBe(true);
    const req = createAgentRequest({ tenantId: "t1", agentId: "a1", input: "x" });
    const res = await mock.execute(req);
    expect(res.success).toBe(true);
    expect(res.response?.output).toBe("echo:x");
    const health = await mock.health();
    expect(health.status).toBe("ok");
  });

  it("AgentRuntimeError serializes and preserves code/details", () => {
    const err = new AgentRuntimeError("Timeout", "timed out", { retry: false });
    expect(err.code).toBe("Timeout");
    const json = JSON.parse(JSON.stringify(err));
    expect(json.code).toBe("Timeout");
    expect(json.details.retry).toBe(false);
  });
});
