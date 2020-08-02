import { Module } from '../../Module';
import Bot from '../../Bot';
import NewsCommand from './News';
import HelpCommand from './Help';
import StreamsCommand from './Twitch';
import UptimeCommand from './Uptime';
import TopCmdsCommand from './TopCmds';
import StatusCommand from './Status';
import SearchCommand from './Search';

export default class Main extends Module {
    constructor(bot: Bot) {
        super(["osu", "осу", "щыг"], bot);

        this.name = "Main";

        this.registerCommand([
            new HelpCommand(this),
            new NewsCommand(this),
            new StreamsCommand(this),
            new UptimeCommand(this),
            new TopCmdsCommand(this),
            new StatusCommand(this),
            new SearchCommand(this)
        ]);
    }
}