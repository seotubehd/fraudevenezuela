import { getSearchCount } from '@/lib/services/search';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const count = await getSearchCount();
        return NextResponse.json({ count });
    } catch (error) {
        console.error('[API search-count] Error getting search count:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
