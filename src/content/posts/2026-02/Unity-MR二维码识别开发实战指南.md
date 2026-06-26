---
title: Unity MR二维码识别开发实战指南
published: 2026-02-09T20:00:00
updated: 2026-02-09T20:00:00
draft: false
description: 详细讲解Unity MR开发中如何实现二维码识别追踪，涵盖Meta摄像头API配置、ZXing插件集成、稳定识别框架等内容。
image: ""
tags:
  - Unity
  - XR
  - Meta-Quest
  - MR
  - 二维码识别
  - PassthroughCamera
lang: zh-CN
pinned: false
prerenderAll: true
---

## 前言

二维码识别是 MR 开发中的重要技术，可以用于室内导航、物体定位、多人协作等场景。本文基于 Unity XR 训练营资料，详细讲解如何在 Meta Quest 设备上实现二维码识别与追踪功能。

---

## 摄像头 API 基础

### 前置要求

| 要求 | 说明 |
|------|------|
| Quest 系统版本 | v74 及以上（推荐 v81+） |
| 设备 | Quest 3 或 Quest 3s |
| 分辨率 | 最大 1280x1280（v83+） |
| 图像延迟 | 40-60 ms |

<span style="color: orange; font-weight: bold;">注意</span>：从 v76 开始，使用摄像头 API 的应用已支持上架 Quest 商店。

<span style="color: red; font-weight: bold;">限制</span>：
- 目前不适合处理移动对象
- 不适合识别小的或远的图像和文本
- SDK 目前无法在串流模式下生效，需要打包到头显测试

### 官方样例工程

**PassthroughCameraApiSamples**
- CameraViewer：将摄像头画面渲染到 RawImage
- CameraToWorld：相机坐标转世界坐标
- BrightnessEstimation：环境亮度估计
- MultiObjectDetection：AI 语义物体识别（Unity Sentis）
- ShaderSample：虚拟水面倒影特效

**Quest Vision Kit**
- Color Picker：吸取现实颜色转虚拟画笔
- Object Detection：AI 语义识别
- QR Code Tracking：二维码识别追踪（ZXing）
- Shader Samples：毛玻璃特效
- OpenAI Vision：基于 GPT 的视觉助手
- WebRTC Streaming：网络串流摄像头画面

---

## 核心脚本：PassthroughCameraAccess

Meta XR SDK V81+ 将摄像头 API 集成到了 MRUK 开发包中，使用统一的 **PassthroughCameraAccess** 脚本。

### 配置步骤

#### 步骤一：添加脚本

通过 **Building Block** 快速添加：
1. 菜单栏 **Meta > Tools > Building Blocks**
2. 点击 **Passthrough** 标签
3. 拖入 **Passthrough Camera Access** 模块

会自动添加：
- `[BuildingBlock] Passthrough Camera Access` — 核心脚本
- `[BuildingBlock] Passthrough Camera Visualizer` — 摄像画面渲染 Quad

#### 步骤二：添加透视模块（可选）

透视场景下使用摄像头 API 是常见场景，但纯 VR 场景也可以使用，根据项目需求决定是否添加。

#### 步骤三：环境修复

**Meta XR Tools > Project Setup Tool**：
- 在安卓端和 PC 端点击 **Fix All** 和 **Apply All**
- 主要消除红色警告

#### 步骤四：检查 OVRManager

在玩家物体（Camera Rig）的 **OVRManager** 脚本中，确保 **Enable Passthrough Camera Access** 已勾选。

#### 步骤五：请求摄像头权限

<span style="color: red; font-weight: bold;">重要</span>：第一次打开程序会弹出权限请求，用户必须点击允许。

**方法一：勾选权限自动请求**

在 OVRManager 的 **Permission Request On Startup** 下勾选：
- **Passthrough Camera Access** — 摄像头访问权限
- **Scene** — 空间数据权限（二维码定位需要）

<span style="color: blue; font-weight: bold;">注意</span>：如果点击拒绝，后续不会再次弹窗且无法获取画面。

**方法二：代码调用**

```csharp
using UnityEngine;
using Meta.XR.MRUK;

public class RequestCameraPermissions : MonoBehaviour
{
    private void Awake()
    {
        OVRPermissionsRequester.Request(new[]
        {
            OVRPermissionsRequester.Permission.Scene,
            OVRPermissionsRequester.Permission.PassthroughCameraAccess
        });
    }
}
```

#### 步骤六：检查 AndroidManifest

确保 `Assets/Plugins/Android/AndroidManifest.xml` 中包含：
```xml
<uses-permission android:name="com.oculus.permission.HEADSET_CAMERA" />
```

如没有，运行 **Meta > Tools > Update AndroidManifest.xml** 自动更新。

---

## 二维码识别样例

### 官方工程

**Quest Vision Kit**：https://github.com/xrdevrob/QuestCameraKit

### 配置步骤

#### 1. 下载工程并打开

克隆或下载 GitHub 工程，用 Unity 打开。

#### 2. 解决报错

首次打开可能报错，选择 **Ignore** 忽略。

#### 3. 下载 ZXing 插件

1. 下载：https://github.com/micjahn/ZXing.Net/releases/tag/v0.16.10.0
2. 解压后找到 `unity/zxing.unity.dll`
3. 复制到 `Assets/Plugins/` 文件夹

#### 4. 配置 ZXingDefineSymbolChecker

打开脚本，修改 `HasZXingDLL` 方法：

```csharp
private static bool HasZXingDLL()
{
    var files = Directory.GetFiles(Application.dataPath, "*ZXing.dll", SearchOption.AllDirectories)
                         .Concat(Directory.GetFiles(Application.dataPath, "*zxing.dll", SearchOption.AllDirectories))
                         .Concat(Directory.GetFiles(Application.dataPath, "*zxing.unity.dll", SearchOption.AllDirectories));
    Debug.Log($"Has ZxingDLL:{files.Any()}");
    return files.Any();
}
```

保存后等待编译完成，自动生成 **ZXING_ENABLED** 符号。

如未自动生成，手动在 **Edit > Project Settings > Player > Other Settings > Scripting Define Symbols** 中添加。

#### 5. 配置权限

在 **OVRManager** 的 **Permission Requests On Startup** 下勾选 **Passthrough Camera Access**。

#### 6. 打包测试

确保头显系统版本为 v81+，打包测试。

---

## 移植到自己的项目

### Unity 6 之前的版本

XR Plug-in Management 安卓端勾选 **Oculus**

### Unity 6 及以上

1. XR Plug-in Management 安卓端勾选 **OpenXR**
2. 导入包：`com.unity.xr.meta-openxr`

### 移植文件

1. `zxing.unity.dll` → `Assets/Plugins/`
2. `Assets/Samples/QRCodeTracking` → 自己的项目
3. `Assets/Samples/Common` → 自己的项目

### 检查项

- [ ] ZXING_ENABLED 符号已配置
- [ ] OVRManager 的 Passthrough Camera Access 已勾选

---

## 二维码稳定识别框架

样例工程的缺陷：识别位置稳定，但旋转角度不稳定。

**解决思路**：多次采样位姿数据，进行平均滤波。

### 框架集成包

核心物体：

| 物体 | 说明 |
|------|------|
| **QrCodeStasticDisplayManager** | 稳定识别核心算法 |
| **CustomQRCodeMarkerSpawner** | 指定二维码和生成的物体 |
| **ResetStableController** | 处理重定位后重新扫码 |

次要物体（空间锚点相关）：

| 脚本 | 说明 |
|------|------|
| **QRCodeTrackEvent** | 提供事件，OnImageStabilized 为稳定后调用 |
| **CustomQRCodeMarkerControllerBase** | 继承并重写 ShowObjByGivenPose |

### 实际项目需求

1. **指定二维码识别**：只识别特定二维码
2. **多二维码分组**：场地内多个二维码，同组只识别一个
3. **重定位恢复**：重定位后重新扫码恢复定位
4. **空间锚点保存**：借助空间锚点固定虚拟场景
5. **关闭扫码节省性能**：识别成功后关闭扫码功能

### 二维码坐标轴朝向

MR 大空间扫码通常是：
- **竖直码**：贴在墙上，Z 轴垂直于二维码平面
- **水平码**：贴在桌上，Y 轴朝上

**配置规则**：
- 竖直码：虚拟场景 Z 轴与二维码法线朝向一致
- 水平码：虚拟场景 Z 轴与二维码 Y 轴一致

---

## 常见问题

### 权限弹窗没出现

1. 检查 OVRManager 的 Permission Request On Startup 是否勾选
2. 使用代码手动请求权限
3. 在头显 **设置 > 隐私与安全 > 应用权限 > 头戴设备摄像头** 手动开启

### 摄像头画面显示白色

1. 检查 AndroidManifest 是否有摄像头权限
2. 运行 Project Setup Tool 的 Fix All
3. 检查 OVRManager 的 Enable Passthrough Camera Access 是否勾选

### 二维码识别不稳定

使用稳定识别框架，进行多次采样滤波。

### 空间锚点保存失败

- 需要设备账号开启双重身份认证
- 手机 APP 需要开启开发者模式
- 代激活/租的设备可能无法使用空间锚点

---

## 总结

二维码识别 MR 开发流程：

1. **环境配置**：安装 MRUK → 配置 PassthroughCameraAccess → 请求权限
2. **集成 ZXing**：下载插件 → 配置符号 → 打包测试
3. **稳定识别**：使用滤波框架 → 处理重定位 → 空间锚点辅助
4. **性能优化**：识别成功后关闭扫码

<span style="color: blue; font-weight: bold;">核心建议</span>：从官方样例工程开始学习，逐步移植到自己的项目。二维码识别涉及坐标转换、位姿滤波等多个环节，需要多调试理解原理。

---

## 参考资源

- [Quest Vision Kit](https://github.com/xrdevrob/QuestCameraKit)
- [ZXing.Net](https://github.com/micjahn/ZXing.Net)
- [Meta XR SDK 文档](https://developer.oculus.com/documentation/unity/)

---

*本文整理自 Unity XR 训练营学习资料，结合 Meta 官方样例与稳定识别框架实战经验。*
