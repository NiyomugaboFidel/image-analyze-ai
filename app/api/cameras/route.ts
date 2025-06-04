import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { CameraService } from '@/lib/services/cameraService';

// GET /api/cameras - Get all cameras
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const cameraService = new CameraService(db);

    const result = await cameraService.getAllCameras();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cameras: result.cameras
    });

  } catch (error) {
    console.error('Create camera API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/cameras - Update camera
export async function PUT(request: NextRequest) {
  try {
    const { id, name, location, status, isAnalysisEnabled, analysisInterval } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Camera ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cameraService = new CameraService(db);

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;
    if (isAnalysisEnabled !== undefined) updates.isAnalysisEnabled = isAnalysisEnabled;
    if (analysisInterval !== undefined) updates.analysisInterval = analysisInterval;

    const result = await cameraService.updateCamera(id, updates);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Camera updated successfully'
    });

  } catch (error) {
    console.error('Update camera API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cameras - Delete camera
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('id');

    if (!cameraId) {
      return NextResponse.json(
        { success: false, error: 'Camera ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cameraService = new CameraService(db);

    const result = await cameraService.deleteCamera(cameraId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Camera deleted successfully'
    });

  } catch (error) {
    console.error('Delete camera API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/cameras - Create new camera
export async function POST(request: NextRequest) {
  try {
    const { id, name, deviceId, location, analysisInterval } = await request.json();

    // Validate required fields
    if (!id || !name || !deviceId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, name, deviceId' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cameraService = new CameraService(db);

    const result = await cameraService.createCamera({
      id,
      name,
      deviceId,
      location,
      analysisInterval
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      camera: result.camera
    }, { status: 201 });

  } catch (error) {
    console.error('Create camera API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}