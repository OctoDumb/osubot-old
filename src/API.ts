import Bot from './Bot';
import IAPI from './api/base';

import BanchoAPI from './api/Bancho';
import GatariAPI from './api/Gatari';
import RippleAPI from './api/Ripple';
import AkatsukiAPI from './api/Akatsuki';
import AkatsukiRelaxAPI from './api/AkatsukiRelax';

class APICollection {
    bancho: BanchoAPI;
    gatari: GatariAPI;
    ripple: RippleAPI;
    akatsuki: AkatsukiAPI;
    relax: AkatsukiRelaxAPI;
    constructor(bot: Bot) {
        this.bancho = new BanchoAPI(bot.config.tokens.bancho);
        this.gatari = new GatariAPI();
        this.ripple = new RippleAPI();
        this.akatsuki = new AkatsukiAPI();
        this.relax = new AkatsukiRelaxAPI();
    }
}

export {
    IAPI,
    APICollection
}