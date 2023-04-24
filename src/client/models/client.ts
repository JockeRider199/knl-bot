import { Client as DSClient, GuildMember, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

import type Config from "./config";
import devConfig from "../environments/environment";
import prodConfig from "../environments/environment.prod";
import { type SlashCommand } from "./slash-command";
import { Poru, PoruEvents } from "poru";

export class Client extends DSClient {
	private readonly config: Config =
		process.env.PRODUCTION == "TRUE" ? prodConfig : devConfig;

	private readonly slashCommands: SlashCommand[] = [];
	public poru: Poru;

	constructor() {
		super({
			intents:
				process.env.PRODUCTION == "TRUE"
					? prodConfig.intents
					: devConfig.intents,
		});
		this.poru = new Poru(
			this,
			this.getConfig().music.nodes,
			this.getConfig().music.options
		);
	}

	public getConfig(): Config {
		return this.config;
	}

	public initPoru() {
		this.poru.init(this);
	}

	public getSlashCommands(): SlashCommand[] {
		return this.slashCommands;
	}

	public async loadEvents() {
		const files = readdirSync(join(__dirname, "..", "events"));
		for (const file of files) {
			const event = require(join(__dirname, "..", "events", file));
			if (event.default.settings.enabled) {
				const eventName = file.split(".")[0];
				this.on(eventName, (...args) => event.default.exec(this, ...args));
				console.log(`Load Event: ${eventName}`);
			}
		}
		console.log(`${files.length} events loaded`);
	}

	public async loadMusicEvents() {
		const files = readdirSync(join(__dirname, "..", "music-events"));
		for (const file of files) {
			const event = require(join(__dirname, "..", "music-events", file));
			if (event.default.settings.enabled) {
				const eventName = file.split(".")[0];
				this.poru.on(<keyof PoruEvents>eventName, (...args: any) =>
					event.default.exec(this, ...args)
				);
				console.log(`Load Music Event: ${eventName}`);
			}
		}
	}

	public async loadSlashCommands() {
		const subfolders = readdirSync(join(__dirname, "..", "commands"));
		for (const folder of subfolders) {
			const files = readdirSync(join(__dirname, "..", "commands", folder));
			for (const file of files) {
				const command = require(join(
					__dirname,
					"..",
					"commands",
					folder,
					file
				));
				const commandName = file.split(".")[0];
				if (command.default.settings.enabled) {
					this.slashCommands.push(command.default);
					console.log(`Load Command: ${commandName}`);
				}
			}
		}
		console.log(`${this.slashCommands.length} commands loaded`);
	}

	private async getSynchronizableInteractions(
		syncInteractions: SynchronizableInteractions
	): Promise<any[]> {
		const data = [];
		if (syncInteractions.slashCommands) {
			if (this.slashCommands.length === 0) {
				console.log("No slash commands loaded");
			} else {
				console.log(
					`Synchronizing ${this.slashCommands.length} slash commands`
				);
				data.push(...this.slashCommands.map((cmd) => cmd.data.toJSON()));
			}
		}
		return data;
	}

	public async syncInteractionsForGuild(
		guildId: string,
		syncInteractions: SynchronizableInteractions
	) {
		const data = await this.getSynchronizableInteractions(syncInteractions);
		if (data.length <= 0) {
			console.log("No data to synchronise");
			return;
		}
		const rest = new REST({ version: "10" });

		if (process.env.PRODUCTION == "TRUE") {
			rest.setToken(process.env.PROD_CLIENT_TOKEN!);
		} else {
			rest.setToken(process.env.CLIENT_TOKEN!);
		}
		try {
			rest.put(
				Routes.applicationGuildCommands(
					process.env.PRODUCTION == "TRUE"
						? process.env.PROD_CLIENT_ID!
						: process.env.CLIENT_ID!,
					guildId
				),
				{ body: data }
			);
		} catch (e) {
			console.log(`${e}`);
		}
	}

	/* public async syncGlobalInteractions(
		syncInteractions: SynchronizableInteractions
	) {
		let data = await this.getSynchronizableInteractions(syncInteractions);
		if (data.length === 0) return console.log("No data to synchronise");
		let rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN!);
		try {
			rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
				body: data,
			});
		} catch (e) {
			console.log(`${e}`, "error");
		}
	} */

	/**
	 * Unloads all slash commands and context menus from the bot.
	 * Use this function if you have duplicated interactions registered.
	 */
	public async unSyncInteractions() {
		await this.application?.commands.set([]);
		for (const guild of this.guilds.cache.values()) {
			await guild.commands.set([]);
		}
	}
}

interface SynchronizableInteractions {
	slashCommands?: boolean;
}
