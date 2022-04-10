import * as React from 'react';

import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Header from './components/Header';
import Loader from './components/Loader';
import "bootstrap/dist/css/bootstrap.css";

import { getChainData } from './helpers/utilities';

import ContractsSDK from './contractsSKD';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import MarketItems from './components/MarketItems';
import ConnectButton from './components/ConnectButton';
import { Container } from 'react-bootstrap';
import MarketItem from './components/MarketItem';
import Profile from './components/Profile';

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  // contractsSDK: ContractsSDK | null;
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
  info: null,
  collections: null,
  marketItems: null
};

class App extends React.Component<any, any> {
  public web3Modal: Web3Modal;
  public state: IAppState;
  private contractsSDK: any;
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
    await this.setState({ fetching: true });
    const provider = await this.web3Modal.connect();
    this.contractsSDK = new ContractsSDK(provider);

    const network = await this.contractsSDK.getNetwork();
    const library = this.contractsSDK.getLibrary();
    const address = this.contractsSDK.getAddress();

    await this.contractsSDK.initializeContracts();

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true
    });
    await this.subscribeToProviderEvents(provider);
    await this.setState({ fetching: false });

  };
  public buyNFT = async (listingId: number, price: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.buyMarketItem(listingId, price);
      await this.setState({ fetching: false });
    }
  }
  public approveNFT = async (tokenId: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.giveApprovalToMarketplace(tokenId);
      await this.setState({ fetching: false });
    }
  }
  public createNFT = async (tokenURL: string) => {
    console.log("createNFT", tokenURL);
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.createNFT(tokenURL);
      await this.setState({ fetching: false });
    }
  }
  public createCollection = async (name: string, description: string) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.createCollection(name, description);
      await this.setState({ fetching: false });
    }
  }
  public createListing = async (collectionId: number, tokenId: number, price: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.createListing(collectionId, tokenId, price);
      await this.setState({ fetching: false });
    }
  }
  public createOffer = async (tokenId: number, price: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.createOffer(tokenId, price);
      await this.setState({ fetching: false });
    }
  }
  public cancelOffer = async (offerId: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.cancelOffer(offerId);
      await this.setState({ fetching: false });
    }
  }
  public acceptOffer = async (offerId: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.acceptOffer(offerId);
      await this.setState({ fetching: false });
    }
  }
  public cancelListing = async (listingId: number) => {
    if (this.contractsSDK !== null) {
      await this.setState({ fetching: true });
      await this.contractsSDK.cancelListing(listingId);
      await this.setState({ fetching: false });
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
      // await this.resetApp();
      await this.setState({ address: accounts[0] });
      this.onConnect();

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
      fetching
    } = this.state;
    return (
      <Container className="p-3">
        <Container className="md-12">
          {this.contractsSDK && !fetching ? (
            <Router>
              <Header
                connected={connected}
                address={address}
                chainId={chainId}
                killSession={this.resetApp}
              />
              <Routes>
                <Route
                  path='/profile/:profileAddress'
                  element={
                    <Profile
                      mint={this.createNFT}
                      createCollection={this.createCollection}
                      approve={this.approveNFT}
                      createListing={this.createListing}
                      collections={this.contractsSDK.collections}
                      marketItems={this.contractsSDK.marketItems}
                      userAddress={address}
                    />
                  }
                />
                <Route
                  path="/"
                  element={
                    <MarketItems
                      buyNFT={this.buyNFT}
                      createOffer={this.createOffer}
                      userAddress={address}
                      collections={this.contractsSDK.collections}
                      marketItems={this.contractsSDK.marketItems}
                    />
                  }
                />
                <Route
                  path="/marketItems/:tokenId"
                  element={
                    <MarketItem
                      buyNFT={this.buyNFT}
                      cancelListing={this.cancelListing}
                      createOffer={this.createOffer}
                      acceptOffer={this.acceptOffer}
                      cancelOffer={this.cancelOffer}
                      marketItems={this.contractsSDK.marketItems}
                      userAddress={address}
                    />
                  }
                />
              </Routes>
            </Router>
          ) : null}
          {fetching ? (
            <Container className="col-md-2 col-md-offset-5">
              <Loader />
            </Container>
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
