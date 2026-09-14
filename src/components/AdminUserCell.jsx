import { Link } from 'react-router-dom'
import { planLatin } from '../lib/plans.js'
import { planOf } from '../lib/dbFromState.js'

export function userPlanLabel(db, user) {
  if (!user) return ''
  const plan = planOf(db, user)
  return planLatin(plan) || user.plan || ''
}

export default function AdminUserCell({
  db,
  user,
  name,
  to,
  fallback = '—',
}) {
  const displayName = (user && user.name) || name || fallback
  const plan = userPlanLabel(db, user)
  const phone = (user && user.phone) || ''
  const href = to || (user && user.id ? `/admin/customers/${user.id}` : null)
  const title = href && user?.id
    ? <Link className="cust-link" to={href}>{displayName}</Link>
    : displayName

  return (
    <>
      {title}
      {(plan || phone) ? (
        <>
          <br />
          <span className="cell-sub">
            {plan || null}
            {plan && phone ? ' · ' : null}
            {phone ? <span dir="ltr">{phone}</span> : null}
          </span>
        </>
      ) : null}
    </>
  )
}
