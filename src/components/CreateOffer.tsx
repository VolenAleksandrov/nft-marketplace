import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface ICreateOffer {
    tokenId: number;
    createOffer: (marketItemId: number, price: number) => void;
}
const CreateOffer = (props: ICreateOffer) => {
    const { tokenId, createOffer } = props;
    const [createOfferShow, setCreateOfferShow] = useState(false);
    const handleCreateOfferShow = () => setCreateOfferShow(true);
    const handleCreateOfferClose = () => setCreateOfferShow(false);
    const [createOfferFormInput, updateCreateOfferFormInput] = useState({ price: '' });


    const onCreateOfferSubmit = () => {
        const { price } = createOfferFormInput;
        if (!price) {
            alert('Please add a price!');
            return;
        }
        createOffer(tokenId, parseFloat(price));
    }

    return (
        <>
            <Button className="btn btn-primary col-md-12" variant="primary" onClick={handleCreateOfferShow}>Create offer</Button>
            <Modal show={createOfferShow} onHide={handleCreateOfferClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create offer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onCreateOfferSubmit}>
                        <Form.Group className="mb-3" controlId="price">
                            <label>Price</label>
                            <Form.Control
                                type="number"
                                placeholder="1.132..."
                                autoFocus
                                onChange={e => updateCreateOfferFormInput({ ...createOfferFormInput, price: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateOfferClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onCreateOfferSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreateOffer