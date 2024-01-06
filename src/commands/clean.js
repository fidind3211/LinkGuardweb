import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import getLeakers from '../utils/getLeakers.js';
import emojis from '../utils/emojis.js';

export default {
    deploy: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Clean the server of leakers.')
        .addSubcommand(s => s.setName('run').setDescription('Run the cleaning process.'))
        .addSubcommand(s => s.setName('view').setDescription('View the users removed when cleaning.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(interaction, client) {
        if (interaction.options.getSubcommand() === 'run') {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.load} **Fetching members...**`)
                ]
            });

            let leakers = await getLeakers();
            let dataString = ``;

            let promises = Object.entries(leakers).map(([id, data]) => new Promise(async (resolve, reject) => {
                let leaker = null;
                if (interaction.guild.members.cache.has(id)) leaker = interaction.guild.members.cache.get(id);
                else leaker = await interaction.guild.members.fetch(id).then((u) => serverLeakers.push(u)).catch(() => {});
                if (!leaker) {
                    dataString += `${emojis.check} **@${data.username} is not in the server.**\n`;
                    return resolve(true);
                };
                
                leaker.ban({
                    reason: `Banned during a leaker cleanup by @${interaction.user.username}.`
                }).then(() => {
                    dataString += `${emojis.check} ${emojis.warn} **Banned <@${id}>!**\n`;
                    resolve(true);
                }).catch(() => {
                    dataString += `${emojis.x} **Failed to ban <@${id}>. They may have a higher role than me.**\n`;
                    resolve(true);
                });
            }));
            await Promise.all(promises);

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Cleaned the server!`)
                        .setDescription(dataString)
                ]
            });
        } else if (interaction.options.getSubcommand() === 'view') {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.load} **Fetching members...**`)
                ]
            });

            let leakers = await getLeakers();
            let serverLeakers = [];

            let promises = Object.keys(leakers).map(id => new Promise(async (resolve, reject) => {
                if (interaction.guild.members.cache.has(id)) serverLeakers.push(interaction.guild.members.cache.get(id));
                else await interaction.guild.members.fetch(id)
                    .then((u) => serverLeakers.push(u))
                    .catch(() => {});
                resolve(true);
            }));
            await Promise.all(promises);

            if (!serverLeakers.length) interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.check} **No leakers are in this server!**`)
                ]
            });
        }
    }
}