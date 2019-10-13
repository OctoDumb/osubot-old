import { APIScore, APIBeatmap } from '../Types';
import Util from '../Util';

export default class CompareTemplate {
    score: APIScore;
    map: APIBeatmap;
    constructor(score: APIScore, map: APIBeatmap) {
        this.score = score;
        this.map = map;
    }

    use(): string {
        if(this.map.mode != 0) return '';
        return `Лучший плей на ${this.map.artist} - ${this.map.title} [${this.map.version}] by ${this.map.creator.nickname}
${Util.formatBeatmapLength(this.map.length)} | AR:${Util.round(this.map.stats.ar, 2)} CS:${Util.round(this.map.stats.cs, 2)} OD:${Util.round(this.map.stats.od, 2)} HP:${Util.round(this.map.stats.hp, 2)} ${Math.round(this.map.bpm)}BPM | ${Util.round(this.map.diff.stars, 2)}

Очки: | Комбо: ${this.score.combo}x / ${this.map.combo}x
Точность: ${Util.round(this.score.accuracy() * 100, 2)}%
PP: ---
Хиткаунты: ${this.score.counts.toString()}
Ранк: -`;
    }
}