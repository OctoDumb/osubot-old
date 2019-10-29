import { APIRecentScore, APIBeatmap } from '../Types';
import Util from '../Util';
import { IPPCalculator as ICalc } from '../pp/Calculator';

export default function(score: APIRecentScore, beatmap: APIBeatmap, calc: ICalc) {
    let pp = calc.calculate(score);
    return `${beatmap.artist} - ${beatmap.title} [${beatmap.version}] by ${beatmap.creator.nickname}
${Util.formatBeatmapLength(beatmap.length / calc.speedMultiplier)} | ${beatmap.stats} ${Math.round(beatmap.bpm * calc.speedMultiplier)}BPM | ${Util.round(beatmap.diff.stars, 2)}✩ ${score.mods}

Очки: ${score.score} | Комбо: ${Util.formatCombo(score.combo, beatmap.combo)}
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${pp.pp.toFixed(2)}${pp.ss == pp.pp ? '' : pp.fc == pp.pp ? ` ⯈ SS: ${pp.ss.toFixed(2)}` : ` ⯈ FC: ${pp.fc.toFixed(2)} ⯈ SS: ${pp.ss.toFixed(2)}`}
Хиткаунты: ${score.counts.toString()}
Ранк: ${score.rank}

Карта: https://osu.ppy.sh/b/${beatmap.id.map}`;
}