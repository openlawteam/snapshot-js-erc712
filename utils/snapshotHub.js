import axios from "axios";
const snapshotHubMessageVersion = "0.2.0"; //needs to match snapshot-hub api version

const addHours = (ts, hours) => {
  let date = new Date(ts * 1e3);
  date.setHours(date.getHours() + hours);
  return (date.getTime() / 1e3).toFixed();
};

export const buildDraftMessage = (message, chainId) => {
  const currentDate = new Date();
  const timestamp = (currentDate.getTime() / 1e3).toFixed();
  const newMessage = {
    msg: {
      payload: {
        name: message.title,
        body: message.desc,
        choices: ["Yes", "No"],
        metadata: {
          uuid: message.addr,
          private: message.private ? 1 : 0,
          type: message.category,
          subType: message.category,
        },
      },
      timestamp: timestamp,
      token: message.token, //this token represents the space token registered in snapshot-hub
      space: message.space, //needs to be registered in snapshot-hub api
      type: message.type,
      actionId: message.actionId,
      version: snapshotHubMessageVersion,
      chainId: chainId,
      verifyingContract: message.verifyingContract,
    },
  };

  return newMessage;
};

export const buildProposalMessage = (message, chainId) => {
  const currentDate = new Date();
  const timestamp = (currentDate.getTime() / 1e3).toFixed();
  const newMessage = {
    msg: {
      payload: {
        name: message.title,
        body: message.desc,
        choices: ["Yes", "No"],
        start: timestamp,
        end: addHours(timestamp, message.votingTime),
        snapshot: 1, //FIXME: how to we get that?
        metadata: {
          uuid: message.addr,
          private: message.private ? 1 : 0,
          type: message.category,
          subType: message.category,
        },
      },
      timestamp: timestamp,
      token: message.token, //this token represents the space token registered in snapshot-hub
      space: message.space, //needs to be registered in snapshot-hub api
      type: message.type,
      actionId: message.actionId,
      version: snapshotHubMessageVersion,
      chainId: chainId,
      verifyingContract: message.verifyingContract,
    },
  };

  return newMessage;
};

export const buildVoteMessage = (vote, proposal, addr, chainId) => {
  const currentDate = new Date();
  const timestamp = (currentDate.getTime() / 1e3).toFixed();
  return {
    address: addr,
    msg: {
      payload: {
        choice: vote,
        proposalIpfsHash: proposal.ipfsHash,
        metadata: {
          memberAddress: addr,
        },
      },
      timestamp: timestamp,
      token: message.token, //this token represents the space token registered in snapshot-hub
      space: message.space,
      type: "vote",
      version: snapshotHubMessageVersion,
      actionId: proposal.actionId,
      chainId: chainId,
      verifyingContract: proposal.verifyingContract,
    },
  };
};

export const submitMessage = (snapshotHubURL, addr, message, signature) => {
  const data = {
    address: addr,
    msg: JSON.stringify(message),
    sig: signature,
  };
  return axios.post(`${snapshotHubURL}/api/message`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getDrafts = (snapshotHubURL, space) => {
  return axios.get(`${snapshotHubURL}/api/${space}/drafts`);
};

export const getProposals = (snapshotHubURL, space) => {
  return axios.get(`${snapshotHubURL}/api/${space}/proposals`);
};

export const getVotes = (snapshotHubURL, space, proposalId) => {
  return axios.get(
    `${snapshotHubURL}/api/${space}/proposal/${proposalId}/votes`
  );
};

export const getApiStatus = (snapshotHubURL) => {
  return axios.get(`${snapshotHubURL}/api`);
};
