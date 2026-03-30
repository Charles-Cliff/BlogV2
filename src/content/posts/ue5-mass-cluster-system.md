---
title: UE5 Mass集群系统详解 — 大规模人群模拟解决方案
published: 2026-03-30T12:31:00
description: '深入解析Unreal Engine 5的Mass集群系统，从架构设计到实战应用，帮你快速掌握大规模人群模拟技术。'
image: ''
tags: ["Unreal Engine", "Mass", "集群模拟", "ECS", "游戏开发"]
category: 技术教程
draft: false
lang: ''
pinned: false
prerenderAll: true
---

# UE5 Mass集群系统详解 — 大规模人群模拟解决方案

## 前言

在游戏开发中，渲染大量独立个体（如城市人群、动物群体、昆虫群落）一直是性能优化的难题。传统方式下，每个AI角色都是独立的Actor，大规模场景下Draw Call和物理计算会成为灾难。

UE5给出的答案是——**Mass**。

Mass是Epic官方推出的**Entity Component System (ECS)** 架构的人群模拟框架，专为大规模集群设计。本文带你从零理解Mass的设计思想，并手把手实现一个简单的集群效果。

---
![Mass集群系统架构](/images/mass-architecture-20260330.png)
## 什么是Mass？

Mass是UE5内置的**大规模实体模拟框架**，核心特点是：

| 特性 | 说明 |
|------|------|
| **ECS架构** | 数据与逻辑分离，缓存友好 |
| **GPU Driven** | 支持GPU实例化渲染 |
| **可扩展** | 自定义Fragment处理复杂行为 |
| **高性能** | 单帧可处理数万个实体 |

简单来说：Mass让你能渲染**数万个同时运行的AI单位**，而且帧率稳定。

---

## Mass核心概念

### 1. Entity（实体）
一个唯一的ID，标识一个集群单位。不存储任何数据，只是一个Handle。

### 2. Fragment（片段）
存储实体的数据，比如：
- `FTransformFragment` — 位置、旋转、缩放
- `FStaticMeshHashMeshVISet` — 渲染数据
- 自定义Fragment存储AI状态

### 3. Trait（特征）
给Entity附加的行为逻辑，比如：
- 移动行为
- 状态机
- 渲染表现

### 4. Processing（处理）
每个系统（System）处理特定的Fragment数据，按阶段顺序执行。

---

## 项目配置

### 启用Mass插件

在 `Edit > Plugins` 中启用：
- **MassEntity** — 核心框架
- **MassSmartObject** — 智能物体交互
- **MassCrowd** — 人群可视化（可选）

重启编辑器后生效。

### 创建Mass处理器的模块

Mass处理器需要在C++模块中注册。如果你的项目没有Gameplay框架，需要先创建：

```cpp
// .uproject 添加依赖
"MassEntity": { "Enabled": true },
"MassCrowd": { "Enabled": true }
```

---

## 实战：创建一个简单的集群效果

### 步骤1：定义Fragment

```cpp
// MyMassFragments.h
#pragma once
#include "CoreMinimal.h"
#include "MassEntityTypes.h"
#include "MyMassFragments.generated.h"

// 位置和移动数据
USTRUCT()
struct FMyMovementFragment : public FMassFragment
{
    GENERATED_BODY()

    FVector Velocity = FVector::ZeroVector;
    float Speed = 100.f;
};

// 外观数据
USTRUCT()
struct FMyVisualFragment : public FMassFragment
{
    GENERATED_BODY()

    UStaticMesh* Mesh = nullptr;
    FLinearColor Color = FLinearColor::White;
};
```

### 步骤2：创建System

```cpp
// MyMassSystem.h
#pragma once
#include "CoreMinimal.h"
#include "MassEntityTypes.h"
#include "MassProcessor.h"
#include "MyMassSystem.generated.h"

// 移动处理系统
UCLASS()
class UMyMovementSystem : public UMassProcessor
{
    GENERATED_BODY()

public:
    UMyMovementSystem();

protected:
    // 配置Boss运行（可选）
    virtual void ConfigureQueries() override;
    // 每帧执行
    virtual void Execute(UMassEntitySubsystem& EntitySubsystem, FMassExecutionContext& Context) override;

    // 查询所有拥有FMyMovementFragment的实体
    FMassEntityQuery EntityQuery;
};
```

```cpp
// MyMassSystem.cpp
#include "MyMassSystem.h"
#include "MyMassFragments.h"

UMyMovementSystem::UMyMovementSystem()
{
    // 在WorldTick开始时执行
    ExecutionOrder.ExecuteInGroup = EMassFragmentAccessAlgorithm::Linear;
    ExecutionOrder.Before.Add(TEXT("UrbanLODUpdate")); // 可选：取决于你想在什么阶段运行

    // 注册Fragment
    EntityQuery.AddRequirement<FMyMovementFragment>(EMassFragmentAccess::ReadWrite);
}

void UMyMovementSystem::ConfigureQueries()
{
    // 过滤条件（可选）：只处理未停止的实体
    EntityQuery.AddTagRequirement<FMyMovementFragment>(EMassFragmentPresence::All);
}

void UMyMovementSystem::Execute(UMassEntitySubsystem& EntitySubsystem, FMassExecutionContext& Context)
{
    // 获取所有满足条件的实体
    EntityQuery.ForEachEntityChunk(EntitySubsystem, Context, [this](FMassExecutionContext& Context)
    {
        // 获取Fragment数据
        TArrayView<FMyMovementFragment> MovementList = Context.GetMutableFragments<FMyMovementFragment>();

        for (int32 i = 0; i < MovementList.Num(); ++i)
        {
            FMyMovementFragment& Movement = MovementList[i];
            
            // 简单示例：让实体向前移动
            FVector Direction = FVector(1.f, 0.f, 0.f);
            Movement.Velocity = Direction * Movement.Speed;
            
            // 实际项目中，这里实现集群算法（ Reynolds规则、boids等）
        }
    });
}
```

### 步骤3：Spawn实体

```cpp
// 在GameInstance或Actor中
void USpawnerComponent::SpawnCluster()
{
    UWorld* World = GetWorld();
    UMassEntitySubsystem* MassSystem = UWorld::GetSubsystem<UMassEntitySubsystem>(World);
    
    // 配置实体数量
    const int32 ClusterCount = 1000;
    
    FMassEntityManager& EntityManager = MassSystem->GetEntityManager();
    
    // 创建批量生成配置
    FMassEntitySpawnData SpawnData;
    SpawnData.Count = ClusterCount;
    
    // 或者手动逐个创建
    for (int32 i = 0; i < ClusterCount; ++i)
    {
        FMassEntityHandle Entity = EntityManager.CreateEntity();
        
        // 初始化Fragment
        FMyMovementFragment Movement;
        Movement.Speed = 100.f + FMath::Rand() % 50.f;
        
        EntityManager.SetFragmentData(Entity, Movement);
        
        // 设置初始位置（可用FTransformFragment）
    }
}
```

---

## Mass与渲染

### 使用InstancedStaticMesh

最常见的渲染方式是配合 `InstancedStaticMeshComponent`：

```cpp
// 渲染系统示例
void UMyRenderSystem::Execute(UMassEntitySubsystem& EntitySubsystem, FMassExecutionContext& Context)
{
    // 收集所有Transform数据
    TArray<FMatrix> InstanceMatrices;
    // ... 填充矩阵数据
    
    // 更新ISM组件
    if (InstancedMesh)
    {
        InstancedMesh->SetStaticMesh(YourMesh);
        InstancedMesh->BuildRuntimeMeshIfNeeded();
        
        for (int32 i = 0; i < InstanceMatrices.Num(); ++i)
        {
            InstancedMesh->SetMatrixAtIndex(i, InstanceMatrices[i]);
        }
        InstancedMesh->MarkRenderStateDirty();
    }
}
```

### MassCrowd插件

如果你只需要简单的人群渲染，可以启用 `MassCrowd` 插件，它提供了开箱即用的：
- 基础移动AI
- 状态机（行走、站立、奔跑）
- 动画绑定

---

## 集群算法：Reynolds' Boids

要让集群行为自然，通常使用**Boids算法**，三条核心规则：

### 1. 分离（Separation）
避免碰撞，保持个体间距：
```cpp
FVector Separation(const FMyMovementFragment& Self, const TArray<FMyMovementFragment>& Neighbors)
{
    FVector Force = FVector::ZeroVector;
    for (const auto& Other : Neighbors)
    {
        float Distance = FVector::Dist(Self.Position, Other.Position);
        if (Distance < MinSeparationDistance && Distance > 0)
        {
            FVector Away = (Self.Position - Other.Position).GetSafeNormal();
            Force += Away / Distance; // 越近力越大
        }
    }
    return Force;
}
```

### 2. 对齐（Alignment）
与邻居速度方向一致：
```cpp
FVector Alignment(const FMyMovementFragment& Self, const TArray<FMyMovementFragment>& Neighbors)
{
    FVector AverageVelocity = FVector::ZeroVector;
    int32 Count = 0;
    for (const auto& Other : Neighbors)
    {
        if (FVector::Dist(Self.Position, Other.Position) < NeightborRadius)
        {
            AverageVelocity += Other.Velocity;
            ++Count;
        }
    }
    return Count > 0 ? (AverageVelocity / Count).GetSafeNormal() : FVector::ZeroVector;
}
```

### 3. 内聚（Cohesion）
向邻居中心移动：
```cpp
FVector Cohesion(const FMyMovementFragment& Self, const TArray<FMyMovementFragment>& Neighbors)
{
    FVector Center = FVector::ZeroVector;
    int32 Count = 0;
    for (const auto& Other : Neighbors)
    {
        if (FVector::Dist(Self.Position, Other.Position) < NeightborRadius)
        {
            Center += Other.Position;
            ++Count;
        }
    }
    return Count > 0 ? ((Center / Count) - Self.Position).GetSafeNormal() : FVector::ZeroVector;
}
```

---

## 性能优化建议

| 优化项 | 方法 |
|--------|------|
| **空间分区** | 使用Grid或Octree减少邻居搜索范围 |
| **LOD** | 远处实体用简化模型或2D sprite |
| **批处理** | Fragment数据布局连续，利于缓存命中 |
| **Job System** | Mass内部已用TaskGraph，可并行处理 |
| **GPU计算** | 对于简单逻辑，考虑使用GPU Buffer |

---

## 常见问题

### Q: Mass和Niagara有什么区别？
A: Niagara是粒子特效系统，适合数千个简单粒子。Mass是通用ECS框架，适合需要独立AI逻辑的实体。

### Q: 支持动画吗？
A: 支持！可以用 `MassAnimationInstance` 配合 Animation Blueprint，或者使用 `MassCrowd` 的内置动画。

### Q: 如何调试？
A: 启用 `MassVisualizer` 插件，可以在Editor中可视化实体位置、速度等信息。

---

## 总结

Mass是UE5解决大规模集群问题的利器。核心思想：

1. **ECS架构** — 数据与逻辑分离，利于并行
2. **Fragment自定义** — 灵活扩展，满足各种需求
3. **批量处理** — 利用TaskGraph最大化性能

建议从官方 `MassCrowd` 插件开始体验，熟悉后再深入自定义System和Fragment。

---

## 📌 参考资源

- [Epic官方Mass文档](https://dev.epicgames.com/documentation/en-us/unreal-engine/mass-overview)
- [MassEntity API](https://docs.unrealengine.com/en-US/API/Plugins/MassEntity/)
- [UE5 Mass示例项目](https://github.com/EpicGames/UnrealEngine/tree/release/Samples/Feature/Mass)

---

🎉 **恭喜！** 现在你已经掌握了UE5 Mass集群系统的核心概念。动手试试吧！
