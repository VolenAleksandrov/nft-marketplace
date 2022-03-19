/* 
Scenario 1:
    1. U -> Create collection                  - M.createCollection(name)
    2. U -> Update collection description      - M.updateCollection(name)
    3. U -> Mint NFT                           - N.createToken(URL)
    4. U -> Approve marketplace for minted NFT - N.approve(tokenId, Maddress)
    5. U -> List for sale (tokenId, price)     - M.ListItem(tokenId, contractAddress, price)
    6. U2 -> Buy item (tokenId) payable        - M.buyItem(itemId) payable

Scenario 2:
    1. U -> Create collection                  - M.createCollection(name)
    2. U -> Mint NFT                           - N.createToken(URL)
    3. U -> Approve marketplace for minted NFT - N.approve(tokenId, Maddress)
    4. U2 -> Clicks on U sees all of his NFTs  - N.getTokensCounter() foreach filter by address of U, display items
    5. U2 -> Make an offer for NFT             - M.makeOffer(itemId, price) payable
*/