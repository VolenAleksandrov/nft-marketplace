import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

interface ICreateCollection {
    // seedCollection: () => void
    createCollection: (name: string, description: string) => void
    //   killSession: () => void
    //   onCreateCollection: () => void
    //   connected: boolean
    //   address: string
    //   chainId: number
}

const CreateCollection = (props: ICreateCollection) => {
    const { createCollection } = props;
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
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

    return (
        <Form style={{ width: '100%' }} onSubmit={onSubmit}>
            <Form.Group className="mb-3">
                <label>Collection name</label>
                <Form.Control type="text" placeholder="Enter collection name" onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Collection description</label>
                <Form.Control type="text" placeholder="Enter collection description" onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    )
}

export default CreateCollection
