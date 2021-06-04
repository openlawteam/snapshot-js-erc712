import { DEFAULT_PROPOSAL_ID, DEFAULT_SIG, DEFAULT_TIMESTAMP } from "./utils";
import { createVote } from "../index";

describe("createVote unit tests", () => {
  test("should return correct data", () => {
    // Vote "yes"
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: DEFAULT_SIG,
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: true,
        weight: "100000",
      })
    ).toEqual({
      choice: 1,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      type: "vote",
      weight: "100000",
    });

    // Vote "no"
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: DEFAULT_SIG,
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: false,
        weight: "100000",
      })
    ).toEqual({
      choice: 2,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      type: "vote",
      weight: "100000",
    });

    // `sig: "0x"`
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: "0x",
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: false,
        weight: "0",
      })
    ).toEqual({
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
      weight: "0",
    });

    // `sig: ""`
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: "0x",
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: false,
        weight: "0",
      })
    ).toEqual({
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
      weight: "0",
    });

    // `weight` is positive, `sig: "0x"`
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: "0x",
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: false,
        weight: "100000",
      })
    ).toEqual({
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
      weight: "0",
    });

    // `weight` is positive, `sig: ""`
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: "0x",
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: false,
        weight: "100000",
      })
    ).toEqual({
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
      weight: "0",
    });

    // Member voted with `weight: "0"`
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: DEFAULT_SIG,
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: false,
        weight: "0",
      })
    ).toEqual({
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      type: "vote",
      weight: "0",
    });
  });

  test("no vote: should return correct `choice`, `weight` data if `weight` is falsy, or wrong type", () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      voteYes: true,
    };

    const defaultReturnData = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
    };

    // Weight is `"0"`
    expect(
      createVote({
        ...defaultArgs,
        weight: "0",
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is empty `String`
    expect(
      createVote({
        ...defaultArgs,
        weight: "",
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is `null`
    expect(
      createVote({
        ...defaultArgs,
        weight: null as any,
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is `Array`
    expect(
      createVote({
        ...defaultArgs,
        weight: [] as any,
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is `Number`
    expect(
      createVote({
        ...defaultArgs,
        weight: 100000 as any,
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });
  });

  test('no vote: `weight` should be `"0"`', () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      voteYes: true,
    };

    const defaultReturnData = {
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
    };

    // Weight provided is `"100000"`
    expect(
      createVote({
        ...defaultArgs,
        weight: "100000",
      })
    ).toEqual({
      ...defaultReturnData,
      weight: "0",
    });

    // Weight provided is `"100000"`, `sig` is empty
    expect(
      createVote({
        ...defaultArgs,
        sig: "",
        weight: "100000",
      })
    ).toEqual({
      ...defaultReturnData,
      weight: "0",
    });

    // Weight provided is `"100000"`, `sig` is empty space
    expect(
      createVote({
        ...defaultArgs,
        sig: " ",
        weight: "100000",
      })
    ).toEqual({
      ...defaultReturnData,
      weight: "0",
    });

    // Weight provided is `"0"`
    expect(
      createVote({
        ...defaultArgs,
        weight: "0",
      })
    ).toEqual({
      ...defaultReturnData,
      weight: "0",
    });

    // Weight provided is empty
    expect(
      createVote({
        ...defaultArgs,
        weight: "",
      })
    ).toEqual({
      ...defaultReturnData,
      weight: "0",
    });

    // Weight provided is is empty space
    expect(
      createVote({
        ...defaultArgs,
        weight: " ",
      })
    ).toEqual({
      ...defaultReturnData,
      weight: "0",
    });
  });

  test('voted: should return `weight` as `"0" if no (or bad) weight`', () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      voteYes: true,
    };

    const defaultReturnData = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      type: "vote",
    };

    // Weight is `"0"`
    expect(
      createVote({
        ...defaultArgs,
        weight: "0",
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is empty
    expect(
      createVote({
        ...defaultArgs,
        weight: "",
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is empty space
    expect(
      createVote({
        ...defaultArgs,
        weight: " ",
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });

    // Weight is negative number string
    expect(
      createVote({
        ...defaultArgs,
        weight: "-100000",
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 0,
      weight: "0",
    });
  });

  test("should return `timestamp` as `0` if no `weight` and/or `sig`", () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      timestamp: DEFAULT_TIMESTAMP,
      voteYes: true,
    };

    const defaultReturnData = {
      choice: 0,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: "0x",
      timestamp: 0,
      type: "vote",
      weight: "0",
    };

    // When weight is `"0"` and `sig` is `"0x"`
    expect(
      createVote({
        ...defaultArgs,
        sig: "0x",
        weight: "0",
      })
    ).toEqual(defaultReturnData);

    // When weight is `"100000"` and `sig` is `"0x"`
    expect(
      createVote({
        ...defaultArgs,
        sig: "0x",
        weight: "100000",
      })
    ).toEqual(defaultReturnData);

    // When weight is `"100000"` and `sig` is empty
    expect(
      createVote({
        ...defaultArgs,
        sig: "",
        weight: "100000",
      })
    ).toEqual(defaultReturnData);

    // When weight is `"100000"` and `sig` is empty space
    expect(
      createVote({
        ...defaultArgs,
        sig: " ",
        weight: "100000",
      })
    ).toEqual(defaultReturnData);

    // When weight is `"0"` and `sig` is OK
    expect(
      createVote({
        ...defaultArgs,
        sig: DEFAULT_SIG,
        weight: "0",
      })
    ).toEqual({
      ...defaultReturnData,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
    });

    // When weight is `"-100000"` and `sig` is OK
    expect(
      createVote({
        ...defaultArgs,
        sig: DEFAULT_SIG,
        weight: "0",
      })
    ).toEqual({
      ...defaultReturnData,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
    });

    // When weight is empty and `sig` is OK
    expect(
      createVote({
        ...defaultArgs,
        sig: DEFAULT_SIG,
        weight: "",
      })
    ).toEqual({
      ...defaultReturnData,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
    });

    // When weight is empty space and `sig` is OK
    expect(
      createVote({
        ...defaultArgs,
        sig: DEFAULT_SIG,
        weight: "",
      })
    ).toEqual({
      ...defaultReturnData,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
    });
  });

  test("should return positive integer for `timestamp`, if somehow negative", () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      voteYes: true,
      weight: "100000",
    };

    const defaultReturnData = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      type: "vote",
    };

    // Negative `timestamp`
    expect(
      createVote({
        ...defaultArgs,
        timestamp: -DEFAULT_TIMESTAMP,
      })
    ).toEqual({
      ...defaultReturnData,
      choice: 1,
      timestamp: DEFAULT_TIMESTAMP,
      weight: "100000",
    });
  });

  test("should return trimmed `sig`", () => {
    // Space added to `sig`
    expect(
      createVote({
        proposalId: DEFAULT_PROPOSAL_ID,
        sig: ` ${DEFAULT_SIG}   `,
        timestamp: DEFAULT_TIMESTAMP,
        voteYes: true,
        weight: "100000",
      })
    ).toEqual({
      choice: 1,
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      type: "vote",
      weight: "100000",
    });
  });

  test("should throw if `timestamp` evaluates to `NaN`", () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      voteYes: true,
      weight: "100000",
    };

    expect(() =>
      createVote({
        ...defaultArgs,
        timestamp: NaN,
      })
    ).toThrowError("`timestamp` must not be `NaN`.");
  });

  test("should throw if `weight` evaluates to `NaN`", () => {
    const defaultArgs = {
      proposalId: DEFAULT_PROPOSAL_ID,
      sig: DEFAULT_SIG,
      timestamp: DEFAULT_TIMESTAMP,
      voteYes: true,
      weight: "100000",
    };

    // Weight is a bad `String`
    expect(() =>
      createVote({
        ...defaultArgs,
        weight: "this is not a number",
      })
    ).toThrowError("`weight` must not be `NaN`.");

    // Weight is bad `String`
    expect(() =>
      createVote({
        ...defaultArgs,
        weight: "{}",
      })
    ).toThrowError("`weight` must not be `NaN`.");

    // Weight is plain `Object`
    expect(() =>
      createVote({
        ...defaultArgs,
        weight: {} as any,
      })
    ).toThrowError("`weight` must not be `NaN`.");

    // Weight is `undefined`
    expect(() =>
      createVote({
        ...defaultArgs,
        weight: undefined as any,
      })
    ).toThrowError("`weight` must not be `NaN`.");
  });
});
