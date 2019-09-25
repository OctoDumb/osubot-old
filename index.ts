import config from './config.json';
import { VK } from 'vk-io';
import Bot from './src/Bot';

var vk: VK = new VK({
    token: config.vk.token,
    pollingGroupId: config.vk.id
});

var bot: Bot = new Bot(config);

bot.start();