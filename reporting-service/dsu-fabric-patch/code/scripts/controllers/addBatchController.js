const {WebcController} = WebCardinal.controllers;
import constants from "../constants.js";
import Batch from "../models/Batch.js";
import getSharedStorage from '../services/SharedDBStorageService.js';
import utils from "../utils.js";
import MessagesService from "../services/MessagesService.js";
import LogService from "../services/LogService.js";
import HolderService from "../services/HolderService.js";
import LeafletService from "../services/LeafletService.js";

const holderService = HolderService.getHolderService();

export default class addBatchController extends WebcController {
  constructor(...props) {
    super(...props);
    const epiUtils = require("epi-utils").getMappingsUtils();
    const mappings = require("epi-utils").loadApi("mappings");
    let state = this.history.location.state;
    const editMode = state != null && state.batchData != null;
    const editData = editMode ? JSON.parse(state.batchData) : undefined;
    let batch = new Batch(editData);
    this.setModel({});
    this.storageService = getSharedStorage(this.DSUStorage);
    this.logService = new LogService(this.DSUStorage);

    this.versionOffset = 1;
    this.model.languageTypeCards = [];
    holderService.ensureHolderInfo((err, holderInfo) => {
      if (!err) {
        this.model.username = holderInfo.userDetails.username;
      } else {
        this.showErrorModalAndRedirect("Invalid configuration detected! Configure your wallet properly in the Holder section!", "batches");
      }
    })

    this.model.batch = batch;
    this.model.batch.productName = "";
    this.model.productDescription = "";
    this.model.editMode = editMode;
    this.model.serialNumbersLogs = [];
    this.model.products = {
      placeholder: "Select a product"
    }

    this.model.serial_update_options = {
      options: [
        {label: "Update Valid", value: "update-valid-serial"},
        {label: "Update Recalled", value: "update-recalled-serial"},
        {label: "Update decommissioned", value: "update-decommissioned-serial"},
        {label: "See update history", value: "update-history"}
      ],
      placeholder: "Select an option"
    }
    if (editMode) {
      this.gtin = this.model.batch.gtin;
      this.model.batch.version++;
      this.getBatchAttachments(this.model.batch, (err, attachments) => {
        if (err) {
          this.showErrorModalAndRedirect("Failed to get inherited cards", "patch");
        }
        this.model.languageTypeCards = attachments.languageTypeCards;
      });
      this.model.batch.enableExpiryDay = this.model.batch.expiry.slice(-2) !== "00";

      this.getProductFromGtin(this.gtin, (err, product) => {
        this.model.batch.productName = product.name;
        this.model.productDescription = product.description;
      });
    }

    this.storageService.filter(this.model.batch.batchNumber, "__timestamp > 0", (err, logs) => {
      if (err || typeof logs === "undefined") {
        logs = [];
      }
      this.model.serialNumbersLogs = logs;
    });

    this.storageService.filter(constants.PRODUCTS_TABLE, "__timestamp > 0", (err, products) => {
      if (err || !products) {
        printOpenDSUError(createOpenDSUErrorWrapper("Failed to retrieve products list!", err));
        return this.showErrorModalAndRedirect("Failed to retrieve products list! Create a product first!", "products", 5000);
      }
      const options = [];
      Object.values(products).forEach(prod => options.push({
        label: prod.gtin + ' - ' + prod.name,
        value: prod.gtin
      }));
      this.model.products.options = options;
    });

    this.model.onChange("batch.batchNumber", (event) => {
      this.storageService.filter(this.model.batch.batchNumber, "__timestamp > 0", (err, logs) => {
        if (err || typeof logs === "undefined") {
          logs = [];
        }
        this.model.serialNumbersLogs = logs;
      });
    })

    this.onTagClick("cancel", () => {
      this.navigateToPageTag("batches");
    });

    let addOrUpdateBatch = async () => {
      if (!this.model.batch.gtin) {
        return this.showErrorModal("Invalid product code. Please select a valid code");
      }
      let batch = this.initBatch();
      if (!batch.expiryForDisplay) {
        return this.showErrorModal("Invalid date");
      }
      // manage ignore date if day is not used we save it as last day of the month
      if (!batch.enableExpiryDay) {
        batch.expiryForDisplay = utils.getIgnoreDayDate(batch.expiryForDisplay)
      }
      batch.expiry = utils.convertDateToGS1Format(batch.expiryForDisplay, batch.enableExpiryDay);

      let error = batch.validate();
      if (error) {
        printOpenDSUError(createOpenDSUErrorWrapper("Invalid batch info", error));
        return this.showErrorModalAndRedirect("Invalid batch info" + error, "batches");
      }
      this.createWebcModal({
        disableExpanding: true,
        disableClosing: true,
        disableFooter: true,
        modalTitle: "Info",
        modalContent: "Saving batch..."
      });

      let message = {
        senderId: this.model.username,
        batch: {}
      }

      epiUtils.transformToMessage(batch, message.batch, epiUtils.batchDataSourceMapping);
      message.messageType = "Batch";

      try {
        //process batch, leaflet & smpc cards

        let cardMessages = await LeafletService.createEpiMessages({
          cards: [...this.model.deletedLanguageTypeCards, ...this.model.languageTypeCards],
          type: "batch",
          username: this.model.username,
          code: message.batch.batch
        })
        if (!this.DSUStorage.directAccessEnabled) {
          this.DSUStorage.enableDirectAccess(async () => {
            await MessagesService.processMessages([message, ...cardMessages], this.DSUStorage, this.showMessageError.bind(this));
          })
        } else {
          await MessagesService.processMessages([message, ...cardMessages], this.DSUStorage, this.showMessageError.bind(this));
        }

      } catch (e) {
        this.showErrorModal(e.message);
      }
    };

    this.onTagClick("update-batch", addOrUpdateBatch)
    this.onTagClick("add-batch", addOrUpdateBatch);


    this.model.onChange("serial_update_options.value", (event) => {
      if (this.model.serial_update_options.value === "update-history") {
        this.showSerialHistoryModal()
      } else {
        this.updateSerialsModal(this.model.serial_update_options.value);
      }
    });

    this.model.onChange("products.value", async (event) => {
      this.model.batch.gtin = this.model.products.value;
      this.getProductFromGtin(this.model.batch.gtin, (err, product) => {
        if (err) {
          printOpenDSUError(createOpenDSUErrorWrapper("Failed to get a valid product", err));
          return this.showErrorModalAndRedirect("Failed to get a valid product", "batches");
        }
        this.model.batch.gtin = product.gtin;
        this.model.batch.productName = product.name;
        this.model.productDescription = product.description || "";
        this.model.batch.product = product.keySSI
      });
    })

    this.on('openFeedback', (e) => {
      this.feedbackEmitter = e.detail;
    });
  }

  showMessageError(undigestedMessages) {
    let errors = [];
    if (undigestedMessages.length > 0) {
      undigestedMessages.forEach(msg => {
        if (errors.findIndex((elem) => elem.message === msg.reason.originalMessage) < 0) {
          errors.push({message: msg.reason.originalMessage});
        }
      })

      this.showModalFromTemplate("digest-messages-error-modal", () => {
        this.hideModal();
        this.navigateToPageTag("batches");
      }, () => {
        this.hideModal();
      }, {model: {errors: errors}});
    } else {

      this.hideModal();
      this.navigateToPageTag("batches");
    }
  }

  getProductFromGtin(gtin, callback) {
    this.storageService.filter(constants.PRODUCTS_TABLE, `gtin == ${gtin}`, (err, products) => {
      if (err) {
        printOpenDSUError(createOpenDSUErrorWrapper("Failed to get a valid product", err));
        return this.showErrorModalAndRedirect("Failed to get a valid product", "batches");
      }
      let product = products[0];
      if (!product) {
        return callback(new Error(`No product found for gtin ${gtin}`));
      }
      callback(undefined, product);
    });
  }

  initBatch() {
    let result = this.model.batch;
    result.serialNumbers = this.stringToArray(this.model.serialNumbers);
    result.recalledSerialNumbers = this.stringToArray(this.model.recalledSerialNumbers);
    result.decommissionedSerialNumbers = this.stringToArray(this.model.decommissionedSerialNumbers);
    return result;
  }

  getBatchAttachments(batch, callback) {
    const resolver = require("opendsu").loadAPI("resolver");
    resolver.loadDSU(batch.keySSI, async (err, batchDSU) => {
      if (err) {
        return callback(err);
      }

      let languageTypeCards = [];
      //used temporarily to avoid the usage of dsu cached instances which are not up to date

      try {
        await $$.promisify(batchDSU.load)();
        let leaflets = await $$.promisify(batchDSU.listFolders)("/leaflet");
        let smpcs = await $$.promisify(batchDSU.listFolders)("/smpc");
        for (const leafletLanguageCode of leaflets) {
          let leafletFiles = await $$.promisify(batchDSU.listFiles)("/leaflet/" + leafletLanguageCode);
          languageTypeCards.push(LeafletService.generateCard(LeafletService.LEAFLET_CARD_STATUS.EXISTS, "leaflet", leafletLanguageCode, leafletFiles));
        }
        for (const smpcLanguageCode of smpcs) {
          let smpcFiles = await $$.promisify(batchDSU.listFiles)("/smpc/" + smpcLanguageCode);
          languageTypeCards.push(LeafletService.generateCard(LeafletService.LEAFLET_CARD_STATUS.EXISTS, "smpc", smpcLanguageCode, smpcFiles));
        }
        callback(undefined, {languageTypeCards: languageTypeCards});
      } catch (e) {
        return callback(e);
      }
    });
  }

  //TODO move it to utils
  stringToArray(string) {
    if (typeof string === "undefined") {
      return [];
    }
    return string.split(/[ ,]+/).filter(v => v !== '')
  }

  showSerialHistoryModal() {
    this.showModalFromTemplate('serial-numbers-update-history', () => {
    }, () => {
      this.model.serial_update_options.value = "Select an option";
    }, {model: this.model});
  }

  updateSerialsModal(type) {
    this.model.actionModalModel = {
      title: "Enter serial numbers separated by comma",
      acceptButtonText: 'Accept',
      denyButtonText: 'Cancel',
      type: type,
      serialNumbers: "",
      resetAll: false,
      decommissionedType: false,
      reason: {
        options: [{label: "Lost", value: "lost"}, {label: "Stolen", value: "stolen"}, {
          label: "Damaged",
          value: "damaged"
        }],
        placeholder: "Select a reason"
      }
    }
    switch (type) {
      case "update-decommissioned-serial":
        this.model.actionModalModel.decommissionedType = true;
        this.model.actionModalModel.resetButtonLabel = "Reset all decommissioned serial numbers";
        break;
      case "update-recalled-serial":
        this.model.actionModalModel.resetButtonLabel = "Reset all recalled serial numbers";
        break;
      case "update-valid-serial":
        this.model.actionModalModel.resetButtonLabel = "Reset all valid serial numbers";
        break;
      default:
        return;
    }

    const serialNumbersLog = {}
    this.showModalFromTemplate('update-batch-serial-numbers', () => {
      switch (type) {
        case "update-valid-serial":
          serialNumbersLog.action = "Updated valid serial numbers list";
          serialNumbersLog.creationTime = new Date().toUTCString();
          if (this.model.actionModalModel.resetAll) {
            this.model.batch.snValidReset = true;
          }
          this.model.serialNumbers = this.model.actionModalModel.serialNumbers;

          break
        case "update-recalled-serial":
          serialNumbersLog.creationTime = new Date().toUTCString();
          serialNumbersLog.action = "Updated recalled serial numbers list";
          if (this.model.actionModalModel.resetAll) {
            this.model.batch.snRecalledReset = true;
          }
          this.model.recalledSerialNumbers = this.model.actionModalModel.serialNumbers;
          break
        case "update-decommissioned-serial":
          serialNumbersLog.action = "Updated decommissioned serial numbers list";
          serialNumbersLog.creationTime = new Date().toUTCString();
          if (this.model.actionModalModel.resetAll) {
            this.model.batch.snDecomReset = true;
          }
          this.model.decommissionedSerialNumbers = this.model.actionModalModel.serialNumbers;
          this.model.batch.decommissionReason = this.model.actionModalModel.reason.value;
          break
      }
      this.model.serial_update_options.value = "Select an option";
      this.storageService.insertRecord(this.model.batch.batchNumber, serialNumbersLog.creationTime, serialNumbersLog, () => {
      })
    }, () => {
      this.model.serial_update_options.value = "Select an option";
    }, {model: this.model});
  }

};
