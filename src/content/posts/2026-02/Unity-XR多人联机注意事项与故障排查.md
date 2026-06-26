---
title: Unity XR 多人联机注意事项与故障排查
published: 2026-02-10T20:00:00
updated: 2026-02-10T20:00:00
draft: false
description: 详细讲解Unity XR多人联机开发中的注意事项，包括IP配置、安卓打包设置、网络权限、以及常见问题的解决方案。
image: ""
tags:
  - Unity
  - XR
  - 多人联机
  - Android打包
  - 网络配置
  - 故障排查
lang: zh-CN
pinned: false
prerenderAll: true
---

## 前言

XR 多人联机开发比普通 PC 多人联机更复杂，涉及网络配置、安卓打包、权限设置等问题。本文基于 Unity XR 训练营资料，总结 XR 多人联机开发的注意事项与故障排查方法。

---

## IP 地址配置

### 注意事项

<span style="color: red; font-weight: bold;">重要</span>：复制 IP 地址时检查前面和后面有没有多复制了空格，特别是后面不能带有空格。

### 查看电脑 IP

Windows 系统：**Win + R** → 输入 **cmd** → 输入 **ipconfig**

### 本地网络测试

| 检查项 | 说明 |
|--------|------|
| Unity Transport Address | 替换为电脑的 IP 地址 |
| Allow Remote Connections | 必须勾选（容易遗漏） |

---

## Wifi 设置

使用本地网络测试时，最好把 **Wifi 设为专用网络**。公用网络有时候容易连不上。

---

## 手机作为服务端

### 网络知识

| 网络类型 | IP 特点 |
|----------|----------|
| Wi-Fi 私有网络 | 通常是 192.x.x.x 私有 IP 地址 |
| 移动数据（4G/5G） | 公共 IP 地址 |

### 手机开热点注意事项

```
手机（移动数据）→ 开启热点 → 电脑连接
```

- 电脑获得的 192.x.x.x IP 是**电脑的私有 IP**，不是手机的
- 手机作为服务端时，需要在手机的 Wi-Fi 设置里查看**路由器为手机分配的 IP 地址**
- 两个设备的 IP 可能不同，但都在同一个局域网内

---

## XR 安卓打包设置

### 降低 Android API Level

<span style="color: orange; font-weight: bold;">问题</span>：Quest 开发需要 Android 12（API Level 32），但某些手机（如华为 P30 Pro）打包会报错"解析包时出现错误"。

**解决**：把 **Minimum API Level** 调低。

### 关闭 XR 插件

在 **XR Plug-in Management** 的安卓端**取消勾选** XR 的底层插件。

---

## 安卓端网络权限设置

### AndroidManifest 配置

在 `Assets/Plugins/Android/AndroidManifest.xml` 中添加：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Project Settings 配置

**Edit > Project Settings > Player > Android**：
- **Internet Access** 设为 **Require**

---

## 本地测试关闭防火墙

测试本地联机时，**关闭电脑防火墙**或添加防火墙例外规则。

---

## 故障排查手册

### 1. 服务端 IP 地址是否正确

检查 Windows 的 ipconfig 查询到的 IP 是否正确配置在 Unity Transport 的 Address 中。

### 2. Quest 头显网络是否已连接

确保头显已连接 Wi-Fi 并且与电脑在同一局域网内。

### 3. 打包程序是否误设为 Server/Host

如果电脑作为服务端，打包的程序需要**启动 Client**。

### 4. 是否勾选允许远程连接

在 **Unity Transport** 脚本：
- **Address** 填入电脑 IP（无多余空格）
- **Allow Remote Connections** 必须勾选

### 5. Wi-Fi 是否设为专用网络

公用网络可能阻止局域网连接。

### 6. 安卓端网络权限

检查清单：
- [ ] AndroidManifest 添加 INTERNET 权限
- [ ] AndroidManifest 添加 ACCESS_NETWORK_STATE 权限
- [ ] Project Settings 的 Internet Access 设为 Require

### 7. 防火墙是否关闭

尝试关闭防火墙进行测试。

---

## 常见错误与解决方案

| 问题 | 解决方案 |
|------|----------|
| 无法连接 | 检查 IP 是否正确、防火墙是否关闭 |
| 打包安装失败 | 降低 Minimum API Level |
| 权限弹窗没出现 | 检查 OVRManager 的 Permission Request On Startup |
| 画面不同步 | 检查 NetworkVariable 的 Server 写权限 |
| 延迟高 | 使用有线网络而非 Wi-Fi |

---

## MR 多人联机特殊注意

### 空间对齐

MR 多人联机需要**空间对齐**，确保多个玩家的虚拟坐标系与现实空间对应。

### 权威判定

所有影响游戏结果的逻辑必须在 **Server 端** 执行，Client 只负责申请和显示。

### 输入同步

XR 输入（头显位置、手柄控制器）是实时流，需要持续同步到远端 Player。

---

## 总结

XR 多人联机注意事项：

1. **IP 配置**：Address 无空格、勾选 Allow Remote Connections
2. **网络设置**：专用 Wi-Fi、同一局域网、防火墙关闭
3. **安卓打包**：降低 API Level、关闭 XR 插件、配置网络权限
4. **故障排查**：按清单逐项检查（IP → 网络 → 权限 → 防火墙）

<span style="color: blue; font-weight: bold;">调试建议</span>：先用 PC 双开测试，确认功能正常后再打包到安卓设备。

---

*本文整理自 Unity XR 训练营学习资料。*
