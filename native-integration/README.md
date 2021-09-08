How To Deploy and test ACDC Authentication Features (With native camera access)

Setup the environment (Node 14 and 16 Tested):

```shell
npm install
npm run install-mobile (if not in mac, tehre will be an error at the end (```carthage: not found```), but that's ok')
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


IMPORTANT!!! in oder to ensure the ```npm install``` properly handles dependencies it will revert the repo back the last commit of that file.
this means whenever you want to test from scratch, you need to ensure the ```octopus-freeze.json``` was changed in your last commit (we add/remove withe lines at the end)


