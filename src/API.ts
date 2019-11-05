import Bot from './Bot';
import IAPI from './api/base';

import BanchoAPI from './api/Bancho';
import GatariAPI from './api/Gatari';
import RippleAPI from './api/Ripple';

class APICollection {
    bancho: BanchoAPI;
    gatari: GatariAPI;
    ripple: RippleAPI;
    constructor(bot: Bot) {
        this.bancho = new BanchoAPI(bot.config.tokens.bancho);
        this.gatari = new GatariAPI();
        this.ripple = new RippleAPI();
    }
}

export {
    IAPI,
    APICollection
}