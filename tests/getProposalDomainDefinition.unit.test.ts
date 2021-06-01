import {
  DEFAULT_ACTION_ID,
  DEFAULT_CHAIN_ID,
  DEFAULT_VERIFYING_CONTRACT,
} from "./utils";
import { getProposalDomainDefinition } from "../index";

describe("getProposalDomainDefinition unit tests", () => {
  test("should return correct data", () => {
    expect(
      getProposalDomainDefinition(
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
          { name: "spaceHash", type: "bytes32" },
          { name: "payload", type: "MessagePayload" },
        ],
        MessagePayload: [
          { name: "nameHash", type: "bytes32" },
          { name: "bodyHash", type: "bytes32" },
          { name: "choices", type: "string[]" },
          { name: "start", type: "uint64" },
          { name: "end", type: "uint64" },
          { name: "snapshot", type: "string" },
        ],
      },
    });
  });
});
