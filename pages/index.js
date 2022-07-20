import React, {useState} from "react";
import {ethers} from "ethers";
import styled, {css} from 'styled-components';
import GlobalStyles from "../components/globalStyles";
import config from "../config";

const ErrorMessage = styled.div`
    color: #ff0000;
    margin-bottom: 10px;
    font-size: 20px;
`

const ConnectWallet = styled.div`
    margin: 15px;
`

const MintContainer = styled.div`
    margin: 30px auto;
    text-align: center;
`

const ConnectWalletButton = styled.button`
    background: #f900ff;
    color: #fff;
    padding: 10px 25px;
    border: 0px;
    font-size: 21px;
    font-weight: 700;
    border-radius: 20px;
    cursor: pointer;
    background: ${props => props.background};
    color: ${props => props.color};    
`

const MintButton = styled(ConnectWalletButton)`
    margin-top: 30px;
`

const WalletConnected = styled.div`
    font-size: 22px;
`

const CurrentPrice = styled.div`
    font-size: 32px;
    margin: 30px;
`

const CollectionLogo = styled.img`
    ${props => props.width && `
        max-width: ${props.width};
    `};
`

const SelectMintsForUser = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100px;
    margin: auto;
   
`

const RemoveMint = styled.div`
    height: 38px;
    width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.background};
    color: ${props => props.color};
    font-size: 25px;
    cursor: pointer;
`

const AddMint = styled(RemoveMint)`
    
`

const MintsForUser = styled.div`
    font-size: 30px;
`

const Index = () => {
    const [mintsForUser, setMintsForUser] = useState(1);

    const [error, setError] = useState();
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();
    const [signerAddress, setSignerAddress] = useState();
    const [minting, setMinting] = useState(false);
    const [mintingEnabled, setMintingEnabled] = useState(config.isMintingEnabled);

    const connectWallet = async (e) => {
        e.preventDefault();

        if (!window.ethereum) {
            setError("Metamask wallet not found, please install it to continue.");
            return;
        }

        setError();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts");
        const signer = provider.getSigner();
        const {chainId} = await provider.getNetwork();

        if (config.appNetwork == 'ropsten') {
            if (chainId != 3) {
                setError('Please connect your Metamask wallet to Ropsten testnet.');
                return;
            }
        } else {
            if (chainId != 1) {
                setError('Please connect your Metamask wallet to Ethereum mainnet.');
                return;
            }
        }

        const signerAddress = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setSignerAddress(signerAddress);

        // check deposit wallet balance if we have a limit to end the sale at (presale, public sale)
        if (config.endSaleAtDepositAmount > 0) {
            const depositProvider = ethers.getDefaultProvider(config.appNetwork == 'ropsten' ? 'ropsten' : 'mainnet');

            depositProvider.getBalance(config.depositWalletAddress).then((balance) => {
                // convert a currency unit from wei to ether
                const balanceInEth = parseFloat(ethers.utils.formatEther(balance));

                if (balanceInEth >= config.endSaleAtDepositAmount) {
                    setError('Mint sale limit has been reached, all NFTs are sold out during this sale!');
                    setMintingEnabled(false);
                }
            });
        }
    }

    const disconnectWallet = async () => {
        setProvider();
        setSigner();
        setSignerAddress();
    }

    const decreaseMintsForUser = () => {
        const newMintsForUser = mintsForUser -1;

        if (newMintsForUser >= 1) {
            setMintsForUser(newMintsForUser);
        }
    }

    const increaseMintsForUser = () => {
        const newMintsForUser = mintsForUser + 1;

        if (newMintsForUser <= config.maxMintsForUser) {
            setMintsForUser(newMintsForUser);
        }
    }

    const displayAddress = (address) => {
        return `${address.substr(0, 7)}...${address.substr(-5)}`;
    }

    const mint = async (e) => {
        e.preventDefault();

        if (signer && !minting) {

            if (config.whitelistOnly && !config.whitelistedAddresses.includes(signerAddress)) {
                setError('Your address must be whitelisted to mint.');
                return;
            }

            if (localStorage.getItem(signerAddress) >= config.maxMintsForUser) {
                setError('Max mint limit reached.');
                return;
            }

            if (mintsForUser <= config.maxMintsForUser) {
                // total mint cost in wei
                const totalMintCost = ethers.utils.parseEther('' + (config.mintCost * mintsForUser));

                setMinting(true);

                try {
                    const tx = await signer.sendTransaction({
                        to: config.depositWalletAddress,
                        value: totalMintCost
                    });

                    setMinting(false);

                    localStorage.setItem(signerAddress, mintsForUser);
                    console.log(tx);

                } catch (err) {
                    setMinting(false);

                    if (err.code === "INSUFFICIENT_FUNDS") {
                        setError(`Insufficient funds in wallet for minting, total cost is: ${config.mintCost * mintsForUser} ETH`);
                    }

                    console.log(err.message);
                }
            }
        }
    }

    return (
        <MintContainer>
            <GlobalStyles background={config.backgroundColor} color={config.textColor} />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <CollectionLogo src="/images/logo.png" width={config.logoMaxWidth} />
            <ConnectWallet>
                {signerAddress ?
                    <WalletConnected>{displayAddress(signerAddress)}</WalletConnected> :
                    <ConnectWalletButton onClick={connectWallet}  background={config.buttonBackgroundColor} color={config.buttonColor}>CONNECT WALLET</ConnectWalletButton>
                }
            </ConnectWallet>
            <CurrentPrice>MINT PRICE: {config.mintCost} ETH</CurrentPrice>
            <SelectMintsForUser>
                <RemoveMint onClick={decreaseMintsForUser} background={config.buttonBackgroundColor} color={config.buttonColor}>-</RemoveMint>
                <MintsForUser>{mintsForUser}</MintsForUser>
                <AddMint onClick={increaseMintsForUser} background={config.buttonBackgroundColor} color={config.buttonColor}>+</AddMint>
            </SelectMintsForUser>
            {mintingEnabled && signer &&
                <MintButton onClick={mint} background={config.buttonBackgroundColor} color={config.buttonColor}>MINT</MintButton>
            }
        </MintContainer>
    );
}

export default Index;