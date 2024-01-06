import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import getLeakers from '../utils/getLeakers.js';
import emojis from '../utils/emojis.js';
import config from '../../config.js';

export default {
    deploy: new SlashCommandBuilder()
        .setName('list')
        .setDescription('View & request changes to our leaker list.')
        .addSubcommand(s => s.setName('view').setDescription('View all leakers.'))
        .addSubcommand(s => s.setName('request').setDescription('Request to add a leaker.'))
        .addSubcommand(s => s.setName('appeal').setDescription('Appeal an addition to the list.')),

    async run(interaction, client) {
        if (interaction.options.getSubcommand() === 'view') {
            let leakers = await getLeakers();

            let tips = [
                'Run /clean run to remove any leakers here!',
                'Run /clean view to see who here is lurking in your server.',
                'You can /check someone who you want to know more about!',
                'Run /list request to request an addition to this very list!'
            ];

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Leaker List: ${Object.keys(leakers).length}`)
                        .setDescription(`${Object.values(leakers).map(l => `${l.mention} **@${l.username}**`).join('\n')}`)
                        .setFooter({
                            text: `Tip: ${tips[Math.random() * tips.length | 0]}`
                        })
                ]
            });
        } else if (interaction.options.getSubcommand() === 'request') {
            let modal = new ModalBuilder()
                .setTitle('Request Leaker Addition')
                .setCustomId('requestadd')
                .addComponents([
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('userid')
                                .setLabel('User ID')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('reason')
                                .setLabel('Reason')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('proof')
                                .setLabel('Proof: image link(s), imgur please')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                        )
                ]);

            interaction.showModal(modal);
        } else if (interaction.options.getSubcommand() === 'appeal') {
            let leakers = await getLeakers();

            if (!leakers[interaction.user.id]) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.warn} You are not on the list!`)
                ],
                ephemeral: true
            });

            let modal = new ModalBuilder()
                .setTitle('Appeal your Ban')
                .setCustomId('appealban')
                .addComponents([
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('reason')
                                .setLabel('Reason')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                        )
                ]);

            interaction.showModal(modal);
        }
    },

    interactions: {
        'requestadd': async (client, interaction) => {
            let userid = interaction.fields.getTextInputValue('userid');
            let reason = interaction.fields.getTextInputValue('reason');
            let proof = interaction.fields.getTextInputValue('proof');

            try {
                let user = await client.users.fetch(userid);

                let channel = await client.channels.fetch(config.channels.banRequests);

                await channel.send({
                    content: `${config.admins.map(a => `<@${a}>`).join(' ')}`,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Ban Request')
                            .setDescription(`**User:** <@${user.id}>\n**Requester**: <@${interaction.user.id}>\n**Reason:**\n\`\`\`\n${reason}\n\`\`\`\n**Proof:**\n\`\`\`\n${proof}\n\`\`\``)
                    ]
                });

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${emojis.check} **Request sent! One of our owners will review it shortly.**`)
                    ],
                    ephemeral: true
                })
            } catch {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${emojis.x} **Failed to find a user with that ID.**`)
                    ]
                });
            }
        },
        'appealban': async (client, interaction) => {
            console.log('appealing')
            let reason = interaction.fields.getTextInputValue('reason');

            let channel = await client.channels.fetch(config.channels.banAppeals);

            await channel.send({
                content: `${config.admins.map(a => `<@${a}>`).join(' ')}`,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('New Appeal')
                        .setDescription(`**Requester**: <@${interaction.user.id}>\n**Reason:**\n\`\`\`\n${reason}\n\`\`\``)
                ],
                ephemeral: true
            });

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${emojis.check} **Request sent. One of our owners will review it shortly.**`)
                ]
            })
        }
    }
}