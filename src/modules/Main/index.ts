import { Module } from '../../Module';
import Bot from '../../Bot';
import NewsCommand from './News';
import HelpCommand from './Help';
import StreamsCommand from './Twitch';
import UptimeCommand from './Uptime';
import TopCmdsCommand from './TopCmds';
import StatsCommand from './Stats';

export default class Main extends Module {
    constructor(bot: Bot) {
        super("osu", bot);

        this.name = "Main";

        this.registerCommand([
            new HelpCommand(this),
            new NewsCommand(this),
            new StreamsCommand(this),
            new UptimeCommand(this),
            new TopCmdsCommand(this),
            new StatsCommand(this)
        ]);
    }
}