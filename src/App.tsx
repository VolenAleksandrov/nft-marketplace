import * as React from 'react';
import styled from 'styled-components';

import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';

// import ConnectButton from './components/ConnectButton';

import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';
import CreateCollection from './components/CreateCollection';
// import {
//   Route,
//   NavLink,
//   HashRouter
// } from "react-router-dom";
import {
  NFT_ADDRESS,
  MARKETPLACE_ADDRESS
} from './constants';
import { getContract } from './helpers/ethers';
import NFT from "./constants/abis/NFT.json";
import MARKETPLACE from "./constants/abis/NFTMarketplace.json";
import ContractsSDK from './contractsSKD';
import Button from './components/Button';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import CreateNFT from './components/CreateNFT';
import MarketItems from './components/MarketItems';
import ConnectButton from './components/ConnectButton';
// import { triggerAsyncId } from 'async_hooks';
const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  contractsSDK: ContractsSDK | null;
  info: any | null;
  collections: ICollection[] | null;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  library: null,
  connected: false,
  chainId: 1,
  pendingRequest: false,
  result: null,
  contractsSDK: null,
  info: null,
  collections: null
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  public provider: any;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
      this.loadCollections();
    }
  }

  public onConnect = async () => {
    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];
    const nftContract = getContract(NFT_ADDRESS, NFT.abi, library, address);
    const marketplaceContract = getContract(MARKETPLACE_ADDRESS, MARKETPLACE.abi, library, address);
    const contractsSDK = ContractsSDK.getInstance(nftContract, marketplaceContract, library.getSigner());
    const collections = await contractsSDK.getCollections();

    // fetching: boolean;
    // address: string;
    // library: any;
    // connected: boolean;
    // chainId: number;
    // pendingRequest: boolean;
    // result: any | null;
    // contractsSDK: any | null;
    // info: any | null;
    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
      contractsSDK,
      collections
    });

    // await this.setState({
    //   marketItems: contractsSDK.getAllNFTs()
    // })

    await this.subscribeToProviderEvents(this.provider);

  };

  public getNFTs = async () => {
    console.log("getAllNFTs");
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.getAllMarketItems();
    }
  }
  public seedNFT = async () => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.seedNFTs();
    }
  }
  public seedApproveNFT = async () => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.seedApproveNFT();
    }
  }
  public seedCollection = async () => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.createSeedCollection();
    }
  }
  public seedListing = async () => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.createSeedListing();
    }
  }
  public getMIs = async () => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.getMIs();
    }
  }
  public loadCollections = async () => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      this.setState({
        collections: await contractsSDK.getCollections()
      });
    }
  }
  public loadBCollections = async () => {
    const { collections } = this.state;
    console.log("Loaded: ", collections);
  }
  public createCollection = async (name: string, description: string) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      contractsSDK.createCollection(name, description);
    }
  }
  public subscribeToProviderEvents = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", this.changedAccount);
    provider.on("chainChanged", this.networkChanged);
    provider.on("disconnect", this.close);

    await this.web3Modal.off('accountsChanged');
  };

  public async unSubscribe(provider: any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload();
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", this.changedAccount);
    provider.off("chainChanged", this.networkChanged);
    provider.off("disconnect", this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if (!accounts.length) {
      // Metamask Lock fire an empty accounts array 
      await this.resetApp();
    } else {
      await this.setState({ address: accounts[0] });
    }
  }

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    await this.setState({ chainId, library });
  }

  public close = async () => {
    this.resetApp();
  }

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    };
    return providerOptions;
  };

  public resetApp = async () => {
    await this.web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await this.unSubscribe(this.provider);

    this.setState({ ...INITIAL_STATE });

  };

  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching,
      collections
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
            onConnect={this.onConnect}
          />
          <SContent>
            <Button onClick={this.seedNFT}>Seed nft</Button>
            <Button onClick={this.loadBCollections}>Loaded collections</Button>
            <Button onClick={this.seedApproveNFT}>Give approve</Button>
            <Button onClick={this.seedCollection}>Seed collection</Button>
            <Button onClick={this.seedListing}>Seed listing</Button>
            <Button onClick={this.getNFTs}>Get NFTs</Button>
            <Button onClick={this.getMIs}>Get NFTs</Button>
            <hr/>
            <Router>
              <Routes>
                <Route path="/create-collection" element={<CreateCollection createCollection={this.createCollection} />} />
                <Route path="/create-nft" element={<CreateNFT seedNFT={this.seedCollection} />} />
                <Route path="/" element={<MarketItems collections={collections} />} />
              </Routes>
            </Router>
            
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : (
            <SLanding center>
              {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
            </SLanding>
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
