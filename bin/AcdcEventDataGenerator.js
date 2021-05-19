const fetch = require('node-fetch')

class AcdcEventDataGenerator {
    url = ""
    checkDateTime = []
    expirationDateTime = []
    products = []
    countries = {}

    constructor(url) {
        console.log("AcdcEventDataGenerator: initialized.")
        this.url = url
        this.checkDateTime = this.buildRandomDate(200, 60)
        this.expirationDateTime = this.buildRandomDate(10, 3)

        const randomInterval = (min = 1000000, max = 9999999) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        this.products = [
            { gtin: `0908881${randomInterval()}`, batchNumber: `SPM${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Cstyx 150mg/ml"},
            { gtin: `0908882${randomInterval()}`, batchNumber: `SPN${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Cstyx 200mg/ml"},
            { gtin: `0908883${randomInterval()}`, batchNumber: `SPO${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Cstyx 75mg/ml"},
            { gtin: `0908884${randomInterval()}`, batchNumber: `SPP${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Abdxo 75mg/ml"},
            { gtin: `0908885${randomInterval()}`, batchNumber: `SSQ${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Abdxo 45mg/ml"},
            { gtin: `0908886${randomInterval()}`, batchNumber: `SSR${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Abdxo 150mg/ml"},
            { gtin: `0908887${randomInterval()}`, batchNumber: `SSS${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Yuzyx 250mg/ml"},
            { gtin: `0908888${randomInterval()}`, batchNumber: `SST${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Yuzyx 125mg/ml"},
            { gtin: `0908889${randomInterval()}`, batchNumber: `SSU${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Yuzyx 400mg/ml"},
            { gtin: `0908880${randomInterval()}`, batchNumber: `SSX${randomInterval(10, 99)}`, serialNumber: `91006482${randomInterval()}`, productName: "Amnid 40mg/ml"},
        ]

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
        const randomProductIdx = (Math.random() * this.products.length) | 0
        const randomExpDateIdx = (Math.random() * this.expirationDateTime.length) | 0
        const randomCheckDateIdx = (Math.random() * this.checkDateTime.length) | 0
        const location = this.buildDummyGeolocation()
        const product = this.products[randomProductIdx]

        return {
            gtin: product.gtin,
            batch: product.batchNumber,
            serialNumber: product.serialNumber,
            productName: `${location.country}-${product.productName}`,
            expiryDate: this.expirationDateTime[randomExpDateIdx],
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
                    console.log("count:", i, " product:", data.productName, "geolocation:",  data.snCheckLocation," response:", json)
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