import config from './config.json';
import Bot from './src/Bot';

var bot: Bot = new Bot(config);

bot.start();