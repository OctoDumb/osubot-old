import { Module } from "../../Module";
import Bot from "../../Bot";
import AkatsukiUser from "./User";
import AkatsukiTop from "./Top";
import AkatsukiNick from "./Nick";
import AkatsukiMode from "./Mode";

export default class Akatsuki extends Module {
    constructor(bot: Bot) {
        super("a", bot);
        
        this.name = "Akatsuki";

        this.link = "https://akatsuki.pw";

        this.registerCommand([
            new AkatsukiNick(this),
            new AkatsukiMode(this),
            new AkatsukiUser(this),
            new AkatsukiTop(this)
        ]);
    }
}