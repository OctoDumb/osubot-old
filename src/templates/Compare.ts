import { APIScore, APIBeatmap } from '../Types';
import Util from '../Util';

export default function(score: APIScore, map: APIBeatmap) {
    if(map.mode != 0) return '';
    return `Лучший плей на ${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length)} | ${map.stats} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩

Очки: | Комбо: ${score.combo}x / ${map.combo}x
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ---
Хиткаунты: ${score.counts.toString()}
Ранк: -`;
}