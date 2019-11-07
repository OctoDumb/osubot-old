import { APIBeatmap } from "../Types";
// import { IPPCalculator as ICalc } from "../pp/Calculator";
import BanchoPP from "../pp/bancho";
import Util from "../Util";
import Mods from "../pp/Mods";

export default function(map: APIBeatmap): string {
    let calc = new BanchoPP(map, new Mods(0));
    switch(map.mode) {
        case 0: { // osu!
            let pp98 = calc.calculate(Util.createPPArgs({
                acc: 0.98,
                combo: map.combo,
                hits: map.objects.circles + map.objects.sliders + map.objects.spinners,
                miss: 0,
                mods: new Mods(0)
            }, map.mode));
            let pp99 = calc.calculate(Util.createPPArgs({
                acc: 0.99,
                combo: map.combo,
                hits: map.objects.circles + map.objects.sliders + map.objects.spinners,
                miss: 0,
                mods: new Mods(0)
            }, map.mode));
            return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname} (${map.status})
${Util.formatBeatmapLength(map.length)} | ${map.stats} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩
PP:
- 98% = ${Util.round(pp98.pp, 2)}
- 99% = ${Util.round(pp99.pp, 2)}
- 100% = ${Util.round(pp98.ss, 2)}`;
        }

        case 1: { // osu!taiko
            let pp98 = calc.calculate(Util.createPPArgs({
                acc: 0.98,
                combo: map.combo,
                hits: map.objects.circles + map.objects.sliders + map.objects.spinners,
                miss: 0,
                mods: new Mods(0)
            }, map.mode));
            let pp99 = calc.calculate(Util.createPPArgs({
                acc: 0.99,
                combo: map.combo,
                hits: map.objects.circles + map.objects.sliders + map.objects.spinners,
                miss: 0,
                mods: new Mods(0)
            }, map.mode));
            return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname} (${map.status})
${Util.formatBeatmapLength(map.length)} | ${map.stats} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩
PP:
- 98% = ${Util.round(pp98.pp, 2)}
- 99% = ${Util.round(pp99.pp, 2)}
- 100% = ${Util.round(pp98.ss, 2)}`;
        }

        case 2: { // osu!catch
            let pp98 = calc.calculate(Util.createPPArgs({
                acc: 0.98,
                combo: map.combo,
                hits: map.objects.circles + map.objects.sliders + map.objects.spinners,
                miss: 0,
                mods: new Mods(0)
            }, map.mode));
            let pp99 = calc.calculate(Util.createPPArgs({
                acc: 0.99,
                combo: map.combo,
                hits: map.objects.circles + map.objects.sliders + map.objects.spinners,
                miss: 0,
                mods: new Mods(0)
            }, map.mode));
            return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname} (${map.status})
${Util.formatBeatmapLength(map.length)} | ${map.stats} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩
PP:
- 98% = ${Util.round(pp98.pp, 2)}
- 99% = ${Util.round(pp99.pp, 2)}
- 100% = ${Util.round(pp98.ss, 2)}`;
        }

        case 3: { // osu!mania
            let pp = calc.calculate(Util.createPPArgs({
                score: 1000000,
                mods: new Mods(0)
            }, map.mode));
            return `${map.artist} - ${map.title} [${map.version}] by ${map.creator.nickname} (${map.status})
${Util.formatBeatmapLength(map.length)} | ${map.stats} ${Math.round(map.bpm)}BPM | ${Util.round(map.diff.stars, 2)}✩
PP (1kk score): ${Util.round(pp.pp, 2)}`;
        }

        default:
            return "Произошла очень плохая ошибка! Я не понимаю, что происходит!";
    }
}