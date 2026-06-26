---
title: Unity MR透视与传送门开发指南
published: 2026-01-15T20:00:00
updated: 2026-01-15T20:00:00
draft: false
description: 详细讲解Unity MR透视开发的核心技术，包括Passthrough配置、深度测试原理、MR传送门实现（Depth Only Shader与模板测试Stencil两种方案）。
image: ""
tags:
  - Unity
  - XR
  - Meta-Quest
  - MR
  - 透视开发
  - Shader
  - Stencil
lang: zh-CN
pinned: false
prerenderAll: true
---

## 前言

MR（混合现实）透视技术让虚拟物体与现实环境融为一体，是当前 XR 开发的热点方向。本文基于 Unity XR 训练营资料，详细讲解 MR 透视开发的核心技术，包括基础配置、深度测试原理、以及 MR 传送门的实现方案。

---

## 透视基础配置

### 1. 添加 Passthrough 模块

在 **Building Blocks** 中找到 **Passthrough** 模块，拖到场景中。

### 2. 配置 Camera Rig

在玩家物体（CameraRig）上的 **OVRManager** 脚本中进行配置。

### 3. 配置相机背景

在玩家物体的相机（CenterEyeAnchor）中：
- **Camera 组件的 Background Type** 设为 **Solid Color**
- **Background 颜色** RGB 设为 **0**，透明度（A）设为 **0**

### 4. 关闭 MR 安全边界

#### 方法一：在 AndroidManifest 中配置

在 `Assets/Plugins/Android/AndroidManifest.xml` 中添加：

```xml
<uses-feature android:name="com.oculus.feature.BOUNDARYLESS_APP" android:required="true"/>
```

#### 方法二：彻底关闭 Quest 安全边界

在头显中：**设置 > 开发者 > 实际空间功能**

<span style="color: red; font-weight: bold;">注意</span>：关闭后头显录屏里的现实环境是黑的。

---

## 透视材质

### 创建透视材质

1. 新建一个 **Material** 材质
2. Shader 参数设为 **Oculus/SelectivePassthrough**

### Render Queue 规则

透视材质的 **Render Queue** 一般需要 **大于 2000**。

| 规则 | 说明 |
|------|------|
| Unity 不透明物体默认 Render Queue | 2000 |
| 透视物体在后方时 | 需要先渲染不透明物体，再渲染透视物体 |
| Render Queue 越大 | 越后渲染 |

### 天空盒设置

打开 **Window > Rendering > Lighting**，将 **Environment** 下的 **skybox material** 设为 **None**。

这样才能看到正确的透视物体和不透明物体的前后遮挡关系。

---

## 深度与渲染队列基础

### 深度（Depth）

**深度** = 物体离摄像机的远近，决定谁在前、谁在后，是实现正确遮挡关系的基础。

### 深度测试（Depth Test）

"谁近谁赢"的淘汰规则：

1. 当一个像素想被画到屏幕上时
2. 它将自己的深度值与深度缓冲区中当前存储的值进行比较
3. 如果它"更近"，通过测试，颜色显示并更新深度缓冲区
4. 如果它"更远"，被淘汰，颜色不绘制

### Render Queue

**Render Queue** = 渲染队列，决定物体渲染顺序。值越大，越后渲染。

---

## MR 传送门：方法一 Depth Only Shader

### 核心原理

| Shader 类型 | 作用 |
|------------|------|
| **Depth Only Shader** | 只写入深度，不渲染颜色 |
| **透视材质** | 显示现实环境 |

### 渲染流程示例：MR 虚拟门窗

假设深度缓冲区比较规则是"小等于"：

**第一步**：虚拟场景先渲染，往深度缓冲区写入深度信息

**第二步**：渲染门
- 门材质为 **Depth Only Shader**
- 门深度 < 虚拟场景（门在虚拟场景前面）
- 通过深度测试，深度缓冲区更新为门的深度值
- 门本身不渲染颜色，所以重叠区域仍显示虚拟场景

**第三步**：渲染墙（透视材质）
- 墙深度 > 门（墙在门后面）
- 未通过深度测试，墙与门重叠部分不显示
- 墙深度 < 虚拟场景（墙在虚拟场景前面）
- 通过深度测试，墙与虚拟场景重叠部分渲染出墙的颜色

### 注意事项

<span style="color: blue; font-weight: bold;">重要</span>：需要用透视材质物体把人从 6 个面包裹起来，挡住外侧的虚拟场景。

如果是**室内空间**：
- 让透视材质物体与现实中的墙壁、天花板、地面贴合
- 相当于造一个和现实空间结构一样的虚拟室内空间

---

## MR 传送门：方法二 模板测试（Stencil Test）

### 模板缓冲区（Stencil Buffer）

模板缓冲区可以为屏幕上的每一个像素点保存一个值。

### 模板测试流程

1. 在渲染过程中，用模板缓冲区中保存的值与预设的**参考值（Reference Value）** 作比较
2. 根据比较结果决定是否更新相应像素点的颜色值

### 比较规则示例

设置参考值为 1，只保留值为 1 的部分：

| 条件 | 结果 |
|------|------|
| 模板缓冲区值 = 参考值 | 通过测试，显示颜色 |
| 否则 | 不显示 |

### Unity 中实现步骤

#### 第一步：添加 Stencil Shader

给传送门区域添加 **Stencil Shader**，作用：
- 不显示颜色
- 不参与深度测试
- 只在模板缓冲区中把值设为设定的 ID（如 1）

应用此材质的物体在屏幕上显示区域的**模板缓冲区值就被设为了 1**。

#### 第二步：设置虚拟世界 Layer

随便取一个 Layer 名字，方便辨识即可（如 `StencilMask1`）。

#### 第三步：配置 URP 过滤器

找到项目中使用的 **URP 配置文件（Universal Renderer Data）**：

1. 在 **Filtering > Layer Mask** 中，**取消勾选**刚才为虚拟世界设置的 Layer
2. 这样场景中就看不到虚拟世界了

#### 第四步：添加 Renderer Feature

在 URP 配置文件中添加 **Renderer Feature**：

1. 点击 **Add Renderer Feature**
2. 选择 **Render Objects**

配置参数：

| 参数 | 值 | 说明 |
|------|-----|------|
| Layer Mask | 虚拟世界的 Layer | 控制哪些物体 |
| Stencil Value | 与 Stencil Shader 一致（如 1） | 参考值 |
| Compare Function | **Equal** | 只渲染Stencil值为1的部分 |
| 其他值 | **Keep** | 保持原值 |

### 核心原理

在 Layer 为 `StencilMask1` 的物体中，**只渲染 Stencil 值为 1 的部分**。

什么部分 Stencil 值为 1？
= **传送门区域与虚拟世界在屏幕上重合的部分**

因为传送门区域的材质为 Stencil Shader，限定了该显示区域的 Stencil 值为 1。

---

## 两种方法对比

| 方法 | 优点 | 缺点 |
|------|------|------|
| **Depth Only Shader** | 简单直接 | 需要物体把人 6 面包裹 |
| **Stencil Test** | 灵活，可做任意形状 | 配置较复杂 |

---

## 常见问题

### 透视物体不透明

1. 检查 **Render Queue** 是否 > 2000
2. 检查天空盒是否已关闭（设为 None）
3. 检查 Camera 的 Background Type 是否为 Solid Color

### 安全边界弹窗

1. 在 AndroidManifest 中添加 `BOUNDARYLESS_APP` 配置
2. 或在头显设置中彻底关闭

### 深度测试不工作

1. 检查 Camera 的 **Depth Texture** 是否开启
2. 检查各物体的 **Render Queue** 设置
3. 确保渲染顺序正确（先不透明物体，再透视物体）

---

## 总结

MR 透视开发要点：

1. **基础配置**：Building Blocks Passthrough → OVRManager → 相机背景 → 关闭安全边界
2. **透视材质**：Oculus/SelectivePassthrough，Render Queue > 2000
3. **Depth Only Shader**：只写深度不写颜色，实现虚拟物体与现实环境遮挡
4. **Stencil Test**：更灵活，可以实现任意形状的传送门效果

<span style="color: blue; font-weight: bold;">选择建议</span>：
- 简单场景用 **Depth Only Shader**
- 复杂形状（如圆形、异形传送门）用 **Stencil Test**

---

## 参考资源

- [Meta 官方文档：Boundaryless](https://developers.meta.com/horizon/documentation/unity/unity-boundaryless/)
- [Unity 官方：Shader Render Queue](https://docs.unity3d.com/cn/current/Manual/SL-SubShaderTags.html)
- [URP Renderer Feature](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@latest/)

---

*本文整理自 Unity XR 训练营学习资料，结合 MR 透视与传送门开发实战经验。*
