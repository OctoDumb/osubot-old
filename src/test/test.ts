import config from '../../config.json';
import Bot from '../Bot';
import Calculator from '../pp/bancho/Calculator';
import Mods from '../pp/Mods.js';

var bot: Bot = new Bot(config);

(async function() {
    let top = await bot.api.bancho.getUserTop("OctopuSSX", 0, 100);
    for(let i = 0; i < top.length; i++) {
        let score = top[i];
        let map = await bot.api.bancho.getBeatmap(score.beatmapId, 0, score.mods.diff());
        let calc = new Calculator(map, score.mods);
        let pp = calc.calculate(score);
        console.log(`Top ${i+1}:`);
        console.log(`${map.artist} - ${map.title} [${map.version}] +${calc.mods.toString()} (${new Mods(calc.mods.diff()).toString()})`);
        console.log(calc.stats.ar, calc.stats.od);
        console.log(`Real: ${score.pp.toFixed(2)}`);
        console.log(`Calc: ${pp.pp.toFixed(2)}`);
        console.log('-'.repeat(20));
    }
})();