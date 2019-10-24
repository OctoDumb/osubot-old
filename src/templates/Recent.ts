import { APIRecentScore, APIBeatmap } from '../Types';
import Util from '../Util';
import { IPP } from '../pp/Calculator';

export default function(score: APIRecentScore, beatmap: APIBeatmap, pp: IPP) {
    if(beatmap.mode != 0) return '';
    return `${beatmap.artist} - ${beatmap.title} [${beatmap.version}] by ${beatmap.creator.nickname}
${Util.formatBeatmapLength(beatmap.length)} | ${beatmap.stats} ${Math.round(beatmap.bpm)}BPM | ${Util.round(beatmap.diff.stars, 2)}✩ ${score.mods.toString().length ? '+'+score.mods.toString() : ''}

Очки: ${score.score} | Комбо: ${score.combo}x / ${beatmap.combo}x
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${pp.pp.toFixed(2)}${pp.ss == pp.pp ? '' : pp.fc == pp.pp ? ` ⯈ SS: ${pp.ss.toFixed(2)}` : ` ⯈ FC: ${pp.fc.toFixed(2)} ⯈ SS: ${pp.ss.toFixed(2)}`}
Хиткаунты: ${score.counts.toString()}
Ранк: ${score.rank}

Карта: https://osu.ppy.sh/b/${beatmap.id.map}`;
}