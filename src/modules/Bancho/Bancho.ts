import { Module } from "../../Module";

import Bot from "../../Bot";
import BanchoUser from "./User";
import BanchoNick from "./Nick";
import BanchoMode from "./Mode";
import BanchoTop from "./Top";
import BanchoRecent from "./Recent";
import BanchoCompare from "./Compare";

export default class Bancho extends Module {
    constructor(bot: Bot) {
        super("b", bot);

        this.name = "Bancho";
        
        this.registerCommand([
            new BanchoUser(this),
            new BanchoNick(this),
            new BanchoMode(this),
            new BanchoTop(this),
            new BanchoRecent(this),
            new BanchoCompare(this)
        ]);
    }
}