---
title: UE5 委托与代理完全指南
published: 2026-02-21T20:20:00
updated: 2026-02-21T20:20:00
description: 深入解析Unreal Engine 5的委托系统，涵盖声明、绑定、广播、解绑等操作，以及多播代理和动态委托的实战用法
image: ""
tags:
  - Unreal
  - Delegate
  - 委托
  - 事件系统
category: 技术教程
lang: ""
pinned: false
draft: false
prerenderAll: true
---

## 前言

委托（Delegate）是UE5中实现事件驱动编程的核心机制。它允许你在一个对象上绑定函数回调，并在特定事件发生时触发调用。

本文系统讲解UE5委托的各种用法，帮你掌握这一重要的C++技能。

---

## 委托基础

### 为什么使用委托？

| 传统回调 | 委托优势 |
|---------|---------|
| 函数指针 | 类型安全 |
| 接口回调 | 声明简洁 |
| 消息中心 | 解耦设计 |

---

## 声明委托

### 单播委托

```cpp
// 声明一个返回bool、接受int参数的委托
DECLARE_DELEGATE_RetVal_OneParam(bool, FOnPlayerAction, int32)

// 或者使用宏自动生成
DECLARE_MULTICAST_DELEGATE_OneParam(FOnDamageDelegate, float)
```

### 参数规则

```cpp
// 无参数
DECLARE_DELEGATE(FSimpleDelegate)

// 单参数（最多8个）
DECLARE_DELEGATE_OneParam(FOneParamDelegate, int32)
DECLARE_DELEGATE_TwoParams(FTwoParamDelegate, int32, FString)
DECLARE_DELEGATE_ThreeParams(FThreeParamDelegate, AActor*, float, FVector)

// 返回值
DECLARE_DELEGATE_RetVal(bool, FReturnBoolDelegate)
DECLARE_DELEGATE_RetVal_OneParam(int32, FReturnIntDelegate, float)
```

---

## 绑定函数

### 绑定普通成员函数

```cpp
class AMyActor : public AActor
{
    UFUNCTION()
    void HandleDamage(float Damage);

    void BindDelegate();
};

void AMyActor::BindDelegate()
{
    // 假设有一个委托对象
    FOnDamageDelegate OnDamage;

    // 绑定到成员函数
    OnDamage.AddDynamic(this, &AMyActor::HandleDamage);
}
```

### 绑定静态函数

```cpp
void MyStaticFunction(float Damage)
{
    UE_LOG(LogTemp, Warning, TEXT("Static handler: %f"), Damage);
}

void AMyActor::BindStatic()
{
    FOnDamageDelegate OnDamage;
    OnDamage.AddStatic(&MyStaticFunction);
}
```

### 绑定Lambda

```cpp
void AMyActor::BindLambda()
{
    FOnDamageDelegate OnDamage;

    // C++14+ 支持Lambda
    int32 Count = 0;
    OnDamage.AddLambda([this, Count](float Damage) {
        UE_LOG(LogTemp, Warning, TEXT("Lambda: %f, Count: %d"), Damage, Count);
    });
}
```

---

## 多播代理

### 声明与使用

```cpp
// 声明多播委托
DECLARE_MULTICAST_DELEGATE_TwoParams(FOnHealthChanged, float /*OldHealth*/, float /*NewHealth*/);

// 在类中定义
UPROPERTY()
FOnHealthChanged OnHealthChangedDelegate;

// 广播（调用所有绑定的函数）
void AMyCharacter::TakeDamage(float Damage)
{
    float OldHealth = Health;
    Health -= Damage;
    OnHealthChangedDelegate.Broadcast(OldHealth, Health);
}
```

### 添加/移除监听

```cpp
void AMyActor::RegisterCallbacks(AMyCharacter* Character)
{
    if (Character)
    {
        // 添加监听
        Character->OnHealthChangedDelegate.AddDynamic(this, &AMyActor::OnHealthChanged);

        // 移除监听
        Character->OnHealthChangedDelegate.RemoveDynamic(this, &AMyActor::OnHealthChanged);
    }
}

void AMyActor::OnHealthChanged(float OldHealth, float NewHealth)
{
    UE_LOG(LogTemp, Warning, TEXT("Health: %f -> %f"), OldHealth, NewHealth);
}
```

### 清空所有绑定

```cpp
// 清空所有监听
OnHealthChangedDelegate.Clear();
```

---

## 动态委托

### 动态多播代理

```cpp
// 用于蓝图支持的动态委托
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnSpellCast, FVector, Location, float, Damage);

// 实现
UPROPERTY(BlueprintAssignable)
FOnSpellCast OnSpellCastDelegate;

// 在Blueprint中绑定
```

### 生成函数签名

| 宏 | 生成函数 |
|----|---------|
| `AddDynamic` | `AddUFunction` |
| `RemoveDynamic` | `RemoveUFunction` |
| `IsBound` | `IsBoundToGameInstance` |

---

## 实战：事件系统

### 定义事件管理器

```cpp
// UGameInstanceSubsystem 实现全局事件
UCLASS()
class UEventManager : public UGameInstanceSubsystem, public FTickableGameObject
{
    GENERATED_BODY()

public:
    // 玩家相关事件
    FDelegateHandle OnPlayerDamagedHandle;
    FDelegateHandle OnPlayerDiedHandle;

    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    // 事件广播
    void BroadcastPlayerDamaged(AActor* Player, float Damage);
    void BroadcastPlayerDied(AActor* Player);

    // 事件监听
    void ListenPlayerDamaged(UObject* Listener, FName FunctionName);
};
```

### 实现

```cpp
void UEventManager::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
}

void UEventManager::BroadcastPlayerDamaged(AActor* Player, float Damage)
{
    // 广播到所有监听者
    OnPlayerDamaged.Broadcast(Player, Damage);
}

void UEventManager::ListenPlayerDamaged(UObject* Listener, FName FunctionName)
{
    if (Listener && !FunctionName.IsNone())
    {
        FScriptDelegate Delegate;
        Delegate.BindUFunction(Listener, FunctionName);
        OnPlayerDamaged.Add(Delegate);
    }
}
```

---

## 常见问题

### Q: AddDynamic报错？
A: 确保目标函数声明为 `UFUNCTION()`，且接受正确参数。

### Q: 内存泄漏？
A: 确保在 `EndPlay` 或 `Deinitialize` 中调用 `RemoveDynamic` 或 `Clear`。

### Q: 委托与接口怎么选？
A: 简单1对1回调用委托，多对多用多播代理，需要蓝图支持用动态委托。

### Q: 如何调试委托绑定？
A: 使用 `IsBound()` 检查，或在Broadcast前加日志。

---

## 总结

UE5委托核心要点：

1. **单播委托** — 一对一回调
2. **多播代理** — 一对多广播
3. **动态委托** — 蓝图支持
4. **生命周期** — 记得解绑防止泄漏

委托是实现解耦和事件驱动编程的利器。

---

## 参考资源

- [UE5委托官方文档](https://dev.epicgames.com/documentation/en-us/unreal-engine/delegates-and-lamba-expressions-in-unreal-engine)
- [C++编程指南](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-cpp-programming)

---

🎉 **恭喜！** 现在你掌握了UE5委托的核心用法！
