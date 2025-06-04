import { Db, ObjectId } from 'mongodb';
import { Camera } from '@/types/database';

export class CameraService {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // Get all cameras
  async getAllCameras(): Promise<{ success: true; cameras: Camera[] } | { success: false; error: string }> {
    try {
      const cameras = await this.db
        .collection('cameras')
        .find({})
        .sort({ createdAt: -1 })
        .toArray() as Camera[];

      return { success: true, cameras };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch cameras'
      };
    }
  }

  // Get camera by ID
  async getCameraById(cameraId: string): Promise<{ success: true; camera: Camera } | { success: false; error: string }> {
    try {
      const camera = await this.db
        .collection('cameras')
        .findOne({ id: cameraId }) as Camera | null;

      if (!camera) {
        return { success: false, error: 'Camera not found' };
      }

      return { success: true, camera };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch camera'
      };
    }
  }

  // Create new camera
  async createCamera(cameraData: {
    id: string;
    name: string;
    deviceId: string;
    location?: string;
    analysisInterval?: number;
  }): Promise<{ success: true; camera: Camera } | { success: false; error: string }> {
    try {
      // Check if camera with same ID or deviceId already exists
      const existingCamera = await this.db
        .collection('cameras')
        .findOne({ 
          $or: [
            { id: cameraData.id },
            { deviceId: cameraData.deviceId }
          ]
        });

      if (existingCamera) {
        return { success: false, error: 'Camera with this ID or device already exists' };
      }

      const camera: Camera = {
        id: cameraData.id,
        name: cameraData.name,
        deviceId: cameraData.deviceId,
        status: 'paused',
        location: cameraData.location,
        isAnalysisEnabled: true,
        analysisInterval: cameraData.analysisInterval || 10000,
        totalDetections: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.db.collection('cameras').insertOne(camera);
      camera._id = result.insertedId;

      return { success: true, camera };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create camera'
      };
    }
  }

  // Update camera
  async updateCamera(
    cameraId: string,
    updates: Partial<Pick<Camera, 'name' | 'location' | 'status' | 'isAnalysisEnabled' | 'analysisInterval'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db.collection('cameras').updateOne(
        { id: cameraId },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Camera not found' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update camera'
      };
    }
  }

  // Delete camera
  async deleteCamera(cameraId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete camera record
      const result = await this.db.collection('cameras').deleteOne({ id: cameraId });

      if (result.deletedCount === 0) {
        return { success: false, error: 'Camera not found' };
      }

      // Optionally delete associated detections (or keep for historical purposes)
      // await this.db.collection('hazard_detections').deleteMany({ cameraId });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete camera'
      };
    }
  }

  // Update camera status
  async updateCameraStatus(
    cameraId: string,
    status: 'active' | 'paused' | 'error',
    errorMessage?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { 
        status,
        updatedAt: new Date()
      };

      if (errorMessage) {
        updateData.errorMessage = errorMessage;
      } else {
        updateData.$unset = { errorMessage: 1 };
      }

      const result = await this.db.collection('cameras').updateOne(
        { id: cameraId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Camera not found' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update camera status'
      };
    }
  }

  // Get camera statistics
  async getCameraStats(): Promise<{
    success: true;
    stats: {
      totalCameras: number;
      activeCameras: number;
      pausedCameras: number;
      errorCameras: number;
      totalDetections: number;
    };
  } | { success: false; error: string }> {
    try {
      const [totalCameras, activeCameras, pausedCameras, errorCameras, detectionStats] = await Promise.all([
        this.db.collection('cameras').countDocuments({}),
        this.db.collection('cameras').countDocuments({ status: 'active' }),
        this.db.collection('cameras').countDocuments({ status: 'paused' }),
        this.db.collection('cameras').countDocuments({ status: 'error' }),
        this.db.collection('cameras').aggregate([
          { $group: { _id: null, totalDetections: { $sum: '$totalDetections' } } }
        ]).toArray()
      ]);

      const totalDetections = detectionStats[0]?.totalDetections || 0;

      return {
        success: true,
        stats: {
          totalCameras,
          activeCameras,
          pausedCameras,
          errorCameras,
          totalDetections
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch camera statistics'
      };
    }
  }
}