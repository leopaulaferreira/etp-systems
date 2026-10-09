import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react'
import type { Assessment } from '../../../types/assessment'
import {
  canStart,
  formatAssessmentDate,
  isAnswered,
  latestScore,
  remainingAttempts,
} from '../assessment'
import AssessmentBadge from './AssessmentBadge'
import AssessmentIcon from './AssessmentIcon'

type AssessmentDialogProps = {
  item: Assessment
  onClose: () => void
  onReviewLesson?: () => void
  onStart: () => void
  onAnswer: (questionId: string, option: number) => void
  onSubmit: () => void
  submitting: boolean
  submitError: boolean
}
const primary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-not-allowed disabled:opacity-40'
const secondary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-panel-alt px-4 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-not-allowed disabled:opacity-40'

export default function AssessmentDialog({
  item,
  onClose,
  onReviewLesson,
  onStart,
  onAnswer,
  onSubmit,
  submitting,
  submitError,
}: AssessmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const questionRef = useRef<HTMLSpanElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const [questionIndex, setQuestionIndex] = useState(() => {
    const unanswered = item.questions.findIndex((question) => !isAnswered(question, item.answers))
    return unanswered >= 0 ? unanswered : Math.max(0, item.questions.length - 1)
  })
  const question = item.questions[questionIndex]
  const answered = item.questions.filter((question) => isAnswered(question, item.answers)).length
  const score = latestScore(item)
  const lastAttempt = item.attempts.at(-1)
  const passed = score !== null && score >= item.minimumScore

  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement as HTMLElement | null
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (trigger?.isConnected) trigger.focus()
      else document.getElementById('assessment-list')?.focus()
    }
  }, [])

  useEffect(() => {
    if (item.status === 'in_progress') questionRef.current?.focus()
    if (item.status === 'completed') resultRef.current?.focus()
  }, [questionIndex, item.status])

  function start() {
    setQuestionIndex(0)
    onStart()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="assessment-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled])',
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === questionRef.current ||
            document.activeElement === resultRef.current)
        ) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-[24px] border border-ink-200 bg-panel p-0 text-ink-900 shadow-card backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <AssessmentIcon topic={item.topic} />
            <AssessmentBadge status={item.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar avaliação"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div>
          <h2
            id="assessment-dialog-title"
            className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl"
          >
            {item.title}
          </h2>
          <p className="mt-2 text-xs leading-5 text-ink-500">
            {item.courseType} · {item.course}
          </p>
          {onReviewLesson && <button type="button" onClick={onReviewLesson} className={`${secondary} mt-4`}>
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Voltar às aulas do curso
          </button>}
        </div>
        {(item.status === 'pending' || item.status === 'scheduled') && (
          <>
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-ink-200 bg-panel-alt p-4 text-sm">
              <p className="flex items-center gap-2 text-ink-700">
                <ClipboardCheck
                  className="h-4 w-4 shrink-0 text-brand-blue-400"
                  aria-hidden="true"
                />
                {item.questions.length} questões
              </p>
              <p className="flex items-center gap-2 text-ink-700">
                <Clock3 className="h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" />~
                {item.estimatedMinutes} minutos
              </p>
              <p className="text-ink-500">
                Nota mínima <strong className="block text-ink-900">{item.minimumScore}%</strong>
              </p>
              <p className="text-ink-500">
                Tentativas disponíveis{' '}
                <strong className="block text-ink-900">{remainingAttempts(item)}</strong>
              </p>
            </div>
            {item.status === 'scheduled' ? (
              <div className="flex items-start gap-3 rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm leading-6 text-violet-200">
                <CalendarDays className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>
                  Avaliação agendada para{' '}
                  <strong>
                    {item.availableAt
                      ? formatAssessmentDate(item.availableAt)
                      : 'uma próxima etapa'}
                  </strong>
                  . Você poderá começar quando ela for liberada.
                </p>
              </div>
            ) : (
              <p className="text-sm leading-6 text-ink-500">
                Escolha uma resposta por questão. Você pode revisar suas escolhas antes de concluir.
                O tempo é uma estimativa, sem contagem regressiva.
              </p>
            )}
            {item.status === 'pending' && (
              <button
                type="button"
                onClick={start}
                disabled={!canStart(item)}
                className={`${primary} self-start`}
              >
                Começar avaliação <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </>
        )}
        {item.status === 'in_progress' && question && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-500">
                <span>
                  Questão {questionIndex + 1} de {item.questions.length}
                </span>
                <span>
                  {answered} {answered === 1 ? 'respondida' : 'respondidas'}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Questões respondidas"
                aria-valuenow={answered}
                aria-valuemin={0}
                aria-valuemax={item.questions.length}
                className="h-2 overflow-hidden rounded-full bg-ink-100"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-blue-600 to-brand-cyan-400"
                  style={{ width: `${(answered / item.questions.length) * 100}%` }}
                />
              </div>
            </div>
            <fieldset className="min-w-0">
              <legend className="mb-4 w-full">
                <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-brand-blue-400">
                  {question.kind === 'multiple_choice' ? 'Múltipla escolha' : 'Verdadeiro ou falso'}
                </span>
                <span
                  ref={questionRef}
                  tabIndex={-1}
                  className="block rounded text-base font-bold leading-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
                >
                  {question.prompt}
                </span>
              </legend>
              <div className="flex flex-col gap-3">
                {question.options.map((option, index) => (
                  <label
                    key={`${question.id}-${index}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-6 transition-colors focus-within:ring-2 focus-within:ring-brand-blue-400 ${item.answers[question.id] === index ? 'border-brand-blue-500/60 bg-brand-blue-500/10 text-ink-900' : 'border-ink-200 bg-panel-alt text-ink-700 hover:border-brand-blue-500/40'}`}
                  >
                    <input
                      type="radio"
                      name={`answer-${question.id}`}
                      value={index}
                      checked={item.answers[question.id] === index}
                      onChange={() => onAnswer(question.id, index)}
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-blue-500"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-5 text-ink-500">Você pode rever as aulas e voltar à avaliação sem perder as respostas desta sessão. Recarregar a página descarta respostas ainda não enviadas.</p>
            {submitError && <p role="alert" className="text-xs font-semibold text-rose-400">Não foi possível enviar a avaliação. Confira sua conexão e tente novamente.</p>}
            {questionIndex === item.questions.length - 1 && answered < item.questions.length && (
              <p role="status" className="text-xs font-semibold text-amber-300">
                Responda todas as questões antes de concluir.
              </p>
            )}
            <div className="flex flex-wrap justify-between gap-3 border-t border-ink-100 pt-4">
              <button
                type="button"
                onClick={() => setQuestionIndex((index) => index - 1)}
                disabled={questionIndex === 0}
                className={secondary}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Anterior
              </button>
              {onReviewLesson && <button type="button" onClick={onReviewLesson} className={secondary}>
                <BookOpen className="h-4 w-4" aria-hidden="true" /> Voltar às aulas
              </button>}
              {questionIndex < item.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setQuestionIndex((index) => index + 1)}
                  className={primary}
                >
                  Próxima <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={submitting || answered !== item.questions.length}
                  className={primary}
                >
                  {submitting ? 'Enviando...' : 'Concluir avaliação'} <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}
        {item.status === 'completed' && lastAttempt && score !== null && (
          <>
            <div
              role="status"
              className={`flex flex-wrap items-center gap-4 rounded-2xl border p-5 ${passed ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-amber-400/20 bg-amber-400/10'}`}
            >
              <span
                className={`text-4xl font-extrabold tracking-tight ${passed ? 'text-emerald-300' : 'text-amber-300'}`}
              >
                {score}%
              </span>
              <div>
                <h3
                  ref={resultRef}
                  tabIndex={-1}
                  className="rounded font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
                >
                  {passed ? 'Parabéns, você foi aprovado!' : 'Continue praticando'}
                </h3>
                <p className="mt-1 text-xs leading-5 text-ink-500">
                  Nota mínima: {item.minimumScore}% · Tentativa {item.attempts.length} de{' '}
                  {item.maxAttempts}
                </p>
              </div>
            </div>
            {item.questions.every((question) => question.correctOption !== undefined) ? <div>
              <h3 className="mb-4 text-base font-bold">Confira suas respostas</h3>
              <ol className="flex flex-col gap-4">
                {item.questions.map((question, index) => {
                  const selected = lastAttempt.answers[question.id]
                  const correct = selected === question.correctOption
                  const Icon = correct ? CheckCircle2 : XCircle
                  return (
                    <li
                      key={question.id}
                      className="rounded-xl border border-ink-200 bg-panel-alt p-4"
                    >
                      <p className="flex items-start gap-2 text-sm font-bold leading-6">
                        <Icon
                          className={`mt-1 h-4 w-4 shrink-0 ${correct ? 'text-emerald-400' : 'text-amber-300'}`}
                          aria-hidden="true"
                        />
                        <span>
                          {index + 1}. {question.prompt}
                        </span>
                      </p>
                      <p className="mt-2 text-xs leading-6 text-ink-500">
                        Sua resposta:{' '}
                        <span className="font-semibold text-ink-700">
                          {question.options[selected] ?? 'Não respondida'}
                        </span>{' '}
                        · {correct ? 'Correta' : 'Incorreta'}
                      </p>
                      {!correct && (
                        <p className="text-xs leading-6 text-emerald-300">
                          Resposta correta: {question.options[question.correctOption!]}
                        </p>
                      )}
                      <p className="mt-2 text-xs leading-6 text-ink-500">{question.explanation}</p>
                    </li>
                  )
                })}
              </ol>
            </div> : <p className="rounded-xl border border-ink-200 bg-panel-alt p-4 text-sm leading-6 text-ink-500">Revise a aula antes de tentar novamente. A correção detalhada aparece após a aprovação ou ao terminar as tentativas.</p>}
            {!passed && !remainingAttempts(item) && (
              <p className="text-sm text-amber-300">
                Você utilizou todas as tentativas desta avaliação.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {canStart(item) && (
                <button type="button" onClick={start} className={secondary}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Tentar novamente ({remainingAttempts(item)})
                </button>
              )}
              <button type="button" onClick={onClose} className={primary}>
                Fechar resultado
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
