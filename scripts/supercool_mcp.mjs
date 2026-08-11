// Minimal MCP-over-HTTP client for the supercool gateway.
// Reads the cached OAuth token, does initialize -> tools/list (or a tool call).
// Prints only tool names / call results — never the token.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TOKEN_PATH = join(
  homedir(),
  ".hermes/profiles/personal-daily-life/mcp-tokens/supercool.json"
);
const ENDPOINT = "https://mcp.supercool.com/mcp";

const token = JSON.parse(readFileSync(TOKEN_PATH, "utf8")).access_token;

let sessionId = null;

async function rpc(method, params = {}, id = 1) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  // Capture session id if server sets one
  const sid = res.headers.get("mcp-session-id");
  if (sid) sessionId = sid;

  const text = await res.text();
  // MCP streamable HTTP returns SSE; parse the last data: line
  let body = text;
  if (text.includes("data:")) {
    const lines = text.split("\n").filter((l) => l.startsWith("data:"));
    body = lines.map((l) => l.slice(5).trim()).filter(Boolean).pop() || text;
  }
  try {
    return JSON.parse(body);
  } catch {
    return { raw: text };
  }
}

const cmd = process.argv[2] || "list";

if (cmd === "list") {
  const init = await rpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "hermes-script", version: "1.0" },
  });
  // some servers need an initialized notification
  await rpc("notifications/initialized", {}, 2).catch(() => {});
  const tools = await rpc("tools/list", {}, 3);
  const list = tools?.result?.tools || [];
  console.log(`TOOLS (${list.length}):`);
  for (const t of list) console.log(`  ${t.name} — ${t.description?.slice(0, 70) || ""}`);
} else if (cmd === "schema") {
  const toolName = process.argv[3];
  await rpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "hermes-script", version: "1.0" },
  });
  await rpc("notifications/initialized", {}, 2).catch(() => {});
  const tools = await rpc("tools/list", {}, 3);
  const list = tools?.result?.tools || [];
  const t = list.find((x) => x.name === toolName);
  console.log(JSON.stringify(t?.inputSchema || t, null, 2));
} else if (cmd === "call") {
  const toolName = process.argv[3];
  const argStr = process.argv[4] || "{}";
  const init = await rpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "hermes-script", version: "1.0" },
  });
  await rpc("notifications/initialized", {}, 2).catch(() => {});
  const out = await rpc(
    "tools/call",
    { name: toolName, arguments: JSON.parse(argStr) },
    4
  );
  console.log(JSON.stringify(out, null, 2));
}
