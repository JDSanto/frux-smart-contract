# frux-smart-contract

Smart contract and basic service to solve payments in Frux

<a href="https://www.notion.so/fdelmazo/frux-efab2dee3dd74d52b2a57311a1891bd4"><img src="docs/logo.png" alt="Logo" width="500px"></a>

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)

## What is Frux?

Frux is the newest crowdfunding app in town.

Before reading this repo, you should probably visit our [homepage](https://www.notion.so/fdelmazo/frux-efab2dee3dd74d52b2a57311a1891bd4), with lots of info on the development, latest news, and lots (*lots*) of documentation. 

If you are only interested in the source code, check out the different repos!

- [frux-app-server](https://github.com/camidvorkin/frux-app-server)
- [frux-web](https://github.com/JuampiRombola/frux-web)
- [frux-mobile](https://github.com/FdelMazo/frux-mobile)
- [frux-smart-contract](https://github.com/JDSanto/frux-smart-contract)
- [frux-chat](https://github.com/JDSanto/frux-chat)

Frux is currently being developed by

- [@fdelmazo](https://www.github.com/FdelMazo)
- [@camidvorkin](https://www.github.com/camidvorkin)
- [@JuampiRombola](https://www.github.com/JuampiRombola)
- [@JDSanto](https://www.github.com/JDSanto)

## Installation

To install the project we recommend that you use NVM and install the node version defined in `.nvmrc`

Once you have that in place, you can install the dependencies with npm through

`npm i`

## Seedifyuba - Service

This is a minimum project that will serve as a guide to help students to do the rest of the integration

### Start process

To start the process, after you installed the dependencies and deployed the smart contracts to Kovan, you can run

`npm start`

keep in mind that you should have everything in config set before that. Create an `.env` file, using the template `.env.example`.

### Available endpoints

The following endpoints are available:

- Create wallet: POST /wallet - No body 
- Get wallet: GET /wallet/:id:
- Create project: POST /project - Body params: reviewerId(integer), ownerId(integer), stagesCost(array of numbers)
- Get project: GET /project/:hash:

### Usage example

```sh
$ http POST http://localhost:300/wallet
HTTP/1.1 200 OK
Connection: keep-alive
Date: Fri, 16 Apr 2021 02:05:45 GMT
Keep-Alive: timeout=5
content-length: 145
content-type: application/json; charset=utf-8

{
    "address": "0xA3A9D25d69A00F17AA7a7DE96fA6729655cFB463",
    "id": 3,
    "privateKey": "0xb9444636faac0ab28ac177c767fa434d7c0767d1b3019d980e079a4d644727ba"
}

$ http POST http://localhost:3000/wallet
HTTP/1.1 200 OK
Connection: keep-alive
Date: Fri, 16 Apr 2021 02:05:46 GMT
Keep-Alive: timeout=5
content-length: 145
content-type: application/json; charset=utf-8

{
    "address": "0x5228DA7727a15904FaF8c98194f710AcD932dba9",
    "id": 4,
    "privateKey": "0x6906bdfcebf1e2366d3c32aa001b0b7e882f719daabe590650f854279979c62e"
}

$ http POST http://localhost:3000/project ownerId=1 reviewerId=2 stagesCost:='[10,20,10]'
HTTP/1.1 200 OK
Connection: keep-alive
Date: Fri, 16 Apr 2021 02:07:07 GMT
Keep-Alive: timeout=5
content-length: 981
content-type: application/json; charset=utf-8

{
    "chainId": 42,
    "data": "0xd86233940000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f018be4fe4fbd4ca1b1162a44bb139a343c2087b00000000000000000000000019544c4b8ce1c08c81bb67c4075265d967935dcd00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000001158e460913d000000000000000000000000000000000000000000000000000008ac7230489e80000",
    "from": "0x55B86Ea5ff4bb1E674BCbBe098322C7dD3f294BE",
    "gasLimit": {
        "hex": "0x02ba56",
        "type": "BigNumber"
    },
    "gasPrice": {
        "hex": "0x02d1375900",
        "type": "BigNumber"
    },
    "hash": "0x30b003c570eccaf1705acd4621f72993acb51715f8decbf61535f21376cfe1d2",
    "nonce": 19,
    "r": "0xd06642b8b98b120829d24cc654b6ae9a22a16c31aa9e714c8f5306befe01cd3f",
    "s": "0x5ad6c768417a99aa63f9a2e2aa3f493db601d9e317922535fb6c54f8cdc0fba9",
    "to": "0xD0436D8e93df9c543eFd2c04152393A8D05B5A05",
    "type": null,
    "v": 119,
    "value": {
        "hex": "0x00",
        "type": "BigNumber"
    }
}

$ http GET http://localhost:3000/project/0x30b003c570eccaf1705acd4621f72993acb51715f8decbf61535f21376cfe1d2
HTTP/1.1 200 OK
Connection: keep-alive
Date: Fri, 16 Apr 2021 02:09:27 GMT
Keep-Alive: timeout=5
content-length: 177
content-type: application/json; charset=utf-8

{
    "projectId": 16,
    "projectOwnerAddress": "0xf018Be4Fe4fBD4cA1B1162A44bB139a343C2087b",
    "projectReviewerAddress": "0x19544c4b8ce1c08c81bb67C4075265D967935DCd",
    "stagesCost": [
        10,
        20,
        10
    ]
}

```

## Seedifyuba - SC

This project is a smart contract made for the subject `Taller de programacion 2` of the `FIUBA`. The project allows social entepreneurs to create projects that other users funds while enabling the funders to track that the funds actually reach the destination which they intended, there is also a reviewer of the project which ensures that the project is going good and is the one in charge of releasing the funds.

### Usage



#### Testing

To run the tests, after you installed the dependencies, just run

`npm t`

#### Linting

To run the linter, after you installed the dependencies, just run 

`npm run lint`

#### Coverage

To create a coverage report, after you installed the dependencies, just run 

`npm run coverage`

#### Doc generation

To create the smart contract documentation, after you installed the dependencies, just run 

`npm run docgen`

This will generate a browsable html file within the `./docs` folder, to view it you can open it with any browser.

#### Deployment

To deploy the smart contracts just run

`npm run deploy-kovan`

`npm run deploy-local`

depending on the network you want to use.

Keep in mind that you have to set the INFURA_API_KEY and MNEMONIC envvars (the .env file can be used for this).

To get the deployed contract address just look in the `deployments/<network>/Seedifyuba.json` file.

#### More scripts

Other useful scripts can be found using

`npm run`
