import { Request, Response } from "express";
import { httpStatus } from "../types";
import os from "os";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { ethers } from "ethers";

// Add a utility function for error responses
const sendErrorResponse = (res: Response, message: string, status: number) => {
  res.status(status).json({ error: message });
};

// Add utility functions for encryption and decryption
const encryptData = (data: any, password: string) => {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encryptedSeed = cipher.update(JSON.stringify(data), "utf8", "hex");
  encryptedSeed += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    encryptedSeed,
    authTag: authTag.toString("hex"),
  };
};

const decryptData = (encryptedData: any, password: string) => {
  const salt = Buffer.from(encryptedData.salt, "hex");
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const iv = Buffer.from(encryptedData.iv, "hex");
  const authTag = Buffer.from(encryptedData.authTag, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decryptedSeed = decipher.update(encryptedData.encryptedSeed, "hex", "utf8");
  decryptedSeed += decipher.final("utf8");

  return JSON.parse(decryptedSeed);
};

export const storeSeedHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { homedir } = os.userInfo();
  console.log(req.body);
  const { encData, unencData, password } = req.body;
  if (!encData || !password) {
    return sendErrorResponse(res, "Seed and password are required", httpStatus.BAD_REQUEST);
  }
  try {
    const encryptedData = encryptData(encData, password);
    const filePath = path.join(homedir, `dwat.json`);
    
    // Store both encrypted data and unencrypted data
    const dataToStore = {
      ...encryptedData,
      unencData // Store unencrypted data as plain text
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataToStore));

    res.status(httpStatus.CREATED).json({ message: "Seed stored successfully" });
  } catch (error) {
    console.error("error3", error);
    sendErrorResponse(res, "Failed to store seed", httpStatus.BAD_REQUEST);
  }
};

export const getSeedHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { password } = req.body;
  console.log("password", password);
  if (!password) {
    return sendErrorResponse(res, "Password is required", httpStatus.BAD_REQUEST);
  }
  try {
    const { homedir } = os.userInfo();
    const filePath = path.join(homedir, `dwat.json`);
    const encryptedDataStr = await fs.readFile(filePath, "utf8");
    const encryptedData = JSON.parse(encryptedDataStr);

    const decryptedSeed = decryptData(encryptedData, password);
    res.status(httpStatus.OK).json(decryptedSeed);
  } catch (error) {
    sendErrorResponse(res, "Failed to retrieve seed", httpStatus.BAD_REQUEST);
  }
};

export const storeConfirmHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { password } = req.body;
  if (!password) {
    return sendErrorResponse(res, "Password is required", httpStatus.BAD_REQUEST);
  }
  try {
    const { homedir } = os.userInfo();
    const filePath = path.join(homedir, `dwat.json`);
    const encryptedDataStr = await fs.readFile(filePath, "utf8");
    const encryptedData = JSON.parse(encryptedDataStr);
    
    const decryptedData = decryptData(encryptedData, password);
    const confirmedData = { ...decryptedData, confirm: true };
    const encryptedConfirmedData = encryptData(confirmedData, password);
    await fs.writeFile(filePath, JSON.stringify(encryptedConfirmedData));
    res.status(httpStatus.OK).json({ message: "Seed confirmed successfully" });

  } catch (error) {
    sendErrorResponse(res, "Failed to retrieve seed", httpStatus.BAD_REQUEST);
  }
};

export const getPrivateKeyHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { password } = req.body;
  if (!password) {
    return sendErrorResponse(res, "Password is required", httpStatus.BAD_REQUEST);
  }
  try {
    const { homedir } = os.userInfo();
    const filePath = path.join(homedir, `dwat.json`);
    const encryptedDataStr = await fs.readFile(filePath, "utf8");
    const encryptedData = JSON.parse(encryptedDataStr);
    const seed = decryptData(encryptedData, password);
    const privateKey = ethers.Wallet.fromPhrase(seed).privateKey;
    res.status(httpStatus.OK).json(privateKey);
  } catch (error) {
    sendErrorResponse(res, "Failed to retrieve private key", httpStatus.BAD_REQUEST);
  }
};

export const existWalletHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const { homedir } = os.userInfo();
  const filePath = path.join(homedir, `dwat.json`);
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  res.status(httpStatus.OK).json(exists);
};

export const getAddressHandler = async (_req: Request, res: Response): Promise<void> => {
  const { homedir } = os.userInfo();
  const filePath = path.join(homedir, `dwat.json`);
  
  try {
    const fileData = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(fileData);
    const address = jsonData.unencData;
    
    res.status(httpStatus.OK).json(address);
  } catch (error) {
    sendErrorResponse(res, "Failed to retrieve address", httpStatus.BAD_REQUEST);
  }
}
