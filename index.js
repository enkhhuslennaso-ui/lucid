function getStepLogger(manager) {
    try {
        if (manager && typeof manager.getLogger === "function") {
            return manager.getLogger();
        }
    }
    catch (_error) {
        // Ignore and fall back to console logger.
    }
    return {
        info: function (message) { if (typeof console !== "undefined" && console.log) { console.log(message); } },
        warn: function (message) { if (typeof console !== "undefined" && console.warn) { console.warn(message); } },
        error: function (message) { if (typeof console !== "undefined" && console.error) { console.error(message); } },
        severe: function (message) { if (typeof console !== "undefined" && console.error) { console.error(message); } }
    };
}

/**
 * STEP Business Rule
 * Trademark: AI Labz Ltd (TM)
 * Purpose: Describe the rule intent and expected side effects.
 * Notes: Keep transactions short and avoid repeated writes in loops.
 */

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    AttachmentBuilder,
    ActivityType
} = require('discord.js');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 CS2 Clan Bot is running 24/7!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server is running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// ==========================================
// ⚙️ СЕРВЕРИЙН БҮХ ID-НУУД
// ==========================================
const CONFIG = {
    TOKEN: process.env.TOKEN || 'ТАНЫ_БОТЫН_TOKEN',
    GUILD_ID: '1571166756355969134',
    ADMIN_ROLE_ID: '1571166796873080965',
    AUTO_ROLE_ID: null,

    // CS2 болон Тоглоомын Role ID-нууд
    ROLE_AWP: 'AWP_ROLE_ID',               // Хэрэв CS2 байрлал хэрэгтэй бол ID-гаа энд тавина
    ROLE_RIFLER: 'RIFLER_ROLE_ID',
    ROLE_IGL: 'IGL_ROLE_ID',
    ROLE_SUPPORT: 'SUPPORT_ROLE_ID',

    // Шинэ тоглоомын Role ID-нууд
    ROLE_CS: '1571357618398699640',       // Counter Strike
    ROLE_VAL: '1571357785638051900',      // Valorant
    ROLE_MC: '1571357701621940315',       // Minecraft
    ROLE_RBX: '1571357855561420920',      // Roblox

    // Channel & Category ID-нууд
    TICKET_CATEGORY_ID: '1571213412032188626',
    WELCOME_CHANNEL_ID: '1571197629616889946',
    MEMBER_LOG_ID: '1571355846431084554',
    TEXT_LOG_ID: '1571216197473533972',
    VOICE_LOG_ID: '1571216312309387476',
    TICKET_LOG_ID: '1571216472095727716',
    MOD_LOG_ID: '1571216408073736333'
};

/**
 * STEP business rule function: formatTime.
 * TODO: Describe purpose, side effects, and expected node/context state.
 * @param {*} timestamp
 */
function formatTime(timestamp) {
    return `<t:${Math.floor(timestamp / 1000)}:F> (<t:${Math.floor(timestamp / 1000)}:R>)`;
}

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} амжилттай аслаа!`);

    /**
 * STEP business rule function: updateStatus.
 * TODO: Describe purpose, side effects, and expected node/context state.
 */
    const updateStatus = () => {
        const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
        const count = guild ? guild.memberCount : 0;
        client.user.setActivity(`CS2 Clan | ${count} гишүүн`, { type: ActivityType.Watching });
    };

    updateStatus();
    setInterval(updateStatus, 60000);
});

// ==========================================
// 1. WELCOME & MEMBER LOGS
// ==========================================
client.on('guildMemberAdd', async (member) => {
    if (CONFIG.AUTO_ROLE_ID) {
        member.roles.add(CONFIG.AUTO_ROLE_ID).catch(() => {});
    }

    const welcomeChannel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF88')
            .setTitle(`🎮 ТАВТАЙ МОРИЛ, ${member.user.username.toUpperCase()}!`)
            .setDescription(
                `**${member.guild.name}** серверт тавтай морил!\n\n` +
                `📜 Суваг дахь дүрэмтэй танилцана уу.\n` +
                `🎯 Кланд элсэх бол Ticket нээж хүсэлтээ илгээнэ үү.`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Гишүүн', value: `${member}`, inline: true },
                { name: '👥 Нийт гишүүд', value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: 'GL & HF!' })
            .setTimestamp();

        welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] }).catch(() => {});
    }

    const memberLog = member.guild.channels.cache.get(CONFIG.MEMBER_LOG_ID);
    if (memberLog) {
        const logEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setAuthor({ name: 'Шинэ гишүүн орж ирлээ', iconURL: member.user.displayAvatarURL() })
            .setDescription(`${member} (\`${member.user.tag}\`)\n**Огноо:** ${formatTime(member.user.createdTimestamp)}`)
            .setTimestamp();
        memberLog.send({ embeds: [logEmbed] }).catch(() => {});
    }
});

client.on('guildMemberRemove', async (member) => {
    const memberLog = member.guild.channels.cache.get(CONFIG.MEMBER_LOG_ID);
    if (memberLog) {
        const logEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setAuthor({ name: 'Гишүүн гарлаа', iconURL: member.user.displayAvatarURL() })
            .setDescription(`${member.user.tag} (\`${member.id}\`)`)
            .setTimestamp();
        memberLog.send({ embeds: [logEmbed] }).catch(() => {});
    }
});

// ==========================================
// 2. TEXT & IMAGE LOGS
// ==========================================
client.on('messageDelete', async (message) => {
    if (!message.guild || message.author?.bot) return;
    const textLog = message.guild.channels.cache.get(CONFIG.TEXT_LOG_ID);
    if (!textLog) return;

    const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setAuthor({ name: `${message.author.tag} мессеж устгалаа`, iconURL: message.author.displayAvatarURL() })
        .addFields(
            { name: '📍 Суваг', value: `${message.channel}`, inline: true },
            { name: '💬 Текст', value: message.content ? message.content.slice(0, 1024) : '*Зураг/Файл*' }
        );

    const files = [];
    if (message.attachments.size > 0) {
        message.attachments.forEach((att) => {
            files.push(new AttachmentBuilder(att.proxyURL, { name: att.name }));
        });
        embed.addFields({ name: '📎 Устгасан зураг', value: `${message.attachments.size} файл хавсаргав.` });
    }

    textLog.send({ embeds: [embed], files: files }).catch(() => {});
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (!oldMsg.guild || oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
    const textLog = oldMsg.guild.channels.cache.get(CONFIG.TEXT_LOG_ID);
    if (!textLog) return;

    const embed = new EmbedBuilder()
        .setColor('#F1C40F')
        .setAuthor({ name: `${oldMsg.author.tag} мессеж заслаа`, iconURL: oldMsg.author.displayAvatarURL() })
        .addFields(
            { name: '📍 Суваг', value: `${oldMsg.channel}`, inline: false },
            { name: '📝 Өмнөх', value: oldMsg.content ? oldMsg.content.slice(0, 1024) : '*Хоосон*' },
            { name: '✏️ Шинэ', value: newMsg.content ? newMsg.content.slice(0, 1024) : '*Хоосон*' }
        )
        .setTimestamp();

    textLog.send({ embeds: [embed] }).catch(() => {});
});

// ==========================================
// 3. VOICE & SCREEN SHARE LOGS
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    const voiceLog = newState.guild.channels.cache.get(CONFIG.VOICE_LOG_ID);
    if (!voiceLog || newState.member.user.bot) return;

    const member = newState.member;
    let action = '';
    let color = '#3498DB';

    if (!oldState.channelId && newState.channelId) {
        action = `📥 **${newState.channel.name}** сувагт орлоо.`;
        color = '#2ECC71';
    } else if (oldState.channelId && !newState.channelId) {
        action = `📤 **${oldState.channel.name}** сувгаас гарлаа.`;
        color = '#E74C3C';
    } else if (oldState.channelId !== newState.channelId) {
        action = `🔄 **${oldState.channel.name}** ➔ **${newState.channel.name}** руу шилжлээ.`;
        color = '#F39C12';
    } else if (!oldState.streaming && newState.streaming) {
        action = `🖥️ **${newState.channel.name}** өрөөнд **ДЭЛГЭЦЭЭ SHARE ХИЙЛЭЭ** (Stream ON).`;
        color = '#9B59B6';
    } else if (oldState.streaming && !newState.streaming) {
        action = `⏹️ **${newState.channel.name}** өрөөнд дэлгэц Share зогсоолоо.`;
        color = '#95A5A6';
    }

    if (!action) return;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .setDescription(`${member} ${action}\n🕒 **Цаг:** ${formatTime(Date.now())}`);

    voiceLog.send({ embeds: [embed] }).catch(() => {});
});

// ==========================================
// 4. ADMIN COMMANDS & PANELS
// ==========================================
client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // Auto-Mod: Discord invite link хамгаалалт
    if (!isAdmin && /(discord\.gg\/|discord\.com\/invite\/)/i.test(message.content)) {
        await message.delete().catch(() => {});
        const warn = await message.channel.send(`⚠️ ${message.author}, серверийн урилга линк явуулахыг хориглоно!`);
        setTimeout(() => warn.delete().catch(() => {}), 5000);
        return;
    }

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === '!ping') {
        const msg = await message.reply('🏓 Шалгаж байна...');
        msg.edit(`🏓 Pong! Ботын хурд: **${client.ws.ping}ms**`);
    }

    if (command === '!clear' && isAdmin) {
        const count = parseInt(args[0]);
        if (!count || count < 1 || count > 100) return message.reply('⚠️ 1-ээс 100 хооронд тоо оруулна уу!');
        await message.channel.bulkDelete(count, true).catch(() => {});
        const reply = await message.channel.send(`🧹 **${count}** мессеж устгалаа.`);
        setTimeout(() => reply.delete().catch(() => {}), 3000);
    }

    if (command === '!announce' && isAdmin) {
        const text = args.join(' ');
        if (!text) return message.reply('⚠️ Зарлалын текстээ бичнэ үү!');
        await message.delete().catch(() => {});
        const annEmbed = new EmbedBuilder()
            .setColor('#FF4655')
            .setTitle('📣 КЛАНЫ ЗАРЛАЛ')
            .setDescription(text)
            .setFooter({ text: `Зарласан: ${message.author.username}` })
            .setTimestamp();
        await message.channel.send({ content: '@everyone', embeds: [annEmbed] }).catch(() => {});
    }

    // Ticket Panel
    if (command === '!ticket-panel' && isAdmin) {
        await message.delete().catch(() => {});
        const panelEmbed = new EmbedBuilder()
            .setColor('#FF4655')
            .setTitle('🎫 КЛАН ДЭМЖЛЭГ & ЭЛСЭЛТИЙН ХЭСЭГ')
            .setDescription('Доорх цэснээс сонгоод **Ticket** нээнэ үү.');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('create_ticket_menu')
            .setPlaceholder('👇 Төрлөө сонгоно уу...')
            .addOptions([
                { label: 'Кланд элсэх', description: 'Элсэлтийн анкет бөглөх', value: 'join_clan', emoji: '🎯' },
                { label: 'Гомдол / Мэдээлэх', description: 'Асуудал мэдүүлэх', value: 'report', emoji: '⚠️' },
                { label: 'Хамтран ажиллах', description: 'Scrim санал', value: 'collab', emoji: '🤝' }
            ]);

        await message.channel.send({ embeds: [panelEmbed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
    }

    // 🎮 TOGLOOMUUDIN SELF-ROLE PANEL (!game-panel)
    if (command === '!game-panel' && isAdmin) {
        await message.delete().catch(() => {});
        const gameEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎮 ТОГЛООМЫН ЦОЛ СОНГОХ')
            .setDescription('Доорх товчлуурууд дээр дарж өөрийн тоглодог тоглоомын цолыг авна уу (Дахин дарвал хасагдана):');

        const gameButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_cs').setLabel('Counter-Strike').setStyle(ButtonStyle.Primary).setEmoji('⚡'),
            new ButtonBuilder().setCustomId('role_val').setLabel('Valorant').setStyle(ButtonStyle.Danger).setEmoji('🎯'),
            new ButtonBuilder().setCustomId('role_mc').setLabel('Minecraft').setStyle(ButtonStyle.Success).setEmoji('🟩'),
            new ButtonBuilder().setCustomId('role_rbx').setLabel('Roblox').setStyle(ButtonStyle.Secondary).setEmoji('🟥')
        );

        await message.channel.send({ embeds: [gameEmbed], components: [gameButtons] });
    }
});

// ==========================================
// 5. INTERACTIONS (TICKETS & GAME ROLES)
// ==========================================
client.on('interactionCreate', async (interaction) => {
    // --- GAME SELF-ROLES ---
    if (interaction.isButton() && interaction.customId.startsWith('role_')) {
        const roleMap = {
            role_cs: CONFIG.ROLE_CS,
            role_val: CONFIG.ROLE_VAL,
            role_mc: CONFIG.ROLE_MC,
            role_rbx: CONFIG.ROLE_RBX
        };

        const roleId = roleMap[interaction.customId];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return interaction.reply({ content: '❌ Энэ Role сервер дээр олдсонгүй!', ephemeral: true });

        if (interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(roleId);
            return interaction.reply({ content: `➖ **${role.name}** цолыг хаслаа.`, ephemeral: true });
        } else {
            await interaction.member.roles.add(roleId);
            return interaction.reply({ content: `✅ **${role.name}** цолыг амжилттай авлаа!`, ephemeral: true });
        }
    }

    // --- TICKET CREATION ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'create_ticket_menu') {
        const type = interaction.values[0];
        const typeNames = {
            join_clan: { prefix: 'clan', title: '🎯 Кланд элсэх хүсэлт', questions: '1. **Нэр / Нас:**\n2. **Faceit / Premier Elo:**\n3. **Steam Link:**' },
            report: { prefix: 'report', title: '⚠️ Гомдол / Мэдээлэл', questions: '1. **Ямар асуудал:**\n2. **Дэлгэрэнгүй:**' },
            collab: { prefix: 'collab', title: '🤝 Хамтран ажиллах', questions: '1. **Саналын дэлгэрэнгүй:**' }
        };

        const selected = typeNames[type];

        const existingChannel = interaction.guild.channels.cache.find(
            (c) => c.parentId === CONFIG.TICKET_CATEGORY_ID && c.topic === interaction.user.id
        );
        if (existingChannel) {
            return interaction.reply({ content: `❌ Танд аль хэдийн нээлттэй Ticket байна: ${existingChannel}`, ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const ticketChannel = await interaction.guild.channels.create({
            name: `${selected.prefix}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.TICKET_CATEGORY_ID,
            topic: interaction.user.id,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: CONFIG.ADMIN_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory] }
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#00A8FF')
            .setTitle(selected.title)
            .setDescription(`Сайн уу ${interaction.user}! Админ орж иртэл мэдээллээ үлдээнэ үү:\n\n${selected.questions}`)
            .addFields(
                { name: '👤 Нээсэн гишүүн', value: `${interaction.user}`, inline: true },
                { name: '🛡️ Хариуцсан Админ', value: '*Хүлээгдэж байна*', inline: true }
            );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ content: `${interaction.user}`, embeds: [ticketEmbed], components: [buttons] }).catch(() => {});
        await interaction.editReply({ content: `✅ Таны Ticket амжилттай үүслээ: ${ticketChannel}` });
    }

    // Claim Button
    if (interaction.isButton() && interaction.customId === 'claim_ticket') {
        if (!interaction.member.roles.cache.has(CONFIG.ADMIN_ROLE_ID) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Админ биш байна!', ephemeral: true });
        }

        const oldEmbed = interaction.message.embeds[0];
        const updatedEmbed = EmbedBuilder.from(oldEmbed).setFields(
            oldEmbed.fields[0],
            { name: '🛡️ Хариуцсан Админ', value: `${interaction.user}`, inline: true }
        );

        const updatedButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel(`Claimed by ${interaction.user.username}`).setStyle(ButtonStyle.Secondary).setEmoji('✅').setDisabled(true),
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await interaction.update({ embeds: [updatedEmbed], components: [updatedButtons] });
        await interaction.channel.send(`✅ Энэ Ticket-ийг ${interaction.user} хариуцаж авлаа!`).catch(() => {});
    }

    // Close Button
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 Ticket хаагдаж байна...');

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptText = messages
            .reverse()
            .map((m) => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content || '[Файл]'}`)
            .join('\n');

        const attachment = new AttachmentBuilder(Buffer.from(transcriptText, 'utf-8'), {
            name: `transcript-${interaction.channel.name}.txt`
        });

        const ticketLog = interaction.guild.channels.cache.get(CONFIG.TICKET_LOG_ID);
        if (ticketLog) {
            const logEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('📁 Ticket Хаагдлаа')
                .addFields(
                    { name: 'Суваг', value: interaction.channel.name, inline: true },
                    { name: 'Нээсэн', value: `<@${interaction.channel.topic}>`, inline: true }
                );
            await ticketLog.send({ embeds: [logEmbed], files: [attachment] }).catch(() => {});
        }

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});

client.login(CONFIG.TOKEN);
