# 节点聚合器 · Node Aggregator

多协议代理节点聚合器，部署在 Cloudflare Workers，支持生成 Base64 / Clash / Sing-box 订阅。

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/84de4fab-4649-4e48-9a61-fda53c541553" />

## 支持协议

- VLESS (TCP/WS/gRPC + TLS/REALITY)
- VMess (TCP/WS/gRPC + TLS)
- Trojan (TCP/WS/gRPC + TLS)
- Shadowsocks (SS)
- SSR (透传)
- Hysteria2 / hy2
- Hysteria
- TUIC v5
- SOCKS5 (透传)
- HTTP (透传)

## 订阅格式

| 格式 | 用途 | URL 参数 |
|------|------|----------|
| Base64 | V2rayN, V2rayNG, Shadowrocket | `?format=base64` |
| Clash YAML | Clash, ClashX, Clash Verge | `?format=clash` |
| Sing-box JSON | Sing-box, NekoBox | `?format=singbox` |
| Raw | 纯文本节点列表 | `?format=raw` |

## 部署步骤

### 1. 上传worker.js

```bash
复制 worker.js 文件，粘贴部署到cloudflare Workers
```

### 2. 创建 KV 命名空间

```bash
创建 KV 命名空间
```

复制输出的 `id`，到刚部署的cloudflare Workers项目

```toml
KV绑定命名“SUBSCRIPTIONS”，选择刚创建的KV
```

### 3. 重试部署

```bash
重试部署让kv生效，完成
```

## 订阅有效期

订阅链接有效期 **30 天**，过期后需重新生成。

## 架构

```
Browser → Cloudflare Workers → KV Store
              ↓
         /api/create   POST  生成订阅，存入 KV
         /sub/:id      GET   读取 KV，按格式输出
         /             GET   前端页面
```
