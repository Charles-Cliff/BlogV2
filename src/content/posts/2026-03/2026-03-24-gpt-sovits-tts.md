---
title: GPT-SoVITS 本地语音合成完整教程
published: 2026-03-24T20:40:00
updated: 2026-03-24T20:40:00
description: 详细记录GPT-SoVITS本地语音合成模型的部署与使用，涵盖环境配置、模型训练、API调用，以及在项目中的集成方法
image: /images/2026-03/mass-architecture-20260330.png
tags:
  - GPT-SoVITS
  - TTS
  - 语音合成
  - AI
  - 本地部署
category: 技术教程
lang: ""
pinned: false
draft: false
prerenderAll: true
---

## 前言

GPT-SoVITS是一款强大的本地语音合成项目，支持零样本声音克隆和少样本训练。本文记录完整的本地部署流程，帮你快速上手AI语音合成技术。

---

## 环境要求

### 硬件
- 显卡：NVIDIA GPU（建议6GB以上显存）
- 内存：16GB RAM
- 硬盘：30GB可用空间

### 软件
- Python 3.10+
- CUDA 11.8 或 12.1
- cuDNN

---

## 安装依赖

### 创建虚拟环境

```bash
conda create -n gptsovits python=3.10
conda activate gptsovits
```

### 安装PyTorch

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 克隆项目

```bash
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS
```

### 安装依赖

```bash
pip install -r requirements.txt
```

---

## 预训练模型下载

### 需要下载的模型

| 模型 | 说明 | 大小 |
|------|------|------|
| GPT-SoVITS模型 | 主模型 | ~1.5GB |
| HuggingFace模型 | 底模 | ~4GB |
| 训练语料（可选） | 参考音色 | 几百MB |

### 下载地址

- [Modelscope下载](https://modelscope.cn/models)
- [HuggingFace下载](https://huggingface.co/)

### 模型存放

```
GPT-SoVITS/
├── GPT_SoVITS/
│   └── pretrained_models/
│       ├── GPT-SoVITS/
│       └── huqubert/
└── SoVITS/
    └── pretrained_models/
```

---

## 推理使用

### 启动WebUI

```bash
python webui.py --port 9876 --colab
```

### 浏览器访问

打开 `http://localhost:9876`

### 推理参数

| 参数 | 说明 | 建议值 |
|------|------|--------|
| 参考音频 | 克隆音色的源 | 5-30秒 |
| 文本内容 | 要合成的文字 | 避免超长 |
| 语速 | 合成语速 | 1.0正常 |
| 音调 | 音高调整 | 0正常 |

---

## API服务

### 启动API服务

```bash
python API.py --port 9880
```

### HTTP调用示例

```python
import requests

# 合成语音
url = "http://127.0.0.1:9880/tts"

data = {
    "text": "你好，欢迎使用GPT-SoVITS语音合成",
    "text_lang": "zh",
    "ref_audio_path": "path/to/reference.wav",
    "prompt_lang": "zh",
    "prompt_text": "这是一段参考音频的文字内容"
}

response = requests.post(url, json=data)

# 保存音频
with open("output.wav", "wb") as f:
    f.write(response.content)
```

### 返回格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "audio": "base64编码的音频数据",
    "duration": 3.5
  }
}
```

---

## 训练自定义音色

### 数据准备

1. 收集目标音色的音频（5-30分钟）
2. 音频格式：16bit WAV，16kHz，单声道
3. 命名规范：`speaker_name_001.wav`

### 音频预处理

```bash
python 3_applyforcevocab.py \
  --input_path ./raw/ \
  --output_path ./processed/
```

### 启动训练

```bash
# 训练SoVITS
python train_sovits.py \
  --data_path ./processed/ \
  --model_path ./output/sovits/

# 训练GPT
python train_gpt.py \
  --data_path ./processed/ \
  --model_path ./output/gpt/
```

### 训练参数

| 参数 | 说明 | 建议值 |
|------|------|--------|
| batch_size | 批量大小 | 显存允许尽量大 |
| learning_rate | 学习率 | 1e-4 |
| epochs | 训练轮数 | 10-20 |

---

## 与项目集成

### Python集成

```python
import subprocess
import base64
import os

class GPTSoVITSClient:
    def __init__(self, api_url="http://127.0.0.1:9880"):
        self.api_url = api_url

    def generate(self, text, ref_audio, ref_text):
        import requests
        with open(ref_audio, "rb") as f:
            ref_audio_b64 = base64.b64encode(f.read()).decode()

        data = {
            "text": text,
            "text_lang": "zh",
            "ref_audio_path": ref_audio,
            "prompt_lang": "zh",
            "prompt_text": ref_text
        }

        response = requests.post(self.api_url + "/tts", json=data)
        result = response.json()

        if result["code"] == 200:
            audio_b64 = result["data"]["audio"]
            audio_data = base64.b64decode(audio_b64)

            output_path = "temp_output.wav"
            with open(output_path, "wb") as f:
                f.write(audio_data)
            return output_path
        return None
```

### 游戏引擎集成

在UE5中使用：

```cpp
// 在OpenClaw或其他项目中调用API
void USoVITSManager::GenerateVoice(const FString& Text, const FString& RefAudio)
{
    TSharedRef<IHttpRequest> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL("http://127.0.0.1:9880/tts");
    Request->SetVerb("POST");
    Request->SetHeader("Content-Type", "application/json");

    TArray<TSharedPtr<FJsonValue>> JsonArray;
    // ... 构建JSON
    Request->SetContentAsString(JsonString);

    Request->OnProcessRequestComplete().BindUObject(this, &USoVITSManager::OnResponse);
    Request->ProcessRequest();
}
```

---

## 常见问题

### Q: 显存不足？
A: 降低batch_size，或使用量化模型。

### Q: 合成声音不自然？
A: 提供更清晰、时长适中的参考音频（10-20秒为佳）。

### Q: 中文发音错误？
A: 使用拼音或带声调的拼音输入。

### Q: 如何提升推理速度？
A: 使用TensorRT加速，或降低推理精度。

---

## 总结

GPT-SoVITS核心要点：

1. **本地部署** — 无需云服务，保护隐私
2. **零样本克隆** — 5秒音频即可克隆
3. **少样本训练** — 5-30分钟数据定制音色
4. **API服务** — 方便项目集成
5. **游戏应用** — NPC对话、语音播报

本地语音合成让AI应用更灵活可控。

---

## 参考资源

- [GPT-SoVITS项目地址](https://github.com/RVC-Boss/GPT-SoVITS)
- [Modelscope模型下载](https://modelscope.cn/models)
- [官方训练教程](https://www.bilibili.com/video/)

---

🎉 **恭喜！** 现在你掌握了GPT-SoVITS本地部署与使用！
