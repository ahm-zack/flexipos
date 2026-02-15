import { NextResponse } from 'next/server';

export async function POST() {
    // This endpoint is deprecated. Use the new step-based signup flow:
    // 1. POST /api/auth/signup/step1 - Create user account
    // 2. POST /api/auth/signup/step2 - Create business and link to user

    return NextResponse.json(
        {
            error: 'This signup endpoint is deprecated. Please use the signup page which implements the new 2-step flow.',
            newFlow: {
                step1: '/api/auth/signup/step1',
                step2: '/api/auth/signup/step2'
            }
        },
        { status: 410 } // 410 Gone
    );
}
