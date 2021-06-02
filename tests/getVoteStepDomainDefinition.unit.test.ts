import {
  DEFAULT_ACTION_ID,
  DEFAULT_CHAIN_ID,
  DEFAULT_VERIFYING_CONTRACT,
} from "./utils";
import { getVoteStepDomainDefinition } from "../index";

describe("getVoteStepDomainDefinition unit tests", () => {
  test("should return correct data", () => {
    expect(
      getVoteStepDomainDefinition(
        DEFAULT_VERIFYING_CONTRACT,
        DEFAULT_ACTION_ID,
        DEFAULT_CHAIN_ID
      )
    ).toEqual({
      domain: {
        actionId: DEFAULT_ACTION_ID,
        chainId: DEFAULT_CHAIN_ID,
        name: "Snapshot Message",
        verifyingContract: DEFAULT_VERIFYING_CONTRACT,
        version: "4",
      },
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
          { name: "actionId", type: "address" },
        ],
        Message: [
          { name: "timestamp", type: "uint64" },
          { name: "nbYes", type: "uint88" },
          { name: "nbNo", type: "uint88" },
          { name: "index", type: "uint32" },
          { name: "choice", type: "uint32" },
          { name: "proposalId", type: "bytes32" },
        ],
      },
    });
  });
});
