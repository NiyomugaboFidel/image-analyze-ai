import { Db, ObjectId } from 'mongodb';
import { HazardDetection, Camera } from '@/types/database';

export class HazardService {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // Analyze image for hazards using Gemini API
  async analyzeImageForHazards(
    imageBase64: string,
    cameraId: string,
    cameraName: string
  ): Promise<{ success: true; detection?: HazardDetection } | { success: false; error: string }> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        return { success: false, error: 'Gemini API key not configured' };
      }

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analyze this image for dangerous situations such as: fire, smoke, people without safety equipment, falling objects, unsafe working conditions, accidents, spills, blocked exits, electrical hazards, or any other hazardous scenarios. 

If you detect danger, respond with JSON in this exact format:
{
  "hazardDetected": true,
  "hazardType": "specific type (e.g., fire, unsafe conditions, etc.)",
  "description": "detailed description of the hazard",
  "severity": "low|medium|high|critical",
  "confidence": 0.85
}

If no danger is present, respond with:
{
  "hazardDetected": false
}`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `API Error: ${response.status} - ${errorText}` };
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        return { success: false, error: 'No response from AI model' };
      }

      // Parse the JSON response
      let analysisResult;
      try {
        // Clean the response text and extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return { success: false, error: 'Invalid response format from AI' };
        }
        analysisResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        return { success: false, error: 'Failed to parse AI response' };
      }

      // If no hazard detected, return success without creating detection
      if (!analysisResult.hazardDetected) {
        return { success: true };
      }

      // Create hazard detection record
      const detection: HazardDetection = {
        timestamp: new Date(),
        cameraId,
        cameraName,
        imageUrl: '', // Will be set after saving to storage
        imageBase64,
        hazardType: analysisResult.hazardType || 'Unknown',
        description: analysisResult.description || 'Hazard detected',
        confidence: analysisResult.confidence || 0.5,
        severity: analysisResult.severity || 'medium',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      const result = await this.db.collection('hazard_detections').insertOne(detection);
      detection._id = result.insertedId;

      // Update camera statistics
      await this.updateCameraStats(cameraId);

      return { success: true, detection };

    } catch (error) {
      console.error('Error analyzing image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown analysis error'
      };
    }
  }

  // Get recent hazard detections
  async getRecentDetections(
    limit: number = 10,
    cameraId?: string
  ): Promise<{ success: true; detections: HazardDetection[] } | { success: false; error: string }> {
    try {
      const filter = cameraId ? { cameraId } : {};
      const detections = await this.db
        .collection('hazard_detections')
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray() as HazardDetection[];

      return { success: true, detections };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch detections'
      };
    }
  }

  // Update detection status
  async updateDetectionStatus(
    detectionId: string,
    status: 'active' | 'resolved' | 'false_positive'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db.collection('hazard_detections').updateOne(
        { _id: new ObjectId(detectionId) },
        { 
          $set: { 
            status, 
            updatedAt: new Date() 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Detection not found' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update detection'
      };
    }
  }

  // Get detection statistics
  async getDetectionStats(cameraId?: string): Promise<{
    success: true;
    stats: {
      total: number;
      active: number;
      resolved: number;
      falsePositives: number;
      bySeverity: Record<string, number>;
      byType: Record<string, number>;
    };
  } | { success: false; error: string }> {
    try {
      const filter = cameraId ? { cameraId } : {};
      
      const [total, active, resolved, falsePositives, bySeverity, byType] = await Promise.all([
        this.db.collection('hazard_detections').countDocuments(filter),
        this.db.collection('hazard_detections').countDocuments({ ...filter, status: 'active' }),
        this.db.collection('hazard_detections').countDocuments({ ...filter, status: 'resolved' }),
        this.db.collection('hazard_detections').countDocuments({ ...filter, status: 'false_positive' }),
        this.db.collection('hazard_detections').aggregate([
          { $match: filter },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]).toArray(),
        this.db.collection('hazard_detections').aggregate([
          { $match: filter },
          { $group: { _id: '$hazardType', count: { $sum: 1 } } }
        ]).toArray()
      ]);

      const severityStats = bySeverity.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const typeStats = byType.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        success: true,
        stats: {
          total,
          active,
          resolved,
          falsePositives,
          bySeverity: severityStats,
          byType: typeStats
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }

  // Update camera statistics
  private async updateCameraStats(cameraId: string): Promise<void> {
    try {
      await this.db.collection('cameras').updateOne(
        { id: cameraId },
        { 
          $inc: { totalDetections: 1 },
          $set: { 
            lastAnalysis: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Failed to update camera stats:', error);
    }
  }

  // Clean up old detections
  async cleanupOldDetections(daysToKeep: number = 30): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.db.collection('hazard_detections').deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['resolved', 'false_positive'] }
      });

      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup old detections'
      };
    }
  }
}