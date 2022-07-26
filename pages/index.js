import React, {useState, useEffect, useRef} from "react";
import {ethers} from "ethers";
import styled, {css} from 'styled-components';
import GlobalStyles from "../components/globalStyles";
import config from "../config";
import axios from "axios";
import Countdown from 'react-countdown';
import {ETHTokenType, Link} from "@imtbl/imx-sdk";
import {useDisclosure} from "@chakra-ui/hooks";
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton, ChakraProvider,
} from '@chakra-ui/react'
import {Input} from "@chakra-ui/input";
import {Button} from "@chakra-ui/button";
import ConfigurationPanel from "../components/ConfigurationPanel";

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
    margin: auto;
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
    const [currentConfig, setCurrentConfig] = useState(config);
    const [linkSDK, setLinkSDK] = useState(null);
    const [mintsForUser, setMintsForUser] = useState(1);
    const [error, setError] = useState();
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();
    const [signerAddress, setSignerAddress] = useState();
    const [minting, setMinting] = useState(false);
    const [mintingEnabled, setMintingEnabled] = useState(currentConfig.isMintingEnabled);
    const [lastMintedId, setLastMintedId] = useState(0);
    const [countdownDate, setCountdownDate] = useState('');

    useEffect(() => {
        checkLastMinted();

        if (currentConfig.countdownDate) {
            setCountdownDate(new Date(currentConfig.countdownDate));
        }
    }, []);

    useEffect(() => {
        if (countdownDate) {
            checkCountdownDate();
        }
    }, [countdownDate]);

    useEffect(() => {
        if (lastMintedId > currentConfig.collectionSize) {
            setMintingEnabled(false);
        }
    }, [lastMintedId]);

    useEffect(() => {
        setMintingEnabled(currentConfig.isMintingEnabled);
    }, [currentConfig.isMintingEnabled]);

    useEffect(() => {
        if (lastMintedId > currentConfig.collectionSize) {
            setMintingEnabled(false);
        }
    }, [lastMintedId]);

    const connectWallet = async (e) => {
        e.preventDefault();

        if (currentConfig.mintLayer == 'l1') {
            if (!window.ethereum) {
                setError("Metamask wallet not found, please install it to continue.");
                return;
            }

            setError();

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts");
            const signer = provider.getSigner();
            const {chainId} = await provider.getNetwork();

            if (currentConfig.appNetwork == 'ropsten') {
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
            if (currentConfig.endSaleAtDepositAmount > 0) {
                const depositProvider = ethers.getDefaultProvider(currentConfig.appNetwork == 'ropsten' ? 'ropsten' : 'mainnet');

                depositProvider.getBalance(currentConfig.depositWalletAddress).then((balance) => {
                    // convert a currency unit from wei to ether
                    const balanceInEth = parseFloat(ethers.utils.formatEther(balance));

                    if (balanceInEth >= currentConfig.endSaleAtDepositAmount) {
                        setError('Mint sale limit has been reached, all NFTs are sold out during this sale!');
                        setMintingEnabled(false);
                    }
                });
            }
        }
        else {
            const linkSdkUrl = currentConfig.appNetwork == 'mainnet' ? currentConfig.linkSDK : currentConfig.linkSDKRopsten;
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

        if (newMintsForUser <= currentConfig.maxMintsForUser) {
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
            if (currentConfig.whitelistOnly && !currentConfig.whitelistedAddresses.includes(signerAddress)) {
                setError('Your address must be whitelisted to mint.');
                return;
            }

            if (localStorage.getItem(signerAddress) >= currentConfig.maxMintsForUser) {
                setError('Max mint limit reached.');
                return;
            }

            if (mintsForUser <= currentConfig.maxMintsForUser) {
                // total mint cost in wei
                const totalMintCost = ethers.utils.parseEther('' + (currentConfig.mintCost * mintsForUser));

                setMinting(true);

                if (currentConfig.mintLayer == 'l1') {
                    try {
                        const tx = await signer.sendTransaction({
                            to: currentConfig.depositWalletAddress,
                            value: totalMintCost
                        });

                        setMinting(false);

                        localStorage.setItem(signerAddress, mintsForUser);
                        console.log(tx);

                    } catch (err) {
                        setMinting(false);

                        if (err.code === "INSUFFICIENT_FUNDS") {
                            setError(`Insufficient funds in wallet for minting, total cost is: ${currentConfig.mintCost * mintsForUser} ETH`);
                        }

                        console.log(err.message);
                    }
                }
                else {
                    try {
                        linkSDK.transfer([
                            {
                                amount: currentConfig.mintCost * mintsForUser,
                                type: ETHTokenType.ETH,
                                toAddress: currentConfig.depositWalletAddress,
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
        if (currentConfig.tokenContractAddress) {
            const url = `https://api.${currentConfig.appNetwork == 'ropsten' ? 'ropsten.' : ''}x.immutable.com/v1/mints?token_address=${currentConfig.tokenContractAddress}`;
            const {data} = await axios.get(url);

            if (data.result.length) {
                const newLastMintedId = data.result[0].token.data.token_id;
                setLastMintedId(newLastMintedId);

                if (newLastMintedId >= currentConfig.collectionSize) {
                    setError('Mint sale limit has been reached, all NFTs are sold out during this sale!');
                    setMintingEnabled(false);
                }
            }
        }
    }

    const checkCountdownDate = () => {
        // disable minting if we're past mint date
        if (countdownDate && new Date(countdownDate) < new Date()) {
            setMintingEnabled(false);
        }
    }

    const updateConfig = (key, value) => {
        const newConfig = {...currentConfig};
        newConfig[key] = value;
        setCurrentConfig(newConfig);
    }

    return (
        <ChakraProvider>
            <MintContainer>
            <GlobalStyles background={currentConfig.backgroundColor} color={currentConfig.textColor} textSizePx={currentConfig.textSize} />
            {error && <ErrorMessage textSizePx={currentConfig.textSizePx}>{error}</ErrorMessage>}
            <Heading textSizePx={currentConfig.textSizePx}>{currentConfig.pageHeading}</Heading>
            {countdownDate &&
                <CountdownContainer textSizePx={currentConfig.textSizePx}>
                    <Countdown date={countdownDate}>
                        <div>Minting is closed!</div>
                    </Countdown>
                </CountdownContainer>
            }
            <CollectionLogo src="/images/logo.png" width={currentConfig.logoMaxWidth} />
            <TotalMinted textSizePx={currentConfig.textSizePx}>{lastMintedId} / {currentConfig.collectionSize}</TotalMinted>
            <ConnectWallet textSizePx={currentConfig.textSizePx}>
                {signerAddress ?
                    <WalletConnected textSizePx={currentConfig.textSizePx}>{displayAddress(signerAddress)}</WalletConnected> :
                    <ConnectWalletButton onClick={connectWallet} borderStyle={currentConfig.mintButtonBorderStyle} textSizePx={currentConfig.textSizePx} background={currentConfig.buttonBackgroundColor} color={currentConfig.buttonColor}>CONNECT WALLET</ConnectWalletButton>
                }
            </ConnectWallet>
            <CurrentPrice textSizePx={currentConfig.textSizePx}>{currentConfig.currentPriceLabel} {currentConfig.mintCost} ETH</CurrentPrice>
            <SelectMintsForUser>
                <RemoveMint onClick={decreaseMintsForUser} background={currentConfig.buttonBackgroundColor} color={currentConfig.buttonColor} textSizePx={currentConfig.textSizePx}>-</RemoveMint>
                <MintsForUser textSizePx={currentConfig.textSizePx}>{mintsForUser}</MintsForUser>
                <AddMint onClick={increaseMintsForUser} background={currentConfig.buttonBackgroundColor} color={currentConfig.buttonColor}>+</AddMint>
            </SelectMintsForUser>
            {mintingEnabled && signer &&
                <MintButton onClick={mint} background={currentConfig.buttonBackgroundColor} color={currentConfig.buttonColor} borderStyle={currentConfig.mintButtonBorderStyle} textSizePx={currentConfig.textSizePx}>{currentConfig.mintButtonLabel}</MintButton>
            }
            {process.env.isConfigurable ?
                <ConfigurationPanel config={currentConfig} updateConfig={updateConfig}/> : null
            }
        </MintContainer>
        </ChakraProvider>
    );
}

export default Index;