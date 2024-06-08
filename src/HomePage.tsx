import { useEffect, useState } from 'react';
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from 'arconnect'

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { InView } from 'react-intersection-observer'
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Segment,
  Sidebar,
  MenuMenu,
  MenuItem,
  GridColumn,
  GridRow,
  FormField,
  Form,
  Checkbox,
  FormGroup,
  FormInput,
  FormButton,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableFooter,
} from 'semantic-ui-react'


const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

interface Tag {
    name: string;
    value: string;
}

interface StakerDetails {
    [key: string]: number; 
}

interface ProposalDetail {
stake: number;
pattern: string; 
handle: string;
stakers: StakerDetails;
}

interface Proposal {
    name: string;
    stake: number;
    pattern: string;
    handle: string;
    stakers: StakerDetails;
}

const NOT = "Fq4KbPbzALhTnb-jvq040o0Na7O5H6Q_Cn52YQ3ZBfI"
const CRED = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"

function HomePage () {
    const [address, setAddress] = useState('')
    const [whatBalance, setWhatBalance] = useState(0)
    const [credBalance, setCredBalance] = useState(0)
    const [credValue, setCredValue] = useState('')
    const [stakeValue, setStakeValue] = useState('')
    const [stakeName, setStakeName] = useState('')
    const [propName, setPropName] = useState('')
    const [propPattern, setPropPattern] = useState('')
    const [propHandle, setPropHandle] = useState('')
    const [swapSuccess, setSuccess] = useState(false)
    const [stakeSuccess, setStakeSuccess] = useState(false)
    const [proposals, setProposals] = useState<Proposal[]>([])
    
    const fetchAddress =  async () => {
        await window.arweaveWallet.connect(
            permissions,
            {
                name: "Notus",
                logo: "OVJ2EyD3dKFctzANd0KX_PCgg8IQvk0zYqkWIj-aeaU"
            }
        )
        try {
            const address = await window.arweaveWallet.getActiveAddress()
            setAddress(address)
        } catch(error) {
            console.error(error)
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        switch (name) {
            case "stakeName":
                setStakeName(value);
                break;
            case "stakeValue":
                setStakeValue(value);
                break;
            case "swap":
                setCredValue(value);
                break;
            case "propName":
                setPropName(value);
                break
            default:
                break;
        }
    };

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        switch (name) {
            case "propPattern":
                setPropPattern(value)
                break
            case "propHandle":
                setPropHandle(value)
                break
            default:
                break
        }
    }

    const swap = async () => {
        var value = parseInt(credValue)
        var units = value * 1000
        var credUnits = units.toString()
        try {
            const getSwapMessage = await message({
                process: CRED,
                tags: [
                    { name: 'Action', value: 'Transfer' },
                    { name: 'Recipient', value: NOT },
                    { name: 'Quantity', value: credUnits }
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });
            try {
                let { Messages, Error } = await result({
                    message: getSwapMessage,
                    process: CRED,
                });
                if (Error) {
                    alert("Error handling swap:" + Error);
                    return;
                }
                if (!Messages || Messages.length === 0) {
                    alert("No messages were returned from ao. Please try later.");
                    return; 
                }
                const actionTag = Messages[0].Tags.find((tag: Tag) => tag.name === 'Action')
                if (actionTag.value === "Debit-Notice") {
                    setSuccess(true)
                }
            } catch (error) {
                alert("There was an error when swapping CRED for NOT: " + error)
            }
        } catch (error) {
            alert('There was an error swapping: ' + error)
        }
    }

    const stake = async () => {
        var value = parseInt(stakeValue)
        var units = value * 1000
        var whatUnits = units.toString()
        try {
            const getStakeMessage = await message({
                process: NOT,
                tags: [
                    { name: 'Action', value: 'Stake' },
                    { name: 'Quantity', value: whatUnits },
                    { name: 'Name', value: stakeName },
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });
            try {
                let { Messages, Error } = await result({
                    message: getStakeMessage,
                    process: NOT,
                });
                if (Error) {
                    alert("Error handling staking:" + Error);
                    return;
                }
                if (!Messages || Messages.length === 0) {
                    alert("No messages were returned from ao. Please try later.");
                    return; 
                }
                alert(Messages[0].Data)
                setStakeSuccess(true)
            } catch (error) {
                alert("There was an error when staking NOT: " + error)
            }
        } catch (error) {
            alert('There was an error staking: ' + error)
        }
    }

    const propose = async () => {
        try {
            const getPropMessage = await message({
                process: NOT,
                tags: [
                    { name: 'Action', value: 'Propose' },
                    { name: 'Name', value: propName },
                    { name: 'Pattern', value: propPattern },
                    { name: 'Handle', value: propHandle}
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });
            try {
                let { Messages, Error } = await result({
                    message: getPropMessage,
                    process: NOT,
                });
                if (Error) {
                    alert("Error handling staking:" + Error);
                    return;
                }
                if (!Messages || Messages.length === 0) {
                    alert("No messages were returned from ao. Please try later.");
                    return; 
                }
                alert(Messages[0].Data)
                setPropName('')
                setPropPattern('')
                setPropHandle('')
            } catch (error) {
                alert("There was an error when staking NOT: " + error)
            }
        } catch (error) {
            alert('There was an error staking: ' + error)
        }
    }

    useEffect(() => {
        const fetchBalance = async (process: string) => {
            try {
                const messageResponse = await message({
                    process,
                    tags: [
                        { name: 'Action', value: 'Balance' },
                    ],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getBalanceMessage = messageResponse;
                try {
                    let { Messages, Error } = await result({
                        message: getBalanceMessage,
                        process,
                    });
                    if (Error) {
                        alert("Error fetching balances:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const balanceTag = Messages[0].Tags.find((tag: Tag) => tag.name === 'Balance')
                    const balance = balanceTag ? parseFloat((balanceTag.value / 1000).toFixed(4)) : 0;
                    if (process === NOT) {
                        setWhatBalance(balance)
                    }
                    if (process === CRED) {
                        setCredBalance(balance)
                    }
                } catch (error) {
                    alert("There was an error when loading balances: " + error)
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchBalance(NOT)
        fetchBalance(CRED)
    }, [address, swapSuccess, stakeSuccess])

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const messageResponse = await message({
                    process: NOT,
                    tags: [
                        { name: 'Action', value: 'Proposals' },
                    ],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getProposalsMessage = messageResponse;
                try {
                    let { Messages, Error } = await result({
                        message: getProposalsMessage,
                        process: NOT,
                    });
                    if (Error) {
                        alert("Error fetching proposals:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const data = JSON.parse(Messages[0].Data)
                    const proposalsData = Object.entries(data).map(([name, details]) => {
                        const typedDetails: ProposalDetail = details as ProposalDetail;
                        return {
                          name,
                          stake: typedDetails.stake / 1000,
                          pattern: typedDetails.pattern,
                          handle: typedDetails.handle,
                          stakers: typedDetails.stakers,
                        };
                      });
                      setProposals(proposalsData);
                } catch (error) {
                    alert("There was an error when loading balances: " + error)
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchProposals()
    }, [])

	return (
        <Container style={{ marginTop: '3em' }}>

        <Header as='h2' dividing>
          Notus.
        </Header>
    
        <Grid columns={1} doubling>
          <Grid.Column>

            <Menu>
            <Button icon='heart' color ="green" />
            <Button color ="green" > Home </Button>
            <Button color ="green" > How It works.</Button>

                <MenuMenu position='right'>
                {address ?
                    (
                        <p>
                            <span className="md:hidden">{`${address.slice(0, 5)}...${address.slice(-3)}`}</span>
                            <span className ="hidden sm:hidden md:block">{address}</span>
                        </p>
                    ) :
                    (
                        <Button onClick={fetchAddress} primary>
                            Connect Wallet.
                        </Button>
                    )
                }
                </MenuMenu>
            </Menu>
          </Grid.Column>
        </Grid>
    
        <Grid columns={2} stackable>
          <Grid.Column  width={12}>
            <Header as='h1'> What is Notus DAO.</Header>
            <p>Notus DAO is a decentralized autonomous organization that operates within AO computer ecosystem. It enables community-driven decision-making, where token holders have the power to propose and vote on key initiatives and changes. This structure ensures transparency, accountability, and equitable distribution of power among its members, fostering a collaborative environment for the development and operation of innovative weather trading products. </p>
            <Header as='h2'>Notus  Weather Trading Products.</Header>

            <Header as='h3'>Notus weather trading products</Header>
            <p> Notus offers a suite of advanced weather trading products designed to allow users to speculate on weather-related events. The products include binary options contracts tied to various weather conditions such as temperature, precipitation, and wind speed. By providing access to diverse weather derivatives, Notus enables traders and businesses to manage risk and potentially profit from weather variability.            </p>

            <Header as='h3'> Notus Weather trading App. </Header>
            <p> The Notus Weather Trading App is a user-friendly mobile and web application that facilitates the trading of weather-related financial instruments. It provides real-time market data, weather forecasts, and intuitive trading interfaces that allow users to easily buy and sell weather derivatives (currently Temperature  Binary Options) .
            </p>
            <Header as='h3'>Notus Weather trading Agents. </Header>
            <p> Notus Weather Agents are decentralized, AI-driven entities that operate within the Notus platform, providing automated trading and analysis based on real-time weather data. These agents leverage advanced algorithms and machine learning to predict weather patterns and market responses, executing trades on behalf of users to optimize their portfolios. By integrating weather intelligence and autonomous trading, Notus Weather Agents enhance the platform's efficiency and enable users to capitalize on weather trends with minimal manual intervention. </p>
            
            <Header as='h3'>Notus Crypto binary trading app. </Header>
            <p>The Notus Crypto Binary Trading App is a specialized platform for trading binary options on various cryptocurrencies and weather derivatives. It allows users to place binary bets on the price movements of assets (currently Bitcoin , Ethereum and Areweave). offering a straightforward way to engage in short-term speculative trading.            </p>         
         
          </Grid.Column>
          

          <Grid.Column  width={4}>

            <Header as='h1'>Important Links.</Header>

            <Divider />
            <Header as='h4'>Notus Landing page.</Header>
                <Button href="https://notus-landing-page-c2ut.vercel.app/" color ="green" > Home </Button>

            <Header as='h4'>Notus Weather trading Front-end .</Header>
                <Button href='https://notus-front-end-i7kt.vercel.app/' link color ="green" > View  </Button>

                <Divider />
            <Header as='h4'>Notus Weather tading AO-process.</Header>
                <Button href="https://gist.github.com/kimtony123/f40b06e95dc5644818e9055727db4197" color ="green" > View </Button>

                <Divider />
            <Header as='h4'>Notus Crypto Trading AO process.</Header>
                <Button  href="https://gist.github.com/kimtony123/4f26f31ed4a918afdb1602be16c06693" color ="green" > Home </Button>

                <Divider />
            <Header as='h4'>Notus Memeframe.</Header>
                <Button href="https://notus-memeframe.vercel.app/" color ="green" > Home </Button>
                <Divider />
          </Grid.Column>
        </Grid>

        <Grid columns={2} divided>
            <GridRow stretched>
                <GridColumn width={9}>
                <Form>
                    <h1 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}} > Make your Own Proposal.</h1>
                        <FormField>
                            <label>Name of the Proposal.</label>
                            <input type="text"
                            name="propName"
                            placeholder="Name of proposal"
                            value={propName}
                            onChange={handleInputChange}
                            />
                        </FormField>
                        <FormField>
                            <label>The Pattern to be matched for code execution. </label>
                             <textarea name="propPattern"
                            placeholder="The pattern to match for your code to be executed"
                            value={propPattern}
                            onChange={handleTextAreaChange}
                             />
                        </FormField>
                        <FormField>
                            <label> The Code to be Executed.</label>
                            <textarea name="propHandle"
                            placeholder="The code to be executed once a pattern is recognised"
                            value={propHandle}
                            onChange={handleTextAreaChange}
                             />
                        </FormField>
                    <FormField>
                    </FormField>
                    <Button  primary style={{display: 'flex',  justifyContent:'center', alignItems:'center'}} type='submit'>Make Proposal.</Button>
                </Form>
                </GridColumn >      
                            <GridRow>
                            <GridColumn>
                            <p className='text-lg md:text-center'>
                                CRED: <span className='font-bold'>{credBalance}</span>
                            </p>
                            <p className='text-lg md:text-center'>
                                NOT: <span className='font-bold'>{whatBalance}</span>
                            </p>
                            </GridColumn>
                            <GridColumn width={4} >
                            <Form>
                                <FormGroup>
                                     <FormInput
                                      type="text"
                                      name="swap"
                                      placeholder="Enter AOCRED amount"
                                      value={credValue}
                                      onChange={handleInputChange}
                                     />
                                    <FormButton onClick={swap} primary content='SWAP' />
                                </FormGroup>
                            </Form>
                                
                            </GridColumn>
                            </GridRow>
                <GridColumn>
                    
                </GridColumn>
                <GridColumn>
                    <Form>
                    <h1 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}} > Vote on a proposal</h1>
                        <FormField>
                            <label>Name Of Proposal</label>
                            <input type="text"
                            name="stakeName"
                            placeholder="Name of proposal"
                            value={stakeName}
                            onChange={handleInputChange} 
                            />
                        </FormField>
                        <FormField>
                            <label> Value to stake.</label>
                            <input type="text"
                            name="stakeValue"
                            placeholder="Value to stake"
                            value={stakeValue}
                            onChange={handleInputChange}
                             />
                        </FormField>
                    <FormField>
                    </FormField>
                    <Button onClick={stake} primary type='submit'> Vote.</Button>
                </Form>        
                </GridColumn>                 
    </GridRow>

   
  <div className='relative rounded-xl overflow-auto'>
  <h1 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}} > Submitted Proposals.</h1>
                        <div className='shadow-sm overflow-hidden my-8'>
                            <div className="table border-collapse table-auto w-full text-sm">
                                <div className="table-header-group">
                                    <div className="table-row">
                                    <div className="table-cell border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Name</div>
                                    <div className="table-cell border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Stake</div>
                                    <div className="table-cell border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Stakers</div>
                                    <div className="table-cell border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Handle</div>
                                    <div className="table-cell border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Pattern</div>
                                    </div>
                                </div>
                                <div className="table-row-group bg-white dark:bg-slate-800">
                                    {proposals.map((proposal, index) => (
                                    <div key={index} className="table-row">
                                        <div className="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:text-slate-400">{proposal.name}</div>
                                        <div className="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:text-slate-400">{proposal.stake}</div>
                                        <div className="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:text-slate-400">
                                        {Object.entries(proposal.stakers).map(([key, value]) => (
                                            <span key={key}>{`${key.substring(0, 5)}: ${value / 1000}`}</span>
                                        ))}
                                        </div>
                                        <div className="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:text-slate-400">{proposal.handle}</div>
                                        <div className="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:text-slate-400">{proposal.pattern}</div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

  </Grid>
      </Container>

	);
}

export default HomePage;
