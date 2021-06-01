import { DEFAULT_PROPOSAL_ID } from "./utils";
import { prepareVotePayload, VoteChoicesIndex } from "../index";

describe("prepareVotePayload unit tests", () => {
  test("should return correct data", () => {
    expect(
      prepareVotePayload({
        choice: VoteChoicesIndex.Yes,
        proposalId: DEFAULT_PROPOSAL_ID,
      })
    ).toEqual({
      choice: 1,
      proposalId:
        "0xf96e930cc62ff54c1bd131db67fdb78238611fbf47eef007f136d96c4f309873",
    });
  });
});
