const {WebcController} = WebCardinal.controllers;
import LanguageService from "../services/LanguageService/LanguageService.js";
import languageServiceUtils from "../services/LanguageService/languageServiceUtils.js";
import SettingsService from "../services/SettingsService.js";
import constants from "../../constants.js";

export default class SettingsController extends WebcController {
    constructor(element, history) {
        super(element, history);

        this.setModel({languageSelectorOpened: false, origin: window.location.origin, networkEditMode: true, scanditLicenseEditMode: true});
        this.languageService = new LanguageService(this.DSUStorage);
        this.settingsService = new SettingsService(this.DSUStorage);

        this.languageService.getLanguageListForOrdering((err, vm) => {
            this.model.workingLanguages = vm;

            this.model.onChange("workingLanguages", (event) => {
                this.languageService.overwriteWorkingLanguages(this.model.workingLanguages.items, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            });
        });

        this.model.networkNameSetting={
            label: "Enter Blockchain Network:"
        };
        this.initNetworkSettingsTab();

        this.on("change-edit-mode", (event)=>{
            this.toggleEditMode(event.target.getAttribute("data"));
        })

        this.on("change-network", ()=>{
            this.settingsService.writeSetting("networkname", this.model.networkNameSetting.value, (err)=>{
                if(err){
                    console.log(err);
                }
                this.toggleEditMode("networkEditMode");
            });
        });

        this.on("change-default-network", ()=>{
            this.settingsService.writeSetting("networkname", undefined, (err)=>{
                if(err){
                    console.log(err);
                }
                this.initNetworkSettingsTab();
                this.toggleEditMode("networkEditMode");
            });
        });

        this.model.languagesToAdd = {
            placeholder: "Select a language",
            options: languageServiceUtils.getAllLanguagesAsVMItems()
        }
        this.on("add-language", (event) => {
            this.model.languageSelectorOpened = true;
        });

        this.model.onChange("languagesToAdd", () => {
            this.languageService.addWorkingLanguages(this.model.languagesToAdd.value, (err) => {
                if (err) {
                    throw err;
                }
                this.languageService.getLanguageListForOrdering((err, vm) => {
                    this.model.workingLanguages = vm;
                    this.model.languageSelectorOpened = false;
                });
            })
        });

        // scanning settings
        this.model.useScanditLicense = { label: "Use Scandit with API key:" };
        this.initScanningSettingsTab();

        this.on("set-scandit-license", ()=>{
            this.settingsService.writeSetting("scanditlicense", this.model.useScanditLicense.value, (err)=>{
                if(err){
                    console.log(err);
                }
                this.toggleEditMode("scanditLicenseEditMode");
            });
        });

        // ACDC integration settings
        this.acdc = require('acdc').ReportingService.getInstance(this.settingsService);

        this.acdc.setSettingsToModel(this.model, err => console.log(err
            ? `Error Binding ACDC settings to model: ${err}`
            : "Acdc Settings Added"));
    }

    toggleEditMode(prop){
        this.model[prop] = !this.model[prop]
    }
    initNetworkSettingsTab(){
        this.settingsService.readSetting("networkname", (err, networkname)=>{
            if(err || typeof networkname === "undefined"){
                this.settingsService.writeSetting("networkname", constants.DEFAULT_NETWORK_NAME, (err)=>{
                    if(err){
                        return console.log("Unable to write setting networkname");
                    }
                    this.model.networkNameSetting.value = constants.DEFAULT_NETWORK_NAME;
                });
            }

            this.model.networkNameSetting.value = networkname;
        });
    }

    initScanningSettingsTab(){
        this.settingsService.readSetting("scanditlicense", (err, scanditlicense)=>{
            if(err || typeof scanditlicense === "undefined"){
                this.settingsService.writeSetting("scanditlicense", "", (err)=>{
                    if(err){
                        return console.log("Unable to write setting scanditlicense");
                    }
                    this.model.useScanditLicense.value = "";
                });
            }

            this.model.useScanditLicense.value = scanditlicense;
        });
    }
}
