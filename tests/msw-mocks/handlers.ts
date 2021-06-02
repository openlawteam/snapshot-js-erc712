import { rest } from "msw";

const snapshotAPIStatusHandler = rest.get("*/api", (_req, res, ctx) =>
  res(
    ctx.json({
      data: {
        name: "snapshot-hub",
        network: "testnet",
        version: "0.1.2",
        tag: "alpha",
        relayer: "0xEd7B3f2902f2E1B17B027bD0c125B674d293bDA0",
      },
    })
  )
);

// Export all mock handlers
export const handlers = [snapshotAPIStatusHandler];
