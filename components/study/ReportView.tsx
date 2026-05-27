'use client'

import React, { useMemo } from 'react'
import { Question } from './StudyApp'
import { ArrowLeft, CheckCircle, XCircle, BarChart3, AlertTriangle, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'

interface ReportViewProps {
  questions: Question[]
  progress: Record<string, 'correct' | 'incorrect'>
}

export default function ReportView({ questions, progress }: ReportViewProps) {
  const stats = useMemo(() => {
    let totalCorrect = 0
    let totalIncorrect = 0
    const moduleStats: Record<string, { correct: number, incorrect: number, total: number }> = {}
    const themeStats: Record<string, { correct: number, incorrect: number, total: number, module: string }> = {}

    // Initialize stats based on answered questions
    Object.keys(progress).forEach(qIdStr => {
      const qId = parseInt(qIdStr, 10)
      const q = questions.find(question => question.id === qId)
      if (!q) return

      const isCorrect = progress[qIdStr] === 'correct'

      if (isCorrect) totalCorrect++
      else totalIncorrect++

      // Module Stats
      if (!moduleStats[q.modulo]) moduleStats[q.modulo] = { correct: 0, incorrect: 0, total: 0 }
      moduleStats[q.modulo].total++
      if (isCorrect) moduleStats[q.modulo].correct++
      else moduleStats[q.modulo].incorrect++

      // Theme Stats
      if (!themeStats[q.tema]) themeStats[q.tema] = { correct: 0, incorrect: 0, total: 0, module: q.modulo }
      themeStats[q.tema].total++
      if (isCorrect) themeStats[q.tema].correct++
      else themeStats[q.tema].incorrect++
    })

    const totalAnswered = totalCorrect + totalIncorrect
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    // Find weakest themes (at least 3 questions answered to be statistically relevant, or just sort by error rate)
    const weakThemes = Object.entries(themeStats)
      .map(([tema, data]) => ({
        tema,
        ...data,
        errorRate: data.total > 0 ? (data.incorrect / data.total) * 100 : 0
      }))
      .filter(t => t.total > 0 && t.incorrect > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.total - a.total)
      .slice(0, 5) // Top 5 weakest themes

    const modulePerformance = Object.entries(moduleStats).map(([modulo, data]) => ({
      modulo,
      ...data,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    })).sort((a, b) => b.accuracy - a.accuracy)

    return { totalCorrect, totalIncorrect, totalAnswered, accuracy, weakThemes, modulePerformance }
  }, [questions, progress])

  if (stats.totalAnswered === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <BarChart3 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Aún no hay datos suficientes</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Comienza a responder preguntas en los módulos o simulacros para generar tu reporte de rendimiento.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 mt-4"
        >
          Ir a estudiar
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Back button */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>
        <div className="flex items-center gap-2 px-4">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-slate-900 dark:text-white">Reporte de Rendimiento</span>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp className="w-16 h-16" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 z-10">Precisión Global</span>
          <div className="mt-4 z-10">
            <div className="text-4xl font-black">{stats.accuracy}%</div>
            <p className="text-sm text-indigo-100 mt-1">{stats.totalAnswered} preguntas respondidas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aciertos</span>
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.totalCorrect}</div>
            <p className="text-xs text-slate-500 mt-1">Respuestas correctas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Errores</span>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-950/40 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-red-600 dark:text-red-400">{stats.totalIncorrect}</div>
            <p className="text-xs text-slate-500 mt-1">Respuestas incorrectas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Área Destacada</span>
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/40 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200 truncate" title={stats.modulePerformance[0]?.modulo || '-'}>
              {stats.modulePerformance[0]?.modulo || '-'}
            </div>
            <p className="text-xs text-slate-500 mt-1">{stats.modulePerformance[0]?.accuracy || 0}% de precisión</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            Rendimiento por Módulo
          </h3>
          <div className="space-y-6">
            {stats.modulePerformance.map(mod => (
              <div key={mod.modulo} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate pr-4" title={mod.modulo}>{mod.modulo}</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{mod.accuracy}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 dark:bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${mod.accuracy}%` }}
                  ></div>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{mod.correct} correctas</span>
                  <span>{mod.incorrect} incorrectas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Themes / Areas of Improvement */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Áreas a Mejorar (Temas)
          </h3>
          
          {stats.weakThemes.length > 0 ? (
            <div className="space-y-4">
              {stats.weakThemes.map((theme) => (
                <div key={theme.tema} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{theme.tema}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{theme.module}</span>
                    </div>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-md ml-2 shrink-0">
                      {Math.round(theme.errorRate)}% error
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 mt-2 bg-white dark:bg-slate-900 inline-flex px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-red-500">{theme.incorrect} fallos</span>
                    <span className="text-emerald-500">{theme.correct} aciertos</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
              <h4 className="text-slate-700 dark:text-slate-300 font-bold">¡Todo perfecto por ahora!</h4>
              <p className="text-slate-500 text-sm mt-1">Sigue practicando para descubrir dónde necesitas mejorar.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
