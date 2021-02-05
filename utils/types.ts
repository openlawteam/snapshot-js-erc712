export enum VoteChoices {
  No = "No",
  Yes = "Yes",
}

// @note The snapshot-hub API does not accept falsy choices like index `0`.
export enum VoteChoicesIndex {
  Yes = 1,
  No = 2,
}

export enum SnapshotType {
  draft = "draft",
  proposal = "proposal",
  vote = "vote",
}

// Ordered vote choices. Do not change the indexes!
export type CoreProposalVoteChoices = [VoteChoices.Yes, VoteChoices.No];

export type SnapshotCoreProposalPayloadData = {
  /**
   * Readable name of the proposal
   */
  name: string;
  /**
   * Readable description of the proposal
   */
  body: string;
  /**
   * Choices for Snapshot vote
   */
  choices: CoreProposalVoteChoices;
  /**
   * Stringifiable metadata for the proposal, e.g. `private: 1`
   */
  metadata: Record<string, any>;
};

export type SnapshotProposalPayloadData = {
  /**
   * Vote start timestamp string (in seconds)
   */
  start: number;
  /**
   * Vote end timestamp string (in seconds)
   */
  end: number;
  /**
   * Ethereum block to use (e.g. latest).
   */
  snapshot: number;
};

export type SnapshotCoreProposalData = {
  /**
   * Creation timestamp
   */
  timestamp: string;
  /**
   * Snapshot entity (i.e. "draft", "proposal", "vote")
   */
  type: SnapshotType;
  /**
   * Version of snapshot-hub api
   */
  version: string;
  /**
   * Represents the `space` token registered in snapshot-hub.
   */
  token: string;
  /**
   * Registered space name in the snapshot-hub api
   */
  space: string;
};

export type SnapshotDraftData = {
  /**
   * Core data about the draft.
   */
  payload: SnapshotCoreProposalPayloadData;
} & SnapshotCoreProposalData;

export type SnapshotProposalData = {
  /**
   * Core data about the proposal and its voting.
   */
  payload: SnapshotCoreProposalPayloadData & SnapshotProposalPayloadData;
} & SnapshotCoreProposalData;

export type SnapshotVoteData = {
  /**
   * Core data about the vote.
   */
  payload: {
    /**
     * The choice's index
     */
    choice: VoteChoicesIndex;
    /**
     * The proposal's ERC712 hash
     */
    proposalHash: string;
    /**
     * Stringifiable metadata for the vote.
     */
    metadata: {
      /**
       * Allows for a different address other than the `address` voting.
       * In many cases this will be the same as the `address` field.
       *
       * e.g. Calculating membership voting power, but a delegate address was used for `address`.
       */
      memberAddress: string;
    } & Record<string, any>;
  };
} & SnapshotCoreProposalData;

/**
 * Common arguments for functions which build messages
 */
export type SnapshotMessageBase = {
  name: SnapshotCoreProposalPayloadData["name"];
  body: SnapshotCoreProposalPayloadData["body"];
  metadata: SnapshotCoreProposalPayloadData["metadata"];
  token: SnapshotCoreProposalData["token"];
  space: SnapshotCoreProposalData["space"];
};

export type SnapshotMessageProposal = {
  /**
   * Duration in seconds of the vote.
   */
  votingTimeSeconds: number;
  /**
   * Ethereum block to use (e.g. latest).
   */
  snapshot: number;
  /**
   * Optional timestamp string (seconds).
   * Providing the timestamp is helpful in cases where generated
   * hashes need to match (i.e. a way to use the same data).
   */
  timestamp?: SnapshotCoreProposalData["timestamp"];
} & SnapshotMessageBase;

export type SnapshotMessageVote = {
  /**
   * Choice to submit for the vote.
   */
  choice: VoteChoices;
  /**
   * Stringifiable metadata for the proposal, e.g. `private: 1`
   */
  metadata: SnapshotVoteData["payload"]["metadata"];
  /**
   * Ethereum network ID. For ERC712 signature verification.
   */
  chainId: number;
};

export type SnapshotVoteProposal = {
  proposalHash: SnapshotVoteData["payload"]["proposalHash"];
  space: SnapshotCoreProposalData["space"];
  token: SnapshotCoreProposalData["token"];
};

export type SnapshotSubmitBaseReturn = {
  uniqueId: string;
};

export type SnapshotSubmitProposalReturn = {
  uniqueIdDraft: string;
} & SnapshotSubmitBaseReturn;

export type SnapshotDraftResponseData = {
  address: string;
  data: {
    authorIpfsHash: string;
    sponsored: boolean;
  };
  msg: {
    version: string;
    timestamp: string;
    token: string;
    type: SnapshotType.draft;
    payload: {
      body: string;
      choices: CoreProposalVoteChoices;
      metadata: Record<string, any>;
      name: string;
    };
  };
  sig: string;
  authorIpfsHash: string;
  relayerIpfsHash: string;
  actionId: string;
};

export type SnapshotDraftResponse = Record<
  /**
   * Proposal erc712 content hash
   */
  string,
  /**
   * Draft data
   */
  SnapshotDraftResponseData
>;

export type SnapshotProposalResponseData = {
  address: string;
  data: {
    authorIpfsHash: string;
    /**
     * The hash of a proposal's draft.
     * This property will not be present if the proposal does not have a draft.
     */
    erc712DraftHash?: string;
  };
  msg: {
    version: string;
    timestamp: string;
    token: string;
    type: SnapshotType.proposal;
    payload: {
      body: string;
      choices: CoreProposalVoteChoices;
      end: number;
      metadata: Record<string, any>;
      name: string;
      start: number;
      snapshot: number;
    };
  };
  /**
   * Votes (`SnapshotVotesResponse`) are optionally included (i.e. requested via query param).
   */
  votes?: SnapshotVotesResponse;
  sig: string;
  authorIpfsHash: string;
  relayerIpfsHash: string;
  actionId: string;
};

export type SnapshotProposalResponse = Record<
  /**
   * Proposal erc712 content hash
   */
  string,
  /**
   * Proposal data
   */
  SnapshotProposalResponseData
>;

/**
 * @note same as `SnapshotProposalResponse` type.
 */
export type SnapshotProposalsResponse = SnapshotProposalResponse;

export type SnapshotVoteResponseData = {
  address: string;
  msg: {
    version: string;
    timestamp: string;
    token: string;
    type: SnapshotType.vote;
    payload: {
      /**
       * Index of the vote chosen, i.e 1 = Yes, 2 = No
       */
      choice: number;
      proposalHash: string;
      metadata: {
        /**
         * @see SnapshotVoteData
         */
        memberAddress: string;
      };
    };
  };
  sig: string;
  authorIpfsHash: string;
  relayerIpfsHash: string;
  actionId: string;
};

export type SnapshotVoteResponse = Record<
  /**
   * Address of the voter
   */
  string,
  /**
   * Vote data
   */
  SnapshotVoteResponseData
>;

/**
 * @note Votes are inside an array, unlike the Proposals object.
 */
export type SnapshotVotesResponse = SnapshotVoteResponse[];

export type Erc712Data = {
  actionId: string;
  chainId: number;
  verifyingContract: string;
  message: Record<string, any>;
};
