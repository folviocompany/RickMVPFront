import { Cable, CheckCircle2 } from 'lucide-react'

export default function PlaceholderPage({ title, description, dependency }) {
  return (
    <section className="content-card dependency-page">
      <div className="dependency-icon"><Cable size={28} /></div>
      <span className="eyebrow">Dependência de backend</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="dependency-box">
        <strong>O que falta para ativar esta tela</strong>
        <span>{dependency}</span>
      </div>
      <div className="safe-note"><CheckCircle2 size={17} /> Nenhum dado fictício está sendo apresentado como informação real.</div>
    </section>
  )
}
