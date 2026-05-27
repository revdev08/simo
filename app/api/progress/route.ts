import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const token = await getToken()
    if (!token) return new NextResponse('Unauthorized', { status: 401 })

    const supabase = createSupabaseClient(token)

    // Using admin client as a fallback or directly to bypass RLS if not configured for this new table
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('user_progress')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching progress:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data?.data || {} })
  } catch (error) {
    console.error('Progress GET error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const body = await req.json()
    const sessionProgress = body.progress

    if (!sessionProgress || typeof sessionProgress !== 'object') {
      return new NextResponse('Bad Request', { status: 400 })
    }

    const admin = createAdminClient()

    // Get current progress to merge
    const { data: current } = await admin
      .from('user_progress')
      .select('data')
      .eq('user_id', userId)
      .single()

    const currentData = current?.data || {}
    
    // Merge new data
    const mergedData = { ...currentData, ...sessionProgress }

    // Upsert
    const { error } = await admin
      .from('user_progress')
      .upsert({
        user_id: userId,
        data: mergedData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('Error saving progress:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: mergedData })
  } catch (error) {
    console.error('Progress POST error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
