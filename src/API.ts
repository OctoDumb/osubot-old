import Bot from './Bot';
import IAPI from './api/base';

import BanchoAPI from './api/Bancho';
import GatariAPI from './api/Gatari';

class APICollection {
    bancho: BanchoAPI;
    gatari: GatariAPI;
    constructor(bot: Bot) {
        this.bancho = new BanchoAPI(bot.config.tokens.bancho);
        this.gatari = new GatariAPI();
    }
}

export {
    IAPI,
    APICollection
}