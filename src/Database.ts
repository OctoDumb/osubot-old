import sqlite from 'sqlite3';
import { VK, MessageContext } from 'vk-io';
import axios from 'axios';
import util from './Util';
import { User } from './Types';

interface IDatabaseUser {
    id: Number,
    nickname: String,
    mode: number,
    pp: Number,
    rank: Number,
    acc: Number
}

class DatabaseServer {
    table: String;
    db: Database;
    constructor(table: String, db: Database) {
        this.table = table;
        this.db = db;
    }

    async getUser(id: Number): Promise<IDatabaseUser | null> {
        try {
            let user: IDatabaseUser = await this.db.get(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
            return user;
        } catch(err) {
            throw err;
        }
    }

    async findByNickname(nickname: String): Promise<IDatabaseUser[]> {
        try {
            let users: IDatabaseUser[] = await this.db.all(`SELECT * FROM ${this.table} WHERE nickname = ? COLLATE NOCASE`, [nickname]);
            return users;
        } catch(err) {
            throw err;
        }
    }

    async setNickname(id: number, uid: number, nickname: String): Promise<void> {
        try {
            let user: IDatabaseUser = await this.getUser(id);
            if(!user)
                await this.db.run(`INSERT INTO ${this.table} (id, uid, nickname, mode) VALUES (?, ?, ?, 0)`, [id, uid, nickname]);
            else
                await this.db.run(`UPDATE ${this.table} SET nickname = ?, uid = ? WHERE id = ?`, [nickname, uid, id]);
        } catch(err) {
            throw err;
        }
    }

    async setMode(id: Number, mode: Number): Promise<Boolean> {
        try {
            let user: IDatabaseUser = await this.getUser(id);
            if(!user)
                return false;
            await this.db.run(`UPDATE ${this.table} SET mode = ? WHERE id = ?`, [mode, id]);
        } catch(err) {
            throw err;
        }
    }

    async updateInfo(user: User): Promise<void> {
        let dbUser = await this.db.get(`SELECT * FROM ${this.table} WHERE uid = ? LIMIT 1`, [user.id]);
        if(dbUser)
            await this.db.run(`UPDATE ${this.table} SET pp = ?, rank = ?, acc = ? WHERE uid = ?`, [user.pp, user.rank.total, user.accuracy, user.id]);
    }
}

class DatabaseCovers {
    db: Database;
    constructor(db: Database) {
        this.db = db;
    }

    async addCover(id: Number): Promise<string> {
        let { data: cover } = await axios.get(`https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg?1`, {
            responseType: "arraybuffer"
        });

        let photo = await this.db.vk.upload.messagePhoto({
            source: Buffer.from(cover)
        });

        return photo.toString();
    }

    async getCover(id: Number): Promise<string> {
        let cover = await this.db.get(`SELECT * FROM covers WHERE id = ?`, [id]);
        if(!cover)
            cover = await this.addCover(id);
        else
            cover = cover.attachment;
        return cover;
    }
}

interface IDatabaseError {
    code: String,
    info: String,
    error: String
}

class DatabaseErrors {
    db: Database;
    constructor(db: Database) {
        this.db = db;
    }

    async addError(prefix: String, ctx: MessageContext, error: String): Promise<String> {
        let code = `${prefix}.${util.hash()}`;
        let check = this.getError(code);
        if(!check)
            return this.addError(prefix, ctx,error);
        let info = `Sender: @id${ctx.senderId}; Text: ${ctx.text}`;
        if(ctx.hasReplyMessage)
            info += `; Replied to: ${ctx.replyMessage.senderId}`;
        if(ctx.hasForwards)
            info += `; Forward: ${ctx.forwards[0].senderId}`;
        await this.db.run(`INSERT INTO errors (code, info, error) VALUES (?, ?, ?)`, [code, info, error]);
        return code;
    }

    async getError(code: String): Promise<IDatabaseError | null> {
        let error = this.db.get(`SELECT * FROM errors WHERE code = ?`, [code]);
        return error;
    }
}

interface IServersList {
    bancho: DatabaseServer,
    gatari: DatabaseServer,
    ripple: DatabaseServer,
    akatsuki: DatabaseServer
}

export default class Database {
    servers: IServersList;
    covers: DatabaseCovers;
    errors: DatabaseErrors;
    db: sqlite.Database;
    vk: VK;
    constructor(vk: VK) {
        this.servers = {
            bancho: new DatabaseServer("bancho", this),
            gatari: new DatabaseServer("gatari", this),
            ripple: new DatabaseServer("ripple", this),
            akatsuki: new DatabaseServer("akatsuki", this)
        }

        this.covers = new DatabaseCovers(this);
        
        this.errors = new DatabaseErrors(this);

        this.db = new sqlite.Database("osu.db");

        this.vk = vk;
    }

    async get(stmt: string, opts: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(stmt, opts, (err: Error, row: any) => {
                if(err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }

    async all(stmt: string, opts: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(stmt, opts, (err: Error, rows: any[]) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    async run(stmt: string, opts: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(stmt, opts, (_res: sqlite.RunResult, err: Error) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}