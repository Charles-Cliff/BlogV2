---
title: Unity脚本生命周期函数详解
published: 2026-01-20T20:00:00
updated: 2026-01-20T20:00:00
draft: false
description: '深入解析Unity脚本的核心概念与生命周期函数执行顺序，帮助你编写更规范、更高效的Unity脚本。'
image: ''
tags: [Unity, C#, MonoBehaviour, 生命周期函数, XR开发]
lang: zh-CN
pinned: false
prerenderAll: true
---


## 前言

Unity脚本是驱动游戏逻辑和行为的核心组件。理解脚本的核心概念和生命周期函数的执行顺序，是编写高效、可维护代码的基础。本文将从实际开发角度，详细讲解Unity脚本的关键知识点。

---

## Unity脚本核心概念

### 1. 脚本基础：继承 MonoBehaviour

所有控制游戏对象（GameObject）行为的脚本都必须直接或间接继承自 `MonoBehaviour` 类。

```csharp
using UnityEngine;

public class MyScript : MonoBehaviour
{
    // 脚本逻辑
}
```

<span style="color: blue; font-weight: bold;">提示</span>：`MonoBehaviour` 是 Unity 脚本的基类，它提供了与引擎交互的接口。

### 2. 组件交互：GetComponent\<T\>

获取组件引用是与引擎交互的最主要方式。

```csharp
public class ComponentExample : MonoBehaviour
{
    private Rigidbody rb;
    private Renderer meshRenderer;

    void Awake()
    {
        // 获取组件引用
        rb = GetComponent<Rigidbody>();
        meshRenderer = GetComponent<Renderer>();
    }
}
```

<span style="color: orange; font-weight: bold;">注意</span>：`GetComponent` 会有一定开销，避免在 `Update` 中频繁调用。

### 3. 变量与 Inspector 面板

使用 `public` 或 `[SerializeField]` 属性将变量暴露给 Inspector：

```csharp
public class InspectorExample : MonoBehaviour
{
    // 公开变量，直接在Inspector中显示和修改
    public float moveSpeed = 5f;
    public GameObject targetObject;

    // 私有变量但仍显示在Inspector
    [SerializeField] private float rotationSpeed = 90f;
    [SerializeField] private bool isActive = true;
}
```

---

## 生命周期函数详解

脚本生命周期定义了脚本从创建到销毁的整个过程中，各个函数被调用的顺序和规则。

### 执行顺序图

```
┌─────────────────────────────────────────────────────────────┐
│                      脚本实例创建                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Awake()         — 脚本实例被创建时立即调用（最早执行）      │
│                     即使脚本未启用也会调用，整个生命周期只执行一次│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  OnEnable()      — 每次脚本被启用时调用                      │
│                     （组件被勾选 或 所在对象被激活）            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Start()         — 首次启用后，Update之前调用               │
│                     只执行一次                                 │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  FixedUpdate()          │     │  Update()                   │
│  固定时间间隔调用        │     │  每帧调用，频率不固定         │
│  默认0.02秒             │     │                             │
│  用于物理计算            │     │  用于非物理逻辑：             │
│                         │     │  - 输入检测                  │
│                         │     │  - 角色状态                  │
│                         │     │  - 游戏逻辑                  │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LateUpdate()      — 所有Update执行完毕后调用               │
│                      常用于摄像机跟随等需要后处理的逻辑          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  OnDisable()       — 脚本被禁用时调用                        │
│                      取消事件监听、停止协程、清理资源           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  OnDestroy()       — 脚本被销毁时调用（对象销毁或场景切换）   │
│                      进行最终的清理工作                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 各生命周期函数详解

### Awake()

```csharp
void Awake()
{
    // 初始化变量、获取组件引用
    // 整个生命周期内只执行一次，执行顺序最早
    rb = GetComponent<Rigidbody>();
    health = maxHealth;
}
```

| 特性 | 说明 |
|------|------|
| 调用时机 | 脚本实例被创建时立即调用 |
| 是否需要启用 | 否，即使脚本禁用也会调用 |
| 执行次数 | 整个生命周期只执行一次 |
| 执行顺序 | 所有生命周期函数中最早 |

<span style="color: blue; font-weight: bold;">典型用途</span>：初始化变量、获取组件引用。用于设置脚本运行所需的基础状态。

### OnEnable()

```csharp
void OnEnable()
{
    // 注册事件监听、启动协程
    GameEvents.OnEnemyKilled += HandleEnemyKilled;
    StartCoroutine(UpdateHealthBar());
}
```

<span style="color: blue; font-weight: bold;">典型用途</span>：注册事件监听、启动脚本激活时需要立即执行的操作。

### Start()

```csharp
void Start()
{
    // 进行依赖于其他组件已初始化完成的逻辑
    // 或者游戏开始前的最终设置
    target = GameObject.FindWithTag("Player").transform;
    animator = GetComponent<Animator>();
}
```

| 特性 | 说明 |
|------|------|
| 调用时机 | 脚本首次启用后，在第一次 Update 之前 |
| 是否需要启用 | 是 |
| 执行次数 | 只执行一次 |

<span style="color: blue; font-weight: bold;">典型用途</span>：进行依赖于其他组件已初始化完成的逻辑，或游戏开始前的最终设置。

### Update()

```csharp
void Update()
{
    // 处理非物理相关的实时游戏逻辑
    float horizontal = Input.GetAxis("Horizontal");
    float vertical = Input.GetAxis("Vertical");

    transform.Translate(horizontal * moveSpeed * Time.deltaTime, 0,
                        vertical * moveSpeed * Time.deltaTime);
}
```

| 特性 | 说明 |
|------|------|
| 调用时机 | 每一帧调用一次 |
| 调用频率 | 与设备性能和当前帧渲染量相关，不固定 |
| 适用场景 | 输入检测、角色状态、游戏逻辑 |

<span style="color: red; font-weight: bold;">性能注意</span>：`Update` 每一帧都会执行，避免在其中进行高开销操作，如 `GetComponent`、字符串拼接、内存分配。

### FixedUpdate()

```csharp
void FixedUpdate()
{
    // 执行与物理计算相关的操作
    // 固定时间间隔调用（默认0.02秒），不受渲染帧率影响
    rb.AddForce(physicsInput * thrustForce);
}
```

| 特性 | 说明 |
|------|------|
| 调用时机 | 固定时间间隔（默认 0.02 秒） |
| 调用频率 | 固定，不受渲染帧率影响 |
| 适用场景 | 物理计算、刚体施力 |

<span style="color: blue; font-weight: bold;">为什么物理计算用 FixedUpdate</span>：物理引擎需要稳定的时间步长，如果用 Update，帧率波动会导致物理模拟不稳定。

### LateUpdate()

```csharp
void LateUpdate()
{
    // 常用语摄像机跟随，确保在目标对象移动完成后再更新
    targetPosition = target.position + offset;
    transform.position = Vector3.SmoothDamp(transform.position,
                                           targetPosition,
                                           ref velocity,
                                           smoothTime);
}
```

<span style="color: blue; font-weight: bold;">典型用途</span>：摄像机跟随、动画后处理等需要在所有 Update 执行完毕后再处理的逻辑。

### OnDisable()

```csharp
void OnDisable()
{
    // 取消事件监听、停止协程、清理资源
    GameEvents.OnEnemyKilled -= HandleEnemyKilled;
    StopAllCoroutines();
}
```

<span style="color: orange; font-weight: bold;">重要</span>：防止脚本禁用后仍执行不必要的操作，造成难以排查的 bug。

### OnDestroy()

```csharp
void OnDestroy()
{
    // 进行最终的清理工作
    Debug.Log($"{gameObject.name} 已被销毁");
}
```

<span style="color: blue; font-weight: bold;">典型用途</span>：保存数据、释放资源、记录日志。

---

## 实用代码模板

```csharp
using UnityEngine;

public class LifecycleExample : MonoBehaviour
{
    // Inspector 面板可编辑
    public float moveSpeed = 5f;
    public float rotationSpeed = 90f;

    // 私有变量
    private Rigidbody rb;
    private Vector3 startPosition;

    void Awake()
    {
        // 最早执行，用于初始化
        rb = GetComponent<Rigidbody>();
        startPosition = transform.position;
        Debug.Log("Awake called");
    }

    void OnEnable()
    {
        // 每次启用时调用
        Debug.Log("OnEnable called");
    }

    void Start()
    {
        // 初始化依赖
        Debug.Log("Start called");
    }

    void FixedUpdate()
    {
        // 物理更新（固定频率）
        rb.AddForce(Vector3.forward * moveSpeed);
    }

    void Update()
    {
        // 游戏逻辑更新（每帧）
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        transform.Rotate(0, h * rotationSpeed * Time.deltaTime, 0);
    }

    void LateUpdate()
    {
        // 摄像机跟随等后处理
    }

    void OnDisable()
    {
        // 清理工作
        Debug.Log("OnDisable called");
    }

    void OnDestroy()
    {
        // 最终清理
        Debug.Log("OnDestroy called");
    }
}
```

---

## 常见问题与最佳实践

### 1. Awake vs Start

| 函数 | 特点 |
|------|------|
| **Awake** | 脚本实例创建时就调用，无需启用，用于基础初始化 |
| **Start** | 首次启用后才调用，用于需要其他组件已就绪的初始化 |

<span style="color: blue; font-weight: bold;">经验</span>：基础初始化放 Awake，依赖其他组件的初始化放 Start。

### 2. Update vs FixedUpdate

| 函数 | 特点 | 适用场景 |
|------|------|----------|
| **Update** | 每帧调用，频率不固定 | 输入检测、角色控制、游戏逻辑 |
| **FixedUpdate** | 固定间隔，频率固定 | 物理计算、刚体操作 |

### 3. 性能优化建议

```csharp
public class BadExample : MonoBehaviour
{
    void Update()
    {
        // ❌ 每帧都GetComponent，开销大
        Rigidbody rb = GetComponent<Rigidbody>();
        rb.AddForce(Vector3.forward);
    }
}

public class GoodExample : MonoBehaviour
{
    private Rigidbody rb;

    void Awake()
    {
        // ✅ 缓存引用，只获取一次
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        // ✅ 使用缓存的引用
        rb.AddForce(Vector3.forward);
    }
}
```

---

## 总结

理解 Unity 脚本的生命周期函数是开发的基础：

1. **Awake** — 最先执行，用于基础初始化
2. **OnEnable** — 每次启用时调用
3. **Start** — 首次启用后执行，用于依赖初始化
4. **FixedUpdate** — 固定频率，用于物理计算
5. **Update** — 每帧调用，用于游戏逻辑
6. **LateUpdate** — 所有 Update 后调用，用于后处理
7. **OnDisable** — 禁用时清理资源
8. **OnDestroy** — 销毁时最终清理

<span style="color: blue; font-weight: bold;">核心理念</span>：在合适的生命周期函数中做合适的事。基础初始化用 Awake，物理计算用 FixedUpdate，游戏逻辑用 Update，摄像机跟随用 LateUpdate。

---

## 参考资源

- [Unity 官方文档：脚本生命周期](https://docs.unity3d.com/cn/current/Manual Execution Order.html)
- [MonoBehaviour 官方文档](https://docs.unity3d.com/cn/current/ScriptReference/MonoBehaviour.html)

---

*如果你有任何问题，欢迎在评论区交流！*
