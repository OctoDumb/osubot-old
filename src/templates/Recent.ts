import { APIRecentScore, APIBeatmap } from '../Types';
import Util from '../Util';
import { IPPCalculator as ICalc } from '../pp/Calculator';

export default function(score: APIRecentScore, beatmap: APIBeatmap, calc: ICalc, link: string) {
    let pp = calc.calculate(score);
    let hits = beatmap.objects.circles + beatmap.objects.sliders + beatmap.objects.spinners;
    if(score.mode == 1)
        hits -= beatmap.objects.sliders;
    if(score.mode == 1 || score.mode == 3)
        hits -= beatmap.objects.spinners;
    let progress = score.counts.totalHits() / hits;
    return ` <${beatmap.status}> ${beatmap.artist} - ${beatmap.title} [${beatmap.version}] by ${beatmap.creator.nickname}
${Util.formatBeatmapLength(beatmap.length / calc.speedMultiplier)} | ${beatmap.stats} ${Math.round(beatmap.bpm * calc.speedMultiplier)}BPM | ${Util.round(beatmap.diff.stars, 2)}✩ ${score.mods}

Score: ${score.score} | Combo: ${Util.formatCombo(score.combo, beatmap.combo)}
Accuracy: ${Util.round(score.accuracy() * 100, 2)}%
PP: ${pp.pp.toFixed(2)}${pp.ss == pp.pp ? '' : pp.fc == pp.pp ? ` ⯈ SS: ${pp.ss.toFixed(2)}` : ` ⯈ FC: ${pp.fc.toFixed(2)} ⯈ SS: ${pp.ss.toFixed(2)}`}
Hitcounts: ${score.counts.toString()}
Grade: ${score.rank} ${score.rank == "F" ? `(${Util.round(progress * 100, 2)}%)` : ''}

Карта: ${link}/b/${beatmap.id.map}`;
}