declare const $$: any;

function registerPowerCord(identity, reference){
  //power cord to communicate with the iframe in which SSApp is loaded
  let PowerCord = require("swarm-engine").SSAppPowerCord;
  let pc = new PowerCord(reference.contentWindow);
  $$.swarmEngine.plug(identity, pc);
}

function getIdentityFromSSAppName(ssappName){
  //todo: build a power cord identity based on ssappName
  return ssappName;
}

class SSAppInstancesRegistry {
  registry: {} = undefined;

  constructor(){
    this.registry = {};
    if(window['$$'] && $$.SSAPP_CONTEXT && $$.SSAPP_CONTEXT.BASE_URL && $$.SSAPP_CONTEXT.SEED) {
        // the app is handled via server to we don't need to initialise the swarms
        return;
    }

    if(typeof $$.flows === "undefined"){
      require('callflow').initialise();
    }
    if(typeof $$.swarms === "undefined"){
      const se = require("swarm-engine");
      se.initialise("wallet");
    }else{
      //this should force an error and help identify misuse of swarm engine
      $$.swarmEngine.updateIdentity("wallet");
    }
  }

  addSSAppReference(ssappName, reference) {
    console.log("registering ssapp", ssappName, reference);
    if (typeof this.registry[ssappName] !== "undefined" && this.registry[ssappName] !== reference) {
      //todo: what should do when this happens
      console.log("Replacing a reference.");
    }else{
      registerPowerCord(getIdentityFromSSAppName(ssappName), reference);
    }
    this.registry[ssappName] = reference;
  }

  removeSSAppReference(ssappName) {
    if (typeof this.registry[ssappName] === "undefined") {
      return;
    }
    delete this.registry[ssappName];
    $$.swarmEngine.unplug(getIdentityFromSSAppName(ssappName));
  }

  getSSAppReference(ssappName) {
    return this.registry[ssappName];
  }
}

let instance = new SSAppInstancesRegistry();

export const getInstanceRegistry = function() : SSAppInstancesRegistry{
  return instance;
}
