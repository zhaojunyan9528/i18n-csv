import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import * as vscode from 'vscode';

// 存储解析后的数据: { key: { lang1: '...', lang2: '...' } }
let translationCache = new Map<string, { [lang: string]: string }>();

export async function loadCsvTranslations(workspaceRoot: string, csvFileName: string): Promise<void> {
  try {
    const csvPath = path.join(workspaceRoot, csvFileName);
    console.log(`Attempting to load CSV from: ${csvPath}`);

    // 检查文件是否存在
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at ${csvPath}`);
      // 尝试寻找项目中的所有csv文件
      const allCsvFiles = await vscode.workspace.findFiles('**/*.csv');
      console.log(`Found ${allCsvFiles.length} CSV files in workspace`);
      allCsvFiles.forEach(file => console.log(`CSV file: ${file.fsPath}`));
      return;
    }

    translationCache.clear();
    const tempResults: any[] = [];
    let csvHeaders: string[] = []; // 存储原始CSV标题
    let isFirstRow = true;

    // 读取并解析 CSV - 使用索引作为键名 (_0, _1, _2...)
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser({
          // 不使用第一行作为标题
          headers: false
        }))
        .on('data', (data: any[]) => {
          if (isFirstRow) {
            // 第一行作为标题行
            csvHeaders = Object.values(data);
            isFirstRow = false;
          } else {
            // 其他行作为数据行
            tempResults.push(data);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // 将数据转换为 Map 结构
    if (tempResults.length > 0 && csvHeaders.length > 0) {
      // 查找包含'key'的列索引（忽略大小写）
      const keyIndex = csvHeaders.findIndex(header => header.toLowerCase() === 'key');
      
      if (keyIndex === -1) {
        console.error('CSV file does not contain a "key" column (case insensitive)');
        return;
      }
      
      // 构建语言代码映射：{_0: 'en', _1: 'zh', ...}
      const languageColumns: { [key: string]: string } = {};
      csvHeaders.forEach((header, index) => {
        if (index !== keyIndex) {
          languageColumns[`_${index}`] = header; // 保留原始语言代码作为显示名称
        }
      });

      for (const row of tempResults) {
        const key = row[keyIndex];
        if (key) {
          const translations: { [lang: string]: string } = {};
          
          // 遍历所有语言列
          csvHeaders.forEach((header, index) => {
            if (index !== keyIndex) {
              translations[header] = row[index] || ''; // 确保即使没有翻译也有默认值
            }
          });
          
          translationCache.set(key, translations);
        }
      }
    }
    
    console.log(`Successfully loaded ${translationCache.size} translations from ${csvFileName}`);
  } catch (error) {
    console.error(`Failed to load CSV translations: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getTranslation(key: string) {
  return translationCache.get(key);
}

// 添加清除缓存的方法，便于扩展管理内存
export function clearTranslationCache(): void {
  translationCache.clear();
  console.log('Translation cache cleared');
}
