import * as React from 'react';
// import styled from 'styled-components';

import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
// import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';
import "bootstrap/dist/css/bootstrap.css";

// import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';
import CreateCollection from './components/CreateCollection';

import ContractsSDK from './contractsSKD';
// import Button from './components/Button';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import MarketItems from './components/MarketItems';
import ConnectButton from './components/ConnectButton';
import CreateNFT from './components/CreateNFT';
import { Button, Container } from 'react-bootstrap';
import MarketItem from './components/MarketItem';
import Profile from './components/Profile';
// const SLayout = styled.div`
//   position: relative;
//   width: 100%;
//   min-height: 100vh;
//   text-align: center;
// `;

// const SContent = styled(Wrapper)`
//   width: 100%;
//   height: 100%;
//   padding: 0 16px;
// `;

// const SContainer = styled.div`
//   height: 100%;
//   min-height: 200px;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   word-break: break-word;
// `;

// const SLanding = styled(Column)`
//   height: 600px;
// `;

// // @ts-ignore
// const SBalances = styled(SLanding)`
//   height: 100%;
//   & h3 {
//     padding-top: 30px;
//   }
// `;

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
  marketItems: IMarketItem[] | null;
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
  collections: null,
  marketItems: null
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  private contractsSDK: any;
  // public provider: any;

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
    }
  }

  public onConnect = async () => {
    const provider = await this.web3Modal.connect();
    console.log("onConnect:Provider: ", provider);
    const contractsSDK = ContractsSDK.getInstance(provider);

    const network = await contractsSDK.getNetwork();
    const library = contractsSDK.getLibrary();
    const address = contractsSDK.getAddress();

    await contractsSDK.initializeContracts();

    const collections = await contractsSDK.getAllCollections();
    const marketItems = await contractsSDK.getAllNFTs(collections);
    
    // contractsSDK.setCollectionToMarketItems(marketItems, collections);

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
      collections,
      marketItems
    });

    // await this.setState({
    //   marketItems: contractsSDK.getAllNFTs()
    // })

    await this.subscribeToProviderEvents(provider);

  };
  public buyNFT = async (listingId: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.buyMarketItem(listingId);
    }
  }
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
  public approveNFT = async (tokenId: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.giveApprovalToMarketplace(tokenId);
    }
  }
  public createNFT = async (tokenURL:string) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.createNFT(tokenURL);
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
  public createListing = async (collectionId: number, tokenId: number, price: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.createListing(collectionId, tokenId, price);
    }
  }

  public createOffer = async (marketItemId: number, price: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.createOffer(marketItemId, price);
    }
  }

  public cancelOffer = async(offerId: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.cancelOffer(offerId);
    }
  }

  public acceptOffer = async (offerId: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.acceptOffer(offerId);
    }
  }

  public cancelListing = async (listingId: number) => {
    const { contractsSDK } = this.state;
    if (contractsSDK !== null) {
      await contractsSDK.cancelListing(listingId);
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
    const library = this.contractsSDK.initializeLibrary();
    const network = this.contractsSDK.getNetwork();
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
    await this.unSubscribe(this.contractsSDK.getProvider());

    this.setState({ ...INITIAL_STATE });

  };

  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching,
      collections,
      marketItems,
      contractsSDK
    } = this.state;
    return (
      <Container className="p-3">
        <Container>
          <Button onClick={this.seedNFT}>Seed nft</Button>
          <Button onClick={this.loadBCollections}>Loaded collections</Button>
          <Button onClick={this.seedApproveNFT}>Give approve</Button>
          <Button onClick={this.seedCollection}>Seed collection</Button>
          <Button onClick={this.seedListing}>Seed listing</Button>
          <Button onClick={this.getNFTs}>Get NFTs</Button>
        </Container>
        <Container className="md-12">
          {contractsSDK && !fetching ? (
            <Router>
              <Header
                connected={connected}
                address={address}
                chainId={chainId}
                killSession={this.resetApp}
              />
              <Routes>
                <Route path="/create-collection" element={<CreateCollection createCollection={this.createCollection} />} />
                <Route path='/profile' element={<Profile collections={collections} marketItems={marketItems} userAddress={address} approve={this.approveNFT} createListing={this.createListing} /> } />
                <Route path="/create-nft" element={<CreateNFT mint={this.createNFT} collections={collections} address={address} />} />
                <Route path="/marketItems" element={<MarketItems collections={collections} marketItems={marketItems} />} />
                <Route path="/marketItems/:itemInd" element={<MarketItem buyNFT={this.buyNFT} cancelListing={this.cancelListing} createOffer={this.createOffer} acceptOffer={this.acceptOffer} cancelOffer={this.cancelOffer} marketItems={marketItems} userAddress={address}/>} />
              </Routes>
            </Router>
          ) : (
            <Container className="p-5 mb-4 md-4">
              {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
            </Container>
          )}
          {fetching ? (
            <Column center>
              <Container>
                <Loader />
              </Container>
            </Column>
          ) : (
            <Container>
              {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
            </Container>
          )}
        </Container>
      </Container>
    );
  };
}

export default App;
