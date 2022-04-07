import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
// import Button from "./Button";
// import styled from 'styled-components'
// import Blockie from './Blockie'
// import { ellipseAddress, getChainData } from '../helpers/utilities';
// import { transitions } from '../styles'

// const SHeader = styled.div`
//   margin-top: -1px;
//   margin-bottom: 1px;
//   width: 100%;
//   height: 100px;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 0 16px;
// `

// const SActiveAccount = styled.div`
//   display: flex;
//   align-items: center;
//   position: relative;
//   font-weight: 500;
// `

// const SActiveChain = styled(SActiveAccount)`
//   flex-direction: column;
//   text-align: left;
//   align-items: flex-start;
//   & p {
//     font-size: 0.8em;
//     margin: 0;
//     padding: 0;
//   }
//   & p:nth-child(2) {
//     font-weight: bold;
//   }
// `

// const SBlockie = styled(Blockie)`
//   margin-right: 10px;
// `

// interface ICreateCollectionStyle {
//     connected: boolean
// }

// const SAddress = styled.p<ICreateCollectionStyle>`
//   transition: ${transitions.base};
//   font-weight: bold;
//   margin: ${({ connected }) => (connected ? '-2px auto 0.7em' : '0')};
// `

// const SDisconnect = styled.div<ICreateCollectionStyle>`
//   transition: ${transitions.button};
//   font-size: 12px;
//   font-family: monospace;
//   position: absolute;
//   right: 0;
//   top: 20px;
//   opacity: 0.7;
//   cursor: pointer;

//   opacity: ${({ connected }) => (connected ? 1 : 0)};
//   visibility: ${({ connected }) => (connected ? 'visible' : 'hidden')};
//   pointer-events: ${({ connected }) => (connected ? 'auto' : 'none')};

//   &:hover {
//     transform: translateY(-1px);
//     opacity: 0.5;
//   }
// `

interface ICreateCollection {
    // seedCollection: () => void
    createCollection: (name: string, description: string) => void
    //   killSession: () => void
    //   onCreateCollection: () => void
    //   connected: boolean
    //   address: string
    //   chainId: number
}

/**
 * onCreateCollection
 */
// function onCreateCollection() {
// }
// const Header = (props: IHeaderProps) => {
//     const { connected, address, chainId, killSession, onConnect } = props
//     const chainData = chainId ? getChainData(chainId) : null
//     return (
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
        // onCreateCollection({ name, description })
        console.log("TEST FORM")
        setName('')
        setDescription('')
    }

    return (
        <Form style={{ width: '100%' }} onSubmit={onSubmit}>
            <Form.Group className="md-3">
                <label>Collection name</label>
                <Form.Control type="text" placeholder="Enter collection name" onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            <Form.Group className="md-3">
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
