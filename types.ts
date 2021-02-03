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

export type PrepareProposalMessageData = {
  timestamp: number;
  space: string;
  payload: PrepareProposalPayloadData;
};

export type PrepareProposalPayloadData = {
  body: string;
  choices: string[];
  end: number;
  name: string;
  snapshot: string;
  start: number;
};

export type PrepareVoteMessageData = {
  timestamp: number;
  payload: PrepareVoteMessagePayloadData;
};

export type PrepareVoteMessagePayloadData = {
  choice: 1 | 2;
  proposalHash: string;
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
