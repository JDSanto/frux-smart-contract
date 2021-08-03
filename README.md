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

## Seedifyuba - SC

This project is a smart contract made for the subject `Taller de programacion 2` of the `FIUBA`. The project allows social entepreneurs to create projects that other users funds while enabling the funders to track that the funds actually reach the destination which they intended, there is also a reviewer of the project which ensures that the project is going good and is the one in charge of releasing the funds.

#### Testing

To run the tests, after you installed the dependencies, just run

`npm t`

#### Linting

To run the linter, after you installed the dependencies, just run 

`npm run lint`

#### Coverage

To create a coverage report, after you installed the dependencies, just run 

`npm run coverage`

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
