---
title: UE5 智能指针完全指南
published: 2026-02-26T20:22:00
updated: 2026-02-26T20:22:00
description: 深入解析Unreal Engine 5的智能指针系统，涵盖TSharedPtr、TWeakPtr、TSharedRef的用法，以及在游戏开发中的实战技巧
image: ''
tags:
  - Unreal
  - SmartPointer
  - C++
  - 内存管理
  - Core
category: 技术教程
lang: ''
pinned: false
draft: false
prerenderAll: true
---

## 前言

智能指针是现代C++开发的重要工具，UE5提供了自己的智能指针实现——TSmartPointer系列（`TSharedPtr`、`TWeakPtr`、`TSharedRef`）。

本文系统讲解UE5智能指针的用法，帮你写出更安全的内存管理代码。

---

## 为什么使用智能指针？

| 传统指针 | 智能指针 |
|---------|---------|
| 手动new/delete | 自动内存管理 |
| 容易内存泄漏 | RAII原则 |
| 悬空指针难排查 | 引用计数安全 |
| 所有权不明确 | 所有权清晰 |

---

## 基础类型

### TSharedPtr 共享指针

```cpp
#include "CoreMinimal.h"

// 创建共享指针
TSharedPtr<FVector> Position = MakeShared<FVector>();

// 使用默认构造
TSharedPtr<FVector> Direction = nullptr;

// 从原始指针创建
FVector* RawPtr = new FVector(1, 0, 0);
TSharedPtr<FVector> Speed = TSharedPtr<FVector>(RawPtr);

// 访问内容
float X = Position->X;
float Y = (*Direction).Y;
```

### TSharedRef 共享引用

```cpp
// 不可为空的共享指针
TSharedRef<FVector> Ref = MakeShared<FVector>();
Ref->X = 100.f;

// TSharedRef 可以安全转换为 TSharedPtr
TSharedPtr<FVector> Ptr = Ref;
```

### TWeakPtr 弱指针

```cpp
// 不增加引用计数的观察者
TWeakPtr<FVector> WeakPosition;

// 从SharedPtr创建
TSharedPtr<FVector> Shared = MakeShared<FVector>();
TWeakPtr<FVector> Weak = Shared;

// 检查有效性
if (Weak.IsValid())
{
    // 安全使用
    TSharedPtr<FVector> Locked = Weak.Pin();
    if (Locked)
    {
        UE_LOG(LogTemp, Warning, TEXT("X: %f"), Locked->X);
    }
}
```

---

## 引用计数

### 引用计数原理

```cpp
TSharedPtr<FVector> Ptr1 = MakeShared<FVector>();
// 引用计数 = 1

TSharedPtr<FVector> Ptr2 = Ptr1;
// 引用计数 = 2

{
    TSharedPtr<FVector> Ptr3 = Ptr1;
    // 引用计数 = 3
}
// Ptr3 销毁，引用计数 = 2

Ptr1.Reset();
// 引用计数 = 1

Ptr2.Reset();
// 引用计数 = 0，对象自动销毁
```

### 手动引用计数

```cpp
// 共享引用计数对象
TSharedRef<int32> CountRef = MakeShared<int32>();
*CountRef = 0;

TWeakPtr<int32> Weak = CountRef;

// 在需要的地方增加引用
{
    TSharedPtr<int32> Temp = CountRef;
    (*CountRef)++;
} // Temp 销毁但不影响原引用
```

---

## 线程安全

### 线程安全版本

```cpp
// TSharedPtr 默认非线程安全
TSharedPtr<FVector> ThreadUnsafe;

// 线程安全版本
TSharedPtr<FVector, ESPMode::ThreadSafe> ThreadSafe;

// 在多线程环境中使用
void WorkerThread()
{
    TSharedPtr<FVector, ESPMode::ThreadSafe> LocalCopy = GlobalPtr;
    if (LocalCopy)
    {
        // 安全访问
    }
}
```

---

## 实战用法

### 缓存管理

```cpp
class UCachedDataManager : public UObject
{
public:
    // 缓存计算结果
    TSharedPtr<FVector> GetCachedDirection(FName Key)
    {
        if (Cache.Contains(Key))
        {
            return Cache[Key];
        }

        TSharedPtr<FVector> NewData = ComputeDirection(Key);
        Cache.Add(Key, NewData);
        return NewData;
    }

private:
    TMap<FName, TSharedPtr<FVector>> Cache;
};
```

### 观察者模式

```cpp
class FObserverManager
{
public:
    void Register(TWeakPtr<FSubject> Observer)
    {
        Observers.Add(Observer);
    }

    void Notify()
    {
        // 只通知有效且存在的观察者
        for (auto It = Observers.CreateIterator(); It; ++It)
        {
            if (It->IsValid())
            {
                if (TSharedPtr<FSubject> Observer = It->Pin())
                {
                    Observer->OnNotify();
                }
            }
            else
            {
                It.RemoveCurrent();
            }
        }
    }

private:
    TArray<TWeakPtr<FSubject>> Observers;
};
```

### 异步加载

```cpp
TSharedPtr<FAsyncLoadTask> LoadAssetAsync(const FSoftObjectPath& Path)
{
    return TSharedPtr<FAsyncLoadTask>(new FAsyncLoadTask(Path));
}

void OnAssetLoaded(TSharedPtr<FAssetData> Asset)
{
    if (Asset.IsValid())
    {
        // 使用加载的资产
        ProcessAsset(Asset);
    }
}
```

---

## 与UObject的关系

### 重要限制

```cpp
// ⚠️ 智能指针不能指向UObject（因为UObject有自己的垃圾回收）
// 错误用法
TSharedPtr<AActor> Actor = MakeShared<AActor>(); // 编译错误！

// ✅ 正确做法：使用UObject的垃圾回收
TWeakObjectPtr<AActor> ActorPtr;

// 或使用TScriptInterface
TScriptInterface<IActorInterface> ActorInterface;
```

### TWeakObjectPtr

```cpp
// 用于引用UObject而不影响GC
TWeakObjectPtr<AActor> CachedActor;

// 存储
CachedActor = MyActor;

// 检查有效性
if (CachedActor.IsValid())
{
    AActor* Actor = CachedActor.Get();
    // 安全使用
}

// 或使用Pin
if (TSharedPtr<AActor> Pinned = CachedActor.Pin())
{
    // 使用Pinned
}
```

---

## 常见问题

### Q: 和标准库智能指针的区别？
A: UE5的TSmartPointer不依赖标准库，更轻量，且与UE的内存管理系统集成。

### Q: 什么时候用TWeakPtr？
A: 观察者、缓存、避免循环引用时。

### Q: 可以用在蓝图吗？
A: 智能指针是纯C++特性，蓝图无法直接使用。蓝图中用Object指针和接口。

### Q: 性能如何？
A: 略有开销（引用计数），但比手动管理安全。游戏关键路径注意测试。

---

## 总结

UE5智能指针核心要点：

1. **TSharedPtr** — 共享所有权，自动释放
2. **TSharedRef** — 不可为空的共享指针
3. **TWeakPtr** — 观察者，不增加引用计数
4. **TWeakObjectPtr** — UObject专用弱引用
5. **ESPMode::ThreadSafe** — 多线程版本

智能指针是编写安全、优雅C++代码的利器。

---

## 参考资源

- [UE5智能指针文档](https://dev.epicgames.com/documentation/en-us/unreal-engine/smart-pointers-in-unreal-engine)
- [C++编程指南](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-cpp-programming)

---

🎉 **恭喜！** 现在你掌握了UE5智能指针的用法！
