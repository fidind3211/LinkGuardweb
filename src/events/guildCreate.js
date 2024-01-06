import { AuditLogEvent, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import emojis from '../utils/emojis.js';
import config from '../../config.js';

export default async function (client, guild) {
    let supportButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Support Server')
        .setURL(`https://discord.gg/${config.supportGuild.invite}`);
        
    try {
        let addEvent = await guild.fetchAuditLogs({
            type: AuditLogEvent.BotAdd,
            limit: 1
        });
        let adder = addEvent.entries.first().executor;

        adder.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Thank you for choosing LinkGuard!')
                    .setDescription(`${emojis.check} \`LinkGuard\` has been added to \`${guild.name}\`!\n\nYou can set up the bot by running **/config**.\nFor more information, join our [Support Server](https://discord.gg/${config.supportGuild.invite})!`)
            ],
            components: [
                new ActionRowBuilder().addComponents(supportButton)
            ]
        });
    } catch {
        let owner = await guild.fetchOwner();
        await owner.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${emojis.warn} LinkGuard Join Error`)
                    .setDescription(`\`LinkGuard\` did not have needed permissions on join, so I've left your server.\nPlease re-add it with the recommended permissions.`)
            ],
            components: [
                new ActionRowBuilder().addComponents(supportButton)
            ]
        });
        await guild.leave();
    }
};