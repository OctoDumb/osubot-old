import { APIScore, APIBeatmap } from '../Types';
import Util from '../Util';
import { IPPCalculator as ICalc } from '../pp/Calculator';

export default function(score: APIScore, map: APIBeatmap, calc: ICalc) {
    let pp = calc.calculate(score);
    return `Лучший плей на ${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length / calc.speedMultiplier)} | ${map.stats} ${Math.round(map.bpm * calc.speedMultiplier)}BPM | ${Util.round(map.diff.stars, 2)}✩ ${score.mods}

${Util.formatDate(score.date)}
Очки: ${score.score} | Комбо: ${Util.formatCombo(score.combo, map.combo)}
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${Util.round(pp.pp, 2)}${pp.ss == pp.pp ? '' : pp.fc == pp.pp ? ` ⯈ SS: ${Util.round(pp.ss, 2)}` : ` ⯈ FC: ${Util.round(pp.fc, 2)} ⯈ SS: ${Util.round(pp.ss, 2)}`}
Хиткаунты: ${score.counts}
Ранк: ${score.rank}`;
}