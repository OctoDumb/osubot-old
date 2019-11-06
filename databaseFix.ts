import config from "./config.json";
import Bot from "./src/Bot";
import Util from "./src/Util.js";

var args = process.argv.slice(2);

var bot = new Bot(config);

let query = {
    get: (t) => `SELECT * FROM ${t}`,
    create: (t) => `CREATE TABLE ${t} (id INTEGER, uid INTEGER, nickname TEXT, mode INTEGER, pp REAL DEFAULT 0, rank INTEGER DEFAULT 9999999, acc REAL DEFAULT 100)`,
    rename: (t1, t2) => `ALTER TABLE ${t1} RENAME TO ${t2}`,
    insert: (t) => `INSERT INTO ${t} (id, uid, nickname, mode) VALUES (?, ?, ?, ?)`,
    info: (t) => `UPDATE ${t} SET pp = ?, rank = ?, acc = ? WHERE uid = ?`,
    drop: (t) => `DROP TABLE ${t}`
};

(async function() {
    if(args.includes("-b")) {
        console.log("Bancho");
        await bot.database.run(query.rename("bancho", "old_bancho"));
        await bot.database.run(query.create("bancho"));
        let users = await bot.database.all(query.get("old_bancho"));
        for(let i = 0; i < users.length; i++) {
            console.log(i+1, users.length);
            try {
                let u = await bot.api.bancho.getUser(users[i].nickname);
                await bot.database.run(query.insert("bancho"), [users[i].id, u.id, u.nickname, users[i].mode]);
                await bot.database.run(query.info("bancho"), [u.pp, u.rank.total, u.accuracy, u.id]);
                await Util.sleep(1000);
            } catch(e) {
                //
            }
        }
        await bot.database.run(query.drop("old_bancho"));
    }

    if(args.includes("-g")) {
        console.log("Gatari");
        await bot.database.run(query.rename("gatari", "old_gatari"));
        await bot.database.run(query.create("gatari"));
        let users = await bot.database.all(query.get("old_gatari"));
        for(let i = 0; i < users.length; i++) {
            console.log(i+1, users.length);
            try {
                let u = await bot.api.gatari.getUser(users[i].nickname);
                await bot.database.run(query.insert("gatari"), [users[i].id, u.id, u.nickname, users[i].mode]);
                await bot.database.run(query.info("gatari"), [u.pp, u.rank.total, u.accuracy, u.id]);
                await Util.sleep(1000);
            } catch(e) {
                //
            }
        }
        await bot.database.run(query.drop("old_gatari"));
    }

    if(args.includes("-r")) {
        console.log("Ripple");
        await bot.database.run(query.rename("ripple", "old_ripple"));
        await bot.database.run(query.create("ripple"));
        let users = await bot.database.all(query.get("old_ripple"));
        for(let i = 0; i < users.length; i++) {
            console.log(i+1, users.length);
            try {
                let u = await bot.api.ripple.getUser(users[i].nickname);
                await bot.database.run(query.insert("ripple"), [users[i].id, u.id, u.nickname, users[i].mode]);
                await bot.database.run(query.info("ripple"), [u.pp, u.rank.total, u.accuracy, u.id]);
                await Util.sleep(1000);
            } catch(e) {
                //
            }
        }
        await bot.database.run(query.drop("old_ripple"));
    }
})();