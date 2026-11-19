import net from "node:net";
import { PGlite } from "@electric-sql/pglite";
import { fromNodeSocket } from "pg-gateway/node";

async function main() {
  // Use persistent directory so database schema and seeded data persist
  const pglite = new PGlite("./.test-data/pglite");
  await pglite.waitReady;
  console.log("PGlite instance ready!");

  const server = net.createServer(async (socket) => {
    try {
      await fromNodeSocket(socket, {
        serverVersion: "16.3",
        auth: {
          method: "trust",
        },
        async onMessage(data, { isAuthenticated }) {
          if (!isAuthenticated) return undefined;
          try {
            const res = await pglite.execProtocolRaw(data);
            return res;
          } catch (err: any) {
            console.error("PGlite execProtocolRaw error:", err);
            return undefined;
          }
        },
      });
    } catch (e: any) {
      console.error("Socket error:", e.message);
    }
  });

  server.listen(5432, "127.0.0.1", () => {
    console.log("✅ PGlite Postgres server listening on 127.0.0.1:5432");
  });
}

main().catch(console.error);
