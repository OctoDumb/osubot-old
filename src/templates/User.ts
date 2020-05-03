import Util from '../Util';
import { APIUser } from '../Types';

export default function(user: APIUser, mode: number, status: string, link: string) {
    return `Player: ${user.nickname} ${status} (${Util.profileModes[mode]})
Rank: #${user.rank.total} (${user.country} #${user.rank.country})
Playcount: ${user.playcount} (Lv${Math.floor(user.level)})
PP: ${Math.round(user.pp)}
Accuracy: ${Util.round(user.accuracy, 2)}%

${link}/u/${user.id}`;
}