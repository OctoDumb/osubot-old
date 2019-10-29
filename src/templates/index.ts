import User from './User';
import TopScore from './TopScore';
import RecentScore from './Recent';
import Compare from './Compare';
import ReplayT from './Replay';
import { Replay } from '../Replay';
import { APIUser, APITopScore, APIBeatmap, APIRecentScore, APIScore } from '../Types';
import { IPPCalculator as ICalc } from '../pp/Calculator';

interface ITemplates {
    User: (user: APIUser, mode: number) => string;
    TopScore: (score: APITopScore, beatmap: APIBeatmap, place: number, calc: ICalc) => string;
    RecentScore: (score: APIRecentScore, beatmap: APIBeatmap, calc: ICalc) => string;
    Compare: (score: APIScore, beatmap: APIBeatmap, calc: ICalc) => string;
    Replay: (replay: Replay, map: APIBeatmap, calc: ICalc) => string;
}

var Templates: ITemplates = {
    User,
    TopScore,
    RecentScore,
    Compare,
    Replay: ReplayT
}

export {
    ITemplates,
    Templates
}