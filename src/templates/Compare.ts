import { APIScore, APIBeatmap } from '../Types';
import Util from '../Util';
import { IPP } from '../pp/Calculator';

export default function(score: APIScore, map: APIBeatmap, pp: IPP) {
    if(map.mode != 0) return '';
    return `Лучший плей на ${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length)} | ${map.stats} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩

Очки: ${score.score} | Комбо: ${score.combo}x / ${map.combo}x
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${pp.pp.toFixed(2)}${pp.ss == pp.pp ? '' : pp.fc == pp.pp ? ` ⯈ SS: ${pp.ss.toFixed(2)}` : ` ⯈ FC: ${pp.fc.toFixed(2)} ⯈ SS: ${pp.ss.toFixed(2)}`}
Хиткаунты: ${score.counts.toString()}
Ранк: ${score.rank}`;
}