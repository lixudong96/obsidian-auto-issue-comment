import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { sendComment } from "auto";


const DEFAULT_SETTINGS = {
	token: "",
	username: "",
	repoName: ""
};

export type MyPluginSettings = typeof DEFAULT_SETTINGS;
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// 新增自定义命令
		this.addCommand({
			id: "ob-auto-issue-comment",
			name: "send-issue",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(view.data);
				console.log(this.settings);
				sendComment(view.data, this.settings)
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Git Token")
			.setDesc("GH_TOKEN")
			.addText((text) =>
				text
					.setPlaceholder("Enter your git token")
					.setValue(this.plugin.settings.token).onChange(async (value) => {
						console.log("git token: " + value);
						this.plugin.settings.token = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("username")
			.setDesc("发送到谁的repo")
			.addText((text) =>
				text
					.setPlaceholder("Enter git username")
					.setValue(this.plugin.settings.username).onChange(async (value) => {
						console.log("git username: " + value);
						this.plugin.settings.username= value;
						await this.plugin.saveSettings();
					})
			);
		
		new Setting(containerEl)
			.setName("repoName")
			.setDesc("仓库名")
			.addText((text) =>
				text
					.setPlaceholder("Enter git repoName")
					.setValue(this.plugin.settings.repoName).onChange(async (value) => {
						console.log("git repoName:" + value);
						this.plugin.settings.repoName = value;
						await this.plugin.saveSettings();
					})
			);

	}
}
