import { APITopScore, APIBeatmap } from "../Types";
import Util from "../Util";
import { IPPCalculator as ICalc } from '../pp/Calculator';

export default function(score: APITopScore, beatmap: APIBeatmap, place: Number, calc: ICalc, link: string) {
    return `#${place}
${beatmap.title} [${beatmap.version}] ${score.mods}
${beatmap.stats} ${Util.round(beatmap.diff.stars, 2)}✩
Ранк: ${score.rank} ⯈ ${Util.formatCombo(score.combo, beatmap.combo)} ⯈ Длина: ${Util.formatBeatmapLength(beatmap.length / calc.speedMultiplier)}
Точность: ${Util.round(score.accuracy() * 100, 2)}% ⯈ ${score.counts}
PP: ${Util.round(score.pp, 2)} ${score.date ? `\nДата: ${Util.formatDate(score.date)}`:''}
${link}/b/${beatmap.id.map}`;
}