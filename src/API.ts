import Bot from './Bot';
import IAPI from './api/base';

import BanchoAPI from './api/Bancho';

class APICollection {
    bancho: BanchoAPI;
    constructor(bot: Bot) {
        this.bancho = new BanchoAPI(bot.config.tokens.bancho);
    }
}

export {
    IAPI,
    APICollection
}