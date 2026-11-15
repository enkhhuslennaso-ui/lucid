require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder, 
    AttachmentBuilder,
    PermissionsBitField 
} = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LUCID THEORY ULTIMATE CLAN BOT IS ONLINE & RUNNING!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const CONFIG = {
    TEXT_LOG_ID: process.env.TEXT_LOG_ID || 'TEXT_LOG_CHANNEL_ID',
    VOICE_LOG_ID: process.env.VOICE_LOG_ID || 'VOICE_LOG_CHANNEL_ID',
    WELCOME_CHANNEL_ID: process.env.WELCOME_CHANNEL_ID || 'WELCOME_CHANNEL_ID',
    ROLE_CS: process.env.ROLE_CS || 'ROLE_CS_ID',
    ROLE_VAL: process.env.ROLE_VAL || 'ROLE_VAL_ID',
    ROLE_MC: process.env.ROLE_MC || 'ROLE_MC_ID',
    ROLE_RBX: process.env.ROLE_RBX || 'ROLE_RBX_ID',
    MEMBER_ROLE_ID: process.env.MEMBER_ROLE_ID || 'CLAN_MEMBER_ROLE_ID'
};

client.once('ready', () => {
    console.log(`=========================================`);
    console.log(`🚀 LUCID THEORY BOT #${client.user.tag} АМЖИЛТТАЙ АСЛАА!`);
    console.log(`🌐 Серверийн тоо: ${client.guilds.cache.size}`);
    console.log(`=========================================`);
    
    client.user.setPresence({
        activities: [{ name: 'Lucid Theory Clan | !help-clan', type: 3 }],
        status: 'online',
    });
});

// --- 1. WELCOME SYSTEM ---
client.on('guildMemberAdd', async (member) => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
        if (!welcomeChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('✨ ШИНЭ ГИШҮҮН НЭГДЛЭЭ!')
            .setDescription(`Мэнд хүргэе, ${member}!\n\nLucid Theory кланы албан ёсны Discord серверт тавтай морил.\n\n• Дүрмээ уншиж танилцах: #rules\n• Тоглоомын цолоо авах: #self-roles\n• Кланд элсэх хүсэлт гаргах: #apply-here`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `Нийт гишүүн: ${member.guild.memberCount}`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        await welcomeChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Welcome message error:', err);
    }
});

// --- 2. AUTO-MODERATION ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content.includes('discord.gg/') || message.content.includes('discord.com/invite/')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await message.delete().catch(() => {});
            const warnMsg = await message.channel.send(`⚠️ ${message.author}, энэ серверт урилгын линк явуулахыг хориглоно!`);
            setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
            return;
        }
    }
});

// --- 3. COMMANDS CENTER ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === '!help-clan') {
        const embed = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('📜 LUCID THEORY BOT — КОМАНДУУД')
            .addFields(
                { name: '🎯 `!ticket-panel`', value: 'Билет нээх панель гаргана (Админ).' },
                { name: '🎮 `!game-panel`', value: 'Тоглоомын цол сонгох панель гаргана (Админ).' },
                { name: '🧹 `!clear [тоо]`', value: 'Мессеж бөөнөөр нь устгана (Админ).' },
                { name: '🤖 `!bot-info`', value: 'Ботын статус шалгана.' }
            );
        return message.reply({ embeds: [embed] });
    }

    if (command === '!bot-info') {
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🤖 BOT SYSTEM STATUS')
            .addFields(
                { name: '🌐 Server', value: 'Render Cloud (Free Tier)', inline: true },
                { name: '⚡ Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '🛡️ Status', value: 'Operational', inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    if (command === '!clear') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Танд энэ командыг ашиглах эрх байхгүй байна.');
        }

        const count = parseInt(args[0]);
        if (isNaN(count) || count < 1 || count > 100) {
            return message.reply('⚠️ 1-ээс 100 хооронд тоо оруулна уу!');
        }

        try {
            await message.channel.bulkDelete(count + 1, true);
            const confirmation = await message.channel.send(`✅ Амжилттай **${count}** мессеж устгалаа.`);
            setTimeout(() => confirmation.delete().catch(() => {}), 4000);
        } catch (err) {
            return message.reply('❌ Алдаа гарлаа.');
        }
    }

    if (command === '!ticket-panel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Администратор эрх хэрэгтэй!');
        }

        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('🎫 LUCID THEORY — ДЭМЖЛЭГ & ЭЛСЭЛТ')
            .setDescription('Доорх цэснээс сонгож Ticket нээнэ үү:\n\n• 🎯 Кланд элсэх\n• 🤝 Хамтран ажиллах / Scrim\n• ⚠️ Гомдол & Тусламж');

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select_menu')
                .setPlaceholder('Сонгох хэсэг...')
                .addOptions([
                    { label: 'Кланд элсэх хүсэлт', description: 'Tryout болон бүртгэл', value: 'ticket_apply', emoji: '🎯' },
                    { label: 'Хамтран ажиллах / Scrim', description: 'Клан хоорондын тоглолт', value: 'ticket_scrim', emoji: '🤝' },
                    { label: 'Гомдол болон бусад', description: 'Админуудтай холбогдох', value: 'ticket_other', emoji: '⚠️' }
                ])
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }

    if (command === '!game-panel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Администратор эрх хэрэгтэй!');
        }

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎮 ТОГЛООМЫН ЦОЛ СОНГОХ (SELF-ROLES)')
            .setDescription('Доорх товчлууруудаас өөрийн тоглодог тоглоомоо сонгож цолоо аваарай!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_cs').setLabel('Counter-Strike').setStyle(ButtonStyle.Primary).setEmoji('⚡'),
            new ButtonBuilder().setCustomId('role_val').setLabel('Valorant').setStyle(ButtonStyle.Danger).setEmoji('🎯'),
            new ButtonBuilder().setCustomId('role_mc').setLabel('Minecraft').setStyle(ButtonStyle.Success).setEmoji('🟩'),
            new ButtonBuilder().setCustomId('role_rbx').setLabel('Roblox').setStyle(ButtonStyle.Secondary).setEmoji('🟥')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }
});

// --- 4. INTERACTIONS ---
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith('role_')) {
        const roleMap = {
            'role_cs': CONFIG.ROLE_CS,
            'role_val': CONFIG.ROLE_VAL,
            'role_mc': CONFIG.ROLE_MC,
            'role_rbx': CONFIG.ROLE_RBX
        };

        const roleId = roleMap[interaction.customId];
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.reply({ content: '❌ Role ID олдсонгүй!', ephemeral: true });
        }

        if (interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(roleId);
            return interaction.reply({ content: `✅ Та **${role.name}** цолыг хаслаа.`, ephemeral: true });
        } else {
            await interaction.member.roles.add(roleId);
            return interaction.reply({ content: `🎉 Та **${role.name}** цолыг авлаа!`, ephemeral: true });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_menu') {
        const selectedValue = interaction.values[0];
        let categoryName = 'SUPPORT';
        if (selectedValue === 'ticket_apply') categoryName = 'APPLY';
        if (selectedValue === 'ticket_scrim') categoryName = 'SCRIM';

        const guild = interaction.guild;
        const channelName = `ticket-${categoryName.toLowerCase()}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '');

        try {
            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: 0,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
                ]
            });

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Билет хаах').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle(`🎫 Төрөл: ${categoryName}`)
                .setDescription(`Сайн байна уу, ${interaction.user}?\nАдминууд удахгүй холбогдох болно.`);

            await ticketChannel.send({ embeds: [welcomeEmbed], components: [closeRow] });
            return interaction.reply({ content: `✅ Билет үүслээ: ${ticketChannel}`, ephemeral: true });
        } catch (err) {
            return interaction.reply({ content: '❌ Билет үүсгэхэд алдаа гарлаа.', ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 Энэ билет 5 секундын дараа хаагдана...' });
        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});

// --- 5. MESSAGE DELETE LOGS ---
client.on('messageDelete', async (message) => {
    if (!message.guild || !message.author || message.author.bot) return;
    const textLog = message.guild.channels.cache.get(CONFIG.TEXT_LOG_ID);
    if (!textLog) return;

    const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setAuthor({ name: `${message.author.tag} мессеж устгалаа`, iconURL: message.author.displayAvatarURL() })
        .addFields(
            { name: '📍 Суваг', value: `${message.channel}`, inline: true },
            { name: '💬 Текст', value: message.content ? message.content.slice(0, 1024) : '*Зураг/Файл*' }
        )
        .setTimestamp();

    const files = [];
    if (message.attachments.size > 0) {
        message.attachments.forEach((att) => {
            files.push(new AttachmentBuilder(att.proxyURL, { name: att.name }));
        });
        embed.addFields({ name: '📎 Хавсралт', value: `${message.attachments.size} файл` });
    }

    textLog.send({ embeds: [embed], files: files }).catch(() => {});
});

client.login(process.env.TOKEN);
