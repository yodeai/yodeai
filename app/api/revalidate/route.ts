import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get('path')
    const type = request.nextUrl.searchParams.get('type') as "page" | "layout";

    if (path) {
        revalidatePath(path, type)
        return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({
        revalidated: false,
        now: Date.now(),
        message: 'Missing path to revalidate',
    })
}