import {
  DEFAULT_ACTION_ID,
  DEFAULT_CHAIN_ID,
  DEFAULT_ETH_ADDRESS,
  DEFAULT_PROPOSAL_ID,
  DEFAULT_SIG,
  DEFAULT_VERIFYING_CONTRACT,
} from "./utils";
import {
  buildVoteLeafHashForMerkleTree,
  SnapshotType,
  VoteChoicesIndex,
} from "../index";

describe("buildVoteLeafHashForMerkleTree unit tests", () => {
  test("should return correct data", () => {
    expect(
      buildVoteLeafHashForMerkleTree(
        {
          index: 2,
          nbNo: "100000",
          nbYes: "200000",
          choice: VoteChoicesIndex.Yes,
          member: DEFAULT_ETH_ADDRESS,
          proposalId: DEFAULT_PROPOSAL_ID,
          sig: DEFAULT_SIG,
          // We don't use our `DEFAULT_TIMESTAMP` test helper as we need this to be deterministic.
          timestamp: 1622555344,
          type: SnapshotType.vote,
          weight: "100000",
        },
        DEFAULT_VERIFYING_CONTRACT,
        DEFAULT_ACTION_ID,
        DEFAULT_CHAIN_ID
      )
    ).toBe(
      "0xd19bb59548c49a34964a8e0c8db6b6e4bc3c38f6f5af19a45d25707b0ee2afd4"
    );
  });
});
