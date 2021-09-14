const fs = require('fs');
const path = require('path');

const repoPath = process.cwd();


const authenticationFeatureRegexp = /^authentication-feature-(.+)$/g;

const authenticationFeaturesDirectories = fs.readdirSync(process.cwd(), {withFileTypes: true})
                                            .filter(d => d.isDirectory() && d.name.match(authenticationFeatureRegexp))
                                            .map(d => d.name);

const output = authenticationFeaturesDirectories.reduce((accum, name) => {
    let match = authenticationFeatureRegexp.exec(name);
    accum[match[1]] = fs.readFileSync(path.join(repoPath, name, "seed")).toString();
    authenticationFeatureRegexp.lastIndex = 0;
    return accum;
    }, {});

fs.writeFileSync(path.join(repoPath, "apihub-root", "auth-features.json"), JSON.stringify(output), "utf-8");