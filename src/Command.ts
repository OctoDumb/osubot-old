import { MessageContext } from 'vk-io';
import { Module } from './Module';
import Util from './Util';
import { ICommandArgs } from './Types';

interface ICommand {
    readonly name: String | String[],
    module: Module,
    function: (ctx: MessageContext, self: Command, args: ICommandArgs) => void
}

export class Command implements ICommand {
    readonly name: String | String[];
    module: Module;
    function: (ctx: MessageContext, self: Command, args: ICommandArgs) => void
    constructor(name: String | String[], module: Module, func: (ctx: MessageContext, self: Command, args: ICommandArgs) => void) {
        this.name = name;
        this.module = module;
        this.function = func;
    }

    public process(ctx: MessageContext) {
        this.function(ctx, this, Util.parseArgs(ctx.text.split(" ").slice(2)));
    }

    public check(name: String) {
        if(Array.isArray(this.name))
            return this.name.includes(name.toLowerCase());
        else
            return this.name == name.toLowerCase();
    }
}