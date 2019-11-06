import { Module } from '../../Module';
import Bot from '../../Bot';
import NewsCommand from './News';
import HelpCommand from './Help';

export default class Main extends Module {
    constructor(bot: Bot) {
        super("osu", bot);

        this.name = "Main";

        this.registerCommand([
            new HelpCommand(this),
            new NewsCommand(this)
        ]);
    }
}