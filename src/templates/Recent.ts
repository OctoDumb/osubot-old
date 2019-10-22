import { APIRecentScore, APIBeatmap } from '../Types';
import Util from '../Util';
import BanchoPP from '../pp/bancho/Calculator';

export default function(score: APIRecentScore, beatmap: APIBeatmap) {
    if(beatmap.mode != 0) return '';
    let calc = new BanchoPP(beatmap, score.mods);
    let pp = calc.calculate(score);
    return `${beatmap.artist} - ${beatmap.title} [${beatmap.version}] by ${beatmap.creator.nickname}
${Util.formatBeatmapLength(beatmap.length)} | ${beatmap.stats} ${Math.round(beatmap.bpm)}BPM | ${Util.round(beatmap.diff.stars, 2)}✩ ${score.mods.toString().length ? '+'+score.mods.toString() : ''}

Очки: ${score.score} | Комбо: ${score.combo}x / ${beatmap.combo}x
Точность: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${pp.pp} ${score.accuracy() == 1 ? '' : score.combo == beatmap.combo ? ` ⯈ FC: ${pp.fc} ⯈ SS: ${pp.ss}` : ` ⯈ SS: ${pp.ss}`}
Хиткаунты: ${score.counts.toString()}
Ранк: ${score.rank}

Карта: https://osu.ppy.sh/b/${beatmap.id.map}`;
}