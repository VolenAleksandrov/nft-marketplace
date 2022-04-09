import React, { useState } from "react";
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Button, Form } from "react-bootstrap";

const ipfs = ipfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
interface ICreateNFT {
    // seedNFT: () => void,
    mint:(metadataUrl: any) => void,
    collections: ICollection[] | null;
    address: any;
}
const CreateNFT = (props: ICreateNFT) => {
    const { mint } = props;
    const [file, setFile] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '', collectionId: '' })
    const [uplodMetadataStatus, updateUploadMetadataStatus] = useState('');
    // let userCollections: ICollection[] = [];
    // if (collections) {
    //     userCollections = collections.filter(x => x.owner !== address);
    // }
    function onChangeFile(e: any) {
        const file = e.target.files[0];
        setFile(file);
    }
    async function createMarketItem(e: any) {
        e.preventDefault();
        const { name, description, price } = formInput;
        let fileUrl = '';
        let metadataFileUrl = '';
        try {
            const added = await ipfs.add(file);
            console.log("added: ", added);
            fileUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
            console.log("URL: ", fileUrl);
        } catch (error) {
            console.log('Error uploading file: ', error);
        }

        if (file !== null) {
            const metadataFile = {
                name,
                description,
                image: fileUrl
            }
            console.log("Metadata stringify: ", metadataFile);
            const metadata = await ipfs.add(JSON.stringify(metadataFile));
            updateUploadMetadataStatus(`Upload complete! Minting token with metadata URI: ${metadata.url}`);
            metadataFileUrl = `https://ipfs.infura.io/ipfs/${metadata.path}`;
            console.log(`https://ipfs.infura.io/ipfs/${metadata.path}`);
            console.log(uplodMetadataStatus);
        }
        console.log(price);
        mint(metadataFileUrl);
    }
    return (
        <Form onSubmit={createMarketItem} className="mb-3">
            <Form.Group className="mb-3">
                <label>Name</label>
                <Form.Control type="text" placeholder="NFT Name" onChange={e => updateFormInput({ ...formInput, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
                <label>Description</label>
                <Form.Control type="text" placeholder="NFT Description" onChange={e => updateFormInput({ ...formInput, description: e.target.value })} />
            </Form.Group>
            {/* <Form.Group className="mb-3">
                <label>NFT Price in Eth</label>
                <Form.Control type="text" placeholder="NFT Price in Eth" onChange={e => updateFormInput({ ...formInput, price: e.target.value })} />
            </Form.Group>
            {userCollections.length > 0 ? (
                <Form.Group className="mb-3">
                    <label>Collection</label>
                    <Form.Control as="select" aria-label="Collection select" onChange={e => updateFormInput({ ...formInput, collectionId: e.target.value })}>
                        <option>Select collection</option>
                        {userCollections.map((collection: ICollection) => (
                            <option value={collection.id}>{collection.name}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
            ) : <div>You have no collections</div>} */}
            <Form.Group className="mb-3">
                <label>NFT picture</label>
                <Form.Control type="file" name="NFT" className="my-4" onChange={onChangeFile} />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={createMarketItem}>
                Create and List NFT
            </Button>
        </Form>
    );
}

export default CreateNFT