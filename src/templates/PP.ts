import { ICommandArgs, APIBeatmap } from "../Types";
import BanchoPP from "../pp/bancho";
import Mods from "../pp/Mods";
import Util from "../Util";

export default function(map: APIBeatmap, args: ICommandArgs): string {
    let calc = new BanchoPP(map, new Mods(args.mods));
    let hits = map.objects.circles + map.objects.sliders + map.objects.spinners;
    if(map.mode == 1)
        hits -= map.objects.sliders;
    if(map.mode == 1 || map.mode == 3)
        hits -= map.objects.spinners;
    switch(map.mode) {
        case 0:
        case 1:
        case 2: {
            let ppArgs = Util.createPPArgs({
                acc: args.acc / 100 || 1,
                combo: args.combo ? Math.min(map.combo, Math.max(1, args.combo)) : map.combo,
                hits,
                miss: args.miss ? Math.min(hits, Math.max(0, args.miss)) : 0,
                mods: new Mods(args.mods),
                counts: {
                    50: args.c50
                }
            }, map.mode);
            let pp = calc.calculate(ppArgs);
            return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length / calc.speedMultiplier)} | ${map.stats} ${Math.round(map.bpm * calc.speedMultiplier)}BPM | ${Util.round(map.diff.stars, 2)}✩ ${calc.mods.toString()}
Accuracy: ${Util.round(ppArgs.acc * 100, 2)}%
Combo: ${Util.formatCombo(ppArgs.combo, map.combo)} | ${ppArgs.counts.miss} misses
- PP: ${Util.round(pp.pp, 2)}
`;
        }

        case 3: {
            let score = parseInt(args.string[0]);
            let ppArgs = Util.createPPArgs({
                hits,
                score: isNaN(score) ? 1000000 : Math.min(1000000, Math.max(0, score)),
                mods: new Mods(args.mods)
            }, map.mode);
            let pp = calc.calculate(ppArgs);
            return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length / calc.speedMultiplier)} | ${map.stats} ${Math.round(map.bpm * calc.speedMultiplier)}BPM | ${Util.round(map.diff.stars, 2)}✩ ${calc.mods.toString()}
Score: ${ppArgs.score}
- PP: ${Util.round(pp.pp, 2)}`;
        }

        default: 
            return "Ошибка калькулятора";
    }
}