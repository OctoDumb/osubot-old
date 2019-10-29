import { Module } from '../../Module';
import Bot from '../../Bot';
import NewsCommand from './News';
import EvalCommand from './Eval';

export default class Admin extends Module {
    constructor(bot: Bot) {
        super("admin", bot);

        this.name = "Admin";

        this.registerCommand([
            new NewsCommand(this),
            new EvalCommand(this)
        ]);
    }
}