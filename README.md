# Seedifyuba

This project is a smart contract made for the subject Taller de programacion 2 of the FIUBA. The project allows social entepreneurs to create projects that other users funds while enabling the funders to track that the funds actually reach the destination which they intended, there is also a reviewer of the project which ensures that the project is going good and is the one in charge of releasing the funds.

## Usage

To install the project we recommend that you use NVM and install the node version defined in `.nvmrc`

Once you have that in place, you can install the dependencies with npm through

`npm i`

### Testing

To run the tests, after you installed the dependencies, just run

`npm t`

### Linting

To run the linter, after you installed the dependencies, just run 

`npm run lint`

### Coverage

To create a coverage report, after you installed the dependencies, just run 

`npm run coverage`

### Doc generation

To create the smart contract documentation, after you installed the dependencies, just run 

`npm run docgen`

This will generate a browsable html file within the `./docs` folder, to view it you can open it with any browser.

### Deployment

To deploy the smart contracts just run

`npm run deploy-kovan`

`npm run deploy-local`

depending on the network you want to use.

Keep in mind that you have to set the INFURA_API_KEY and MNEMONIC envvars(the .env file can be used for this).

To get the deployed contract address just look in the `deployments/<network>/Seedifyuba.json` file.

### More scripts

Other useful scripts can be found using

`npm run`
