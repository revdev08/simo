import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient, createAdminClient } from '@/lib/supabase'
import { isPremium } from '@/lib/premium'
import questionsData from '@/questions.json'
import ReportView from '@/components/study/ReportView'
import ThemeToggle from '@/components/ThemeToggle'
import SignOutButton from '@/components/SignOutButton'

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile & Status Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Mi Rendimiento 📊</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {user?.emailAddresses?.[0]?.emailAddress || profile?.email || 'Estudiante'}
            </p>
          </div>

          <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
            <ThemeToggle />
            <div className="px-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <div>
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                  Suscripción Activa
                </div>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* Main Content Area */}
        <ReportView questions={questionsData as any} progress={progressData} />

      </div>
    </div>
  )
}
