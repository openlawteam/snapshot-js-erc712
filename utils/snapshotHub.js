const snapshotHubMessageVersion = "0.2.0"; //needs to match snapshot-hub api version

const addHours = (ts, hours) => {
  let date = new Date(ts * 1e3);
  date.setHours(date.getHours() + hours);
  return (date.getTime() / 1e3).toFixed();
};

export const buildDraftMessage = (message, chainId, token, space) => {
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
      token: token, //this token represents the space token registered in snapshot-hub
      space: space, //needs to be registered in snapshot-hub api
      type: message.type,
      actionId: message.actionId,
      version: snapshotHubMessageVersion,
      chainId: chainId,
      verifyingContract: message.verifyingContract,
    },
  };

  return newMessage;
};

export const buildProposalMessage = (message, chainId, token, space) => {
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
      token: token, //this token represents the space token registered in snapshot-hub
      space: space, //needs to be registered in snapshot-hub api
      type: message.type,
      actionId: message.actionId,
      version: snapshotHubMessageVersion,
      chainId: chainId,
      verifyingContract: message.verifyingContract,
    },
  };

  return newMessage;
};

export const buildVoteMessage = (
  vote,
  proposal,
  addr,
  chainId,
  token,
  space
) => {
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
      token: token, //this token represents the space token registered in snapshot-hub
      space: space,
      type: "vote",
      version: snapshotHubMessageVersion,
      actionId: proposal.actionId,
      chainId: chainId,
      verifyingContract: proposal.verifyingContract,
    },
  };
};
