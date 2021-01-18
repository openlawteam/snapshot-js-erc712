import axios from "axios";

/**
 * ------------------
 * TYPES
 * ------------------
 */

export enum VoteChoices {
  No = "No",
  Yes = "Yes",
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
  /**
   * Intended contract address to use this data. For ERC712 signature verification.
   */
  actionId: string;
  /**
   * Ethereum network ID. For ERC712 signature verification.
   */
  chainId: number;
  /**
   * The contract address which will verify the signature. For ERC712 signature verification.
   */
  verifyingContract: string;
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
    choice: number;
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
  actionId: SnapshotCoreProposalData["actionId"];
  chainId: SnapshotCoreProposalData["chainId"];
  verifyingContract: SnapshotCoreProposalData["verifyingContract"];
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
  actionId: SnapshotCoreProposalData["actionId"];
  proposalHash: SnapshotVoteData["payload"]["proposalHash"];
  space: SnapshotCoreProposalData["space"];
  token: SnapshotCoreProposalData["token"];
  verifyingContract: SnapshotCoreProposalData["verifyingContract"];
};

export type SnapshotSubmitBaseReturn = {
  uniqueId: string;
};

export type SnapshotSubmitDraftReturn = {
  uniqueIdDraft: string;
} & SnapshotSubmitBaseReturn;

/**
 * ------------------
 * SNAPSHOT HUB UTILS
 * ------------------
 */

const VOTE_CHOICES: CoreProposalVoteChoices = [VoteChoices.Yes, VoteChoices.No];

const getTimestampSeconds: () => number = () => Math.floor(Date.now() / 1e3);

// @note The snapshot-hub API does not accept falsy choices like index `0`.
const getVoteChoiceIndex = (choice: VoteChoices) =>
  VOTE_CHOICES.findIndex((c) => c === choice) + 1;

export const buildDraftMessage = async (
  message: SnapshotMessageBase,
  snapshotHubURL: string
): Promise<SnapshotDraftData> => {
  try {
    const { data } = await getApiStatus(snapshotHubURL);

    return {
      payload: {
        body: message.body,
        choices: VOTE_CHOICES,
        metadata: message.metadata,
        name: message.name,
      },
      actionId: message.actionId,
      chainId: message.chainId,
      space: message.space,
      timestamp: getTimestampSeconds().toString(),
      token: message.token,
      type: SnapshotType.draft,
      verifyingContract: message.verifyingContract,
      version: data.version,
    };
  } catch (error) {
    throw error;
  }
};

export const buildProposalMessage = async (
  message: SnapshotMessageProposal,
  snapshotHubURL: string
): Promise<SnapshotProposalData> => {
  try {
    const timestamp = message.timestamp
      ? parseInt(message.timestamp)
      : getTimestampSeconds();
    const { data } = await getApiStatus(snapshotHubURL);

    return {
      payload: {
        body: message.body,
        choices: VOTE_CHOICES,
        end: timestamp + message.votingTimeSeconds,
        metadata: message.metadata,
        name: message.name,
        start: timestamp,
        snapshot: message.snapshot,
      },
      actionId: message.actionId,
      chainId: message.chainId,
      space: message.space,
      timestamp: timestamp.toString(),
      token: message.token,
      type: SnapshotType.proposal,
      verifyingContract: message.verifyingContract,
      version: data.version,
    };
  } catch (error) {
    throw error;
  }
};

export const buildVoteMessage = async (
  vote: SnapshotMessageVote,
  proposal: SnapshotVoteProposal,
  snapshotHubURL: string
): Promise<SnapshotVoteData> => {
  const timestamp = getTimestampSeconds();

  try {
    const { data } = await getApiStatus(snapshotHubURL);

    return {
      payload: {
        choice: getVoteChoiceIndex(vote.choice),
        proposalHash: proposal.proposalHash,
        metadata: vote.metadata,
      },
      actionId: proposal.actionId,
      chainId: vote.chainId,
      space: proposal.space,
      timestamp: timestamp.toString(),
      token: proposal.token,
      type: SnapshotType.vote,
      verifyingContract: proposal.verifyingContract,
      version: data.version,
    };
  } catch (error) {
    throw error;
  }
};

export const submitMessage = <ReturnData extends SnapshotSubmitBaseReturn>(
  snapshotHubURL: string,
  address: string,
  message: SnapshotDraftData | SnapshotProposalData | SnapshotVoteData,
  signature: string
): Promise<{ data: ReturnData }> => {
  const data = {
    address,
    msg: JSON.stringify(message),
    sig: signature,
  };
  return axios.post(`${snapshotHubURL}/api/message`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getDrafts = (snapshotHubURL: string, space: string) => {
  return axios.get(`${snapshotHubURL}/api/${space}/drafts`);
};

export const getProposals = (snapshotHubURL: string, space: string) => {
  return axios.get(`${snapshotHubURL}/api/${space}/proposals`);
};

export const getSpace = (snapshotHubURL: string, space: string) => {
  return axios.get(`${snapshotHubURL}/api/spaces/${space}`);
};

export const getVotes = (
  snapshotHubURL: string,
  space: string,
  proposalId: string
) => {
  return axios.get(
    `${snapshotHubURL}/api/${space}/proposal/${proposalId}/votes`
  );
};

export const getApiStatus = (snapshotHubURL: string) => {
  return axios.get(`${snapshotHubURL}/api`);
};
