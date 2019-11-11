import { Module } from '../../Module';
import Bot from '../../Bot';
import NewsCommand from './News';
import EvalCommand from './Eval';
import ErrorCommand from './Error';
import StatusCommand from './Status';
import UploadCommand from './Upload';

export default class Admin extends Module {
    constructor(bot: Bot) {
        super("admin", bot);

        this.name = "Admin";

        this.registerCommand([
            new NewsCommand(this),
            new ErrorCommand(this),
            new StatusCommand(this),
            new EvalCommand(this),
            new UploadCommand(this)
        ]);
    }
}