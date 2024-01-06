import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import getLeakers from '../utils/getLeakers.js';
import emojis from '../utils/emojis.js';

export default {
    deploy: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Check a user against the link leaker DB.')
        .addUserOption(option => option.setName('user').setDescription('The user!').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async run(interaction, client) {
        let leakers = await getLeakers();

        if (leakers[interaction.options.getUser('user').id]) {
            let info = leakers[interaction.options.getUser('user').id];
            let clientUser = await client.users.fetch(interaction.options.getUser('user').id);

            let guildUser;
            guildUser = await interaction.guild.members.fetch(interaction.options.getUser('user').id)
                .catch(() => { });

            let banButton = new ButtonBuilder()
                .setCustomId('checkban-' + interaction.options.getUser('user').id)
                .setLabel('Ban User')
                .setStyle(ButtonStyle.Danger);

            let embed = new EmbedBuilder()
                .setTitle(clientUser.globalName ? `${clientUser.globalName} (@${clientUser.username})` : '@' + clientUser.username)
                .setDescription(`> ${info.reason}`)
                .addFields([
                    {
                        name: 'Mention',
                        value: `${info.mention}`,
                        inline: true
                    },
                    {
                        name: 'In Server?',
                        value: `${guildUser ? emojis.check : emojis.x}`,
                        inline: true
                    }
                ]);
            
            if (info.proof.split(/,|\s/)[0].trim().startsWith('https://')) embed.setImage(info.proof.split(/,|\s/)[0].trim());
            else embed.addFields([
                {
                    name: 'Proof',
                    value: info.proof,
                    inline: true
                }
            ]);

            interaction.reply({
                embeds: [embed],
                components: guildUser ? [new ActionRowBuilder().addComponents(banButton)] : []
            })
        } else {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.check} **This user isn't a leaker. Good for them!**`)
                ]
            });
        }
    },
    interactions: {
        'checkban': async (client, interaction) => {
            let user = await interaction.guild.members.fetch(interaction.customId.split('-')[1]);
            user.ban({
                reason: 'Banned for leaking links by @' + interaction.user.username + '.'
            }).then(() => interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.check} **Banned <@${user.id}>!**`)
                ]
            })).catch(() => interaction.rpely({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.x} **FAILED to ban <@${user.id}>. They may have a role higher than mine.**`)
                ]
            }));
        }
    }
}