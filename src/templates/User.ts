import Util from '../Util';
import { APIUser } from '../Types';
import { Module } from '../Module';

export default class UserTemplate {
    user: APIUser;
    module: Module;
    mode: number;
    constructor(user: APIUser, module: Module, mode: number) {
        this.user = user;
        this.module = module;
        this.mode = mode;
    }

    use(): string {
        return `[Server: ${this.module.name}]
Player ${this.user.nickname} (${Util.profileModes[this.mode]})
Rank: #${this.user.rank.total} (${this.user.country} #${this.user.rank.country})
Playcount: ${this.user.playcount} (Lv${Math.floor(this.user.level)})
PP: ${Math.round(this.user.pp)}
Accuracy: ${Util.round(this.user.accuracy, 2)}%

https://osu.ppy.sh/u/${this.user.id}`;
    }
}