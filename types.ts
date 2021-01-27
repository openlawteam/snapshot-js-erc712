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
  timestamp: string;
};
