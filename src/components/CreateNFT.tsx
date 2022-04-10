import React, { useState } from "react";
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Button, Form, Modal } from "react-bootstrap";

const ipfs = ipfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
interface ICreateNFT {
    mint: (metadataUrl: any) => void,
    collections: ICollection[] | null;
    address: any;
}
const CreateNFT = (props: ICreateNFT) => {
    const { mint } = props;
    const [file, setFile] = useState(null);
    const [showCreateNFT, setCreateNFTShow] = useState(false);
    const handleCreateNFTShow = () => setCreateNFTShow(true);
    const handleCreateNFTClose = () => setCreateNFTShow(false);
    const [createNFTFormInput, updateCreateNFTFormInput] = useState({ name: '', description: '', collectionId: '' })
    const [uplodMetadataStatus, updateUploadMetadataStatus] = useState('');

    function onChangeFile(e: any) {
        const file = e.target.files[0];
        setFile(file);
    }
    
    async function onCreateNFTSubmit(e: any) {
        e.preventDefault();
        const { name, description } = createNFTFormInput;
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
        mint(metadataFileUrl);
    }
    return (
        <>
            <Button className="btn btn-primary col-md-2" variant="primary" onClick={handleCreateNFTShow}>Create NFT</Button>
            <Modal show={showCreateNFT} onHide={handleCreateNFTClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create NFT</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onCreateNFTSubmit} className="mb-3">
                        <Form.Group className="mb-3">
                            <label>Name</label>
                            <Form.Control type="text" placeholder="NFT Name" onChange={e => updateCreateNFTFormInput({ ...createNFTFormInput, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <label>Description</label>
                            <Form.Control type="text" placeholder="NFT Description" onChange={e => updateCreateNFTFormInput({ ...createNFTFormInput, description: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <label>NFT picture</label>
                            <Form.Control type="file" name="NFT" className="my-4" onChange={onChangeFile} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateNFTClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onCreateNFTSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreateNFT