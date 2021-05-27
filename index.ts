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
import {
  TypedDataUtils,
  recoverTypedSignature_v4,
  signTypedData_v4,
} from "eth-sig-util";

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
  ToStepNodeResult,
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
    case "coupon":
      return getCouponDomainDefinition(verifyingContract, actionId, chainId);
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
      { name: "timestamp", type: "uint64" },
      { name: "payload", type: "MessagePayload" },
    ],
    MessagePayload: [
      { name: "choice", type: "uint32" },
      { name: "proposalId", type: "bytes32" },
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
      { name: "timestamp", type: "uint64" },
      { name: "nbYes", type: "uint88" },
      { name: "nbNo", type: "uint88" },
      { name: "index", type: "uint32" },
      { name: "choice", type: "uint32" },
      { name: "proposalId", type: "bytes32" },
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
      { name: "timestamp", type: "uint64" },
      { name: "spaceHash", type: "bytes32" },
      { name: "payload", type: "MessagePayload" },
    ],
    MessagePayload: [
      { name: "nameHash", type: "bytes32" },
      { name: "bodyHash", type: "bytes32" },
      { name: "choices", type: "string[]" },
      { name: "start", type: "uint64" },
      { name: "end", type: "uint64" },
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
      { name: "timestamp", type: "uint64" },
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

export const getCouponDomainDefinition = (
  verifyingContract: string,
  actionId: string,
  chainId: number
) => {
  const domain = getMessageDomainType(chainId, verifyingContract, actionId);

  const types = {
    Message: [
      { name: "authorizedMember", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
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
      return prepareDraftMessage(message as unknown as PrepareDraftMessageData);
    // @note Probably better to use this function on its own in consuming code, as the types are precise.
    case "vote":
      return prepareVoteMessage(message as unknown as PrepareVoteMessageData);
    case "proposal":
      // @note Probably better to use this function on its own in consuming code, as the types are precise.
      return prepareProposalMessage(
        message as unknown as PrepareProposalMessageData
      );
    case "result":
      return message;
    case "coupon":
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

export const prepareVotePayload = (payload: PrepareVoteMessagePayloadData) => ({
  proposalId: payload.proposalId,
  choice: payload.choice,
});

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
}): ToStepNodeResult => ({
  choice: step.choice,
  index: step.index,
  member: step.member,
  nbNo: step.nbNo,
  nbYes: step.nbYes,
  proof: merkleTree.getHexProof(
    buildVoteLeafHashForMerkleTree(step, verifyingContract, actionId, chainId)
  ),
  proposalId: step.proposalId,
  sig: step.sig,
  timestamp: step.timestamp,
});

export const createVote = ({
  memberAddress,
  proposalId,
  sig = "0x",
  timestamp,
  voteYes,
  weight = "0",
}: {
  memberAddress: string;
  proposalId: string;
  /**
   * Will default to `"0x"` if not provided.
   */
  sig: string;
  timestamp: number;
  voteYes: boolean;
  /**
   * Will default to `0` if not provided.
   */
  weight: string;
}): VoteEntry => {
  // If `weight` is falsey then set choice to `0`, else continue to determine a choice of yes or no.
  const choice: VoteEntry["choice"] = !weight
    ? 0
    : voteYes
    ? VoteChoicesIndex.Yes
    : VoteChoicesIndex.No;

  return {
    choice,
    member: memberAddress,
    proposalId,
    sig: sig ?? "0x",
    timestamp,
    type: SnapshotType.vote as SnapshotType.vote,
    weight: weight ?? "0",
  };
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
}): Promise<{ voteResultTree: MerkleTree; result: ToStepNodeResult[] }> {
  const votesToLeaves = [...(votes as VoteEntryLeaf[])];

  // Build each vote leaf
  votesToLeaves.forEach((v, i) => {
    const { choice, weight } = v;

    v.nbNo = choice === VoteChoicesIndex.No ? weight : "0";
    v.nbYes = choice === VoteChoicesIndex.Yes ? weight : "0";

    // Add together the running total of `nbYes`, `nbNo` voting `weight`s
    if (i > 0) {
      const previousVoteLeaf = votesToLeaves[i - 1];

      v.nbYes = toBN(v.nbYes).add(toBN(previousVoteLeaf.nbYes)).toString();
      v.nbNo = toBN(v.nbNo).add(toBN(previousVoteLeaf.nbNo)).toString();
    }

    v.index = i;
  });

  const tree = new MerkleTree(
    votesToLeaves.map((v) =>
      buildVoteLeafHashForMerkleTree(v, daoAddress, actionId, chainId)
    )
  );

  const result = votesToLeaves.map((vote) =>
    toStepNode({
      actionId,
      chainId,
      merkleTree: tree,
      step: vote,
      verifyingContract: daoAddress,
    })
  );

  return { voteResultTree: tree, result };
}

export function prepareVoteProposalData(
  data: PrepareVoteProposalData,
  web3Instance: any
): string {
  return web3Instance.eth.abi.encodeParameter(
    {
      ProposalMessage: {
        timestamp: "uint64",
        spaceHash: "bytes32",
        payload: {
          nameHash: "bytes32",
          bodyHash: "bytes32",
          choices: "string[]",
          start: "uint64",
          end: "uint64",
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

export const SigUtilSigner = (privateKeyStr: string) => {
  return function (
    message: MessageWithType,
    verifyingContract: string,
    actionId: string,
    chainId: number
  ) {
    const m = prepareMessage(message);
    if (privateKeyStr.indexOf("0x") === 0) {
      privateKeyStr = privateKeyStr.slice(2);
    }
    const privateKey = Buffer.from(privateKeyStr, "hex");
    const { domain, types } = getDomainDefinition(
      message,
      verifyingContract,
      actionId,
      chainId
    );
    const msgParams = {
      domain,
      message: m,
      primaryType: "Message",
      types,
    };
    return signTypedData_v4<any>(privateKey, { data: msgParams });
  };
};

// Export utilities
export * from "./utils";
