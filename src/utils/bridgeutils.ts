import Web3 from "web3";
import Big from 'big.js';
import { toWei, validate, checkAllowance } from "./web3utils";
import { AbiItem } from 'web3-utils';
import BRIDGE_ABI from './ABI/bridge.json';
import CDPMANAGER_ABI from './ABI/cdp.json';
import ERC20_ABI from './ABI/erc20.json';
import { bridgeAddress, busdAddress, cdpmanager, gcdAddress, ogxtAddress, ogxtL2Address, vault } from "./addresses";
declare const window: any;

export async function buyToken(amount:number, address:string):Promise<number> {
    const GCDAmount:number = amount * 6 / 10;
    const amountWei:Big = toWei(amount);
    const gcdWei:Big = toWei(GCDAmount);

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], ogxtAddress);
    const userBalance:string = await contract.methods.balanceOf(address).call();
    const balance:Big = Big(userBalance);

    if(amountWei.gt(balance)){
        throw Error('Insufficient amount');
    }

    await checkAllowance(ogxtAddress, address, vault, amountWei);
    await checkAllowance(gcdAddress, address, vault, gcdWei);

    const cdpContract = new web3.eth.Contract(CDPMANAGER_ABI as AbiItem[], cdpmanager);
    const txn = await cdpContract.methods
        .join(ogxtAddress, amountWei.toFixed(), gcdWei.toFixed())
        .send({ from: address });
    
    return GCDAmount;
}

export async function bridgeToken(amount:number, address:string):Promise<string> {
    await validate();

    const amountWei:Big = toWei(amount);

    const gas:number = 200000;
    const data:string = '0x00';
    const web3 = new Web3(window.ethereum);

    const contract = new web3.eth.Contract(BRIDGE_ABI as AbiItem[], bridgeAddress);
    let txn = await contract.methods.depositERC20(
        ogxtAddress,
        ogxtL2Address,
        amountWei.toFixed(),
        gas,
        data,
    ).send({ from: address });
    
    return txn.transactionHash;
}