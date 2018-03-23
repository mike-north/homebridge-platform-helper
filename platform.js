const persistentState = require('./helpers/persistentState')
const semver = require('semver');

if (semver.lt(process.version, '7.6.0')) throw new Error(`Homebridge plugins that use the "homebridge-easy-platform" library require your node version to be at least v7.6.0. Current version: ${process.version}`)

class HomebridgePlatform {

  constructor (log, config = {}, homebridge) {
    this.log = log;
    this.config = config;
    this.homebridge = homebridge;

    const { homebridgeDirectory } = config;

    persistentState.init({ homebridge, homebridgeDirectory });
  }

  addAccessories (accessories) {
    throw new Error('The addAccessories method must be overridden.')
  };

  accessories (callback) {
    const { config, log } = this;
    const { name, disableLogs } = config;

    const accessories = [];

    this.addAccessories(accessories);

    // Disable logs if requested
    if (disableLogs !== undefined) {
      accessories.forEach((accessory) => {
        if (accessory.config.disableLogs === undefined) {
          accessory.disableLogs = disableLogs
        }
      })
    }

    // Check for no accessories
    if (!config.accessories || config.accessories.length === 0) {
      if (!disableLogs) log(`No accessories have been added to the "${name}" platform config.`);
      return callback(accessories);
    }

    // Let accessories know about one-another if they wish
    accessories.forEach((accessory) => {
      if (accessory.updateAccessories) accessory.updateAccessories(accessories);
    })

    callback(accessories);
  }
}

module.exports = HomebridgePlatform;
