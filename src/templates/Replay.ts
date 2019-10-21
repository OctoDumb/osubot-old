import { Replay } from '../Replay';
import { APIBeatmap } from '../Types';
import Util from '../Util';

export default function(replay: Replay, map: APIBeatmap) {
    if(map.mode != 0) return '';
    return `Реплей игрока ${replay.player}:

${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length)} | AR:${Util.round(map.stats.ar, 2)} CS:${Util.round(map.stats.cs, 2)} OD:${Util.round(map.stats.od, 2)} HP:${Util.round(map.stats.hp, 2)} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩

Очки: ${replay.score} | Комбо: ${replay.combo}x / ${map.combo}x
Точность: ${Util.round(Util.accuracy(replay.counts) * 100, 2)}%
PP: ---
Хиткаунты: ${replay.counts.toString()}
Моды: ${replay.mods.toString()}`;
}