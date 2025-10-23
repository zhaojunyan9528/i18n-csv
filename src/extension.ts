// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { getTranslation, loadCsvTranslations } from './csv-data-loader';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "i18n-csv" is now active!');

	// 注册一个 Hover Provider，只对特定语言（例如 TypeScript/JavaScript/Vue/HTML）生效
	const selector: vscode.DocumentSelector = [
		{ scheme: 'file', language: 'typescript' },
		{ scheme: 'file', language: 'javascript' },
		{ scheme: 'file', language: 'vue' },
		{ scheme: 'file', language: 'html' }
		// ... 添加其他您希望支持的文件类型
	];

	context.subscriptions.push(
		vscode.languages.registerHoverProvider(selector, {
			provideHover(document, position, token) {
				return createTranslationHover(document, position);
			}
		})
	);

	// 首次加载数据 (或在激活时)
	const workspaceRoot = vscode.workspace.rootPath || '';
	let csvConfig = getCSVFolderAndFile();
	loadCsvTranslations(csvConfig.folder, csvConfig.fileName);

	// 添加文件监听器以便在 CSV 文件更改时重新加载数据
	let watcher: vscode.FileSystemWatcher | undefined;
	if (workspaceRoot) {
		const csvFilePath = path.join(csvConfig.folder, csvConfig.fileName);
		watcher = vscode.workspace.createFileSystemWatcher(csvFilePath);
		context.subscriptions.push(watcher);
		context.subscriptions.push(watcher.onDidChange(() => {
			console.log('CSV file changed, reloading translations...');
			loadCsvTranslations(csvConfig.folder, csvConfig.fileName);
		}));
		context.subscriptions.push(watcher.onDidCreate(() => {
			console.log('CSV file created, loading translations...');
			loadCsvTranslations(csvConfig.folder, csvConfig.fileName);
		}));
	}

	// 添加配置变更监听器 - 这是使配置外部可配置的关键部分
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration('i18n-csv.csvPath')) {
			console.log('CSV path configuration changed, updating...');
			
			// 移除旧的文件监听器
			if (watcher) {
				// 注意：正确的做法是使用 watcher.dispose() 而不是从 subscriptions 中过滤
				watcher.dispose();
			}
			
			// 获取新的配置
			csvConfig = getCSVFolderAndFile();
			
			// 重新创建文件监听器
			if (workspaceRoot) {
				const csvFilePath = path.join(csvConfig.folder, csvConfig.fileName);
				watcher = vscode.workspace.createFileSystemWatcher(csvFilePath);
				context.subscriptions.push(watcher);
				context.subscriptions.push(watcher.onDidChange(() => {
					console.log('CSV file changed, reloading translations...');
					loadCsvTranslations(csvConfig.folder, csvConfig.fileName);
				}));
				context.subscriptions.push(watcher.onDidCreate(() => {
					console.log('CSV file created, loading translations...');
					loadCsvTranslations(csvConfig.folder, csvConfig.fileName);
				}));
			}
			
			// 重新加载翻译
			loadCsvTranslations(csvConfig.folder, csvConfig.fileName);
			vscode.window.showInformationMessage(`Translations reloaded from new path: ${path.join(csvConfig.folder, csvConfig.fileName)}`);
		}
	}));

    // 添加手动刷新翻译命令
    const reloadCommand = vscode.commands.registerCommand('i18n-csv.reloadTranslations', async () => {
        const workspaceRoot = vscode.workspace.rootPath || '';
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder opened');
            return;
        }
        
        const csvConfig = getCSVFolderAndFile();
        await loadCsvTranslations(csvConfig.folder, csvConfig.fileName);
        vscode.window.showInformationMessage(`Translations reloaded from ${path.join(csvConfig.folder, csvConfig.fileName)}`);
    });
    
    context.subscriptions.push(reloadCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// 获取CSV文件路径配置
function getCSVFilePath(): string {
    // 从配置中获取CSV文件路径，如果没有则使用默认路径
    const config = vscode.workspace.getConfiguration('i18n-csv');
    const csvPath = config.get<string>('csvPath', 'public/lang.csv');
    
    // 确保路径是相对于工作区根目录的
    const workspaceRoot = vscode.workspace.rootPath || '';
    return path.isAbsolute(csvPath) ? csvPath : path.join(workspaceRoot, csvPath);
}

// 获取CSV文件夹和文件名
function getCSVFolderAndFile(): { folder: string; fileName: string } {
    const fullPath = getCSVFilePath();
    return {
        folder: path.dirname(fullPath),
        fileName: path.basename(fullPath)
    };
}

function createTranslationHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
	const range = document.getWordRangeAtPosition(position);
	if (!range) {
		console.log('No word range found at position');
		return null;
	}

	const lineText = document.lineAt(position.line).text;
	console.log(`Checking line: ${lineText}`);

	// 增强的正则表达式，支持更多情况
	const keyMatch = lineText.match(/\bt\s*\(\s*['"]([^'"]*)['"](?:\s*,[^)]*)*\s*\)/g);
	console.log(`Found matches: ${keyMatch ? keyMatch.join(', ') : 'none'}`);

	if (keyMatch) {
		let targetKey: string | undefined;
		
		// 遍历所有匹配项，找到最接近悬停位置的一个
		for (const match of keyMatch) {
			const keyMatch = match.match(/\bt\s*\(\s*['"]([^'"]*)['"]/);
			if (keyMatch && keyMatch[1]) {
				const key = keyMatch[1];
				const matchStartIndex = lineText.indexOf(match);
				const matchEndIndex = matchStartIndex + match.length;
				
				// 检查悬停位置是否在匹配范围内
				if (position.character >= matchStartIndex && position.character <= matchEndIndex) {
					targetKey = key;
					console.log(`Found target key: ${targetKey}`);
					break;
				}
			}
		}

		if (targetKey) {
			const translations = getTranslation(targetKey);
			if (translations) {
				console.log(`Translations for key "${targetKey}": ${JSON.stringify(translations)}`);
				// 格式化输出内容为Markdown表格
				const contents = new vscode.MarkdownString();
				contents.isTrusted = true; // 允许完整的Markdown语法
				
				// 添加标题和表格头部
				contents.appendMarkdown(`**Key:** \`${targetKey}\`\n\n---\n\n`);
				contents.appendMarkdown(`|key|value|\n| --- | --- |\n`);
				
				// 遍历所有语言，并添加到表格中
				for (const lang in translations) {
					if (lang) {
						// 确保翻译内容中的特殊字符被转义
						const translation = (translations[lang] || 'NULL')
						.replace(/\|/g, '\\|')  // 转义竖线
						.replace(/\n/g, '\\n');  // 转义换行符
						contents.appendMarkdown(`| ${lang} | ${translation} |\n`);
					}
				}

				return new vscode.Hover(contents, range);
			}
		}
	}

	return null;
}
