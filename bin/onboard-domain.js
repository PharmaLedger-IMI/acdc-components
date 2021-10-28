
const argParser = function(defaultOpts, args){
    let config = JSON.parse(JSON.stringify(defaultOpts));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}

const defaultOps = {
    domainName: "epi-auth-template",
    anchoring: "http://localhost:8080",
    notifications: "http://localhost:8080",
    bricking: "http://localhost:8080",
    replicas: JSON.stringify([])
}

const bdnsPath = 'apihub-root/external-volume/config/bdns.hosts';

const conf = argParser(defaultOps, process.argv);

const fs = require('fs');
const path = require('path');

const readFile = function(filePath){
    let data;
    try {
        console.log(`Reading file: `, filePath);
        data = fs.readFileSync(filePath);
    } catch (e) {
        throw new Error(`Could not read file from ${filePath} - ${e.message}`);
    }
    return data.toString();
}

const writeFile = function(data, filePath){
    try {
        console.log(`Writing updated file to: `, filePath);
        fs.writeFileSync(filePath, data);
    } catch (e) {
        throw new Error(`Could not write to ${filePath} - ${e.message}`);
    }
}

const handleBDNS = function(){
    const bdns = JSON.parse(readFile(bdnsPath));

    const getBDNSConfig = function(){
        return {
            "replicas": JSON.parse(conf.replicas),
            "brickStorages": [
                conf.bricking
            ],
            "anchoringServices": [
                conf.anchoring
            ],
            "notifications": [
                conf.notifications
            ]
        }
    }

    bdns[conf.domainName] = getBDNSConfig();

    writeFile(JSON.stringify(bdns, undefined, 2), bdnsPath);
}

const banner = function(){
    console.log(`-------------------------------------------`);
    console.log(`Adding a new BDNS with configs:`);
    Object.keys(conf).forEach(k => console.log(`${k} = ${conf[k]}`));
    console.log(`-------------------------------------------`);
}

banner();

handleBDNS();

console.log(`BDNS updated`);






