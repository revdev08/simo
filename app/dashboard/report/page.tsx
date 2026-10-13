import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient, createAdminClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import { getReportQuestions } from '@/lib/questions'
import ReportView from '@/components/study/ReportView'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function ReportPage() {
  const { userId, getToken } = await auth()
  const user = await currentUser()

  if (!userId) {
    redirect('/')
  }

  const token = await getToken()
  if (!token) {
    redirect('/')
  }

  // Verificamos estado premium
  const isUserPremium = await isPremium(userId)

  if (!isUserPremium) {
    redirect('/dashboard') // Redirigir si no es premium
  }

  // Fetch data
  const supabase = createSupabaseClient(token)
  const admin = createAdminClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: progressRow } = await admin
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .single()

  const progressData = progressRow?.data || {}

  const email = user?.emailAddresses?.[0]?.emailAddress || profile?.email || ''

  return (
    <DashboardShell email={email} name={user?.firstName} subscription="active">
      <div className="space-y-8 animate-enter">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mi progreso</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Cómo vas en cada módulo y qué temas te conviene reforzar.</p>
        </div>
        <ReportView questions={getReportQuestions()} progress={progressData} />
      </div>
    </DashboardShell>
  )
}
