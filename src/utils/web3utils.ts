import Web3 from 'web3';
import Big, {BigSource} from 'big.js';
import { AbiItem } from 'web3-utils';
import ERC20_ABI from './ABI/erc20.json';
declare const window: any;

export const validate = async () => {
    if (!window.ethereum || !window.ethereum!.isMetaMask) {
        throw new Error('NO_METAMASK');
    }
    if (!window.ethereum.request) {
        throw new Error('NO_METAMASK');
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
        throw new Error('NO_METAMASK');
    }

    const web3 = new Web3(window.ethereum);
    const currentChainId = await web3.eth.net.getId();
    if(currentChainId !== 97){
        throw new Error('Error NETWORK');
    }
}

export const approve = async (
    userAddress: string,
    token: string,
    spender: string,
    amount: Big,
): Promise<string> => {
    await validate();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], token);
    const tx = await contract.methods.approve(spender, amount.toFixed()).send(
        { from: userAddress }
    );
    return tx.transactionHash;
};
  
export const allowance = async (token: string, address: string): Promise<Big> => {
    await validate();
    const web3 = new Web3(window.ethereum);
    const signer = (await web3.eth.getAccounts())[0];
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], token);
    const userBalance: string = await contract.methods.allowance(signer, address).call();
    return Big(userBalance);
};

export const checkAllowance = async (tokenAddress:string, userAddress:string, dest:string, amount: Big) => {
    const allow = await allowance(tokenAddress, dest);
    if (amount.gt(allow)) {
        await approve(userAddress, tokenAddress, dest, amount);
    }
}

export const fromWei = (n: BigSource, d: number = 18): Big => Big(n).div(new Big(10).pow(d));
export const toWei = (n: BigSource, d: number = 18): Big => Big(n).mul(new Big(10).pow(d));