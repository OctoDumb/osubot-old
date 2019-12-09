import { Module } from "../../Module";

import Bot from "../../Bot";
import VudekUser from "./User";
import VudekTop from "./Top";
import VudekRecent from "./Recent";
import VudekChat from "./Chat";
import VudekCompare from "./Compare";
import VudekMode from "./Mode";
import VudekNick from "./Nick";
import VudekFind from "./Find";
import VudekLeaderboard from "./Leaderboard";

export default class Vudek extends Module {
    link: string;
    constructor(bot: Bot) {
        super("v", bot);

        this.name = "Vudek";

        this.link = "https://osu.vudek.ga";

        this.registerCommand([
            new VudekUser(this),
            new VudekFind(this),
            new VudekTop(this),
            new VudekRecent(this),
            new VudekChat(this),
            new VudekCompare(this),
            new VudekMode(this),
            new VudekNick(this),
            new VudekLeaderboard(this)
        ]);
    }
}