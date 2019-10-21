import { APIRecentScore, APIBeatmap } from '../Types';
import Util from '../Util';

export default function(score: APIRecentScore, beatmap: APIBeatmap) {
    if(beatmap.mode != 0) return '';
    return `${beatmap.artist} - ${beatmap.title} [${beatmap.version}] by ${beatmap.creator.nickname}
${Util.formatBeatmapLength(beatmap.length)} | AR:${Util.round(beatmap.stats.ar, 2)} CS:${Util.round(beatmap.stats.cs, 2)} OD:${Util.round(beatmap.stats.od, 2)} HP:${Util.round(beatmap.stats.hp, 2)} ${Math.round(beatmap.bpm)}BPM | ${Util.round(beatmap.diff.stars, 2)}✩ ${score.mods.toString().length ? '+'+score.mods.toString() : ''}

Очки: ${score.score} | Комбо: ${score.combo}x / ${beatmap.combo}x
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ---
Хиткаунты: ${score.counts.toString()}
Ранк: ${score.rank}

Карта: https://osu.ppy.sh/b/${beatmap.id.map}`;
}