import { ObjectId } from 'mongodb';

export interface HazardDetection {
  _id?: ObjectId;
  timestamp: Date;
  cameraId: string;
  cameraName: string;
  imageUrl: string;
  imageBase64: string;
  hazardType: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'false_positive';
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Camera {
  _id?: ObjectId;
  id: string;
  name: string;
  deviceId: string;
  status: 'active' | 'paused' | 'error';
  location?: string;
  isAnalysisEnabled: boolean;
  analysisInterval: number;
  lastAnalysis?: Date;
  totalDetections: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisSession {
  _id?: ObjectId;
  sessionId: string;
  cameraId: string;
  startTime: Date;
  endTime?: Date;
  totalFramesAnalyzed: number;
  totalHazardsDetected: number;
  status: 'active' | 'completed' | 'error';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettings {
  _id?: ObjectId;
  analysisInterval: number;
  maxStoredDetections: number;
  autoDeleteAfterDays: number;
  alertThreshold: 'low' | 'medium' | 'high';
  enableEmailAlerts: boolean;
  emailRecipients: string[];
  createdAt: Date;
  updatedAt: Date;
}