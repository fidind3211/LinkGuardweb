import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import emojis from '../utils/emojis.js';
import config from '../../config.js';
import getLeakers from '../utils/getLeakers.js';

export default async function (client, member) {
    let leakers = await getLeakers();

    if (leakers[member.id]) {
        if (member.bannable) member.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Banned by LinkGuard :D`)
                    .setDescription(`${emojis.x} You have been banned by **LinkGuard**, as you are on the leaker list.\nTo appeal this, run \`/list appeal\``)
            ]
        }).catch((err) => { });

        member.ban({
            reason: `Banned by LinkGuard for leaking.`
        }).catch(async (e) => {            
            let supportButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Support Server')
                .setURL(`https://discord.gg/${config.supportGuild.invite}`);

            let owner = await member.guild.fetchOwner();
            await owner.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${emojis.x} Insufficient Permissions`)
                        .setDescription(`I failed to ban <@${member.id}> due to insufficient permissions.\nPlease give me ban permissions.`)
                ],
                components: [
                    new ActionRowBuilder().addComponents(supportButton)
                ]
            }).catch(() => { });
        });
    }
};