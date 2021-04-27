const fetch = require('node-fetch')

class AcdcEventDataGenerator {
    url = ""
    checkDateTime = []
    expirationDateTime = []
    GTIN = []
    batchNumber = []
    sn = []
    productNames = []
    countries = {}

    constructor(url) {
        console.log("AcdcEventDataGenerator: initialized.")
        this.url = url
        this.checkDateTime = this.buildRandomDate(200, 60)
        this.expirationDateTime = this.buildRandomDate(10, 3)

        // Metadata -> need to have the same length
        this.GTIN = ["09088884204593", "09088884204598", "09088884204595"]
        this.batchNumber = ["SPM66", "SPM70", "SPM63"]
        this.sn = ["91006482939355", "91006482939351", "91006482939394"]
        this.productNames = ["Cstyx 150mg/ml", "Yuzyx 75mg/ml", "Abdxo 200mg/ml"]
        if([this.batchNumber.length, this.sn.length, this.productNames.length].some( (value) => value !== this.GTIN.length)) {
            throw new Error("All metadata arrays need to have the same length")
        }

        // Countries that will be generated geolocation
        this.countries = [
            {code: "FR", lat: 46.227638, long: 2.213749},
            {code: "DE", lat: 51.165691, long: 10.451526},
            {code: "IT", lat: 41.87194, long: 12.56738},
            {code: "PT", lat: 39.399872, long: -8.224454},
            {code: "ES", lat: 40.463667, long: -3.74922}
        ]
    }

    // Generates a random date array, from today to the number of previous days informed
    buildRandomDate(qty = 1, daysBefore = 1) {
        let arr = []
        for (let i = 0 ; i < qty ; i++){
            const dateOffset = (24 * 60 * 60 * 1000) *  ((Math.random() * daysBefore) | 0); //60 days
            const randomDate = new Date(new Date() - dateOffset)
            arr.push(randomDate)
        }
        return arr
    }

    // Generate a random geolocation in format: { contry: country_code, geolocation: "lat, long" }
    buildDummyGeolocation() {
        const randomIdx = (Math.random() * this.countries.length) | 0
        const country = this.countries[randomIdx]
        const randomLat = (country.lat + (Math.random() * 1.835)).toFixed(6)
        const randomLong = (country.long + (Math.random() * 1.835)).toFixed(6)
        return {country: country.code, geolocation: `${randomLat}, ${randomLong}`}
    }

    // Generate a random metadata to input in scan route
    buildDummyData() {
        const randomMetadataIdx = (Math.random() * this.GTIN.length) | 0
        const randomExpDateIdx = (Math.random() * this.expirationDateTime.length) | 0
        const randomCheckDateIdx = (Math.random() * this.checkDateTime.length) | 0
        const location = this.buildDummyGeolocation()

        return {
            gtin: this.GTIN[randomMetadataIdx],
            batch: this.batchNumber[randomMetadataIdx],
            serialNumber: this.sn[randomMetadataIdx],
            productName: `${location.country}-${this.productNames[randomMetadataIdx]}`,
            expireDate: this.expirationDateTime[randomExpDateIdx],
            snCheckDateTime: this.checkDateTime[randomCheckDateIdx],
            snCheckLocation: location.geolocation
        }
    }

    // Send dummy scan data to Acdc
    populate(qty, verbose = false) {
        console.log("AcdcEventDataGenerator: populating " + qty + " records...")
        for (let i = 1; i <= qty; i++) {
            const data = this.buildDummyData()
            fetch(this.url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }).then(res => res.json()).then(json => {
                if(verbose) {
                    console.log("count:", i, " product:", data.Product_name, "geolocation:",  data.SN_check_location," response:", json)
                }
            }).catch(err => {
                throw new Error(err)
            });
        }
    }
}

if (require.main === module) {
    const url = "http://localhost:3000/borest/scan"
    const generator = new AcdcEventDataGenerator(url)
    generator.populate(3000, true)
}