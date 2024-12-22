import React, { useEffect, useState } from "react";
import * as buffer from "buffer";
import {
  SlotMachine,
  SlotStatus,
} from "./components/slot-machine/slot-machine";
import { initVault, spin, collectWins } from "./core/transactions";
import {
  checkIfWalletConnected,
  connectWallet,
  getBalance,
} from "./core/wallet";
import { ReactComponent as WalletSvg } from "./img/wallet.svg";

import "./App.css";
import { formatAddress } from "./core/utils";
import logo from "./img/logo.png";
window.Buffer = buffer.Buffer;

function App() {
  // Create and preload sounds
  const loginSound = new Audio(process.env.PUBLIC_URL + '/login-sound.mp3');
  const slotMachineSound = new Audio(process.env.PUBLIC_URL + '/Jackpot Slot Machine Sounds Effect Casino.mp3');
  loginSound.preload = 'auto';
  slotMachineSound.preload = 'auto';
  slotMachineSound.loop = true;
  const [walletAddress, setWalletAdresss] = useState("");
  const [status, setStatus] = useState(SlotStatus.none);
  const [jackpot, setJackpot] = useState("");
  const [balance, setBalance] = useState("");
  const [winBalance, setWinBalance] = useState("");

  useEffect(() => {
    // Play slot machine ambient sound when component mounts
    slotMachineSound.play().catch(err => console.log('Error playing sound:', err));
    
    getBalance();
    const onLoad = () => {
      checkIfWalletConnected().then((res) => {
        setWalletAdresss(res as string);
        updateBalance();
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const updateBalance = (onlyWallet = false) => {
    getBalance().then((res) => {
      res.balance && setBalance(res.balance);
      if (!onlyWallet) {
        res.winBalance && setWinBalance(res.winBalance);
      }
      if(res.vaultBalance) {
        setJackpot(res.vaultBalance)
      }
    });
  };

  const spinIt = () => {
    setStatus(SlotStatus.spin);

    // demo spin
    if (!walletAddress) {
      setTimeout(() => {
        setStatus(
          Math.floor(Math.random() * 2) === 0
            ? SlotStatus.loose
            : SlotStatus.win1
        );
      }, 2000);

      return;
    }
    spin().then((result) => {
      updateBalance(true);
      switch (result) {
        case "1":
          setStatus(SlotStatus.win1);
          break;
        case "2":
          setStatus(SlotStatus.win2);
          break;
        case "3":
          setStatus(SlotStatus.win3);
          break;

        default:
          setStatus(SlotStatus.loose);
      }
    });
  };

  return (
    <div className="App">
      <div className="top-image">
        <img src="https://zxiikllymaqizaoiqwam.supabase.co/storage/v1/object/public/art/IMG_7005.png" alt="Top Art" />
      </div>
      <div className="header">
        {walletAddress && (
          <div className="wallet-info">
            {balance}
            <WalletSvg />
            {formatAddress(walletAddress)}
          </div>
        )}
        {!walletAddress && (
          <button
            className="button"
            onClick={() => {
              connectWallet().then((res) => {
                setWalletAdresss(res as string);
                updateBalance();
                // Play sound on successful login
                loginSound.play().catch(err => console.log('Error playing sound:', err));
              });
            }}
          >
            Connect Phantom Wallet
          </button>
        )}
      </div>
      <div className="cluster">mainnet</div>
      <div className="glow-logo">
        <img src={process.env.PUBLIC_URL + '/logo-glow.png'} alt="Glowing Logo" className="glow-effect" />
      </div>
      <div className="logo">
        <img src={logo} alt="Logo"></img>
      </div>
      <div className="contaner-positioner">
        <div className="slot-container">
          <SlotMachine
            onSpin={spinIt}
            status={status}
            winBalance={winBalance}
            jackpot={jackpot}
            walletAddress={walletAddress}
            collect={() => {
              collectWins().then(() => {
                updateBalance();
              });
            }}
            onSpinFinished={() => {
              updateBalance();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
