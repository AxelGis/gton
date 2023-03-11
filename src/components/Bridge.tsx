import React, { useState } from "react";
import Web3 from "web3";
import { bridgeToken, buyToken } from "../utils/bridgeutils";
import { validate } from "../utils/web3utils";
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
declare const window: any;

type BridgeProps = {

};

export const Bridge: React.FC<BridgeProps> = (props) => {
    const [amount,setAmount] = useState(1);
    const [log,setLog] = useState("");

    const updateAmount = (value:string) => {
        const regex:RegExp = /^\d+(?:\.\d+)?$/;
        if (value === "" || regex.test(value)) {
            setAmount(+value);
        }
        
    }

    const buying = async () => {
        await validate();
        const web3 = new Web3(window.ethereum);
        const signer = (await web3.eth.getAccounts())[0];
        setLog("wait for buying...");
        const gcd:number = await buyToken(amount, signer);
        setLog("wait for bridging...");
        const txt:string = await bridgeToken(gcd, signer);
        setLog(txt);
    }

    const bridging = async () => {
        await validate();
        const web3 = new Web3(window.ethereum);
        const signer = (await web3.eth.getAccounts())[0];
        setLog("wait for bridging...");
        const txt:string = await bridgeToken(amount, signer);
        setLog(txt);
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ pt: 5 }}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <TextField id="count" label="Count" variant="outlined"
                        onChange={(nv) => updateAmount(nv.target.value)} value={amount} />
                </Grid>
                <Grid item xs={4}>
                    <Button 
                        onClick={buying} 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 1, mb: 1 }}
                        color="primary"
                    >
                        Buy
                    </Button>
                </Grid>
                <Grid item xs={4}>
                    <Button 
                        onClick={bridging} 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 1, mb: 1 }}
                        color="success"
                    >
                        Bridge
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    {log}
                </Grid>
            </Grid>
        </Container>
    );
};