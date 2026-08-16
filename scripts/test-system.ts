import { generateTicketId } from "../src/lib/ticket";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../src/lib/auth";
import { isValidStatusTransition, ComplaintStatus } from "../src/lib/types/complaints";
import { checkRateLimit } from "../src/lib/rate-limit";

async function runTests() {
  console.log("\n==========================================");
  console.log(" NETRONiX Complaint System Test Suite");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Ticket ID Generator Tests
  console.log("▶ 1. Cryptographic Ticket ID Generation");
  const sampleId = generateTicketId();
  assert(sampleId.startsWith("NX-"), "Ticket ID starts with 'NX-' prefix");
  assert(sampleId.length === 11, `Ticket ID length is 11 chars (NX- + 8 chars), got: ${sampleId}`);
  assert(!/[01OIL]/i.test(sampleId), "Ticket ID does not contain ambiguous characters (0, 1, O, I, L)");

  const ids = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    ids.add(generateTicketId());
  }
  assert(ids.size === 1000, "1,000 consecutively generated Ticket IDs have 0 collisions");

  // 2. Authentication & Cryptography Tests
  console.log("\n▶ 2. Authentication, Hashing & JWT Verification");
  const rawPassword = "SuperSecurePassword123!";
  const hash = await hashPassword(rawPassword);
  assert(hash !== rawPassword && hash.startsWith("$2"), "Password hashed with bcrypt salt rounds");
  const matches = await verifyPassword(rawPassword, hash);
  assert(matches, "verifyPassword succeeds for matching password");
  const wrongMatches = await verifyPassword("WrongPassword123!", hash);
  assert(!wrongMatches, "verifyPassword rejects incorrect password");

  const mockAdmin = {
    id: "uuid-12345",
    email: "admin@netronix.giki.edu.pk",
    name: "Lead Engineer",
    role: "ADMIN" as const,
  };
  const token = await createSessionToken(mockAdmin);
  assert(typeof token === "string" && token.length > 30, "createSessionToken generates valid JWT");
  const payload = await verifySessionToken(token);
  assert(payload?.sub === mockAdmin.id, "JWT verify extracts correct admin user ID (sub)");
  assert(payload?.role === "ADMIN", "JWT verify extracts correct role");

  const invalidPayload = await verifySessionToken(token + "corrupt");
  assert(invalidPayload === null, "JWT verify rejects tampered token");

  // 3. Status Transition Matrix Tests
  console.log("\n▶ 3. Complaint Status Transition Rules");
  assert(isValidStatusTransition(ComplaintStatus.REPORTED, ComplaintStatus.ASSIGNED), "REPORTED -> ASSIGNED is valid");
  assert(isValidStatusTransition(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS), "ASSIGNED -> IN_PROGRESS is valid");
  assert(isValidStatusTransition(ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED), "IN_PROGRESS -> RESOLVED is valid");
  assert(isValidStatusTransition(ComplaintStatus.REPORTED, ComplaintStatus.REJECTED), "REPORTED -> REJECTED is valid");
  assert(isValidStatusTransition(ComplaintStatus.RESOLVED, ComplaintStatus.IN_PROGRESS), "RESOLVED -> IN_PROGRESS (reopening) is valid");
  assert(!isValidStatusTransition(ComplaintStatus.RESOLVED, ComplaintStatus.ASSIGNED), "RESOLVED -> ASSIGNED is prohibited");
  assert(!isValidStatusTransition(ComplaintStatus.REJECTED, ComplaintStatus.RESOLVED), "REJECTED -> RESOLVED is prohibited");

  // 4. Rate Limiter Tests
  console.log("\n▶ 4. Rate Limiting Logic");
  const testKey = `test-ip-${Date.now()}`;
  const r1 = checkRateLimit(testKey, { limit: 3, windowMs: 5000 });
  assert(r1.allowed && r1.remaining === 2, "Rate limiter allows first request");
  checkRateLimit(testKey, { limit: 3, windowMs: 5000 });
  const r3 = checkRateLimit(testKey, { limit: 3, windowMs: 5000 });
  assert(r3.allowed && r3.remaining === 0, "Rate limiter allows up to limit");
  const r4 = checkRateLimit(testKey, { limit: 3, windowMs: 5000 });
  assert(!r4.allowed, "Rate limiter blocks request exceeding limit");

  console.log("\n==========================================");
  console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
