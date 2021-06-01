import { DEFAULT_TIMESTAMP } from "./utils";
import { prepareProposalMessage } from "../index";

describe("prepareProposalMessage unit tests", () => {
  const defaultArgs = {
    timestamp: DEFAULT_TIMESTAMP.toString(),
    space: "tribute",
    payload: {
      body: "Hello there!",
      choices: ["Yes", "No"],
      end: DEFAULT_TIMESTAMP + 120,
      name: "Some great proposal",
      snapshot: 50,
      start: DEFAULT_TIMESTAMP,
    },
  };

  const defaultReturn = {
    payload: {
      bodyHash:
        "0xbcaa8219a31b43ee23eaede08aebae39cdba2dd382d3579de9463070e53da6bd",
      choices: ["Yes", "No"],
      end: DEFAULT_TIMESTAMP + 120,
      nameHash:
        "0xb790ff851b467c74c5cab0188e0650c9457a054f444dfc69c8745983615a48b5",
      snapshot: "50",
      start: DEFAULT_TIMESTAMP,
    },
    spaceHash:
      "0x9f3f3b08778f7e67091ae6263e03332fca03c910449d2c2eec3320e107a90ad6",
    timestamp: DEFAULT_TIMESTAMP,
  };

  test("should return correct data", () => {
    expect(prepareProposalMessage(defaultArgs)).toEqual(defaultReturn);

    // When `snapshot` is Number
    expect(
      prepareProposalMessage({
        ...defaultArgs,
        payload: {
          ...defaultArgs.payload,
          snapshot: 50,
        },
      })
    ).toEqual(defaultReturn);

    // When `timestamp` is String
    expect(
      prepareProposalMessage({
        ...defaultArgs,
        timestamp: DEFAULT_TIMESTAMP.toString(),
      })
    ).toEqual(defaultReturn);
  });
});
