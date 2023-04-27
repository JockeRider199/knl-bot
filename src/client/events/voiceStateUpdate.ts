import { ChannelType, VoiceState } from "discord.js";
import { Event } from "../models/event";
import * as Database from "../utils/database";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (client, oldState: VoiceState, newState: VoiceState) => {
		if (!newState.guild || newState.member?.user.bot) return;

		const voiceConfig = await Database.getVoiceConfig(newState.guild.id);

		if (
			newState.channel &&
			voiceConfig &&
			newState.channelId == voiceConfig.voiceCreationChannelId
		) {
			const channel = await newState.guild.channels.create({
				name: `${newState.member!.displayName}'s channel`,
				type: ChannelType.GuildVoice,
				parent: voiceConfig.voiceCreationCategoryId,
			});
			channel.permissionOverwrites.set([
				{
					id: newState.member!.user.id,
					allow: ["MoveMembers"],
				},
			]);
			newState.member!.voice.setChannel(channel);
			await Database.createVoiceChannel(
				newState.guild.id,
				channel.id,
				newState.member!.id
			);
		}

		if (oldState.channel && oldState.channel.members.size == 0) {
			const isTempVoice = await Database.isTempVoiceChannel(
				oldState.guild.id,
				oldState.channel.id
			);
			if (isTempVoice) {
				oldState.channel.delete();
				await Database.removeVoiceChannel(
					oldState.guild.id,
					oldState.channel.id
				);
			}
		}
	},
};

export default event;
