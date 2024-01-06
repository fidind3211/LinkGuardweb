import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';

import config from '../config.js';

const client = new Client({
    intents: Object.values(GatewayIntentBits).filter(a => isNaN(a)).map(a => GatewayIntentBits[a])
});

client.commands = new Collection();

for (const file of fs.readdirSync('./src/commands')) {
    const command = (await import(`./commands/${file}`)).default;
    client.commands.set(command.deploy.name, command);
}

for (const file of fs.readdirSync('./src/events').filter(file => file.endsWith('.js'))) {
    const event = (await import(`./events/${file}`)).default;
    client.on(file.split('.')[0], (...args) => event(client, ...args));
}

client.login(config.token);