/**
MIT License

Copyright (c) 2020 Openlaw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
import { sha3, toBN } from "web3-utils";
import { TypedDataUtils, recoverTypedSignature_v4 } from "eth-sig-util";

import {
  MessageWithType,
  PrepareDraftMessageData,
  PrepareDraftMessagePayloadData,
  PrepareDraftMessagePayloadReturn,
  PrepareDraftMessageReturn,
  PrepareProposalMessageData,
  PrepareProposalMessageReturn,
  PrepareProposalPayloadData,
  PrepareProposalPayloadReturn,
  PrepareVoteMessageData,
  PrepareVoteMessagePayloadData,
  PrepareVoteProposalData,
  VoteEntry,
  VoteEntryLeaf,
} from "./types";
import MerkleTree from "./utils/merkleTree";
import { SnapshotType, VoteChoicesIndex } from "./utils";

export const getMessageERC712Hash = (
  message: MessageWithType,
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const m = prepareMessage(message);
  const { domain, types } = getDomainDefinition(
    message,
    verifyingContract,
    actionId,
    chainId
  );
  const msgParams = {
    domain: domain,
    message: m,
    primaryType: "Message",
    types: types,
  };
  //TODO do we need to use v4 here?
  return "0x" + TypedDataUtils.sign<any>(msgParams, true).toString("hex");
};

export const getDraftERC712Hash = (
  message: MessageWithType,
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const updatedMessage = { ...message, type: SnapshotType.draft };

  return getMessageERC712Hash(
    updatedMessage,
    verifyingContract,
    actionId,
    chainId
  );
};

export const getDomainDefinition = (
  message: MessageWithType,
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  switch (message.type) {
    case "draft":
      return getDraftDomainDefinition(verifyingContract, actionId, chainId);
    case "vote":
      return getVoteDomainDefinition(verifyingContract, actionId, chainId);
    case "proposal":
      return getProposalDomainDefinition(verifyingContract, actionId, chainId);
    case "result":
      return getVoteResultRootDomainDefinition(
        verifyingContract,
        actionId,
        chainId
      );
    default:
      throw new Error("unknown type " + message.type);
  }
};

export const getMessageDomainType = (
  chainId: number,
  verifyingContract: string,
  actionId: string
) => {
  return {
    name: "Snapshot Message",
    version: "4",
    chainId,
    verifyingContract,
    actionId,
  };
};

export const getVoteDomainDefinition = (
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const domain = getMessageDomainType(chainId, verifyingContract, actionId);

  // The named list of all type definitions
  const types = {
    Message: [
      { name: "timestamp", type: "uint256" },
      { name: "payload", type: "MessagePayload" },
    ],
    MessagePayload: [
      { name: "choice", type: "uint256" },
      { name: "proposalHash", type: "bytes32" },
    ],
    EIP712Domain: getDomainType(),
  };

  return { domain, types };
};

export const getVoteStepDomainDefinition = (
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const domain = getMessageDomainType(chainId, verifyingContract, actionId);

  // The named list of all type definitions
  const types = {
    Message: [
      { name: "account", type: "address" },
      { name: "timestamp", type: "uint256" },
      { name: "nbYes", type: "uint256" },
      { name: "nbNo", type: "uint256" },
      { name: "index", type: "uint256" },
      { name: "choice", type: "uint256" },
      { name: "proposalHash", type: "bytes32" },
    ],
    EIP712Domain: getDomainType(),
  };

  return { domain, types };
};

export const getProposalDomainDefinition = (
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const domain = getMessageDomainType(chainId, verifyingContract, actionId);

  const types = {
    Message: [
      { name: "timestamp", type: "uint256" },
      { name: "spaceHash", type: "bytes32" },
      { name: "payload", type: "MessagePayload" },
    ],
    MessagePayload: [
      { name: "nameHash", type: "bytes32" },
      { name: "bodyHash", type: "bytes32" },
      { name: "choices", type: "string[]" },
      { name: "start", type: "uint256" },
      { name: "end", type: "uint256" },
      { name: "snapshot", type: "string" },
    ],
    EIP712Domain: getDomainType(),
  };

  return { domain, types };
};

export const getDraftDomainDefinition = (
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const domain = getMessageDomainType(chainId, verifyingContract, actionId);

  const types = {
    Message: [
      { name: "timestamp", type: "uint256" },
      { name: "spaceHash", type: "bytes32" },
      { name: "payload", type: "MessagePayload" },
    ],
    MessagePayload: [
      { name: "nameHash", type: "bytes32" },
      { name: "bodyHash", type: "bytes32" },
      { name: "choices", type: "string[]" },
    ],
    EIP712Domain: getDomainType(),
  };

  return { domain, types };
};

export const getVoteResultRootDomainDefinition = (
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const domain = getMessageDomainType(chainId, verifyingContract, actionId);

  const types = {
    Message: [{ name: "root", type: "bytes32" }],
    EIP712Domain: getDomainType(),
  };

  return { domain, types };
};

export const getDomainType = () => {
  return [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    { name: "actionId", type: "address" },
  ];
};

export const prepareMessage = (message: MessageWithType) => {
  switch (message.type) {
    // @note Probably better to use this function on its own in consuming code, as the types are precise.
    case "draft":
      return prepareDraftMessage(
        (message as unknown) as PrepareDraftMessageData
      );
    // @note Probably better to use this function on its own in consuming code, as the types are precise.
    case "vote":
      return prepareVoteMessage((message as unknown) as PrepareVoteMessageData);
    case "proposal":
      // @note Probably better to use this function on its own in consuming code, as the types are precise.
      return prepareProposalMessage(
        (message as unknown) as PrepareProposalMessageData
      );
    case "result":
      return message;
    default:
      throw new Error("unknown type " + message.type);
  }
};

export const prepareVoteMessage = (message: PrepareVoteMessageData) => {
  const timestampParsed: number =
    typeof message.timestamp === "string"
      ? parseInt(message.timestamp)
      : message.timestamp;

  return {
    timestamp: timestampParsed,
    payload: prepareVotePayload(message.payload),
  };
};

export const prepareVotePayload = (payload: PrepareVoteMessagePayloadData) => {
  return {
    proposalHash: payload.proposalHash,
    choice: payload.choice,
  };
};

export function prepareProposalMessage(
  message: PrepareProposalMessageData
): PrepareProposalMessageReturn {
  try {
    const spaceHash: string | null = sha3(message.space);
    const timestampParsed: number =
      typeof message.timestamp === "string"
        ? parseInt(message.timestamp)
        : message.timestamp;

    if (!spaceHash) {
      throw new Error("Hash of `space` returned empty.");
    }

    return {
      spaceHash,
      timestamp: timestampParsed,
      payload: prepareProposalMessagePayload(message.payload),
    };
  } catch (error) {
    throw error;
  }
}

export function prepareProposalMessagePayload(
  payload: PrepareProposalPayloadData
): PrepareProposalPayloadReturn {
  try {
    const nameHash: string | null = sha3(payload.name);
    const bodyHash: string | null = sha3(payload.body);

    if (!nameHash) {
      throw new Error("Hash of `name` returned empty");
    }
    if (!bodyHash) {
      throw new Error("Hash of `body` returned empty");
    }

    return {
      nameHash,
      bodyHash,
      choices: payload.choices,
      snapshot: payload.snapshot.toString(),
      start: payload.start,
      end: payload.end,
    };
  } catch (error) {
    throw error;
  }
}

export const prepareDraftMessage = (
  message: PrepareDraftMessageData
): PrepareDraftMessageReturn => {
  try {
    const spaceHash: string | null = sha3(message.space);
    const timestampParsed: number =
      typeof message.timestamp === "string"
        ? parseInt(message.timestamp)
        : message.timestamp;

    if (!spaceHash) {
      throw new Error("Hash of `space` returned empty.");
    }

    return {
      spaceHash,
      timestamp: timestampParsed,
      payload: prepareDraftMessagePayload(message.payload),
    };
  } catch (error) {
    throw error;
  }
};

export function prepareDraftMessagePayload(
  payload: PrepareDraftMessagePayloadData
): PrepareDraftMessagePayloadReturn {
  try {
    const nameHash: string | null = sha3(payload.name);
    const bodyHash: string | null = sha3(payload.body);

    if (!nameHash) {
      throw new Error("Hash of `name` returned empty");
    }
    if (!bodyHash) {
      throw new Error("Hash of `body` returned empty");
    }

    return {
      nameHash,
      bodyHash,
      choices: payload.choices,
    };
  } catch (error) {
    throw error;
  }
}

export const toStepNode = ({
  actionId,
  chainId,
  merkleTree,
  step,
  verifyingContract,
}: {
  actionId: string;
  chainId: number;
  merkleTree: MerkleTree;
  step: VoteEntryLeaf;
  verifyingContract: string;
}) => ({
  account: step.account,
  nbNo: step.nbNo,
  nbYes: step.nbYes,
  index: step.index,
  choice: step.choice,
  sig: step.sig,
  timestamp: step.timestamp,
  proposalHash: step.proposalHash,
  proof: merkleTree.getHexProof(
    buildVoteLeafHashForMerkleTree(step, verifyingContract, actionId, chainId)
  ),
});

export const createVote = ({
  account,
  proposalHash,
  sig,
  timestamp,
  voteYes,
  weight,
}: {
  account: string;
  proposalHash: string;
  timestamp: number;
  voteYes: boolean;
  /**
   * Optionally add existing weight. Defaults to `0`.
   * @note Be sure to attach to the resulting `VoteEntry` before submission.
   */
  weight?: string | number;
  /**
   * Optionally add an existing signature. Defaults to `""`.
   * @note Be sure to attach to the resulting `VoteEntry` before submission.
   */
  sig?: string;
}): VoteEntry => {
  const payload = {
    account,
    choice: voteYes ? VoteChoicesIndex.Yes : VoteChoicesIndex.No,
    proposalHash,
  };

  const vote = {
    type: SnapshotType.vote as SnapshotType.vote,
    timestamp,
    payload,
    sig: sig ?? "",
    weight: weight ?? 0,
  };

  return vote;
};

export const buildVoteLeafHashForMerkleTree = (
  leaf: any,
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const { domain, types } = getVoteStepDomainDefinition(
    verifyingContract,
    actionId,
    chainId
  );
  const msgParams = {
    domain,
    message: leaf,
    primaryType: "Message",
    types,
  };
  return "0x" + TypedDataUtils.sign<any>(msgParams).toString("hex");
};

export async function prepareVoteResult({
  actionId,
  chainId,
  daoAddress,
  votes,
}: {
  actionId: string;
  chainId: number;
  daoAddress: string;
  votes: VoteEntry[];
}): Promise<{ voteResultTree: MerkleTree; votes: VoteEntryLeaf[] }> {
  // Sort votes ASC by account string
  const sortedVotes = votes.sort((a, b) => {
    const accountA = a.payload.account.toUpperCase(); // ignore upper and lowercase
    const accountB = b.payload.account.toUpperCase(); // ignore upper and lowercase
    if (accountA < accountB) {
      return -1;
    }
    if (accountA > accountB) {
      return 1;
    }
    // names must be equal
    return 0;
  });

  const leaves = [...(sortedVotes as VoteEntryLeaf[])];

  leaves.forEach((leaf, idx) => {
    leaf.nbYes =
      leaf.payload.choice === VoteChoicesIndex.Yes
        ? toBN(leaf.weight).toString()
        : "0";
    leaf.nbNo =
      leaf.payload.choice !== VoteChoicesIndex.Yes
        ? toBN(leaf.weight).toString()
        : "0";
    leaf.account = leaf.payload.account;
    leaf.choice = leaf.payload.choice;
    leaf.proposalHash = leaf.payload.proposalHash;

    if (idx > 0) {
      const previousLeaf = leaves[idx - 1];
      leaf.nbYes = toBN(leaf.nbYes).add(toBN(previousLeaf.nbYes)).toString();
      leaf.nbNo = toBN(leaf.nbNo).add(toBN(previousLeaf.nbNo)).toString();
    }

    leaf.index = idx;
  });

  const tree = new MerkleTree(
    leaves.map((vote) =>
      buildVoteLeafHashForMerkleTree(vote, daoAddress, actionId, chainId)
    )
  );

  return { voteResultTree: tree, votes: leaves };
}

export function prepareVoteProposalData(
  data: PrepareVoteProposalData,
  web3Instance: any
): string {
  return web3Instance.eth.abi.encodeParameter(
    {
      ProposalMessage: {
        timestamp: "uint256",
        spaceHash: "bytes32",
        payload: {
          nameHash: "bytes32",
          bodyHash: "bytes32",
          choices: "string[]",
          start: "uint256",
          end: "uint256",
          snapshot: "string",
        },
        sig: "bytes",
      },
    },
    {
      timestamp: data.timestamp,
      spaceHash: sha3(data.space),
      payload: prepareVoteProposalPayload(data.payload),
      sig: data.sig || "0x",
    }
  );
}

export const prepareVoteProposalPayload = (
  payload: PrepareVoteProposalData["payload"]
) => {
  return {
    nameHash: sha3(payload.name),
    bodyHash: sha3(payload.body),
    choices: payload.choices,
    start: payload.start,
    end: payload.end,
    snapshot: payload.snapshot,
  };
};

/**
 * Signs a message with MetaMask's `request`
 *
 *
 * @note We will replace this with hopefully the ethers.js version.
 * @note Provider must be via MetaMask's injected Web3 provider
 *   for this function to work.
 *
 * @param provider
 * @param signer
 * @param data
 * @see https://docs.metamask.io/guide/signing-data.html#signing-data-with-metamask
 */
export const signMessage = (provider: any, signer: any, data: any) => {
  return provider.request({
    method: "eth_signTypedData_v4",
    params: [signer, data],
    from: signer,
  });
};

export const verifySignature = (
  message: MessageWithType,
  address: string,
  verifyingContract: string,
  actionId: string,
  chainId: number,
  signature: string
) => {
  const { domain, types } = getDomainDefinition(
    message,
    verifyingContract,
    actionId,
    chainId
  );

  const msgParams = {
    domain,
    message,
    primaryType: "Message",
    types,
  };

  const recoverAddress = recoverTypedSignature_v4<any>({
    data: msgParams,
    sig: signature,
  });
  return address.toLowerCase() === recoverAddress.toLowerCase();
};

// Export utilities
export * from "./utils";
