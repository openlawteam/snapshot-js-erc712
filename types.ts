import { SnapshotType, VoteChoicesIndex } from "./utils";

export type PrepareVoteProposalData = {
  payload: {
    body: string;
    choices: string[];
    end: number;
    name: string;
    snapshot: string;
    start: number;
  };
  sig: string;
  space: string;
  timestamp: number;
};

export type PrepareDraftMessageData = {
  timestamp: number | string;
  space: string;
  payload: PrepareDraftMessagePayloadData;
};

export type PrepareDraftMessagePayloadData = {
  body: string;
  choices: string[];
  name: string;
};

export type PrepareProposalMessageData = {
  timestamp: number | string;
  space: string;
  payload: PrepareProposalPayloadData;
};

export type PrepareProposalPayloadData = {
  body: string;
  choices: string[];
  end: number;
  name: string;
  snapshot: string | number;
  start: number;
};

export type PrepareVoteMessageData = {
  timestamp: number | string;
  payload: PrepareVoteMessagePayloadData;
};

export type PrepareVoteMessagePayloadData = {
  choice: VoteChoicesIndex;
  proposalHash: string;
};

export type PrepareDraftMessageReturn = {
  timestamp: number;
  spaceHash: string;
  payload: PrepareDraftMessagePayloadReturn;
};

export type PrepareDraftMessagePayloadReturn = {
  bodyHash: string;
  choices: string[];
  nameHash: string;
};

export type PrepareProposalMessageReturn = {
  timestamp: number;
  spaceHash: string;
  payload: PrepareProposalPayloadReturn;
};

export type PrepareProposalPayloadReturn = {
  bodyHash: string;
  choices: string[];
  end: number;
  nameHash: string;
  snapshot: string;
  start: number;
};

export type MessageWithType = Record<string, any> & {
  type: SnapshotType | "result";
};

export type CreateVoteReturn = {
  type: SnapshotType.vote;
  timestamp: number;
  payload: {
    choice: VoteChoicesIndex;
    account: string;
    proposalHash: string;
  };
};

export type VoteEntry = {
  sig: string;
  weight?: number;
} & CreateVoteReturn;

export type VoteEntryLeaf = {
  account: string;
  choice: VoteChoicesIndex;
  index: number;
  nbNo: number;
  nbYes: number;
  proposalHash: string;
  sig: string;
  weight: number;
} & CreateVoteReturn;
