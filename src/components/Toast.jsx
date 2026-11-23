import { CheckCircle2, CircleAlert, X } from 'lucide-react'

export default function Toast({ type = 'success', message, onClose }) {
  const Icon = type === 'error' ? CircleAlert : CheckCircle2
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <Icon size={19} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Fechar notificação">
        <X size={17} />
      </button>
    </div>
  )
}
