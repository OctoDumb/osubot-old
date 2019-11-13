import { LeaderboardResponse } from "../Types";
import Util from "../Util";
// import { IPPCalculator as ICalc } from "../pp/Calculator";
import BanchoPP from "../pp/bancho";

export default function(leaderboard: LeaderboardResponse): string {
    let map = leaderboard.maps.find(m => m.mods == 0).map;
    return `Топ беседы на карте:
${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}\n` + leaderboard.scores/* .slice(0, 10) */.map((lbscore, i) => {
        let smap = leaderboard.maps.find(m => m.mods == lbscore.score.mods.diff()).map;
        console.log(smap.diff, lbscore.user.nickname);
        let calc = new BanchoPP(smap, lbscore.score.mods);
        let pp = calc.calculate(lbscore.score);
        return `#${i+1} ${lbscore.user.nickname} | ${lbscore.score.score} | ${Util.formatCombo(lbscore.score.combo, smap.combo)} | ${Util.round(lbscore.score.accuracy() * 100, 2)}% | ${Util.round(pp.pp, 2)}pp ${lbscore.score.mods}`;
    }).join("\n");
}