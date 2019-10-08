import * as axios from 'axios';
import { APIUser, APITopScore, APIBeatmap, APIRecentScore } from '../Types';

export default interface IAPI {
    token?: String,
    api: axios.AxiosInstance,
    getUser(nickname: string, mode?: number): Promise<APIUser>,
    getUserTop(nickname: string, mode?: number, limit?: number): Promise<APITopScore[]>,
    getUserRecent(nickname: string, mode?: number): Promise<APIRecentScore>,
    getBeatmap?(id: number | string, mode?: number, mods?: number): Promise<APIBeatmap>
}