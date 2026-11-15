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

// Express сервер (Render Free-tier 24/7 идэвхтэй байлгахад зориулав)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LUCID THEORY ULTIMATE CLAN BOT IS ONLINE & RUNNING!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// Discord Bot Client үүсгэх (Бүх шаардлагатай Intent-үүдтэй)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Environment variables-ээс ID болон тохиргоонуудыг авах
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

// Bot асахад ажиллах хэсэг
client.once('ready', () => {
    console.log(`=========================================`);
    console.log(`🚀 LUCID THEORY BOT #${client.user.tag} АМЖИЛТТАЙ АСЛАА!`);
    console.log(`🌐 Серверийн тоо: ${client.guilds.cache.size}`);
    console.log(`=========================================`);
    
    // Bot Status / Activity тохируулах
    client.user.setPresence({
        activities: [{ name: 'Lucid Theory Clan | !help-clan', type: 3 }], // 3 = Watching
        status: 'online',
    });
});

// --- 1. WELCOME & GOODBYE SYSTEM ---
client.on('guildMemberAdd', async (member) => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
        if (!welcomeChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('✨ ШИНЭ ГИШҮҮН НЭГДЛЭЭ!')
            .setDescription(`Мэнд хүргэе, ${member}!\n\n**Lucid Theory** кланы албан ёсны Discord серверт тавтай морил.\n\n• Дүрмээ уншиж танилцах: `#rules`\n• Тоглоомын цолоо авах: `#self-roles`\n• Кланд элсэх хүсэлт гаргах: `#apply-here``)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `Нийт гишүүн: ${member.guild.memberCount}`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        await welcomeChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Welcome message error:', err);
    }
});

// --- 2. AUTO-MODERATION (Link & Invite Filter) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // Discord Invite Link шүүх (Хууль бус сервер сурталчлахаас сэргийлэх)
    if (message.content.includes('discord.gg/') || message.content.includes('discord.com/invite/')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await message.delete().catch(() => {});
            const warnMsg = await message.channel.send(`⚠️ ${message.author}, энэ серверт урилгын линк явуулахыг хориглоно!`);
            setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
            return;
        }
    }
});

// --- 3. COMMANDS CENTER (!ticket-panel, !game-panel, !help-clan, !clear) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. Help Command
    if (command === '!help-clan') {
        const embed = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('📜 LUCID THEORY BOT — КОМАНДУУДЫН ЖАГСААЛТ')
            .setDescription('Админ болон гишүүдэд зориулсан тусламжийн хэсэг:')
            .addFields(
                { name: '🎯 `!ticket-panel`', value: 'Дэмжлэг болон элсэлтийн билет нээх панель гаргана (Админ).' },
                { name: '🎮 `!game-panel`', value: 'Тоглоомын цол сонгох товчлууртай панель гаргана (Админ).' },
                { name: '🧹 `!clear [тоо]`', value: 'Чат дахь мессежүүдийг бөөнөөр нь устгана (Админ).' },
                { name: '🤖 `!bot-info`', value: 'Ботын ажиллаж буй систем болон статус харуулна.' }
            )
            .setFooter({ text: 'Lucid Theory System' });

        return message.reply({ embeds: [embed] });
    }

    // 2. Bot Info Command
    if (command === '!bot-info') {
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🤖 BOT SYSTEM STATUS')
            .addFields(
                { name: '🌐 Server', value: 'Render Cloud (Free Tier)', inline: true },
                { name: '⚡ Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '⚙️ Node.js', value: process.version, inline: true },
                { name: '🛡️ Status', value: '100% Operational & Secure', inline: false }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // 3. Clear Chat Command
    if (command === '!clear') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Танд энэ командыг ашиглах эрх байхгүй байна (`Manage Messages` шаардлагатай).');
        }

        const count = parseInt(args[0]);
        if (isNaN(count) || count < 1 || count > 100) {
            return message.reply('⚠️ 1-ээс 100 хооронд тоо оруулна уу! (Жишээ нь: `!clear 10`');
        }

        try {
            await message.channel.bulkDelete(count + 1, true);
            const confirmation = await message.channel.send(`✅ Амжилттай **${count}** ширхэг мессеж устгалаа.`);
            setTimeout(() => confirmation.delete().catch(() => {}), 4000);
        } catch (err) {
            return message.reply('❌ Мессеж устгах явцад алдаа гарлаа (14 хоногоос хуучин мессеж байж магадгүй).');
        }
    }

    // 4. Ticket Panel Command
    if (command === '!ticket-panel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Энэ панелыг гаргахын тулд Администратор эрх хэрэгтэй!');
        }

        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('🎫 LUCID THEORY — КЛАН ДЭМЖЛЭГ & ЭЛСЭЛТ')
            .setDescription('Сервер болон клантай холбоотой асуудлаар доорх цэснээс сонгож **Ticket** нээнэ үү.\n\n• 🎯 **Кланд элсэх** (Tryout & Application)\n• 🤝 **Хамтран ажиллах** (Scrim / Match)\n• ⚠️ **Гомдол & Тусламж** (Support & Report)')
            .setFooter({ text: 'Lucid Theory Automated System' });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select_menu')
                .setPlaceholder('Энд дарж билетний төрлөө сонгоно уу...')
                .addOptions([
                    { label: 'Кланд элсэх хүсэлт', description: 'Tryout болон бүртгэлийн талаар', value: 'ticket_apply', emoji: '🎯' },
                    { label: 'Хамтран ажиллах / Scrim', description: 'Клан хоорондын тоглолт болон партнер', value: 'ticket_scrim', emoji: '🤝' },
                    { label: 'Гомдол болон бусад тусламж', description: 'Админуудтай шууд холбогдох', value: 'ticket_other', emoji: '⚠️' }
                ])
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }

    // 5. Game Role Panel Command
    if (command === '!game-panel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Энэ панелыг гаргахын тулд Администратор эрх хэрэгтэй!');
        }

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎮 ТОГЛООМЫН ЦОЛ СОНГОХ (SELF-ROLES)')
            .setDescription('Доорх товчлууруудаас дарж өөрийн тоглодог тоглоомынхоо үндсэн цолыг авна уу! Дахин дарж цолоо хасах боломжтой.');

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

// --- 4. INTERACTION HANDLER (Buttons & Select Menus) ---
client.on('interactionCreate', async (interaction) => {
    // Game Role Button Logic
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
            return interaction.reply({ content: '❌ Уг серверт тохирох Role ID тохируулагдээгүй байна!', ephemeral: true });
        }

        if (interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(roleId);
            return interaction.reply({ content: `✅ Та **${role.name}** цолыг амжилттай хаслаа.`, ephemeral: true });
        } else {
            await interaction.member.roles.add(roleId);
            return interaction.reply({ content: `🎉 Та **${role.name}** цолыг амжилттай авлаа!`, ephemeral: true });
        }
    }

    // Ticket Select Menu Logic
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
                type: 0, // Guild Text Channel
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
                .setDescription(`Сайн байна уу, ${interaction.user}?\nАдминууд удахгүй тантай холбогдох болно. Асуудлаа дэлгэрэнгүй бичнэ үү.`);

            await ticketChannel.send({ embeds: [welcomeEmbed], components: [closeRow] });
            return interaction.reply({ content: `✅ Таны билет амжилттай үүслээ: ${ticketChannel}`, ephemeral: true });
        } catch (err) {
            return interaction.reply({ content: '❌ Билет үүсгэх явцад алдаа гарлаа.', ephemeral: true });
        }
    }

    // Close Ticket Button Logic
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 Энэ билет 5 секундын дараа хаагдах болно...' });
        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});

// --- 5. LOGGING SYSTEM (Text Delete & Voice State) ---
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
        embed.addFields({ name: '📎 Хавсралт', value: `${message.attachments.size} файл хавсаргасан байсан.` });
    }

    textLog.send({ embeds: [embed], files: files }).catch(() => {});
});

// Bot нэвтрэх
client.login(process.env.TOKEN);
