import { defineConfig } from "vitepress";

export default defineConfig({
	title: "DevKit",
	description: "Developer productivity CLI with nightly automated commits",
	base: "/devkit/",
	cleanUrls: true,
	ignoreDeadLinks: true,
	themeConfig: {
		nav: [
			{ text: "Guide", link: "/getting-started" },
			{ text: "Commands", link: "/commands" },
			{ text: "Plugins", link: "/plugins" },
			{ text: "Reports", link: "/architecture" },
		],
		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Getting started", link: "/getting-started" },
					{ text: "Commands", link: "/commands" },
					{ text: "Plugins", link: "/plugins" },
				],
			},
			{
				text: "Generated reports",
				items: [
					{ text: "Architecture", link: "/architecture" },
					{ text: "Changelog preview", link: "/changelog-preview" },
					{ text: "Code size", link: "/metrics/code-size" },
					{ text: "Tests", link: "/metrics/tests" },
					{ text: "Outstanding work", link: "/project/todos" },
					{ text: "Link report", link: "/project/link-report" },
					{ text: "API reference", link: "/reference/api" },
					{ text: "Dependencies", link: "/security/dependencies" },
				],
			},
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/buzludeniz/devkit" },
		],
		search: { provider: "local" },
		editLink: {
			pattern: "https://github.com/buzludeniz/devkit/edit/main/docs/:path",
		},
		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2026 Deniz Ikili",
		},
	},
});
