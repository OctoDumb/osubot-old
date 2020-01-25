import Bot from './src/Bot';
import fs from "fs";

var config = fs.existsSync("./config.json") 
    ? JSON.parse(fs.readFileSync("./config.json").toString())
    : {};

var bot: Bot = new Bot(config);

bot.start();