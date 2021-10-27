# acdc-workspace

ACDC means Anti-Counterfeiting Data Collaboration - Use-Case 4 of PharmaLedger

*acdc-workspace*  a clone of the ePi https://github.com/PharmaLedger-IMI/epi-workspace modified for ACDC Purposes.


## Installation

In order to use the workspace, we need to follow a list of steps presented below. 


### Step 1: Clone the workspace

```sh
$ git clone https://github.com/PharmaLedger-IMI/acdc-workspace.git
```

After the repository was cloned, you must install all the dependencies.

```sh
$ cd acdc-workspace
#Important: If you plan to contribute to the project and/or dependecies please set DEV:true
#in the file env.json before you run the installation!
$ npm install
```
**Note:** this command might take quite some time depending on your internet connection and you machine processing power.

### Step 2: Launch the "server"

While in the *acdc-workspace* folder run:

```sh
$ npm run server
```

At the end of this command you get something similar to:

![alt text](scr-npm-run-server.png)


### Step 3: Build all things needed for the application to run.

Open a new console inside *acdc-workspace* folder and run:

```sh
# Note: Run this in a new console inside "epi-workspace" folder
$ npm run build-all
```



## Running 
To run the application launch your browser (preferably Chrome) in Incognito mode and access the http://localhost:8080 link.

### Enterprise wallet

Enterprise wallet allows creation of Products and Batches.

#### Step 1: Register details

```
Username: test1234

Email: test@test.test

Company: Test Company Inc

Password: Test1234567890#
```

#### Step 2: Setup credentials for Issuer and Holder
    1. Go to MAH as Issuer page
    2. Put "epi" in application domain field and press "Generate an identifier as company" button
    3. Go to User as Holder page
    4. Enter the application domain "epi" and press "Generate an Identifier as User" button
    5. Copy the generated User Identity
    6. Go again to MAH as Issuer page
    7. Paste the generated User Identity into the first input field
    8. Press the "Generate Credential" button
    9. Copy the generated credential
    10. Go again to User as Holder page
    11. In the "Human readable User Identity" section paste the previous generated crendetial and press the button "Save Credential"
    12. Finally for the current user, the Human readable Credential should look like the following: 
![alt text](user_credential.png)    
   
Now you will act as a Holder thus will be able to add Products (and leaflets for it) and create Batches of products.

#### Add Products to Enterprise Wallet for ACDC Scan Response
    # Product 1
    Product Name: Cosentyx
    Product Code (GTIN/NTIN): 02113100000011
    BatchID: MAY1701
    Expiry Date: 2022-04-30
    Serial Number: {
        valid: 43023992515022
        recalled: 43023992515000
        decommissioned: 43023992515099
    }
    MAH: Novartis

    # Product 2
    Product Name: Keytruda
    Product Code (GTIN/NTIN): 01133111111118
    BatchID: MAY1702
    Expiry Date: 2022-04-30
    Serial Number: {
        valid: 33023992515022
        recalled: 33023992515000
        decommissioned: 33023992515099
    }
    MAH: MSD

    # Product 3
    Product Name: Fluarix
    Product Code (GTIN/NTIN): 01183111111137
    BatchID: MAY1703
    Expiry Date: 2022-04-30
    Serial Number: {
        valid: 33023992515022
        recalled: 33023992515000
        decommissioned: 33023992515099
    }
    MAH: GSK

### EPI Client
This is the part a normal user will see. The part that will
be used to scan barcodes on drug's packages.

## Prepare & release a new stable version of the workspace
Steps:
1. start from a fresh install of the workspace.
```
git clone https://github.com/PharmaLedger-IMI/acdc-workspace
cd acdc-workspace
```
2. ensure that env variable called DEV is set to true in env.json file
>{
>  "PSK_TMP_WORKING_DIR": "tmp",
>  "PSK_CONFIG_LOCATION": "../apihub-root/external-volume/config",
>  **"DEV": true**
>}
3. run the installation process of the workspace
```
npm install
```
4. run the server and build the ssapps and wallets
```
npm run server
npm run build-all
```
4. verify that the builds are successfully and the ssapps are functioning properly
5. execute the freeze command
```
npm run freeze
```
6. verify the output of freeze command and check for errors. If any, correct them and run again the freeze command.
7. commit the new version of the octopus.json file obtained with the freeze command.


### Build Android APK

Steps

1. Install all dependencies (as develoment) for this workspace
```sh
npm run dev-install
```

2. Bind Android repository into workspace
```sh
npm run install-mobile
```

3. Launch API HUB
```sh
npm run server
```

4. Prepare the Node files that will be packed into the Android app
```sh
#In another tab / console
npm build-mobile
```

5. Have /mobile/scan-app/android/local.properties file with the following content

```sh
# Change the value to your SDK path
sdk.dir=/home/alex/Android/Sdk
```
More on this [here](https://github.com/PrivateSky/android-edge-agent#iv-setup-local-environment-values)

6. Build the APK
```sh
npm build-android-apk
```

This concludes the steps to build the APK file.

**Note:** The .apk file should be in folder
```
mobile/scan-app/android/app/build/outputs/apk/release
<<<<<<< HEAD
```

### Build iOS App

How To Deploy and test ACDC Authentication Features (With native camera access)
​
Setup the environment (Node 14 and 16 Tested):
​
For local development:
Update mobile/scan-app/ios/PSKNodeServer/PSDKNodeServer/nodejsProject/apihub-root/external-volume/config/bdns.hosts:line 14
```
  "epi": {
    "replicas": [],
    "brickStorages": [
      "http://<Your-Local-IP>:8080"
    ],
    "anchoringServices": [
      "http://<Your-Local-IP>:8080"
    ]
```

This allows for faster development passes since the app does not need to be rebuilt in Xcode. Also make sure that the iPhone and Macbook are on the same wi-fi connection, otherwise this will not work.

IMPORTANT:
if running on iOS, carthage must be installed: typically ```brew install carthage```

```shell
npm install
npm run install-mobile (if not in mac, there will be an error at the end (```carthage: not found```), but that's ok', if in mac and you get an error like 'A shell task (/usr/bin/xcrun xcodebuild -project /Users/tvenceslau/workspace/acdc/acdc-workspace/mobile/scan-app/ios/pharmaledger-camera/PharmaLedger\ Camera/Carthage/Checkouts/GCDWebServer/GCDWebServer.xcodeproj CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY= CARTHAGE=YES -list) failed with exit code 72:
xcrun: error: unable to find utility "xcodebuild", not a developer tool or in PATH' then in the xcode preferences under 'Locations', set the 'Command Line Tools' to the xcode you are using)
npm run server
```

in another shell:
```shell
npm run build-all
```

in the browser (use CHROME in anonymous!) go to localhost:8080 and enter the Enterprise Wallet. Create a new Account (you only need to do this once), and login.
```
MAH as issuer
 - generate an Identifier (use the default values)
 
User as Holder
 - generate an Identifier (use default values);
 - copy generated identity;
 
MAH as issuer
- paste the generated identity;
- click generate credential;
- copy the generated code;

User as Holder
- paste the code;
- click save credential;

Products
    Add Product
     - go to https://www.gtin.info/check-digit-calculator/ and calculate a valid GTIN 14 code;
     - input that code in the product code field;
     - add names and description;
     - click add EPI and select the leaflet example folder;
     - save product;

Batches
    Add Batch
     - add expiry date and select the product code;
     - click add EPI and add the same leaflet files as before;
     - click manage serial numbers/ update Valid and input any comma separated number value list (uniques);
     - click enablhe authentication feature and input the keySSI present in the splash page (localhost:8080);
     - Click Add Batch;
     - click view 2d data matrix in the batch list item and take a picture of the valid qr code;
     
in the browser (use CHROME in anonymous mode!) go to the Patient Wallet.
 - click scan and scan the qr code from before. you should see a details screen aying there's an authentication feature available.
 - click verify package. THis will launch the Authentication Feature;
 - click scan and scan the same qr code again. You should be sent back to details page with the confirmation that the package is valid;
 - IMPORTANT: go to the console and type 'window.Native.Camera' - you should get an object called CameraApi. This is the browser version and was used to re-check the code in the Authentication feature;
```


Back to the shell:

NOTE: Please note that the following command, right now, and to allow testing, copies the entire 'blockchain' to the phone, (so we have that product and batch to be able to scan)
but should only be used without an ```npm run clean``` to empty the blockchain is this situation

```shell
npm run build-ios-app
```

in XCode:

- open ```./mobile/scan-app/ios/PSSmartWalletNativeLayer.workscape```
- configure signing, etc;
- connect your iphone/ipad;
- configure to build PSKNodeServer to that device;
- build it;

scan the code, click verify package;

inspect the variable 'window.Native.Camera'. it will present the same api as the browser version,
but will also have a property called nativeBridge exposing all the native camera API;

For any subsequent builds, you can do as follows
- npm run build authentication-feature-<your-feature-name>
- Close the app on your phone (to prevent caching)
- Open the app and scan your batch code again

Relevant folders:
```shell
  authentication-feature-template
  native-integration
```
- authentication-feature-template:
  This is a separate repository, that is loaded onto this workspace thy octopus (more on that later).
  To Develop your authentication feature, you should fork this repository and fo from there;
- native-integration:
  this is there the integration with the camera api happens:
    - 2 versions of this camera Api are build at the moment. default and ios. Depending on the environment, the proper one is injected into the code;
    - in the ios version, not all features are functions and/or have been adapted to our intended implementation (simple api, cross-compatible),
      but all the native API is exposed via the 'nativeBridge' object;
    - This basic Camera API (not the native one) in not closed will benefit from you input and adaptation to your needs.\
      Our focus was not to implement but to expose.

Relevant files:
```shell
  octopus.json
  octopus.freeze.json
```

these are the build script files. handle with extreme care or the build process might/WILL be broken.
These files must always be in sync apart from some commit hashes that MUST not be changed!! (backups for those hashes can be found in octopus-freeze.json.bck);

There are 3 main relevant sections in these files: 'dependencies', 'build', and 'build-ios-app':
- the dependencies is run when you run 'npm install';
- build when you run 'npm run build-all';
- build-ios-app ...

Notice all entries regarding 'authentication-feature-template':
these should be replicated for your fork on both files;

NOTE: If you keep the folder for Authentication features consistent: 'authentication-feature-xxx' the build script will automatically present those credentials in the splash page (localhost:8080)

IMPORTANT!!! in oder to ensure the ```npm install``` properly handles dependencies it will revert the repo back the last commit of that file.
this means whenever you want to test from scratch, you need to ensure the ```octopus-freeze.json``` was changed in your last commit (we add/remove withe lines at the end)

In the event that the app runs slow:
- delete authentication-feature-<your-feature-name>/seed
- In ACDC root: run build authentication-feature-<your-feature-name>
- Update batch to newly generated SSI so that authentication still works



# Misc

## How to pull latest ePi changes

```sh
git remote add epi https://github.com/PharmaLedger-IMI/epi-workspace
git pull epi master
```

# Contributions

If you think you can contribute, please check with the team, if it is ok to submit a pull-request.

## Follow the "10 commandments" at https://jaxenter.com/10-commandments-committing-pull-requests-115707.html

1. Thou Shalt not reformat
2. Thou shalt absolutely not fix whitespace
3. Thou Shalt not refactor
5. Thou Shalt not rename
6. Thou shalt document
7. Thou shalt not implement more than one thing in a single commit
8. Thou shalt ask the vendor / community first
9. Thou shalt not demand
10. Thou shalt accept the license terms

