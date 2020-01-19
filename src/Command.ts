import { MessageContext } from 'vk-io';
import { Module } from './Module';
import Util from './Util';
import { ICommandArgs } from './Types';

export class Command {
    readonly name: String | String[];
    module: Module;
    uses: number;
    function: (ctx: MessageContext, self: Command, args: ICommandArgs) => void;

    permission: (ctx: MessageContext) => boolean;
    constructor(name: String | String[], module: Module, func: (ctx: MessageContext, self: Command, args: ICommandArgs) => void) {
        this.name = name;
        this.module = module;
        this.function = func;

        this.uses = 0;
        this.permission = () => true;
    }

    public process(ctx: MessageContext) {
        if(!this.permission(ctx)) return;
        this.uses++;
        this.function(ctx, this, Util.parseArgs(ctx.text.split(" ").slice(2)));
    }

    public check(name: String) {
        if(Array.isArray(this.name))
            return this.name.includes(name.toLowerCase());
        else
            return this.name == name.toLowerCase();
    }
}