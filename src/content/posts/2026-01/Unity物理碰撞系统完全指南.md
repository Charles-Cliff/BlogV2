---
title: Unity物理碰撞系统完全指南
published: 2026-01-09T20:00:00
updated: 2026-01-09T20:00:00
draft: false
description: 详细讲解Unity物理碰撞系统的核心概念，包括刚体与碰撞体的区别、常用属性设置、Mesh Collider使用以及碰撞检测条件。
image: ""
tags:
  - Unity
  - 物理系统
  - Rigidbody
  - Collider
  - Mesh-Collider
  - 碰撞检测
lang: zh-CN
pinned: false
prerenderAll: true
---

## 前言

物理碰撞是 Unity 游戏开发中的核心系统之一，正确理解和使用物理碰撞能让游戏交互更加真实自然。本文基于 Unity XR 训练营资料，系统讲解 Unity 物理碰撞系统的核心概念与实际应用。

---

## 核心概念：刚体与碰撞体

### 刚体（Rigidbody）

让游戏对象受物理引擎驱动，模拟质量、重力、受力运动。

### 碰撞体（Collider）

定义游戏物体的物理形状和边界，用于碰撞检测，是几何上的碰撞体积。

### 协同工作

| 组件 | 作用 |
|------|------|
| **刚体** | 提供动力 |
| **碰撞体** | 提供可碰撞的形体 |

两者协同工作：刚体提供物理驱动力，碰撞体提供可碰撞的形状。

---

## 刚体重要属性

### 1. 质量（Mass）

决定物体的惯性。质量越大的物体：
- 越难被推动
- 碰撞时产生的动量越大

<span style="color: orange; font-weight: bold;">注意</span>：应根据物体大小合理设置质量比例，避免失衡。

### 2. 阻力与角阻力（Drag / Angular Drag）

| 属性 | 作用 |
|------|------|
| **Drag** | 影响物体直线移动时的阻力 |
| **Angular Drag** | 影响物体旋转时的阻力 |

数值越大，物体运动衰减越快。

### 3. 使用重力（Use Gravity）

勾选后，对象会受到持续向下的重力影响。

### 4. 是否运动学（Is Kinematic）

<span style="color: red; font-weight: bold;">关键属性</span>

启用后：
- 刚体不再受物理力（重力、碰撞力）的影响
- 只能通过直接设置 Transform（位置、旋转）来移动

**适用场景**：
- 移动平台
- 开关门
- 由动画或脚本精确控制的物体

### 5. 碰撞检测模式（Collision Detection）

| 模式 | 说明 | 性能 |
|------|------|------|
| **Discrete（离散）** | 默认模式，可能导致高速物体"穿模" | 低 |
| **Continuous（连续）** | 适合高速物体 | 中 |
| **Continuous Dynamic** | 动态物体使用连续检测 | 高 |

<span style="color: blue; font-weight: bold;">建议</span>：对于高速移动的物体（如子弹），使用 Continuous 或 Continuous Dynamic 以确保碰撞准确。

### 6. 约束（Constraints）

可以"冻结"对象在特定方向上的移动或旋转。

**示例**：2D 游戏角色
- 冻结 Z 轴移动（防止前后移动）
- 冻结 X、Y 轴旋转（防止倾斜）

---

## 碰撞体重要属性

### Is Trigger

勾选后碰撞体成为**触发器**：
- 不再具有物理阻挡作用
- 其他物体可以穿过它
- 会触发特定事件

**事件函数**：
- `OnTriggerEnter` — 进入触发器时
- `OnTriggerStay` — 停留在触发器时
- `OnTriggerExit` — 离开触发器时

**适用场景**：
- 收集物品
- 检测玩家进入特定区域（检查点、陷阱）
- 触发区域事件

---

## Mesh Collider（网格碰撞体）

### 工作原理

Mesh Collider 根据模型的网格信息生成对应形状的碰撞体：
- Mesh 参数引用的是模型的网格
- 与 Mesh Filter 中的 Mesh 参数相同
- 模型网格由许多三角面组成
- Mesh Collider 给每个三角面添加碰撞体

### 特点

| 优点 | 缺点 |
|------|------|
| 碰撞体更精确表示模型形状 | 性能消耗增大 |

### Convex 参数

如果带有 Mesh Collider 的物体身上有刚体，需要**勾选 Convex** 参数才能让刚体拥有物理效果。

**Convex** = 凸体：
- 会填充模型网格凹进去的部分
- 最多支持 **255 个三角面**
- 模型面数太大不适合用 Mesh Collider

---

## 碰撞发生的条件

### 碰撞 vs 触发器

| 类型 | 效果 | 应用 |
|------|------|------|
| **碰撞（Collision）** | 产生阻挡，可传递力 | 物理碰撞、弹跳、阻挡 |
| **触发器（Trigger）** | 无阻挡，触发事件 | 收集物品、区域检测 |

### 碰撞的条件

1. **两个物体都要有 Collider**
2. **至少一个物体有 Rigidbody**
3. **物体间有相对运动**（或其中一个受重力影响）

### 触发器的条件

| 条件 | 说明 |
|------|------|
| 两个物体都有 Collider | 碰撞体存在 |
| 至少一个物体有 Rigidbody | 提供物理引擎驱动 |
| 至少一个 Collider 勾选 Is Trigger | 触发器模式 |

---

## 代码示例

### 碰撞检测

```csharp
public class CollisionExample : MonoBehaviour
{
    void OnCollisionEnter(Collision collision)
    {
        Debug.Log($"碰撞到: {collision.gameObject.name}");
    }

    void OnCollisionStay(Collision collision)
    {
        Debug.Log($"持续碰撞中: {collision.gameObject.name}");
    }

    void OnCollisionExit(Collision collision)
    {
        Debug.Log($"碰撞结束: {collision.gameObject.name}");
    }
}
```

### 触发器检测

```csharp
public class TriggerExample : MonoBehaviour
{
    void OnTriggerEnter(Collider other)
    {
        Debug.Log($"触发器进入: {other.gameObject.name}");
    }

    void OnTriggerStay(Collider other)
    {
        Debug.Log($"触发器停留中: {other.gameObject.name}");
    }

    void OnTriggerExit(Collider other)
    {
        Debug.Log($"触发器离开: {other.gameObject.name}");
    }
}
```

---

## XR 开发中的物理碰撞

### Quest 中的注意事项

1. **碰撞检测模式**：XR 交互物体多为中低速，Discrete 足够
2. **Mesh Collider 慎用**：MR 场景复杂，Mesh Collider 性能开销大
3. **使用 Compound Collider**：多个简单碰撞体组合代替复杂网格碰撞体
4. **关闭不必要的物理**：静态物体不启用刚体

### XR 交互建议

| 交互类型 | 碰撞体建议 |
|----------|------------|
| 抓取物体 | 使用 Capsule Collider 或 Box Collider |
| 手柄射线检测 | 使用 Raycast 或 Sphere Collider |
| 区域触发 | 使用 Trigger Collider |

---

## 常见问题

### 物体穿模

- 使用 Continuous 碰撞检测
- 或降低物体移动速度
- 增加碰撞体大小

### 碰撞不触发

- 检查两个物体是否都有 Collider
- 检查至少一个物体是否有 Rigidbody
- 确保不是两个都是 Kinematic

### Trigger 不触发

- 检查 Collider 是否勾选 Is Trigger
- 确保至少一个物体有 Rigidbody

### Mesh Collider 不生效

- 如果有 Rigidbody，必须勾选 Convex
- 检查模型面数是否超过 255

---

## 总结

| 概念 | 要点 |
|------|------|
| **刚体** | 提供物理驱动力，控制重力、受力运动 |
| **碰撞体** | 定义碰撞形状，决定碰撞检测范围 |
| **Is Kinematic** | 运动学刚体不受物理力影响 |
| **Is Trigger** | 触发器模式，触发事件但不阻挡 |
| **Mesh Collider** | 精确但性能开销大，注意 Convex 限制 |
| **碰撞检测模式** | 高速物体用 Continuous |

<span style="color: blue; font-weight: bold;">核心原则</span>：刚体提供动力，碰撞体提供形状。合理搭配使用，平衡性能与真实性。

---

## 参考资源

- [Unity 官方文档：Rigidbody](https://docs.unity3d.com/cn/current/Manual/class-Rigidbody.html)
- [Unity 官方文档：Colliders](https://docs.unity3d.com/cn/current/Manual/class-Collider.html)
- [Unity 官方文档：Physics Overview](https://docs.unity3d.com/cn/current/Manual/PhysicsOverview.html)

---

*本文整理自 Unity XR 训练营学习资料。*
