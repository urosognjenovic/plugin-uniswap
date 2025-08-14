import {
  createPublicClient,
  http,
  getContract,
  type Chain,
  type Address,
  type Abi,
  PublicClient,
} from "viem";

// Initialize the client
export const initializeClient = (
  chain: Chain | undefined,
  rpcUrl: string | undefined
): PublicClient => {
  return createPublicClient({
    chain: chain,
    transport: http(rpcUrl),
  });
};

// Set up a contract instance
export const setUpContract = (
  contractAddress: Address,
  contractABI: Abi,
  client: PublicClient
) => {
  return getContract({
    address: contractAddress,
    abi: contractABI,
    client: client,
  });
};
