import { LeaderboardResponse } from "../Types";
import Util from "../Util";
// import { IPPCalculator as ICalc } from "../pp/Calculator";
import BanchoPP from "../pp/bancho";

export default function(leaderboard: LeaderboardResponse, server: string, getStatus: (server: string, id: number) => string): string {
    if(!leaderboard.scores[0])
        return `[Server: ${server}]\nНи у кого нет скоров на этой карте!`;
    let map = leaderboard.maps.find(m => m.mods == 0).map;
    return `[Server: ${server}]
Топ беседы на карте:
${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}\n` + leaderboard.scores/* .slice(0, 10) */.map((lbscore, i) => {
        let smap = leaderboard.maps.find(m => m.mods == lbscore.score.mods.diff()).map;
        let calc = new BanchoPP(smap, lbscore.score.mods);
        let pp = calc.calculate(lbscore.score);
        return `#${i+1} ${lbscore.user.nickname} ${getStatus(server.toLowerCase(), lbscore.user.uid)} | ${lbscore.score.score} | ${Util.formatCombo(lbscore.score.combo, smap.combo)} | ${Util.round(lbscore.score.accuracy() * 100, 2)}% | ${lbscore.score.counts.miss} misses | ${Util.round(pp.pp, 2)}pp ${lbscore.score.mods} | ${Util.formatDate(lbscore.score.date, true)}`;
    }).join("\n");
}