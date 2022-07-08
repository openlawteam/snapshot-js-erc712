import {
  DEFAULT_ACTION_ID,
  DEFAULT_CHAIN_ID,
  DEFAULT_VERIFYING_CONTRACT,
} from "./utils";
import { getDomainType, getCouponKycDomainDefinition } from "../index";

describe("getCouponKycDomainDefinition unit tests", () => {
  test("should return correct data", () => {
    expect(
      getCouponKycDomainDefinition(
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
          { name: "kycedMember", type: "address" },
          { name: "memberNonce", type: "uint256" },
        ],
        EIP712Domain: getDomainType(),
      },
    });
  });
});
