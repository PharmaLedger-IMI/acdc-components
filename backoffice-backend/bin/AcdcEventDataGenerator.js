const fetch = require('node-fetch')

class AcdcEventDataGenerator {
    url = ""

    // nameMedicinalProduct it's just for reference with backend, not used in EventInput
    products = [
        {productCode: '01201419000158', nameMedicinalProduct: 'Cosentyx 150mg/ml x2'},
        {productCode: '29653329154760', nameMedicinalProduct: 'Ritalin LA HGC 40mg 1x30'},
        {productCode: '30652009514715', nameMedicinalProduct: 'Aspirin 500mg 1x25'},
        {productCode: '49408945163108', nameMedicinalProduct: 'Keytruda 25mg/ml'},
    ]

    productStatus = [
        'Released to market', 'Released to market', 'Released to market', 'Released to market', 'Released to market',
        'Not released', 'Not released', 'Not released',
        'Not registered', 'Not registered',
        'Reported stolen',
        'Reported destroyed',
        'Reported suspect',
    ]

    // batch Prefix: for backend return ProductStatus for dummy scan response
    batchPrefix = {
        'Released to market': 'RMKT',
        'Not released': 'NREG',
        'Not registered': 'NREL',
        'Reported stolen': 'RSTO',
        'Reported destroyed': 'RDES',
        'Reported suspect': 'RSUS',
    }

    // Countries that will be generated geolocation
    countries = [
        {code: "FR", lat: 46.227638, long: 2.213749},
        {code: "DE", lat: 51.165691, long: 10.451526},
        {code: "IT", lat: 41.87194, long: 12.56738},
        {code: "PT", lat: 39.399872, long: -8.224454},
        {code: "ES", lat: 40.463667, long: -3.74922},
        {code: "US", lat: 40.654382, long: -103.994355},
        {code: "BR", lat: -15.297258, long: -49.140362},
        {code: "UK", lat: 52.111281, long: -0.992124},
    ]

    /** each product has multiple batches, each batch has a status and an expiration date
     serial number = gtin + batch
     checkDateTime -> aleatory
     expirationDateTime -> according to batch (format: YYMMDD)
     */
    constructor(url) {
        console.log("AcdcEventDataGenerator: initialized.")
        this.url = url
    }

    // Choose a random element from a list
    randomChoice(list) {
        const idx = (Math.random() * list.length) | 0
        return list[idx]
    }

    // Take a random number between two numbers
    randomInterval(min = 1, max = 9) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // Format data to YYMMDD
    dateFormatYYMMDD(date) {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString().substr(-2);;
        return `${year}${month}${day}`;
    }

    // Generates a random date between today and the number of previous days informed
    buildRandomDate(untilDaysBefore = 1, callback = null) {
        const dateOffset = (24 * 60 * 60 * 1000) * ((Math.random() * untilDaysBefore) | 0);
        let randomDate = new Date(new Date() - dateOffset)
        if(!!callback) {
            randomDate = callback(randomDate)
        }
        return randomDate
    }

    // Generate a random geolocation
    buildDummyGeolocation() {
        const randomIdx = (Math.random() * this.countries.length) | 0
        const country = this.countries[randomIdx]
        return {
            latitude: parseFloat((country.lat + (Math.random() * 1.835)).toFixed(6)),
            longitude: parseFloat((country.long + (Math.random() * 1.835)).toFixed(6))
        }
    }

    // Build batches for each product
    buildShipments(products, batchQtyMax = 1) {
        const shipments = []
        products.forEach(product => {
            const batchQty = this.randomInterval(1, batchQtyMax)
            for (let i = 0; i < batchQty; i++) {
                const productCode = product.productCode
                const expiryDate = this.buildRandomDate(90, this.dateFormatYYMMDD)

                const productStatus = this.randomChoice(this.productStatus)
                const batch = `${this.batchPrefix[productStatus]}${productCode.substr(0, 3)}${this.randomInterval(10000, 99999)}`
                const serialNumber = productCode + batch

                const shipment = {productCode, batch, serialNumber, expiryDate}
                shipments.push(shipment)
            }
        })
        return shipments
    }

    // Generate a random AcdcScan data structure
    buildDummyScan(shipment) {
        const snCheckDateTime = this.buildRandomDate(150)
        const snCheckLocation = this.buildDummyGeolocation()
        const scanObject = {
            ...shipment,
            snCheckDateTime,
            snCheckLocation,
            did: 'AcdcEventDataGenerator',
            batchDsuStatus: true,
            productDsuStatus: false
        };
        if (false) { // only send on secondary reports (for an existing previous report)
            scanObject['previousScan'] = "c5c281e6-3abf-4a8a-8154-a161cd08a705";
            scanObject['authResponse'] = {
                status: true
            };
        }
        return scanObject;
    }

    // Send dummy scan data to Acdc
    async populate(qty, verbose = false) {
        const shipments = this.buildShipments(this.products, Math.ceil(qty / 1000) + 1)
        console.log("AcdcEventDataGenerator: populating " + qty + " records...")
        for (let i = 1; i <= qty; i++) {
            const shipment = this.randomChoice(shipments)
            const dummyData = this.buildDummyScan(shipment)
            fetch(this.url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dummyData)
            }).then(res => res.json()).then(json => {
                if (verbose) {
                    console.log("count:", i, dummyData, " response:", json)
                }
            }).catch(err => {
                throw new Error(err)
            });
            await new Promise(r => setTimeout(r, 85));
        }
    }
}

if (require.main === module) {
    const url = "http://localhost:3000/borest/scan"
    const generator = new AcdcEventDataGenerator(url)
    generator.populate(3000, true).then(r => console.log('AcdcEventDataGenerator finish'))
}
