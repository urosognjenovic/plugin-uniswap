// Fetch the name of an ERC20 token
export const getERC20TokenName = async (address: any, ERC20ABI: any, client: any) => {
    try {
        const tokenName = await address.read.name();

        return tokenName;
    } catch (error) {
        throw new Error(`Error fetching ERC20 token name. The address is ${address}`);
    }
}
