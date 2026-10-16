import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { useAssessments } from './AssessmentContext'
import { hasUnsavedAnswers, leaveAssessmentMessage } from './unsavedAnswers'

export default function AssessmentNavigationGuard() {
  const { assessments } = useAssessments()
  const dirty = hasUnsavedAnswers(assessments)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname === '/avaliacoes' &&
    (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search))
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm(leaveAssessmentMessage)) blocker.proceed()
    else blocker.reset()
  }, [blocker])
  useEffect(() => {
    if (!dirty) return
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  return null
}
