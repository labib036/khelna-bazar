/**
 * Next.js Instrumentation Hook
 * Executes once on server startup before request handling begins.
 * Enforces production launch guard validation, failing closed if misconfigured.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateProductionConfig } = await import("@/server/launch-guard");
    const result = validateProductionConfig();
    if (!result.valid) {
      console.error("=================================================");
      console.error("FATAL: PRODUCTION LAUNCH GUARD VALIDATION FAILED!");
      console.error("=================================================");
      for (const err of result.errors) {
        console.error(` ❌ ${err}`);
      }
      console.error("=================================================");
      throw new Error(
        `FATAL: Production launch guard blocked startup:\n${result.errors.join("\n")}`
      );
    }
  }
}
