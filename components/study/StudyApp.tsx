'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { BookOpen, CheckCircle, Circle, Play, ArrowLeft, Lightbulb, ChevronRight, BarChart } from 'lucide-react'

// Types
export interface Option {
  id: string
  texto: string
}

export interface Question {
  id: number
  modulo: string
  tema: string
  dificultad: string
  pregunta: string
  opciones: Option[]
  respuestaCorrecta: string
  explicacionIA: string
}

interface ProgressData {
  [questionId: number]: 'correct' | 'incorrect'
}

export default function StudyApp({ questions }: { questions: Question[] }) {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressData>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('simo_study_progress')
    if (saved) {
      try {
        setProgress(JSON.parse(saved))
      } catch (e) {}
    }
    setIsLoaded(true)
  }, [])

  // Save progress to localStorage
  const handleSaveProgress = (questionId: number, status: 'correct' | 'incorrect') => {
    const newProgress = { ...progress, [questionId]: status }
    setProgress(newProgress)
    localStorage.setItem('simo_study_progress', JSON.stringify(newProgress))
  }

  // Compute modules and stats
  const modulesStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; incorrect: number }> = {}
    
    questions.forEach(q => {
      if (!stats[q.modulo]) {
        stats[q.modulo] = { total: 0, correct: 0, incorrect: 0 }
      }
      stats[q.modulo].total += 1
      
      const status = progress[q.id]
      if (status === 'correct') stats[q.modulo].correct += 1
      if (status === 'incorrect') stats[q.modulo].incorrect += 1
    })

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      progress: Math.round(((data.correct + data.incorrect) / data.total) * 100) || 0
    }))
  }, [questions, progress])

  if (!isLoaded) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando tu progreso...</div>

  if (activeModule) {
    const moduleQuestions = questions.filter(q => q.modulo === activeModule)
    return (
      <StudySession 
        moduleName={activeModule} 
        questions={moduleQuestions} 
        progress={progress}
        onSaveProgress={handleSaveProgress}
        onBack={() => setActiveModule(null)} 
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-xl">
          <BookOpen className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Módulos de Estudio</h2>
          <p className="text-gray-500">Selecciona un módulo para comenzar tu entrenamiento SIMO.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulesStats.map(mod => (
          <div 
            key={mod.name}
            onClick={() => setActiveModule(mod.name)}
            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer hover:border-purple-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-purple-600 ml-1" />
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2 pr-12">{mod.name}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4"/> {mod.total} preg.</span>
              <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4"/> {mod.correct}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-600">Progreso</span>
                <span className="text-gray-600">{mod.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${mod.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Sub-component for the actual study session
function StudySession({ 
  moduleName, 
  questions, 
  progress, 
  onSaveProgress,
  onBack 
}: { 
  moduleName: string, 
  questions: Question[], 
  progress: ProgressData,
  onSaveProgress: (id: number, status: 'correct'|'incorrect') => void,
  onBack: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  
  const question = questions[currentIndex]
  const currentStatus = progress[question.id]

  // If returning to a previously answered question, pre-fill it? 
  // Let's reset selection for fresh practice, or show if it's already answered.
  useEffect(() => {
    setSelectedOption(null)
    setShowExplanation(false)
  }, [currentIndex])

  const handleSelect = (optionId: string) => {
    if (selectedOption) return // Prevent changing answer after revealing

    setSelectedOption(optionId)
    setShowExplanation(true)
    
    const isCorrect = optionId === question.respuestaCorrecta
    onSaveProgress(question.id, isCorrect ? 'correct' : 'incorrect')
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a módulos
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              {question.tema}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              question.dificultad === 'Alta' ? 'bg-red-100 text-red-700' : 
              question.dificultad === 'Baja' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {question.dificultad}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Pregunta {currentIndex + 1} de {questions.length}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
            {question.pregunta}
          </h3>

          <div className="space-y-3">
            {question.opciones.map(opt => {
              const isSelected = selectedOption === opt.id
              const isCorrectAnswer = opt.id === question.respuestaCorrecta
              const isWrongSelection = isSelected && !isCorrectAnswer
              const showAsCorrect = showExplanation && isCorrectAnswer

              let baseClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 "
              
              if (!showExplanation) {
                baseClass += "border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer"
              } else if (showAsCorrect) {
                baseClass += "border-green-500 bg-green-50"
              } else if (isWrongSelection) {
                baseClass += "border-red-500 bg-red-50"
              } else {
                baseClass += "border-gray-100 bg-gray-50 opacity-50"
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={baseClass}
                  disabled={showExplanation}
                >
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    showAsCorrect ? 'border-green-500 bg-green-500 text-white' :
                    isWrongSelection ? 'border-red-500 bg-red-500 text-white' :
                    'border-gray-300'
                  }`}>
                    <span className="text-xs font-bold">{opt.id}</span>
                  </div>
                  <span className="text-gray-700 font-medium">{opt.texto}</span>
                </button>
              )
            })}
          </div>

          {/* Explanation Area */}
          {showExplanation && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Explicación del Instructor IA</h4>
                  <p className="text-blue-800 leading-relaxed text-sm md:text-base">
                    {question.explicacionIA}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 rounded-lg transition-colors"
          >
            Anterior
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!showExplanation || currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
