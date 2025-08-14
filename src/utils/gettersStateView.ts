// TODO Fix types (remove any)

// Get the total liquidity of the pool
export const getPoolLiquidity = async (stateView: any, poolId: any) => {
  try {
    const liquidity = await stateView.read.getLiquidity([poolId]);

    return liquidity;
  } catch (error) {
    throw new Error("Error fetching pool liquidity:" + error);
  }
};

// Get the pool state
export const getPoolState = async (stateView: any, poolId: any) => {
  try {
    const [sqrtPriceX96, tick, protocolFee, lpFee] =
      await stateView.read.getSlot0([poolId]);

    return {
      sqrtPriceX96,
      tick,
      protocolFee,
      lpFee,
    };
  } catch (error) {
    throw new Error("Error fetching pool state:" + error);
  }
};
