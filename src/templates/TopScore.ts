import { APITopScore, APIBeatmap } from "../Types";
import Util from "../Util";

export default function(score: APITopScore, beatmap: APIBeatmap, place: Number) {
    if(beatmap.mode != 0) return '';
    return `#${place}
${beatmap.title} [${beatmap.version}] ${score.mods.toString().length == 0 ? '' : '+' + score.mods}
${beatmap.stats} ${Util.round(beatmap.diff.stars, 2)}✩
Ранк: ${score.rank} ⯈ x${score.combo}/${beatmap.combo} ⯈ Длина: ${Util.formatBeatmapLength(beatmap.length)}
Точность: ${Util.round(score.accuracy() * 100, 2)}% ⯈ ${score.counts[300]}/${score.counts[100]}/${score.counts[50]}/${score.counts.miss}
PP: ${Util.round(score.pp, 2)}
https://osu.ppy.sh/b/${beatmap.id.map}`;
}