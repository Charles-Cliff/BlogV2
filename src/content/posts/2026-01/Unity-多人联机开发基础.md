---
title: Unity Netcode for GameObjects 多人联机开发基础
published: 2026-01-25T20:00:00
updated: 2026-01-25T20:00:00
draft: false
description: 详细讲解Unity多人联机开发的核心概念，包括权威同步、Client-Server-Host架构、NetworkVariable与RPC的使用方法。
image: ""
tags:
  - Unity
  - XR
  - 多人联机
  - Netcode
  - Netcode-for-GameObjects
lang: zh-CN
pinned: false
prerenderAll: true
---

## 前言

多人联机是 XR 开发中的重要方向，可以让多个用户在同一个 MR 空间中协作。本文基于 Unity XR 训练营资料，系统讲解 Unity 多人联机开发的核心概念与 Netcode for GameObjects 的使用方法。

---

## 核心概念：空间对齐与权威

### 空间对齐

**为什么需要对齐？**

假设同一个现实空间有两个玩家，玩家在 Unity 中的初始坐标都是 (0, 0, 0)。但玩家戴上头显时，头显在现实中的初始位置和朝向决定了玩家的 Unity 原点位置和朝向。

| 问题 | 后果 |
|------|------|
| 玩家 A 在自己的 (0, 0, 1) 发射子弹 | 如果同步到玩家 B 的世界，B 看到的子弹在实际位置上对不上 |
| 需要统一的坐标系 | 才能保证 A 和 B 看到的东西在现实中一致 |

### 权威（Authority）

| 概念 | 说明 |
|------|------|
| **权威** | 谁拥有最终决定权 |
| **服务端** | 就是权威，最终由它说了算 |
| **权威同步** | 同步权威判定后的结果 |

### Client、Server、Host 区别

| 角色 | 说明 |
|------|------|
| **Client（客户端）** | 玩家本人，作为当事人操作 |
| **Server（服务端）** | 规则本身，作为裁判判定结果 |
| **Host** | Server + Client 在同一台设备，一边当玩家一边当裁判 |

<span style="color: orange; font-weight: bold;">Host 写逻辑需要区分 Server/Client</span>

### 权威规则示例

**错误做法**：
- Client 自己改血量、位置、状态 ✗
- Client 自己判定命中 ✗

**正确流程**：

```
Client（玩家）发射子弹
↓
Server 判断子弹有没有命中
↓
得出结果：命中/未命中
↓
把结果同步给所有人
```

**子弹生成流程**：
```
Client 扣下扳机
↓
Client 向 Server 申请开枪
↓
Server 验证：冷却时间？弹药？状态？
↓
Server 实例化子弹物体
↓
Server 把子弹同步给 Client
```

<span style="color: blue; font-weight: bold;">核心原则</span>：写代码前想好这段代码是在当玩家，还是当裁判。凡是能够影响别人结果的，都是由 Server 进行生成和判定。

---

## 联机框架选择

| 框架 | 费用 | 特点 |
|------|------|------|
| **Unity Netcode for Gameobjects（NGO）** | 免费 | Unity 官方维护，学习资料多，可自建服务器或使用云服务器 |
| **Mirror** | 免费，开源 | 写法与 NGO 相似，教程少，只能自建服务器 |
| **Photon** | 商业 | 免费版最大 20 人同时在线，只能用官方云服务 |

---

## Netcode for GameObjects 安装配置

### 安装

在 **Unity Package Manager** 的 **Unity Registry** 搜索 **Netcode for Gameobjects**，进行安装。

### 基础配置

1. 在场景中新增一个空物体（如 `Network Manager`）
2. 在物体上添加 **NetworkManager** 脚本
3. 一个场景只能有一个 NetworkManager 脚本
4. 在 NetworkManager 的 **Network Transport** 处选择 **Unity Transport** 作为网络传输层

### 多实例调试工具 ParrelSync

**下载**：https://github.com/VeriorPies/ParrelSync

1. 下载 unitypackage 并导入 Unity
2. 点击菜单栏 **ParrelSync > Clone Manager** 克隆 Unity 工程
3. **Open In New Editor** 打开
4. 可在多个相同工程里模拟不同客户端/服务端
5. 主工程修改后克隆的工程会同步修改

---

## 常用组件

### NetworkManager

整个联机世界的开关，负责：
- 启动 Server / Client / Host
- 管理玩家连接
- 管理 Player Prefab
- 管理网络生命周期

### Player Prefab

每个客户端玩家在联机世界中代表自己的游戏对象，相当于自己在联机世界的化身。

在 **NetworkManager** 组件的 **Player Prefab** 字段中进行指定。

### NetworkObject

联机世界的身份证，允许物体进入联机世界。

### NetworkBehaviour

| 类 | 说明 |
|---|------|
| MonoBehaviour | 单机逻辑 |
| NetworkBehaviour | 联机逻辑 |

继承自 NetworkBehaviour 的脚本能够处理联机逻辑。

---

## NetworkVariable

### 特点

| 特点 | 说明 |
|------|------|
| 用途 | 用于同步状态，无法同步行为 |
| 可同步 | 血量、子弹数量、是否死亡 |
| 不可同步 | 开枪动作、播放动画 |

### 工作机制

- **自动同步**：值改变后，NGO 自动处理网络通信（只有值变化后才同步，不是每帧同步）
- **状态同步**：中途加入的客户端会自动同步服务器的当前状态
- **变更回调**：提供 OnValueChanged 事件，可在值改变时执行自定义逻辑

### 代码写法

```csharp
// 权威规则
// Server 写（只能服务端修改数值，修改后所有客户端会自动同步）
// Client 读

public class HealthSystem : NetworkBehaviour
{
    public NetworkVariable<int> health = new NetworkVariable<int>(100);

    // Server 端修改
    public void TakeDamage(int damage)
    {
        health.Value -= damage; // 只有 Server 有权限
    }
}
```

### 常见错误

**错误一：Client 直接改 NetworkVariable**

```csharp
// ❌ 错误：客户端自己执行
health.Value -= 100;

// 后果：客户端没有权利判定结果
```

**错误二：用 NetworkVariable 同步瞬时事件**

```csharp
// ❌ 错误：开枪是瞬时事件，不是长期状态
isShooting.Value = true;

// 后果：玩家一直维持开枪状态
```

**错误三：每帧修改 NetworkVariable**

```csharp
// ❌ 错误：Update 里不断改血量
void Update()
{
    health.Value = currentHealth;
}

// 后果：性能消耗大
```

<span style="color: blue; font-weight: bold;">XR 输入同步例外</span>：XR 中需要实时同步头显、手柄输入到远端 Player，这是输入流需要持续更新。

### IsOwner 含义

**我有没有资格发请求**。当前生成的 Player 是不是由我这个客户端控制的。

例如：客户端 A 先加入，然后客户端 B 加入。A 的世界里生成了代表 B 的 Player，但 A 客户端的这个 B 不归 A 管，所以不会触发 Move。而 B 世界里生成的 B 归自己管，所以一生成就调用 Move。

### IsOwner 和 IsLocalPlayer 区别

| 参数 | 说明 |
|------|------|
| IsOwner | 当前客户端是否拥有这个 NetworkObject |
| IsLocalPlayer | 是否是本地玩家 |

---

## RPC（Remote Procedure Call）

RPC 是联机世界的对话方式，一般用于**瞬时的动作或事件**（玩家开枪、播放音效、触发爆炸）。

### ServerRPC（Client → Server）

客户端向服务端发起请求，执行的代码在服务端执行。

```csharp
[ServerRpc]
void ShootServerRpc()
{
    // 执行在服务端
    Debug.Log("Server 处理开枪逻辑");
}
```

### ClientRPC（Server → Client）

服务端向客户端发起通知。

```csharp
[ClientRpc]
void ExplodeClientRpc()
{
    // 执行在所有客户端
    PlayExplosionEffect();
}
```

---

## 官方新手入门样例

### HelloWorldPlayer 与 HelloWorldManager

**执行流程**：

```
Client 按按钮
↓
ServerRpc
↓
Server 决定位置
↓
NetworkVariable 同步结果
↓
所有 Client 更新显示
```

---

## 总结

| 概念 | 核心要点 |
|------|----------|
| **空间对齐** | MR 多人联机需要统一坐标系 |
| **权威** | Server 说了算，Client 只负责申请和显示 |
| **NetworkVariable** | 同步状态，Server 写 Client 读 |
| **RPC** | 瞬时动作/事件，ServerRpc/ClientRPC |

<span style="color: blue; font-weight: bold;">核心原则</span>：写代码前想好是在当玩家还是当裁判。影响别人结果的逻辑，必须由 Server 执行。

---

## 参考资源

- [Netcode for GameObjects 官方文档](https://docs.unity3d.com/Packages/com.unity.netcode@latest/)
- [ParrelSync 多开工具](https://github.com/VeriorPies/ParrelSync)

---

*本文整理自 Unity XR 训练营学习资料。*
