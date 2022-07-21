import React, {useState, useEffect} from "react";
import {ethers} from "ethers";
import styled, {css} from 'styled-components';
import GlobalStyles from "../components/globalStyles";
import config from "../config";
import axios from "axios";
import Countdown from 'react-countdown';
import {ETHTokenType, Link} from "@imtbl/imx-sdk";

const ErrorMessage = styled.div`
    color: #ff0000;
    margin-bottom: 10px;
    font-size: ${props => props.textSizePx * 1.6 + 'px'};
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
    padding: 10px 25px;
    border: 0px;
    font-size: ${props => props.textSizePx * 1.6 + 'px'};
    font-weight: 700;
    cursor: pointer;
    background: ${props => props.background};
    color: ${props => props.color};    
    border-radius: ${props => props.borderStyle == 'rounded' ? '20px' : 'none' }
`

const MintButton = styled(ConnectWalletButton)`
    margin-top: 30px;
`

const WalletConnected = styled.div`
    font-size: ${props => props.textSizePx * 1.8 + 'px'};
`

const CurrentPrice = styled.div`
    font-size: ${props => props.textSizePx * 2 + 'px'};
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
    font-size: ${props => props.textSizePx * 2 + 'px'};
    cursor: pointer;
`

const AddMint = styled(RemoveMint)`
    
`

const MintsForUser = styled.div`
    font-size: ${props => props.textSizePx * 2.5 + 'px'};
`

const Heading = styled.h1`
    font-size: ${props => props.textSizePx * 2.5 + 'px'};
    margin-top: 20px;
`

const TotalMinted = styled.div`
    margin: 20px 0px 40px 0px;
    font-size: ${props => props.textSizePx * 2.5 + 'px'};
`

const CountdownContainer = styled.div`
    text-align: center;
    font-size: ${props => props.textSizePx * 3 + 'px'};
`

const Index = () => {
    const [linkSDK, setLinkSDK] = useState(null);
    const [mintsForUser, setMintsForUser] = useState(1);
    const [error, setError] = useState();
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();
    const [signerAddress, setSignerAddress] = useState();
    const [minting, setMinting] = useState(false);
    const [mintingEnabled, setMintingEnabled] = useState(config.isMintingEnabled);
    const [lastMintedId, setLastMintedId] = useState(0);
    const [countdownDate, setCountdownDate] = useState('');

    useEffect(() => {
        checkLastMinted();

        if (config.countdownDate) {
            setCountdownDate(new Date(config.countdownDate));
        }
    }, []);

    useEffect(() => {
        if (countdownDate) {
            checkCountdownDate();
        }
    }, [countdownDate]);

    useEffect(() => {
        if (lastMintedId > config.collectionSize) {
            setMintingEnabled(false);
        }
    }, [lastMintedId]);

    const connectWallet = async (e) => {
        e.preventDefault();

        if (config.mintLayer == 'l1') {
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
        else {
            const linkSdkUrl = config.appNetwork == 'mainnet' ? config.linkSDK : config.linkSDKRopsten;
            const link = new Link(linkSdkUrl);
            setLinkSDK(link);
            // we don't really need this
            setSigner(link);

            if (!localStorage.getItem('address')) {
                const {address} = await link.setup({});
                localStorage.setItem('address', address);

                setSignerAddress(address);
            }
            else {
                setSignerAddress(localStorage.getItem('address'));
            }
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
        checkCountdownDate();

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

                if (config.mintLayer == 'l1') {
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
                else {
                    try {
                        linkSDK.transfer([
                            {
                                amount: config.mintCost * mintsForUser,
                                type: ETHTokenType.ETH,
                                toAddress: config.depositWalletAddress,
                            }]);

                        setMinting(false);
                        localStorage.setItem(signerAddress, mintsForUser);

                        checkLastMinted();

                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    }

    const checkLastMinted = async () => {
        if (config.tokenContractAddress) {
            const url = `https://api.${config.appNetwork == 'ropsten' ? 'ropsten.' : ''}x.immutable.com/v1/mints?token_address=${config.tokenContractAddress}`;
            const {data} = await axios.get(url);

            if (data.result.length) {
                setLastMintedId(data.result[0].token.data.token_id);
            }
        }
    }

    const checkCountdownDate = () => {
        // disable minting if we're past mint date
        if (countdownDate && new Date(countdownDate) < new Date()) {
            setMintingEnabled(false);
        }
    }

    return (
        <MintContainer>
            <GlobalStyles background={config.backgroundColor} color={config.textColor} textSizePx={config.textSize} />
            {error && <ErrorMessage textSizePx={config.textSizePx}>{error}</ErrorMessage>}
            <Heading textSizePx={config.textSizePx}>{config.pageHeading}</Heading>
            {countdownDate &&
                <CountdownContainer textSizePx={config.textSizePx}>
                    <Countdown date={countdownDate}>
                        <div>Minting is closed!</div>
                    </Countdown>
                </CountdownContainer>
            }
            <CollectionLogo src="/images/logo.png" width={config.logoMaxWidth} />
            <TotalMinted textSizePx={config.textSizePx}>{lastMintedId} / {config.collectionSize}</TotalMinted>
            <ConnectWallet textSizePx={config.textSizePx}>
                {signerAddress ?
                    <WalletConnected textSizePx={config.textSizePx}>{displayAddress(signerAddress)}</WalletConnected> :
                    <ConnectWalletButton onClick={connectWallet} borderStyle={config.mintButtonBorderStyle} textSizePx={config.textSizePx} background={config.buttonBackgroundColor} color={config.buttonColor}>CONNECT WALLET</ConnectWalletButton>
                }
            </ConnectWallet>
            <CurrentPrice textSizePx={config.textSizePx}>{config.currentPriceLabel} {config.mintCost} ETH</CurrentPrice>
            <SelectMintsForUser>
                <RemoveMint onClick={decreaseMintsForUser} background={config.buttonBackgroundColor} color={config.buttonColor} textSizePx={config.textSizePx}>-</RemoveMint>
                <MintsForUser textSizePx={config.textSizePx}>{mintsForUser}</MintsForUser>
                <AddMint onClick={increaseMintsForUser} background={config.buttonBackgroundColor} color={config.buttonColor}>+</AddMint>
            </SelectMintsForUser>
            {mintingEnabled && signer &&
                <MintButton onClick={mint} background={config.buttonBackgroundColor} color={config.buttonColor} borderStyle={config.mintButtonBorderStyle} textSizePx={config.textSizePx}>{config.mintButtonLabel}</MintButton>
            }
        </MintContainer>
    );
}

export default Index;