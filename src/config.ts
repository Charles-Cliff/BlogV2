import type {
	AntiLeechConfig,
	ExpressiveCodeConfig,
	ImageFallbackConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "384400's Blog",
	subtitle: "分享网络技术、UE开发、Unity 开发、AI 技术应用",
	description:
		"分享网络技术、UE开发、Unity开发、AI技术应用、作者为384400",

	keywords: [],
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
	themeColor: {
		hue: 270, // Violet theme
		fixed: true, // Hide the theme color picker for visitors
		forceDarkMode: true, // Force dark mode and hide theme switcher
	},
	banner: {
		enable: false,
		src: "", // Relative to the /src directory. Relative to the /public directory if it starts with '/'

		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed

			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	background: {
		enable: true, // Enable background image
		src: [ // 背景图数组，页面加载时随机选择一张
			"/images/bgs/KA.png"
		],
		position: "center", // Background position: 'top', 'center', 'bottom'
		size: "cover", // Background size: 'cover', 'contain', 'auto'
		repeat: "no-repeat", // Background repeat: 'no-repeat', 'repeat', 'repeat-x', 'repeat-y'
		attachment: "fixed", // Background attachment: 'fixed', 'scroll', 'local'
		opacity: 0.9, // Background opacity (0-1)
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		{
			src: "/images/Castle00.png", // 使用城堡图片作为网站图标
			//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
			//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		},
	],
	apps: [
		{
			name: "提示词优化",
			url: "https://prompt.micostar.cc",
			image: "/favicon/prompts.webp",
			description: "AI 提示词一键优化工具",
			external: true,
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Friends,
		LinkPreset.Apps,
		LinkPreset.Donate,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/images/avatar.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "384400",
	bio: ["兴趣使然的独立开发者"],
	links: [
		{
			name: "Bilibli",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/434410489?spm_id_from=333.1007.0.0",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Charles-Cliff",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

// 图片回退配置（如果没有外部图床，可以禁用）
export const imageFallbackConfig: ImageFallbackConfig = {
	enable: false,  // 禁用回退，使用本地图片
	originalDomain: "",
	fallbackDomain: "",
};

export const umamiConfig: UmamiConfig = {
	enable: true,
	baseUrl: "",
	shareId: "",
	timezone: "",
};

// 防盗链/域名保护配置
// export const antiLeechConfig: AntiLeechConfig = {
// 	enable: true,
// 	officialSites: [{ url: "https://gzhblog.cn/", name: "主站" }],
// 	debug: false,
// 	warningTitle: "⚠️ 域名安全警告",
// 	warningMessage:
// 		"您可能正在访问非官方网站，存在安全风险！建议跳转到官方网站。",
// };

export const googleAnalyticsConfig = {
	enable: true,
	measurementId: "G-68S9RLWRP0",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
