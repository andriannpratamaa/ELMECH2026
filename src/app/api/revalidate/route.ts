import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Revalidate page cache
 * POST /api/revalidate?slug=tentang
 */
export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    // Revalidate the specific page
    revalidatePath(`/${slug}`);
    
    console.log(`[API] Revalidated page: /${slug}`);

    return NextResponse.json({
      success: true,
      message: `Revalidated page: /${slug}`,
      revalidated: true,
      now: Date.now(),
    });
  } catch (error) {
    console.error("[API] Revalidate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
