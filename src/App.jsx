import React from 'react';
import { useState, useEffect} from 'react';
import ABI from './contractABI';
import { ethers } from 'ethers';
import './App.css';

export default function App(){
  
  //contract address and ABI
  const address = '0xd580442b44B08F39AEF96d52E4a984f4Ee84894B';
  const contractABI = ABI.abi;
  
  //component state
  const [currentAccount, setAccount] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [memo, setMemo] = useState([]);
  const [value, setValue] = useState();

  function onNameChange(e){
    setName(e.target.value);
  }

  function onMessageChange(e){
    setMsg(e.target.value);
  }

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
        setAccount(account);
        console.log(currentAccount);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }


  //here we done connection of our wallet account
  const connectWallet = async() => {
    try{
      const { ethereum } = window;
      if(!ethereum){
        console.log('make sure you have metamask');
      }

      const accounts = await ethereum.request({method:"eth_accounts"});
      setAccount(accounts[0]);
    }catch(error){
      console.error(error);
    }
  }

  //we have to buy coffee
  const buyCoffee = async() =>{
    try{
      const { ethereum } = window;
      if(ethereum){
        const provider = new ethers.BrowserProvider(ethereum);
        const signer =  await provider.getSigner();
        const buyMeCoffeeContract = new ethers.Contract(address, contractABI, signer);

        console.log('buying coffee...')
        const coffeeTxn = await buyMeCoffeeContract.buyCoffee(name, msg, {value: ethers.parseEther('0.01')});
        await coffeeTxn.wait();   //wait for transaction to be mined

        console.log('transaction is mined : ',coffeeTxn.hash);
        console.log('coffee purchased');

        //clear the name and message field
        setName("");
        setMsg("");  

      }
    }catch(error){
      console.log(error);
    }
  }

//function to fetch all the memos stored on-chin
const getMemos = async() =>{
  try{
    const { ethereum } = window;
    if(ethereum){
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const buyMeCoffeeContract = new ethers.Contract(address, contractABI, signer);

      console.log('fetching the memos from the smart contract');
      const memos = await buyMeCoffeeContract.getMemos();
      setMemo(memos);
    }
  }catch(error){
    console.log(error);
  }
}

async function getValue(){
    try{
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const buyMeCoffeeContract = new ethers.Contract(address, contractABI, signer);

      const value = await provider.getBalance(address);
      const valueInEth = await ethers.formatEther(value);
      setValue(valueInEth);
    }catch(error){
      console.log(error);
    }
}

  useEffect(()=>{
    isWalletConnected();
    getMemos();
    getValue();
  },[])

  console.log(memo);

  const array = memo.map((element, index)=>{
      return(<div className='info-block' key={index}>
              <p>Name: {element.name}</p>
              <p>Message: {element.message}</p>
              <p>From: {element.from}</p>
              <p>Time: {Number(element.timestamp)}sec</p>
        </div>)
    })

  const loot = async() => {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const buyMeCoffeeContract = new ethers.Contract(address, contractABI, signer);
    const looting = await buyMeCoffeeContract.withDrawnTips();
    await looting.wait();
  }  

  
  return(<div className='container'>
    <h1 className='logo'>My<br/>c🫥ffee<br/>Dapp</h1>
    <div className='detail'>
        <h1 className='heading'>hey! Buy Me A Coffee</h1>
        <p>hello i am sharad and currently learning web3 ,this is my buy me coffee dapp, if you want you can 
          send me some coffees.
        </p>
        <div className='form'>
          <input type='text' placeholder='name' onChange={onNameChange}/>
          <textarea placeholder='any note for sharad...' onChange={onMessageChange}></textarea>
          <button onClick={buyCoffee}>Buy Coffee</button>
          {!currentAccount && <button onClick={connectWallet}>connect wallet</button>}
        </div>      
    </div>
    <div className='info'>
       <h1 className='info-heading'>memos!</h1>
      { array }
    </div>
    <div className='withdrawn'>
        <h2>Withdraw money!🤗</h2>
        <p>current contract value : <span>{value}ETH</span></p>
        <button onClick={loot}>loot</button>
    </div>
  </div>)
}