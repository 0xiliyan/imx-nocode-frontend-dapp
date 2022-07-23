import React, {useState, useEffect, useRef} from "react";
import {
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay
} from '@chakra-ui/react'
import {Input} from "@chakra-ui/input";
import {Button} from "@chakra-ui/button";
import styled from "styled-components";
import {useDisclosure} from "@chakra-ui/hooks";
import {FormControl, FormHelperText, FormLabel} from "@chakra-ui/form-control";
import {Flex, SimpleGrid} from "@chakra-ui/layout";
import {Select} from "@chakra-ui/select";

const StyledDrawer = styled(Drawer)`
    color: #000;
`

const ConfigureButton = styled(Button)`
    position: absolute;
    top: 5px;
    right: 25px;
`

const ConfigurationPanel = ({config, updateConfig}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef(null);

    return (
        <>
            <ConfigureButton onClick={onOpen} colorScheme="messenger" mr={25}>Configure Dapp</ConfigureButton>
            <StyledDrawer
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
                finalFocusRef={btnRef}
                size="lg"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton color="#000" />
                    <DrawerHeader color="#000">Configure Minting Dapp</DrawerHeader>

                    <DrawerBody>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Minting Enabled?</FormLabel>
                                <Select color="#000" onChange={(e) => updateConfig('isMintingEnabled', e.target.value)} value={config.isMintingEnabled}>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Current App Network</FormLabel>
                                <Select color="#000" onChange={(e) => updateConfig('appNetwork', e.target.value)} value={config.appNetwork}>
                                    <option value="ropsten">Ropsten</option>
                                    <option value="mainnet">Mainnet</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">NFT Collection IMX Contract Address</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('tokenContractAddress', e.target.value)} value={config.tokenContractAddress} />
                                <FormHelperText>Enter the contract address for your NFT collection on IMX. Addresses are different for Ropsten / Mainnet.</FormHelperText>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Payment Layer</FormLabel>
                                <Select color="#000" onChange={(e) => updateConfig('mintLayer', e.target.value)} value={config.mintLayer}>
                                    <option value="l1">Ethereum L1</option>
                                    <option value="l2">ImmutableX L2</option>
                                </Select>
                                <FormHelperText>Which blockchain do you use for mint payments in this dapp - ETH L1 or L2</FormHelperText>
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Mint Cost (ETH)</FormLabel>
                                <Input placeholder="e.g. 0.04 ETH" color="#000" onChange={(e) => updateConfig('mintCost', e.target.value)} value={config.mintCost} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Collection Size</FormLabel>
                                <Input placeholder="e.g. 10000" color="#000" onChange={(e) => updateConfig('collectionSize', e.target.value)} value={config.collectionSize} />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Max Mints per User</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('maxMintsForUser', e.target.value)} value={config.maxMintsForUser} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Deposit Wallet Address</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('depositWalletAddress', e.target.value)} value={config.depositWalletAddress} />
                                <FormHelperText>Enter the wallet address where you will take payments for minting your NFT</FormHelperText>
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Mint is for Whitelisted Only?</FormLabel>
                                <Select color="#000" onChange={(e) => updateConfig('whitelistOnly', e.target.value)} value={config.whitelistOnly}>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Whitelisted Addresses</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('whitelistedAddresses', e.target.value)} value={config.whitelistedAddresses.join(',')} />
                                <FormHelperText>Enter a list of comma separated wallet addresses that will be whitelisted to mint</FormHelperText>
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Page Background Color (HEX)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('backgroundColor', e.target.value)} value={config.backgroundColor} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Page Text Color (HEX)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('textColor', e.target.value)} value={config.textColor} />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Button Background Color (HEX)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('buttonBackgroundColor', e.target.value)} value={config.buttonBackgroundColor} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Button Color (HEX)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('buttonColor', e.target.value)} value={config.buttonColor} />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Base Text Size (px)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('textSizePx', e.target.value)} value={config.textSizePx} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Logo Max Width (px)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('logoMaxWidth', e.target.value)} value={config.logoMaxWidth} />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Page Heading</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('pageHeading', e.target.value)} value={config.pageHeading} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Logo Max Width (px)</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('logoMaxWidth', e.target.value)} value={config.logoMaxWidth} />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Mint Button Text</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('mintButtonLabel', e.target.value)} value={config.mintButtonLabel} />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Current Price Text</FormLabel>
                                <Input color="#000" onChange={(e) => updateConfig('currentPriceLabel', e.target.value)} value={config.currentPriceLabel} />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={10} mb={5}>
                            <FormControl>
                                <FormLabel color="#000">Mint Button Border Style</FormLabel>
                                <Select color="#000" onChange={(e) => updateConfig('mintButtonBorderStyle', e.target.value)} value={config.mintButtonBorderStyle}>
                                    <option value="rounded">Rounded</option>
                                    <option value="rectangular">Rectangular</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="#000">Sale End Countdown Date</FormLabel>
                                <Input type="date" color="#000" onChange={(e) => updateConfig('countdownDate', e.target.value)} value={config.countdownDate} />
                            </FormControl>
                        </SimpleGrid>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant='outline' mr={3} onClick={onClose} color="#555">
                            Cancel
                        </Button>
                        <Button colorScheme='messenger'>Save</Button>
                    </DrawerFooter>
                </DrawerContent>
            </StyledDrawer>
        </>
    );
}

export default ConfigurationPanel;