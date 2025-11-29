import { resetSearchCount } from '@/lib/services/search';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await resetSearchCount();
        return NextResponse.json({ message: 'Search count reset successfully.' });
    } catch (error) {
        console.error('[API reset-search-count] Error resetting search count:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
