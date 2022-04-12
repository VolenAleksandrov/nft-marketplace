import React, { useState } from "react";
import { Accordion, Button, Card, Container, Form, Modal, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getStatusName } from "src/helpers/utilities";
import CreateNFT from "./CreateNFT";

interface IProfilePage {
    collections: ICollection[];
    marketItems: IMarketItem[];
    userAddress: string;
    userListings: IListing[];
    userOffers: IOffer[];
    approve: (tokenId: number) => void;
    createListing: (collectionId: number, tokenId: number, price: number) => void;
    cancelListing: (listingId: number) => void;
    cancelOffer: (offerId: number) => void;
    createCollection: (name: string, description: string) => void;
    mint: (metadataUrl: string) => void;
}
const Profile = (props: IProfilePage) => {
    const { collections, marketItems, userAddress, userListings, userOffers, approve, createListing, createCollection, mint, cancelListing, cancelOffer } = props;
    const { profileAddress } = useParams();
    const zeroCollectionId = 0;
    let profileItems: IMarketItem[] = [];
    let profileCollections: ICollection[] = [];
    let isCurrentUserProfile: boolean = false;
    if (profileAddress) {
        isCurrentUserProfile = profileAddress.toLocaleLowerCase() === userAddress.toLocaleLowerCase();
        if (marketItems) {
            profileItems = marketItems.filter(x => {
                if (profileAddress) {
                    return x.owner.toLocaleLowerCase() === profileAddress.toLocaleLowerCase();
                }
                return false;
            });
        }
        if (collections) {
            profileCollections = collections.filter(x => {
                if (profileAddress) {
                    return x.owner.toLocaleLowerCase() === profileAddress.toLocaleLowerCase();
                }
                return false;
            });
        }
    }

    const [createListingFormInput, updateCreateListingFormInput] = useState({ price: 0, collectionId: 0 });
    const [createCollectionFormInput, updateCreateCollectionFormInput] = useState({ name: '', description: '' });
    const [tokenId, setTokenId] = useState(0);
    const [collectionId, setCollectionId] = useState(0);

    const [showCreateListing, setCreateListingShow] = useState(false);
    const [showCreateCollection, setCreateCollectionShow] = useState(false);

    const handleCreateListingClose = () => setCreateListingShow(false);
    const handleCreateCollectionClose = () => setCreateCollectionShow(false);
    const handleCreateListingShow = (token: number, itemId: number) => {
        setTokenId(token);
        const item = profileItems.find(x => x.collectionId !== 0);
        if (item) {
            setCollectionId(item.collectionId);
            updateCreateListingFormInput({ ...createListingFormInput, collectionId: item.collectionId });
        }
        setCreateListingShow(true);
    }
    const handleCreateCollectionShow = () => setCreateCollectionShow(true);
    const onCreateListingSubmit = () => {
        const { price, collectionId } = createListingFormInput;
        if (!price) {
            alert('Please add a price!');
            return;
        }
        if (collectionId <= 0) {
            alert('Please select collection!');
            return;
        }
        createListing(collectionId, tokenId, price);
    }
    async function onsCreateCollectionSubmit(e: any) {
        e.preventDefault();
        const { name, description } = createCollectionFormInput;
        if (!name) {
            alert('Please add a collection name!');
            return;
        }
        if (!description) {
            alert('Please add a collection description!');
            return;
        }
        createCollection(name, description);
    }

    const approveNFT = (tokenId: any, e: { preventDefault: () => void }) => {
        e.preventDefault();
        approve(tokenId);
    }

    return (
        <>
            <Container className="row">
                {isCurrentUserProfile ? (
                    <>
                        <Button className="col-md-2 left" variant="primary" onClick={handleCreateCollectionShow}>Create collection</Button>
                        <CreateNFT mint={mint} collections={profileCollections} address={userAddress} />
                    </>
                ) : null}
                <Container className="row">
                    <h2>All items</h2>
                    {profileItems.map((item: IMarketItem, index: number) => (
                        <Card className="col-md-3" key={index}>
                            <Card.Img variant="top" src={item.image} />
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                                {item.listings && item.currentListingIndex >= 0 ? (
                                    <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                ) : (
                                    <>
                                        <Card.Text>Not listed!</Card.Text>
                                        {isCurrentUserProfile && item.isApproved ? (<Button className="btn" variant="primary" onClick={handleCreateListingShow.bind(null, item.tokenId)}>Create listing</Button>) : null}
                                    </>
                                )}
                                {!item.isApproved && isCurrentUserProfile ? <Button onClick={approveNFT.bind(null, item.tokenId)}>Approve</Button> : null}
                                {/* <Link to={`${url}/${item.id}`}>Open</Link> */}
                                <Card.Footer>
                                    <Link to={"/marketItems/" + item.tokenId}>Show</Link>
                                </Card.Footer>
                            </Card.Body>
                        </Card>
                    ))}
                </Container>
                <h2>All collections</h2>
                <Accordion defaultActiveKey="0" alwaysOpen>
                    {profileCollections.length > 0 ? (
                        <>
                            {profileCollections.map((collection: ICollection, index: number) => (
                                <Accordion.Item eventKey={(index + 1).toString()} key={index}>
                                    <Accordion.Header>{collection.name}</Accordion.Header>
                                    <Accordion.Body className="row">
                                        {profileItems.filter(x => x.collectionId === collection.id).map((item: IMarketItem, index: number) => (
                                            <Card className="col-md-3" key={index}>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Body>
                                                    <Card.Title>{item.name}</Card.Title>
                                                    <Card.Text>{item.description}</Card.Text>
                                                    {item.listings && item.currentListingIndex >= 0 ? (
                                                        <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                                    ) : (
                                                        <>
                                                            <Card.Text>Not listed!</Card.Text>
                                                            {isCurrentUserProfile && item.isApproved ? (<Button className="btn" variant="primary" onClick={handleCreateListingShow.bind(null, item.tokenId)}>Create listing</Button>) : null}
                                                        </>
                                                    )}
                                                    {!item.isApproved && isCurrentUserProfile ? <Button onClick={approveNFT.bind(null, item.tokenId)}>Approve</Button> : null}
                                                    {/* <Link to={`${url}/${item.id}`}>Open</Link> */}
                                                    <Card.Footer>
                                                        <Link to={"/marketItems/" + item.tokenId}>Show</Link>
                                                    </Card.Footer>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </>
                    ) : null}
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Items that are not in any collection</Accordion.Header>
                        <Accordion.Body className="row">
                            {profileItems.filter(x => x.collectionId === zeroCollectionId).map((item: IMarketItem, index: number) => (
                                <Card className="col-md-3" key={index}>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body>
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>{item.description}</Card.Text>
                                        {item.listings && item.currentListingIndex >= 0 ? (
                                            <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                        ) : (
                                            <>
                                                <Card.Text>Not listed!</Card.Text>
                                                {isCurrentUserProfile && item.isApproved ? (<Button className="btn" variant="primary" onClick={handleCreateListingShow.bind(null, item.tokenId)}>Create listing</Button>) : null}
                                            </>)}
                                        {!item.isApproved && isCurrentUserProfile ? <Button onClick={approveNFT.bind(null, item.tokenId)}>Approve</Button> : null}
                                        {/* <Link to={`${url}/${item.id}`}>Open</Link> */}
                                        <Card.Footer>
                                            <Link to={"/marketItems/" + item.tokenId}>Show</Link>
                                        </Card.Footer>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Container>
            <Container className="row">
                <h3>Listings and offers</h3>
                <Container className="row">
                    <Accordion className="col-md-12" defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Listings</Accordion.Header>
                            <Accordion.Body>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Seller</th>
                                            <th>Buyer</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userListings.map((listing: IListing, index: number) => (
                                            <tr key={index}>
                                                <td><Link to={"/marketItems/" + listing.tokenId}>Item</Link></td>
                                                <td>Seller: <Link to={"/profile/" + listing.seller}>Profile</Link></td>
                                                <td>Buyer: <Link to={"/profile/" + listing.buyer}>Profile</Link></td>
                                                <td>{listing.price} ETH</td>
                                                <td>{getStatusName(listing.status)}</td>
                                                <td>
                                                    <>
                                                        {listing.status === 0 && listing.seller === userAddress ? (
                                                            <Button className="btn" onClick={cancelListing.bind(null, listing.id)}>Cancel</Button>
                                                        ) : null}
                                                    </>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Offers</Accordion.Header>
                            <Accordion.Body>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Offerer</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userOffers.map((offer: IOffer, index: number) => (
                                            <tr key={index}>
                                                <td><Link to={"/marketItems/" + offer.tokenId}>Item</Link></td>
                                                <td>Offerer: <Link to={"/profile/" + offer.offerer}>Profile</Link></td>
                                                <td>{offer.price} ETH</td>
                                                <td>{getStatusName(offer.status)}</td>
                                                <td>
                                                    <>
                                                        {offer.status === 0 ? (
                                                            <Button className="btn" onClick={cancelOffer.bind(null, offer.id)}>Cancel</Button>
                                                        ) : null}
                                                    </>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Container>
            </Container>
            <Modal show={showCreateListing} onHide={handleCreateListingClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create listing</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onCreateListingSubmit}>
                        <Form.Group className="mb-3" controlId="price">
                            <label>Price</label>
                            <Form.Control
                                type="number"
                                placeholder="1.132 ETH"
                                autoFocus
                                onChange={e => updateCreateListingFormInput({ ...createListingFormInput, price: parseFloat(e.target.value) })}
                            />
                        </Form.Group>
                        {profileCollections.length > 0 ? (
                            <Form.Group className="mb-3">
                                <label>Collection</label>
                                <Form.Control as="select" aria-label="Collection select" onChange={e => updateCreateListingFormInput({ ...createListingFormInput, collectionId: parseInt(e.target.value, 10) })}>
                                    <option>Select collection</option>
                                    {profileCollections.map((collection: ICollection, index: number) => (
                                        <>
                                            {collectionId === collection.id ? (
                                                <option selected key={index} value={collection.id}>{collection.name}</option>
                                            ) : (
                                                <option key={index} value={collection.id}>{collection.name}</option>
                                            )}
                                        </>

                                    ))}
                                </Form.Control>
                            </Form.Group>
                        ) : <div>You have no collections</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateListingClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onCreateListingSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showCreateCollection} onHide={handleCreateCollectionClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create collection</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form style={{ width: '100%' }} onSubmit={onsCreateCollectionSubmit}>
                        <Form.Group className="mb-3">
                            <label>Collection name</label>
                            <Form.Control type="text" placeholder="Enter collection name" onChange={e => updateCreateCollectionFormInput({ ...createCollectionFormInput, name: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <label>Collection description</label>
                            <Form.Control type="text" placeholder="Enter collection description" onChange={e => updateCreateCollectionFormInput({ ...createCollectionFormInput, description: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateCollectionClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onsCreateCollectionSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Profile