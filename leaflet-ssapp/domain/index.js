$$.swarm.describe("leafletLoader", {
    mountDSU: function (mountPath, gtinSSI) {
        rawDossier.readFile("/code/constitution/gtinResolver.js", (err, content) => {
            eval(content.toString());
            let gtinResolver = require("gtin-resolver");
            rawDossier.mount(mountPath, gtinSSI, (err) => {
                rawDossier.listFiles(`${mountPath}/batch/product`, (err, files) => {
                    this.return(err);
                });
            });
        });
    }
});
