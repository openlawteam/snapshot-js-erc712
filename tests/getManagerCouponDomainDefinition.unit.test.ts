import {
  DEFAULT_ACTION_ID,
  DEFAULT_CHAIN_ID,
  DEFAULT_VERIFYING_CONTRACT,
} from "./utils";
import { getDomainType, getManagerCouponDomainDefinition } from "../index";

describe("getManagerCouponDomainDefinition unit tests", () => {
  test("should return correct data", () => {
    expect(
      getManagerCouponDomainDefinition(
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
        Message: [
          { name: "daoAddress", type: "address" },
          { name: "proposal", type: "ProposalDetails" },
          { name: "configs", type: "Configuration[]" },
          { name: "nonce", type: "uint256" },
        ],
        ProposalDetails: [
          { name: "adapterOrExtensionId", type: "bytes32" },
          { name: "adapterOrExtensionAddr", type: "address" },
          { name: "updateType", type: "uint8" },
          { name: "flags", type: "uint128" },
          { name: "keys", type: "bytes32[]" },
          { name: "values", type: "uint256[]" },
          { name: "extensionAddresses", type: "address[]" },
          { name: "extensionAclFlags", type: "uint128[]" },
        ],
        Configuration: [
          { name: "key", type: "bytes32" },
          { name: "numericValue", type: "uint256" },
          { name: "addressValue", type: "address" },
          { name: "configType", type: "uint8" },
        ],
        EIP712Domain: getDomainType(),
      },
    });
  });
});
