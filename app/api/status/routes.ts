import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { HazardService } from '@/lib/services/hazardServices';
import { CameraService } from '@/lib/services/cameraService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('cameraId');

    const db = await getDb();
    const hazardService = new HazardService(db);
    const cameraService = new CameraService(db);

    // Get detection stats and camera stats in parallel
    const [detectionResult, cameraResult] = await Promise.all([
      hazardService.getDetectionStats(cameraId || undefined),
      cameraService.getCameraStats()
    ]);

    if (!detectionResult.success) {
      return NextResponse.json(
        { success: false, error: detectionResult.error },
        { status: 500 }
      );
    }

    if (!cameraResult.success) {
      return NextResponse.json(
        { success: false, error: cameraResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      detectionStats: detectionResult.stats,
      cameraStats: cameraResult.stats
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}