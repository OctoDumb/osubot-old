import Util from '../Util';
import { APIUser } from '../Types';
import { Module } from '../Module';

export default function(user: APIUser, module: Module, mode: number) {
    return `[Server: ${module.name}]
Player ${user.nickname} (${Util.profileModes[mode]})
Rank: #${user.rank.total} (${user.country} #${user.rank.country})
Playcount: ${user.playcount} (Lv${Math.floor(user.level)})
PP: ${Math.round(user.pp)}
Accuracy: ${Util.round(user.accuracy, 2)}%

https://osu.ppy.sh/u/${user.id}`;
}