import Bot from './Bot';
import IAPI from './api/base';

import BanchoAPI from './api/Bancho';
import GatariAPI from './api/Gatari';
import RippleAPI from './api/Ripple';
import AkatsukiAPI from './api/Akatsuki';
import AkatsukiRelaxAPI from './api/AkatsukiRelax';
import EnjuuAPI from './api/Enjuu';
import VudekAPI from './api/Vudek';
import KurikkuAPI from './api/Kurikku';

class APICollection {
    bancho: BanchoAPI;
    gatari: GatariAPI;
    ripple: RippleAPI;
    akatsuki: AkatsukiAPI;
    relax: AkatsukiRelaxAPI;
    enjuu: EnjuuAPI;
    vudek: VudekAPI;
    kurikku: KurikkuAPI;
    constructor(bot: Bot) {
        this.bancho = new BanchoAPI(bot);
        this.gatari = new GatariAPI(bot);
        this.ripple = new RippleAPI(bot);
        this.akatsuki = new AkatsukiAPI(bot);
        this.relax = new AkatsukiRelaxAPI(bot);
        this.enjuu = new EnjuuAPI(bot);
        this.vudek = new VudekAPI(bot);
        this.kurikku = new KurikkuAPI(bot);
    }
}

export {
    IAPI,
    APICollection
}