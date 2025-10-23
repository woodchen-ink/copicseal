# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Copicseal 是一个基于 Electron + Vue 3 的跨平台图片水印工具,支持读取 EXIF 信息,为照片添加相机参数(快门、ISO、光圈等)水印。

## 技术栈

- **主进程**: Electron (Node.js)
- **渲染进程**: Vue 3 + TypeScript + Element Plus
- **构建工具**: electron-vite
- **UI 框架**: Element Plus + UnoCSS
- **截图渲染**: Puppeteer (通过 puppeteer-in-electron)
- **EXIF 处理**: exifreader, exiftool-vendored, piexifjs
- **图片格式**: 支持 HEIC/HEIF 格式转换 (heic-to)

## 项目架构

### 目录结构

```
src/
├── main/                    # Electron 主进程
│   ├── index.ts            # 主进程入口
│   ├── handles.ts          # IPC 处理器注册
│   └── utils/              # 主进程工具
│       ├── capture.ts      # Puppeteer 截图核心逻辑
│       ├── file.ts         # 文件操作
│       ├── font.ts         # 系统字体获取
│       ├── storage.ts      # electron-store 配置持久化
│       └── updater.ts      # 应用更新检查
├── preload/                # 预加载脚本
│   ├── index.ts           # 暴露安全的 API 给渲染进程
│   └── utils/storage.ts   # 存储工具封装
└── renderer/              # 渲染进程 (Vue 应用)
    └── src/
        ├── components/    # 通用组件
        ├── views/         # 视图组件
        │   ├── co-mark.vue        # 主视图
        │   ├── components/        # 业务组件
        │   │   ├── co-image-list.vue  # 图片列表
        │   │   ├── co-image-view.vue  # 图片预览
        │   │   ├── co-render.vue      # 水印渲染组件
        │   │   ├── panels/            # 侧边栏面板
        │   │   └── dialogs/           # 对话框
        │   └── tpls/              # 水印模板
        │       ├── tpl-default.vue    # 默认模板
        │       └── tpl-default*.vue   # 其他预设模板
        ├── uses/          # Composables
        │   ├── co-pic.ts      # 图片列表状态管理
        │   ├── config.ts      # 配置管理
        │   ├── export.ts      # 导出逻辑
        │   └── progress.ts    # 进度条状态
        ├── utils/         # 工具函数
        │   ├── co-pic.tsx     # CoPic 类定义
        │   ├── exif.ts        # EXIF 解析
        │   ├── render.ts      # 渲染工具
        │   └── sfc.ts         # Vue SFC 工具
        └── theme/         # 主题配置
```

### 核心工作流程

1. **图片导入**: 用户拖拽/选择图片 → 解析 EXIF → 创建 `CoPic` 实例 → 加入列表
2. **水印预览**: Vue 组件渲染水印模板 → 实时预览
3. **导出图片**:
   - 将 Vue 模板渲染为 HTML 字符串
   - 通过 IPC 传递给主进程
   - 主进程使用 Puppeteer 创建隐藏窗口
   - 加载 HTML 并截图
   - 使用 exiftool 写入 DPI 信息
   - 保存到指定路径

### IPC 通信

**主要 IPC 通道** (定义在 [src/main/handles.ts](src/main/handles.ts)):

- `captureDOM`: 截图渲染 (HTML → 图片)
- `openDirectoryDialog`: 选择输出目录
- `showCtxMenu`: 显示右键菜单
- `openTargetPath`: 打开文件/文件夹
- `getSysFonts`: 获取系统字体列表
- `getAppVersion`: 获取版本更新信息
- `config:get/set/delete`: 配置读写

### 状态管理

使用 Vue 3 Composition API + Provide/Inject 模式:

- `provideCoPic()` / `injectCoPic()`: 图片列表状态 ([src/renderer/src/uses/co-pic.ts](src/renderer/src/uses/co-pic.ts))
- `useConfig()`: 全局配置 ([src/renderer/src/uses/config.ts](src/renderer/src/uses/config.ts))
- `useExport()`: 导出逻辑 ([src/renderer/src/uses/export.ts](src/renderer/src/uses/export.ts))

### 水印模板系统

- 模板是独立的 `.vue` 文件 (位于 [src/renderer/src/views/tpls/](src/renderer/src/views/tpls/))
- 通过 Props 接收 `CoPic` 实例和设置
- 使用动态组件加载: `<component :is="currentTemplate" />`
- 模板可访问 EXIF 数据、背景设置、样式配置等

## 常用命令

### 开发

```bash
# 安装依赖
npm install

# 开发模式 (热重载)
npm run dev

# 类型检查
npm run typecheck          # 全部检查
npm run typecheck:node     # 仅主进程
npm run typecheck:web      # 仅渲染进程

# 代码格式化和检查
npm run lint
```

### 构建

```bash
# 构建应用 (不打包)
npm run build

# 构建并打包
npm run build:unpack       # 构建到目录 (不生成安装包)
npm run build:win          # Windows 安装包
npm run build:mac          # macOS 安装包
npm run build:linux        # Linux 安装包
```

### 预览

```bash
# 预览已构建的应用
npm start
```

## 开发注意事项

### 1. Electron 进程隔离

- 主进程和渲染进程**不能直接共享代码**
- 通过 IPC 通信,API 定义在 [src/types.d.ts](src/types.d.ts)
- 预加载脚本 ([src/preload/index.ts](src/preload/index.ts)) 负责暴露安全 API

### 2. 截图渲染机制

- 使用 Puppeteer 在**隐藏窗口**中渲染 HTML ([src/main/utils/capture.ts](src/main/utils/capture.ts))
- 窗口设置:
  - `opacity: 0` - 不可见
  - `skipTaskbar: true` - 不显示在任务栏
  - 10 秒无操作自动销毁
- 支持批量输出不同尺寸/格式

### 3. EXIF 处理

- **读取**: 使用 `exifreader` (纯 JS,快速) ([src/renderer/src/utils/exif.ts](src/renderer/src/utils/exif.ts))
- **写入**: 使用 `exiftool-vendored` (需要 exiftool 二进制)
- **主要字段**: 定义在 `primaryExif` 数组 ([src/renderer/src/uses/co-pic.ts](src/renderer/src/uses/co-pic.ts):103-117)

### 4. 样式系统

- 使用 UnoCSS + Element Plus
- 自定义 margin/padding 规则: `m-4` = `calc(var(--co-base-size) * 4)` (基准 4px)
- Element Plus 使用 SCSS 主题变量 ([src/renderer/src/theme/element/index.scss](src/renderer/src/theme/element/index.scss))

### 5. 配置持久化

- 使用 `electron-store` ([src/main/utils/storage.ts](src/main/utils/storage.ts))
- 配置项:
  - `output.defaultPath`: 默认输出路径
  - `output.presets`: 输出预设
  - `template.presets`: 模板预设

### 6. 图片格式支持

- 原生支持: JPEG, PNG, WebP
- HEIC/HEIF: 通过 `heic-to` 库自动转换

### 7. 添加新水印模板

1. 在 `src/renderer/src/views/tpls/` 创建 `.vue` 文件
2. 接收 Props: `coPic: CoPic`, `settings: Settings`
3. 在模板选择面板中注册

## 调试技巧

### 主进程调试

在 VS Code 中使用 Electron 调试配置,或查看终端输出 (`console.log`)

### 渲染进程调试

开发模式下自动打开 DevTools (F12)

### 截图问题排查

- 检查 HTML 字符串是否正确生成
- 查看主进程日志 (`console.time/timeEnd('capture-div')`)
- 确认 Puppeteer 窗口是否正常创建
- 验证输出路径权限

## 依赖说明

### 关键依赖

- `puppeteer-in-electron`: 在 Electron 中使用 Puppeteer
- `exiftool-vendored`: EXIF 元数据读写 (需要 exiftool 二进制)
- `electron-store`: 配置持久化存储
- `element-plus`: UI 组件库
- `unocss`: 原子化 CSS 框架
- `heic-to`: HEIC/HEIF 格式转换

### Peer Dependencies

需要手动安装:
- `ajv@^8.17.1`
- `http-proxy-agent@^7.0.2`

## 版本更新

- 更新检查逻辑: [src/main/utils/updater.ts](src/main/utils/updater.ts)
- 当前版本: 见 [package.json](package.json)
- 发布流程: GitHub Releases + 自动更新服务器

## 测试

项目当前未配置自动化测试,手动测试流程:

1. 导入不同格式图片 (JPEG, PNG, HEIC)
2. 测试 EXIF 读取
3. 切换不同水印模板
4. 导出不同尺寸/格式
5. 验证 DPI 信息写入
6. 测试配置持久化

## macOS 特殊处理

- 应用未经 Apple 公证,需要用户手动移除隔离标志:
  ```bash
  sudo xattr -rd com.apple.quarantine /Applications/Copicseal.app
  ```
- 构建脚本: `npm run build:mac`
