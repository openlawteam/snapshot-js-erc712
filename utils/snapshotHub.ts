import axios from "axios";

import {
  CoreProposalVoteChoices,
  Erc712Data,
  SnapshotDraftData,
  SnapshotMessageBase,
  SnapshotMessageProposal,
  SnapshotMessageVote,
  SnapshotProposalData,
  SnapshotSubmitBaseReturn,
  SnapshotType,
  SnapshotVoteData,
  SnapshotVoteProposal,
  VoteChoices,
  VoteChoicesIndex,
} from "./types";

/**
 * ------------------
 * SNAPSHOT HUB UTILS
 * ------------------
 */

const VOTE_CHOICES: CoreProposalVoteChoices = [VoteChoices.Yes, VoteChoices.No];

const getTimestampSeconds: () => number = () => Math.floor(Date.now() / 1e3);

const getVoteChoiceIndex = (choice: VoteChoices): VoteChoicesIndex => {
  const index = VoteChoicesIndex[choice];

  if (!index) {
    throw new Error("Could not find vote index.");
  }

  return index;
};

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
      space: message.space,
      timestamp: getTimestampSeconds().toString(),
      token: message.token,
      type: SnapshotType.draft,
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
    const voteStartTimestamp: number = getTimestampSeconds();

    const { data } = await getApiStatus(snapshotHubURL);

    return {
      payload: {
        body: message.body,
        choices: VOTE_CHOICES,
        end: voteStartTimestamp + message.votingTimeSeconds,
        metadata: message.metadata,
        name: message.name,
        start: voteStartTimestamp,
        snapshot: message.snapshot,
      },
      space: message.space,
      timestamp: timestamp.toString(),
      token: message.token,
      type: SnapshotType.proposal,
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
      space: proposal.space,
      timestamp: timestamp.toString(),
      token: proposal.token,
      type: SnapshotType.vote,
      version: data.version,
    };
  } catch (error) {
    throw error;
  }
};

export const submitMessage = <T extends SnapshotSubmitBaseReturn>(
  snapshotHubURL: string,
  address: string,
  message: SnapshotDraftData | SnapshotProposalData | SnapshotVoteData,
  signature: string,
  erc712Data: Erc712Data
): Promise<{ data: T }> => {
  const data = {
    address,
    msg: JSON.stringify(message),
    sig: signature,
    erc712Data: JSON.stringify(erc712Data),
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
