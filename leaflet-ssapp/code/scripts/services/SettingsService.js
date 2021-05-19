import constants from "../../constants.js";

export default class SettingsService {
	constructor(dsuStorageInstance) {
		if (typeof dsuStorageInstance === "undefined") {
			throw Error("Constructor need a DSUStorage instance as param.");
		}

		this.DSUStorage = dsuStorageInstance;
	}

	readSetting(chain, callback){
		let settingsChain = chain.split(".");

		if(settingsChain.length === 0){
			return this.read(callback);
		}

		this.read((err, settings)=>{
			if(err){
				console.trace(err);
				return callback(err);
			}
			let setting = settings;
			for(let settingName of settingsChain){
				if(settingName === ""){
					continue;
				}
				try{
					setting = setting[settingName];
				}catch(err){
					console.trace(err);
					return callback(err);
				}
			}

			return callback(undefined, setting);
		});
	}

	writeSetting(chain, value, callback){
		let settingsChain = chain.split(".");
		if(settingsChain === 0){
			return callback("no setting chain provided");
		}
		let settingName = settingsChain.pop();
		this.read((err, settings)=>{
			if(err){
				return callback(err);
			}

			try{
				let currentSetting = settings;
				for(let settingName of settingsChain){
					currentSetting = currentSetting[settingName];
				}
				currentSetting[settingName] = value;
			}catch(err){
				return callback(err);
			}

			this.write(settings, callback);
		});
	}

	read(callback){
		this.DSUStorage.getObject(constants.SETTINGS_STORAGE_PATH, (err, settings)=>{
			if(err || typeof settings === "undefined"){
				settings = {};
			}

			callback(undefined, settings);
		});
	}

	write(settings, callback){
		this.DSUStorage.setObject(constants.SETTINGS_STORAGE_PATH, settings, callback);
	}
}