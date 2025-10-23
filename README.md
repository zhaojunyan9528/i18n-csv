
# i18n-csv 扩展

一个为 VS Code 开发的国际化 CSV 文件辅助工具，帮助开发者在代码中快速查看和管理多语言翻译。

## 功能特性

- **实时翻译预览**：将鼠标悬停在代码中的 `t('key')` 函数调用上，即时显示对应键的所有语言翻译
- **表格化展示**：以表格形式清晰展示多语言翻译内容，支持不同大小写的键列识别
- **灵活的配置**：可通过 VS Code 设置界面自定义 CSV 文件路径
- **自动重载**：CSV 文件变更时自动重新加载翻译数据
- **手动刷新**：提供命令手动刷新翻译数据
- **配置热更新**：修改配置后自动应用新设置
- **支持参数化调用**：兼容 `t('key', [params])` 格式的带参数翻译调用

## 安装方法

1. 在 VS Code 中打开**扩展**面板（快捷键 `Ctrl+Shift+X` 或 `Cmd+Shift+X`）
2. 搜索 "i18n-csv"
3. 点击**安装**按钮
4. 安装完成后点击**启用**按钮

或者直接从 [Visual Studio Marketplace](https://marketplace.visualstudio.com/vscode) 下载安装。

## 使用方法

### 基本使用

1. 确保您的项目中存在包含多语言翻译的 CSV 文件
2. 默认情况下，扩展会查找工作区根目录下的 `public/lang.csv` 文件
3. 在代码中编写 `t('key')` 形式的翻译调用
4. 将鼠标悬停在翻译调用上，即可看到所有语言的翻译内容

### CSV 文件格式

您的 CSV 文件需要包含一个键列（大小写不敏感：'key'、'Key' 或 'KEY' 都可以），以及各个语言的列：

```csv
key,en,zh
welcome,Welcome,欢迎
hello,Hello,你好
```

### 自定义 CSV 文件路径

1. 打开 VS Code 设置（快捷键 `Ctrl+,` 或 `Cmd+,`）
2. 在搜索框中输入 "i18n-csv"
3. 找到 "I18n Csv: Csv Path" 设置项
4. 输入您的 CSV 文件路径（相对于工作区根目录）
5. 保存设置后，扩展会自动加载新路径下的翻译文件

## 命令

扩展提供了以下命令（可通过 `Ctrl+Shift+P` 或 `Cmd+Shift+P` 打开命令面板并输入）：

- **i18n-csv.reloadTranslations**：手动刷新翻译数据

## 配置选项

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `i18n-csv.csvPath` | string | `public/lang.csv` | 相对于工作区根目录的 CSV 翻译文件路径 |

## 支持的文件类型

扩展目前支持在以下文件类型中显示翻译提示：

- TypeScript (.ts)
- JavaScript (.js)
- Vue (.vue)
- HTML (.html)

## 常见问题

### Q: 为什么我看不到翻译提示？

A: 请检查以下几点：

1. CSV 文件路径是否正确配置
2. CSV 文件格式是否符合要求，特别是是否包含键列
3. 代码中的翻译调用格式是否为 `t('key')` 或 `t('key', [params])`
4. 尝试使用命令面板执行 `i18n-csv.reloadTranslations` 命令

### Q: 如何支持其他文件类型？

A: 目前扩展默认支持 TypeScript、JavaScript、Vue 和 HTML 文件。如需支持其他文件类型，请在 GitHub 上提交功能请求。

### Q: 扩展支持 CSV 文件中的嵌套参数吗？

A: 是的，扩展支持 `t('key', [param1, param2])` 格式的带参数翻译调用。

## 贡献指南

如果您发现了 bug 或有新功能的建议，请在 [GitHub 仓库](https://github.com/zhaojunyan9528/i18n-csv.git) 上提交 issue 或 pull request。

## 更新日志

### v0.0.1

- 初始版本发布
- 支持基本的翻译预览功能
- 支持自定义 CSV 文件路径
- 支持配置热更新
- 支持参数化翻译调用
