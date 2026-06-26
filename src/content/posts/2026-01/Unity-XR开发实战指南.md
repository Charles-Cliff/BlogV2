---
title: Unity XR开发实战指南
published: 2026-01-08T20:00:00
updated: 2026-01-08T20:00:00
draft: false
description: 从环境搭建到交互开发，系统讲解Unity XR开发的核心流程，涵盖Meta XR SDK配置、抓取交互、手势录制等实用技巧。
image: ""
tags:
  - Unity
  - XR
  - Meta-Quest
  - OpenXR
  - MR
  - 交互开发
lang: zh-CN
pinned: false
prerenderAll: true
---

## 前言

XR（VR/AR/MR）开发正在快速发展，Meta Quest、PICO、Apple Vision Pro 等设备引领着空间计算时代的到来。本文基于 Unity XR 训练营资料，系统讲解 Unity XR 开发的核心流程与实战技巧。

---

## 开发环境搭建

### 1. 创建 URP 工程

首先在 Unity Hub 中创建一个使用 **URP（Universal Render Pipeline）** 的工程。URP 是 Meta 推荐使用的渲染管线，提供更好的性能表现。

### 2. 切换安卓平台

菜单栏 **File > Build Profile**，点击 **Android**，点击 **Switch Platform**。

<span style="color: orange; font-weight: bold;">为什么需要切换平台？</span>Quest 和 PICO 头显都是基于安卓系统，想要把程序打包发布到这些设备上运行，必须打包出能在安卓系统运行的 APK 文件。

### 3. 配置 XR Plugin Management

1. 打开 **Edit > Project Settings > XR Plugin Management**
2. 点击 **Install XR Plugin Management**
3. 在安卓端和 PC 端都勾选 **OpenXR**

### 4. 导入 Meta XR SDK

1. 打开 **Window > Package Management > Package Manager**
2. 在 Unity Asset Store 添加以下三个 SDK：
   - **Meta XR Core SDK** — 核心功能
   - **Meta XR Interaction SDK** — 交互系统
   - **Meta MR Utility Kit** — MR 工具包

<span style="color: blue; font-weight: bold;">提示</span>：安装可能需要科学上网，如果失败请尝试重新安装。

### 5. 环境修复

1. 找到 **Meta XR Tools > Project Setup Tool**
2. 在安卓端和 PC 端都点击 **Fix All** 和 **Apply All**
3. 重点消除 **Fix All** 下的红色警告（未消除会导致程序无法运行）
4. 点击 **XR Plug-in Management > Project Validation**，在安卓端和 PC 端点击 **Fix All**

### 6. 最终检查

| 检查项 | 说明 |
|--------|------|
| OpenXR 安卓端 Render Mode | 设为 **Single Pass Instanced** 或 **Multi-view**（性能更好） |
| Enable Interaction Profiles | 应有 **Oculus Touch Controller Profile** |
| OpenXR Feature Groups | 勾选 **Meta XR** |

---

## 交互系统开发

### 玩家物体

Meta 提供了功能齐全的玩家物体（Building Block），可以快速搭建基础交互功能。

### 抓取交互

#### 近距离抓取

1. 在需要添加抓取交互的物体上**鼠标右键**
2. 选择 **Interaction SDK > Add Grab Interaction**
3. 点击 **Fix All** 后再点击 **Create**
4. Unity 会自动添加抓取交互所需的脚本和组件

#### 限制抓取物体的移动、旋转、双手缩放

在有 **Grabbable** 脚本的物体上添加 **Grab Free Transformer** 脚本：

```csharp
// 配置步骤
1. 把 GrabFreeTransformer 添加到 Grabbable 的 One Grab Transformer 参数
2. 如果需要双手抓取，添加到 Two Grab Transformer 参数
3. 取消勾选 Grabbable 的 Transfer On Second Selection 参数
```

#### 双手缩放

将 **GrabFreeTransformer** 脚本上 **Scale Constraints** 三个轴的 Constrain 取消勾选，双手就能自由缩放物体大小。

#### 限制抓取范围

**GrabFreeTransformer** 脚本上的 **Position/Rotation/Scale Constrains** 分别控制位置、旋转和缩放的允许范围：

```csharp
// 配置参数说明
Constrain：勾选后启用该轴的限制
Min / Max：限制的最小值和最大值
Constraints Are Relative：是否相对于本地坐标
```

**Constraints Are Relative 示例（以缩放为例）：**

假设物体原缩放为 (0.8, 0.8, 0.8)，X/Y/Z 缩放最小值 0.3，最大值 2：

| 模式 | 最小缩放 | 最大缩放 |
|------|----------|----------|
| 勾选 Relative | (0.24, 0.24, 0.24) | (1.6, 1.6, 1.6) |
| 不勾选 | (0.3, 0.3, 0.3) | (2, 2, 2) |

---

## 录制抓取手势

Meta 提供了便捷的抓取手势录制工具。

### 录制步骤

#### 第一步：准备工作

1. 菜单栏点击 **Meta > Interaction > Hand Grab Pose Recorder**
2. 引用有 **Hand** 脚本的右手物体
3. 需要录制手势的物体需有 **Rigidbody** 刚体组件

#### 第二步：运行录制

1. 运行程序，做出抓取手势
2. 在 Recorder 面板空白处**双击**
3. 按**空格键**或点击 **Record HandGrabPose** 按钮开始录制

#### 第三步：保存手势

点击 **Save To Collection**

#### 第四步：加载手势

1. 退出运行模式
2. 点击 **Load From Collection**
3. 保留一个有 **HandGrabPose** 子物体的 **HandGrabInteractable**，删除其他的

### 生成镜像手势

找到物体身上的 **HandGrabInteractable** 脚本，点击 **Create Mirrored HandGrabInteractable** 即可快速生成另一只手的镜像手势。

---

## 远距离抓取

### 添加远距离抓取

选中物体，**鼠标右键** > **Interaction SDK > Add Distance Grab Interaction**

### 三种抓取类型

| 类型 | 说明 | 特点 |
|------|------|------|
| **Grab Relative To Hand** | 物体和手同步移动 | 像手和物体之间连成一条线 |
| **Pull Interactable To Hand** | 物体飞向手 | 最常用，一把物体抓到手上 |
| **Manipulate In Place** | 远距离操控物体 | 像有只无形的"幽灵手"直接抓住物体 |

<span style="color: blue; font-weight: bold;">推荐</span>：**Pull Interactable To Hand**，用户体验最自然。

### Time out Snap Zone

当选择 **Pull Interactable To Hand** 类型时：

1. 在 **Optional Components** 下找到 **Time out Snap Zone**
2. 点击 **Fix** 再点击 **Create**
3. 增加功能：松开手后等待一定秒数，物体自动回到初始位置

**控制返回时间**：设置 **Snap Interactor** 中的 **Time out** 参数。

---

## 触碰物体交互

### 配置步骤

1. 添加近距离抓取交互组件后，**删除**物体原先的 **Grabbable** 脚本
2. 在 **ISDK_HandGrabInteraction** 子物体上添加 **InteractableUnityEventWrapper** 脚本
3. 将 **HandGrabInteractable** 引用到 **Interactable View** 参数上

### 应用场景

可以配置 **WhenHover** 事件获取物体被手触碰的时机，用于：
- 触发高亮效果
- 播放音效
- 启动某些交互逻辑

---

## 性能优化要点

### 渲染批次优化

| 技术 | 适用场景 |
|------|----------|
| 动态批次 | 大量小型相同材质物体 |
| 静态批次 | 不移动的物体 |
| GPU Instancing | 大量相同网格物体（树木、石头等） |
| SRP Batcher | URP/HDRP 管线优化 |

### 贴图优化

- XR 一体机建议贴图 **Max Size 设为 1024**
- 启用 **Mipmap** 减少带宽浪费
- 使用压缩格式（ASTC/ETC2）

### 内存优化

- 定期调用 `Resources.UnloadUnusedAssets()`
- 使用 `StringBuilder` 拼接字符串
- 避免在 `Update` 中使用 LINQ
- 禁用正式版本的 `Debug.Log`

---

## 常见问题与解决

### SDK 导入报错

如果导入 **Meta XR Core SDK** 报错：
```
Library\PackageCache\com.meta.xr.sdk.core@xxx\Editor\MetaXRSimulator\XRSimInstallationDetector.cs(87,29):
```

**解决方案**：打开 **Package Manager**，在 **In Project** 中找到 **Unity Version Control**，点击 **Version History**，选择带有 **Recommended** 的版本，点击 **Update**。

### 项目验证失败

如果 **Project Validation** 有红色警告：
1. 使用 **Project Setup Tool** 的 **Fix All** 功能
2. 检查 **XR Plug-in Management** 配置
3. 确保所有平台（安卓/PC）都已正确配置

### 交互不工作

1. 检查物体是否有正确的 **Rigidbody** 组件
2. 确认 **Layer** 设置正确（需要包含在交互系统的 Layer 配置中）
3. 查看 **Frame Debugger** 检查渲染事件

---

## 总结

Unity XR 开发主要流程：

1. **环境搭建**：创建 URP 项目 → 切换安卓平台 → 配置 XR Plugin → 导入 SDK → 环境修复
2. **交互开发**：添加玩家物体 → 配置抓取交互 → 录制手势 → 远距离抓取
3. **性能优化**：批次处理 → 贴图优化 → 内存管理

<span style="color: blue; font-weight: bold;">核心建议</span>：使用 Meta 提供的 Building Block 快速原型开发，深入理解 Interaction SDK 的组件架构，遇到问题多查看官方文档和 Frame Debugger。

---

## 参考资源

- [Meta XR SDK 官方文档](https://developer.oculus.com/documentation/unity/)
- [Unity XR Interaction Toolkit](https://docs.unity3d.com/Packages/com.unity.xr.interaction.toolkit@latest/)
- [OpenXR 官方规范](https://www.khronos.org/openxr/)

---

*本文整理自 Unity XR 训练营学习资料，结合 Meta XR SDK 与 Interaction SDK 实战经验。如有疑问欢迎交流！*
