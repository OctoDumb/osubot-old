import { ICommandArgs, APIBeatmap } from "../Types";
import BanchoPP from "../pp/bancho";
import Mods from "../pp/Mods";
import Util from "../Util";

export default function(map: APIBeatmap, args: ICommandArgs): string {
    if(map.mode != 0) return '';
    let calc = new BanchoPP(map, new Mods(args.mods));
    let hits = map.objects.circles + map.objects.sliders + map.objects.spinners;
    let ppArgs = Util.createPPArgs({
        acc: args.acc / 100 || 1,
        combo: args.combo ? Math.min(map.combo, Math.max(1, args.combo)) : map.combo,
        hits,
        miss: args.miss ? Math.min(hits, Math.max(0, args.miss)) : 0,
        mods: new Mods(args.mods)
    }, map.mode)
    let pp = calc.calculate(ppArgs);
    return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname}
${Util.formatBeatmapLength(map.length / calc.speedMultiplier)} | ${map.stats} ${Math.round(map.bpm * calc.speedMultiplier)}BPM | ${Util.round(map.diff.stars, 2)}✩ ${calc.mods.toString()}
Точность: ${Util.round(ppArgs.acc * 100, 2)}%
Комбо: ${Util.formatCombo(ppArgs.combo, map.combo)} | ${ppArgs.counts.miss} промахов
- PP: ${Util.round(pp.pp, 2)}`;
}