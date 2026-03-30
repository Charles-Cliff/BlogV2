---
title: Rider与VisualStudio的中文注释编码的爱恨情仇（转换兼容）
published: 2025-10-25T12:32:34
updated: 2026-01-22T01:17:07
description: 'Rider与VisualStudio在中文注释编码上的兼容问题解决方案，记录了解决该问题的过程与方法'
image: '/images/2025-10/rv4.webp'
tags: [Unity, Rider, VisualStudio, 中文注释, 编码转换]

draft: false 
lang: ''
---

## 事情的起�?
团队合作开发Unity项目时，一开始我单人使用Rider编写，但是后来的所有人都是使用VisualStudio，结果在代码注释中出现了乱码问题。所以我决定我去适配其他人，完成中文转换
## 在Visual Studio中，我们编写图中带有中文的代码及注释
![Visual Studio中编写的中文注释代码示例](/images/2025-10/rv1.webp)
### 但是切换为Rider后，中文注释就变成了乱码
### Unity中视�?![Unity编辑器中显示的中文乱码问题](/images/2025-10/rv2.webp)
### Rider中视�?![Rider中显示的中文注释乱码问题](/images/2025-10/rv4.webp)
## 原因分析

经过一番查找，发现这是由于Rider默认使用UTF-8编码，而Visual Studio使用的是GBK编码，导致中文注释无法正确显示，需要进行编码转换故我们选择进行重载，注意一定要选择<span style="color: red; font-weight: bold;">重新加载�?/span>
![Rider文件编码重新加载操作界面](/images/2025-10/rv5.webp)
## 然后发现Rider重新加载后，中文注释就能正确显示�?![Rider重新加载后中文注释正确显示](/images/2025-10/rv6.webp)
## A.为了一劳永逸，我们可以在Rider中设置项目编码为GBK，避免每次打开文件都需要重新加�?![Rider项目编码设置为GBK配置界面](/images/2025-10/rv3.webp)
## B.使用更为统一的UTF-8（带BOM）编码，这样我们很多正常编译器均支持（推荐）
![Rider设置UTF-8带BOM编码配置界面](/images/2025-10/rv8.webp)
## 最后均可正常显示中文注�?![Rider和Visual Studio中文注释兼容成功显示](/images/2025-10/rv7.webp)

