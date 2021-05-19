const DOSSIER_SEED_FILE_PATH = "./seed";
const CARDINAL_SEED_FILE_PATH = "../cardinal/seed";
const THEMES_PATH = "../themes";
const DEFAULT_DOMAIN = "default";

require("./../../privatesky/psknode/bundles/openDSU.js");

const fs = require("fs");
const openDSU = require("opendsu");
const keyssi = openDSU.loadApi("keyssi");
const resolver = openDSU.loadApi("resolver");

function getCardinalDossierSeed(callback){
    fs.readFile(CARDINAL_SEED_FILE_PATH, (err, content)=>{
        if (err || content.length === 0) {
            return callback(err);
        }
        callback(undefined, content.toString());
    })
}

function getThemeDossierSeed(themeName, callback){

    fs.readFile(`${THEMES_PATH}/${themeName}/seed`, (err, content)=>{
        if (err || content.length === 0) {
            return callback(err);
        }
        callback(undefined, content.toString());
    })
}

function storeKeySSI(seed_path, keySSI, callback) {
    fs.writeFile(seed_path, keySSI, (err) => {
        return callback(err, keySSI);
    });
}

function createDossier(callback) {
    resolver.createDSU(keyssi.buildTemplateSeedSSI(DEFAULT_DOMAIN), (err, bar) => {
        if (err) {
            return callback(err);
        }

        updateDossier(bar, callback);
    })
}

function updateDossier(bar, callback) {
    bar.delete("/", function(err){
        if(err){
            throw err;
        }

        bar.addFolder("code", "/", {batch: false, encrypt: false}, (err, archiveDigest) => {
            if (err) {
                return callback(err);
            }

            bar.getKeySSIAsString((err, barKeySSI) => {
                if (err) {
                    return callback(err);
                }

                resolver.loadDSU(barKeySSI, (err, loadedDossier) => {
                    if(err){
                        return callback(err);
                    }

                    getCardinalDossierSeed((err, cardinalSeed)=>{
                        if (err) {
                            return callback(err);
                        }
                        loadedDossier.mount("/cardinal", cardinalSeed, (err) => {
                            if (err) {
                                return callback(err);
                            }
                            try {
                                let themeNames = fs.readdirSync(THEMES_PATH);
                                function addTheme(theme, callback){
                                    getThemeDossierSeed(theme,(err, themeSeed) => {
                                        if (err) {
                                            return callback(err);
                                        }

                                        loadedDossier.mount(`/themes/${theme}`, themeSeed, (err) => {
                                            if (err) {
                                                return callback(err);
                                            }

                                            if(themeNames.length !== 0){
                                                addTheme(themeNames.pop(), callback);
                                            }else{
                                                return callback();
                                            }
                                        });
                                    })
                                }

                                if(themeNames.length > 0){
                                    addTheme(themeNames.pop(), function(err){
                                        if (err) {
                                            return callback(err);
                                        }
                                        storeKeySSI(DOSSIER_SEED_FILE_PATH, barKeySSI, callback);
                                    })
                                }else{
                                    storeKeySSI(DOSSIER_SEED_FILE_PATH, barKeySSI, callback);
                                }
                            } catch (e) {
                                storeKeySSI(DOSSIER_SEED_FILE_PATH, barKeySSI, callback);
                            }
                        })
                    })
                })
            });
        });
    });
}

function build(callback) {
    fs.readFile(DOSSIER_SEED_FILE_PATH, (err, content) => {
        if (err || content.length === 0) {
            console.log(`Creating a new Dossier...`);
            return createDossier(callback);
        }

        let keySSI;
        try {
            keySSI = keyssi.parse(content.toString());
        } catch (err) {
            console.log("Invalid keySSI. Creating a new Dossier...");
            return createDossier(callback);
        }

        if(keySSI.getDLDomain() !== DEFAULT_DOMAIN){
            console.log("Domain change detected. Creating a new Dossier...");
            return createDossier(callback);
        }

        console.log("Dossier updating...");
        resolver.loadDSU(content.toString(), (err, bar) => {
            if (err) {
                return callback(err);
            }

            updateDossier(bar, callback);
        });
    });
}

build(function (err, keySSI) {
    let path = require("path");
    let projectName = path.basename(path.join(__dirname, "../"));
    if (err) {
        console.log(`Build process of <${projectName}> failed.`);
        console.log(err);
        process.exit(1);
    }
    console.log(`Build process of <${projectName}> finished. Dossier's KeySSI:`, keySSI);
});