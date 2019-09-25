import { Module } from "../../Module";

import BanchoUser from "./User";
import BanchoNick from "./Nick";
import BanchoMode from "./Mode";
import BanchoTop from "./Top";
import Bot from "../../Bot";

export default class Bancho extends Module {
    constructor(bot: Bot) {
        super("b", bot);

        this.name = "Bancho";
        
        this.registerCommand([
            new BanchoUser(this),
            new BanchoNick(this),
            new BanchoMode(this),
            new BanchoTop(this)
        ]);
    }
}