import { rest } from "msw";

import {
  DEFAULT_CHAIN_ID,
  DEFAULT_ETH_ADDRESS,
  DEFAULT_PROPOSAL_ID,
  DEFAULT_VERIFYING_CONTRACT,
} from "./utils";
import { buildVoteMessage, VoteChoices } from "../index";
import { DEFAULT_SNAPSHOT_HUB_API_URL } from "./msw-mocks/helpers";
import { server } from "./msw-mocks";

describe("buildVoteMessage unit tests", () => {
  test("should return correct data", async () => {
    const result = await buildVoteMessage(
      {
        choice: VoteChoices.Yes,
        metadata: { memberAddress: DEFAULT_ETH_ADDRESS },
        chainId: DEFAULT_CHAIN_ID,
      },
      {
        proposalId: DEFAULT_PROPOSAL_ID,
        space: "tribute",
        token: DEFAULT_VERIFYING_CONTRACT,
      },
      DEFAULT_SNAPSHOT_HUB_API_URL
    );

    expect(result).toMatchObject({
      payload: {
        choice: 1,
        metadata: {
          memberAddress: DEFAULT_ETH_ADDRESS,
        },
        proposalId: DEFAULT_PROPOSAL_ID,
      },
      space: "tribute",
      token: DEFAULT_VERIFYING_CONTRACT,
      type: "vote",
      version: "0.1.2",
    });

    expect(result.timestamp).toMatch(/^[0-9]{1,}$/);
  });

  test("should throw on error", async () => {
    server.use(
      rest.get(`${DEFAULT_SNAPSHOT_HUB_API_URL}/api`, (_req, res, ctx) =>
        res(ctx.status(500))
      )
    );

    try {
      await buildVoteMessage(
        {
          choice: VoteChoices.Yes,
          metadata: { memberAddress: DEFAULT_ETH_ADDRESS },
          chainId: DEFAULT_CHAIN_ID,
        },
        {
          proposalId: DEFAULT_PROPOSAL_ID,
          space: "tribute",
          token: DEFAULT_VERIFYING_CONTRACT,
        },
        DEFAULT_SNAPSHOT_HUB_API_URL
      );
    } catch (error) {
      expect(error.message.length > 0).toBe(true);
    }
  });
});
