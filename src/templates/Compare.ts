import { APIScore, APIBeatmap } from '../Types';
import Util from '../Util';
import { IPPCalculator as ICalc } from '../pp/Calculator';

export default function(score: APIScore, map: APIBeatmap, calc: ICalc) {
    let pp = calc.calculate(score);
    return `Лучший плей на ${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length / calc.speedMultiplier)} | ${map.stats} ${Math.round(map.bpm * calc.speedMultiplier)}BPM | ${Util.round(map.diff.stars, 2)}✩ ${score.mods}

Очки: ${score.score} | Комбо: ${Util.formatCombo(score.combo, map.combo)}
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${pp.pp.toFixed(2)}${pp.ss == pp.pp ? '' : pp.fc == pp.pp ? ` ⯈ SS: ${pp.ss.toFixed(2)}` : ` ⯈ FC: ${pp.fc.toFixed(2)} ⯈ SS: ${pp.ss.toFixed(2)}`}
Хиткаунты: ${score.counts.toString()}
Ранк: ${score.rank}`;
}