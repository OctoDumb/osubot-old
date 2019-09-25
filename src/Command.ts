import { MessageContext } from 'vk-io';
import { Module } from './Module';

interface ICommand {
    readonly name: String | String[],
    module: Module,
    function: (ctx: MessageContext, self: Command, args: String[]) => void
}

export class Command implements ICommand {
    readonly name: String | String[];
    module: Module;
    function: (ctx: MessageContext, self: Command, args: String[]) => void
    constructor(name: String | String[], module: Module, func: (ctx: MessageContext, self: Command, args: string[]) => void) {
        this.name = name;
        this.module = module;
        this.function = func;
    }

    public process(ctx: MessageContext) {
        this.function(ctx, this, ctx.text.split(" ").slice(2));
    }

    public check(name: String) {
        if(Array.isArray(this.name))
            return this.name.includes(name.toLowerCase());
        else
            return this.name == name.toLowerCase();
    }
}