import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { HazardService } from '@/lib/services/hazardServices';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, cameraId, cameraName } = await request.json();

    // Validate required fields
    if (!imageBase64 || !cameraId || !cameraName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: imageBase64, cameraId, cameraName' },
        { status: 400 }
      );
    }

    // Validate base64 image format
    if (!imageBase64.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid image format. Expected base64 data URL' },
        { status: 400 }
      );
    }

    // Extract base64 data without data URL prefix
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { success: false, error: 'Invalid base64 image data' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await getDb();
    const hazardService = new HazardService(db);

    // Analyze image for hazards
    const result = await hazardService.analyzeImageForHazards(
      base64Data,
      cameraId,
      cameraName
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Return result
    return NextResponse.json({
      success: true,
      hazardDetected: !!result.detection,
      detection: result.detection
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('cameraId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const hazardService = new HazardService(db);

    // Get recent detections
    const result = await hazardService.getRecentDetections(limit, cameraId || undefined);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      detections: result.detections
    });

  } catch (error) {
    console.error('Get detections API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}