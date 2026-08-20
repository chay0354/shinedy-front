// מנוע ה-KPI של שנדי — כל המדדים נגזרים מנתוני המערכת בלבד.
// כשאין מספיק נתונים מחזירים null, והמסך מציג "אין מספיק נתונים" ולא 0 מטעה.
import {
  ACQUISITION_CATEGORIES, CAPEX_CATEGORIES, FIXED_CATEGORIES,
  isActiveSubscriber, totalCreditLiability, unitsOut,
} from './kpiSupport.js'

const DAY = 86400000
export const CURRENCY = '₪'

export const PERIODS = [
  { id: 'this-month', label: 'החודש' },
  { id: 'last-month', label: 'חודש שעבר' },
  { id: 'last-3', label: '3 חודשים אחרונים' },
  { id: 'last-6', label: '6 חודשים אחרונים' },
  { id: 'this-year', label: 'השנה' },
  { id: 'custom', label: 'טווח מותאם' },
]

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)

// טווח התקופה הנבחרת + הטווח המקביל הקודם (להשוואת מגמה)
export function periodRange(id, custom) {
  const now = new Date()
  let start, end
  switch (id) {
    case 'last-month': {
      const m = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      start = startOfMonth(m); end = endOfMonth(m); break
    }
    case 'last-3':
      start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1)); end = endOfMonth(now); break
    case 'last-6':
      start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1)); end = endOfMonth(now); break
    case 'this-year':
      start = new Date(now.getFullYear(), 0, 1); end = endOfMonth(now); break
    case 'custom':
      start = custom && custom.from ? new Date(custom.from) : startOfMonth(now)
      end = custom && custom.to ? new Date(new Date(custom.to).setHours(23, 59, 59, 999)) : endOfMonth(now)
      break
    default:
      start = startOfMonth(now); end = endOfMonth(now)
  }
  const span = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - span)
  return { start, end, prevStart, prevEnd }
}

// רשימת החודשים שבתוך הטווח
function monthsIn(start, end) {
  const out = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    const mStart = new Date(cur.getFullYear(), cur.getMonth(), 1)
    const mEnd = endOfMonth(cur)
    out.push({
      start: mStart,
      end: mEnd > end ? end : mEnd,
      key: `${cur.getFullYear()}-${cur.getMonth() + 1}`,
      label: cur.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' }),
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return out
}

const inRange = (iso, s, e) => {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return t >= s.getTime() && t <= e.getTime()
}

// פריסת הוצאות על התקופה:
// הוצאה חד-פעמית נספרת בתאריך שלה; הוצאה חודשית קבועה נספרת בכל חודש מאז תחילתה ועד שהופסקה.
export function expenseOccurrences(expenses, start, end, months) {
  const out = []
  for (const e of expenses) {
    if (!e.recurring) {
      if (inRange(e.date, start, end)) out.push({ ...e, occurrence: e.date })
      continue
    }
    const from = new Date(e.date).getTime()
    const until = e.endDate ? new Date(e.endDate).getTime() : Infinity
    for (const m of months) {
      if (from <= m.end.getTime() && until >= m.start.getTime()) {
        out.push({ ...e, occurrence: m.end.toISOString(), isRecurringOccurrence: true })
      }
    }
  }
  return out
}

// האם יחידה מסוימת הייתה אצל לקוחה בנקודת זמן
function heldAt(item, t) {
  const since = new Date(item.since || item.orderCreatedAt).getTime()
  const until = item.returnedAt ? new Date(item.returnedAt).getTime() : Infinity
  return since <= t && until > t
}

// חפיפת ימים בין החזקת פריט לבין הטווח
function overlapDays(sinceIso, untilIso, s, e) {
  const a = Math.max(new Date(sinceIso).getTime(), s.getTime())
  const b = Math.min(untilIso ? new Date(untilIso).getTime() : Date.now(), e.getTime())
  return b > a ? (b - a) / DAY : 0
}

// כל הפריטים שהיו אצל לקוחה בנקודת זמן — מכל ההזמנות שלה
function userItemsAt(db, userId, t) {
  const out = []
  for (const o of db.orders) {
    if (o.userId !== userId) continue
    for (const it of o.items) {
      if (heldAt({ ...it, orderCreatedAt: o.createdAt }, t)) {
        const product = db.products.find((p) => p.id === it.pid)
        if (product) out.push({ ...it, product, orderId: o.id })
      }
    }
  }
  return out
}

/**
 * החישוב המרכזי.
 * filters: { plan, category }
 */
export function computeKpis(db, range, filters = {}) {
  const { start, end } = range
  const rates = db.rates
  const users = db.users.filter((u) => !filters.plan || u.plan === filters.plan)
  const planPrice = (u) => (db.plans.find((p) => p.id === u.plan) || { price: 0 }).price

  const months = monthsIn(start, end)
  const monthCount = Math.max(1, months.length)

  // ===== מנויים =====
  const activeAt = (t) => users.filter((u) => isActiveSubscriber(u, t)).length
  const activeEnd = activeAt(end)
  const activeStart = activeAt(start)
  const newSubs = users.filter((u) => inRange(u.joinedAt, start, end)).length
  const churned = users.filter((u) => u.canceledAt && inRange(u.canceledAt, start, end)).length

  // שיעור נטישה: לחודש בודד — נטישות ÷ פעילות בתחילת התקופה.
  // לתקופה רב-חודשית — ממוצע השיעורים החודשיים, אחרת מתקבל ערך חסר משמעות (מעל 100%).
  // מפתן נתונים: אחוז מוצג רק מחודשים עם 30+ מנויות בתחילתם — בבסיס קטן ביטול
  // בודד נראה כמו "6.7% נטישה" ומייצר בהלת שווא; עד אז מוצגת הספירה בלבד.
  const CHURN_MIN_BASE = 30
  const monthsList = monthsIn(start, end)
  const monthlyChurnRates = monthsList.map((m) => {
    const before = new Date(m.start.getTime() - 1)
    const startCount = users.filter((u) => isActiveSubscriber(u, before)).length
    const left = users.filter((u) => u.canceledAt && inRange(u.canceledAt, m.start, m.end)).length
    return startCount >= CHURN_MIN_BASE ? (left / startCount) * 100 : null
  }).filter((x) => x !== null)
  const churnRate = monthlyChurnRates.length
    ? monthlyChurnRates.reduce((a, b) => a + b, 0) / monthlyChurnRates.length
    : null

  // תנועת מנויים חודשית
  const movement = months.map((m) => ({
    label: m.label,
    active: users.filter((u) => isActiveSubscriber(u, m.end)).length,
    joined: users.filter((u) => inRange(u.joinedAt, m.start, m.end)).length,
    left: users.filter((u) => u.canceledAt && inRange(u.canceledAt, m.start, m.end)).length,
  }))

  // ===== הכנסה (הכרה חודשית לפי מנויים פעילים) =====
  let revenue = 0
  const monthlyActive = []
  for (const m of months) {
    const act = users.filter((u) => isActiveSubscriber(u, m.end))
    monthlyActive.push(act.length)
    revenue += act.reduce((s, u) => s + planPrice(u), 0)
  }
  const avgActive = monthlyActive.length
    ? monthlyActive.reduce((a, b) => a + b, 0) / monthlyActive.length
    : 0
  const arpu = avgActive > 0 ? revenue / avgActive : null
  const arpuMonthly = arpu === null ? null : arpu / monthCount

  // ===== עלויות משתנות (נגזרות מפעולות אמיתיות) =====
  const periodOrders = db.orders.filter((o) => inRange(o.createdAt, start, end)
    && users.some((u) => u.id === o.userId))
  const periodShipments = db.shipments.filter((s) => inRange(s.createdAt || s.date, start, end))
  const returnedItemsCount = db.orders.reduce((n, o) => {
    if (!users.some((u) => u.id === o.userId)) return n
    return n + o.items.filter((it) => it.returnedAt && inRange(it.returnedAt, start, end)).length
  }, 0)

  // ===== הכנסות נוספות (מעבר לדמי המנוי) =====
  // 1. רכישות תכשיטים — לקוחה שקונה תכשיט (מחיר מלא = הכנסה; במזומן נכנס רק מה ששולם בפועל,
  //    כי חלק מכוסה בקרדיטים שכבר נצברו כהתחייבות)
  const periodPurchases = (db.purchases || []).filter((x) => inRange(x.date, start, end)
    && (!filters.plan || users.some((u) => u.id === x.userId)))
  const purchaseRevenue = periodPurchases.reduce((s, x) => s + (Number(x.price) || 0), 0)
  const purchaseCashIn = periodPurchases.reduce((s, x) => s + (Number(x.paid) || 0), 0)

  // 2. דמי משלוח החלפה נוספת (₪65): החלפה אחת בכל חלון 60 יום כלולה במנוי,
  //    וכל החלפה נוספת בתוך החלון מחויבת. בלי זה הלקוחות המחליפות-הרבה נראות
  //    מפסידות יותר מהאמת — דווקא הסגמנט שהכי חשוב למדוד נכון.
  const extraFee = Number(rates.extraExchangeFee) || 0
  let chargedExchangesInRange = 0
  const chargedByUser = {}
  for (const u of users) {
    const exs = db.orders
      .filter((o) => o.userId === u.id && o.type === 'החלפה' && o.createdAt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    let lastFree = -Infinity
    for (const o of exs) {
      const t = new Date(o.createdAt).getTime()
      const free = t - lastFree >= 60 * DAY
      if (free) lastFree = t
      else if (inRange(o.createdAt, start, end)) {
        chargedExchangesInRange += 1
        chargedByUser[u.id] = (chargedByUser[u.id] || 0) + 1
      }
    }
  }
  const exchangeFeeIncome = chargedExchangesInRange * extraFee

  const totalRevenue = revenue + purchaseRevenue + exchangeFeeIncome

  const shippingCost = periodOrders.length * rates.shippingPerOrder
  const packagingCost = periodOrders.length * rates.packagingPerOrder
  const shipInsuranceCost = periodOrders.length * rates.shipInsurancePerOrder
  const cleaningCost = returnedItemsCount * rates.cleaningPerItem
  // עמלת סליקה נגבית על כל מה שנסלק: דמי מנוי, תשלומי רכישה ודמי החלפה
  const paymentFees = (revenue + purchaseCashIn + exchangeFeeIncome) * (rates.paymentPct / 100)
  // קרדיטים: אחוז מדמי המנוי נצבר לזכות הלקוחה — התחייבות עסקית לכל דבר
  const creditsAccrued = revenue * (rates.creditPct / 100)
  const variableCosts = shippingCost + packagingCost + shipInsuranceCost
    + cleaningCost + paymentFees + creditsAccrued

  const grossProfit = totalRevenue - variableCosts
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : null

  // ===== הוצאות =====
  const periodExpenses = expenseOccurrences(db.expenses, start, end, months)
  const expenseBy = (cat) => periodExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0)
  const sumCats = (cats) => periodExpenses.filter((e) => cats.includes(e.category)).reduce((s, e) => s + e.amount, 0)
  const marketing = sumCats(ACQUISITION_CATEGORIES)
  const fixedCosts = sumCats(FIXED_CATEGORIES)
  const capex = sumCats(CAPEX_CATEGORIES)
  // פירוט העלויות הקבועות לפי קטגוריה — להצגה בכרטיס ובדוח
  const fixedByCategory = FIXED_CATEGORIES
    .map((c) => ({ category: c, amount: expenseBy(c) }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  const otherExpenses = periodExpenses
    .filter((e) => ![...FIXED_CATEGORIES, ...ACQUISITION_CATEGORIES, ...CAPEX_CATEGORIES].includes(e.category))
    .reduce((s, e) => s + e.amount, 0)
  const cac = newSubs > 0 && marketing > 0 ? marketing / newSubs : null

  // רווח תפעולי — אחרי כל העלויות השוטפות, כולל קבועות ושיווק (לא כולל רכש מלאי)
  const operatingProfit = grossProfit - fixedCosts - marketing - otherExpenses
  const operatingMarginPct = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : null
  const operatingPerSub = avgActive > 0 ? operatingProfit / avgActive : null

  // נקודת איזון: כמה מנויות דרושות כדי שהרווח הגולמי יכסה את העלויות הקבועות
  const grossPerSubMonth = (avgActive > 0 && monthCount > 0) ? grossProfit / avgActive / monthCount : null
  const fixedMonthly = (fixedCosts + otherExpenses) / monthCount
  const breakEvenSubs = (grossPerSubMonth && grossPerSubMonth > 0)
    ? Math.ceil(fixedMonthly / grossPerSubMonth)
    : null

  // LTV — על בסיס חודשי: ARPU חודשי × מרווח תרומתי ÷ נטישה חודשית.
  // מפתן נתונים: מוצג רק אחרי 5 נטישות מצטברות לפחות — לפני כן ה-churn שממנו
  // הוא נגזר מבוסס על מקרה בודד, וה-LTV שמתקבל הוא ניחוש שנראה כמו מדע.
  const totalChurnedEver = users.filter((u) => u.canceledAt).length
  const monthlyChurn = churnRate !== null ? churnRate / 100 : 0
  const cmPct = totalRevenue > 0 ? grossProfit / totalRevenue : 0
  const ltv = (totalChurnedEver >= 5 && monthlyChurn > 0 && arpuMonthly)
    ? (arpuMonthly * cmPct) / monthlyChurn
    : null

  // ===== רווחיות לפי מסלול =====
  const byPlan = db.plans.map((plan) => {
    const planUsers = users.filter((u) => u.plan === plan.id)
    let rev = 0
    const actCounts = []
    for (const m of months) {
      const act = planUsers.filter((u) => isActiveSubscriber(u, m.end))
      actCounts.push(act.length)
      rev += act.length * plan.price
    }
    const avgAct = actCounts.length ? actCounts.reduce((a, b) => a + b, 0) / actCounts.length : 0
    const ords = periodOrders.filter((o) => planUsers.some((u) => u.id === o.userId))
    const retItems = db.orders.reduce((n, o) => {
      if (!planUsers.some((u) => u.id === o.userId)) return n
      return n + o.items.filter((it) => it.returnedAt && inRange(it.returnedAt, start, end)).length
    }, 0)
    // דמי החלפה נוספת של מנויות המסלול — הכנסה שמצטרפת להכנסת המנוי
    const planExFees = planUsers.reduce((s, u) => s + (chargedByUser[u.id] || 0), 0) * extraFee
    const revTotal = rev + planExFees
    const varC = ords.length * (rates.shippingPerOrder + rates.packagingPerOrder + rates.shipInsurancePerOrder)
      + retItems * rates.cleaningPerItem + revTotal * (rates.paymentPct / 100) + rev * (rates.creditPct / 100)
    const contribution = revTotal - varC
    return {
      id: plan.id, name: plan.latin, price: plan.price,
      subscribers: planUsers.filter((u) => isActiveSubscriber(u, end)).length,
      avgActive: avgAct, revenue: revTotal, variableCosts: varC, contribution,
      marginPct: revTotal > 0 ? (contribution / revTotal) * 100 : null,
    }
  })
  // הקצאת העלויות הקבועות והשיווק בין המסלולים לפי משקל המנויות
  const totalAvgActive = byPlan.reduce((s, r) => s + r.avgActive, 0)
  for (const row of byPlan) {
    const share = totalAvgActive > 0 ? row.avgActive / totalAvgActive : 0
    row.fixedShare = (fixedCosts + marketing + otherExpenses) * share
    row.operating = row.contribution - row.fixedShare
    row.operatingMarginPct = row.revenue > 0 ? (row.operating / row.revenue) * 100 : null
  }

  // ===== רווחיות לפי לקוחה =====
  const byCustomer = users.map((u) => {
    let rev = 0
    for (const m of months) if (isActiveSubscriber(u, m.end)) rev += planPrice(u)
    const ords = periodOrders.filter((o) => o.userId === u.id)
    const retItems = db.orders.reduce((n, o) => {
      if (o.userId !== u.id) return n
      return n + o.items.filter((it) => it.returnedAt && inRange(it.returnedAt, start, end)).length
    }, 0)
    // דמי החלפה נוספת שהלקוחה שילמה — הכנסה שמקזזת את עלויות המשלוח שלה
    const exFees = (chargedByUser[u.id] || 0) * extraFee
    const revTotal = rev + exFees
    const ship = ords.length * rates.shippingPerOrder
    const pack = ords.length * rates.packagingPerOrder
    const insur = ords.length * rates.shipInsurancePerOrder
    const clean = retItems * rates.cleaningPerItem
    const fees = (rev + exFees) * (rates.paymentPct / 100)
    const credits = rev * (rates.creditPct / 100)
    const contribution = revTotal - ship - pack - insur - clean - fees - credits
    return {
      id: u.id, name: u.name, plan: (db.plans.find((p) => p.id === u.plan) || {}).latin || '—',
      active: isActiveSubscriber(u, end),
      revenue: revTotal, exchangeFees: exFees,
      shipping: ship, packaging: pack, insurance: insur, cleaning: clean, fees, credits,
      exchanges: ords.filter((o) => o.type === 'החלפה').length,
      contribution, marginPct: revTotal > 0 ? (contribution / revTotal) * 100 : null,
    }
  }).filter((c) => c.revenue > 0 || c.contribution !== 0)
  // הקצאת עלויות קבועות שוות בין הלקוחות הפעילות — לקבלת רווח תפעולי אמיתי ללקוחה
  const fixedPerCustomer = byCustomer.length ? (fixedCosts + marketing + otherExpenses) / byCustomer.length : 0
  for (const c of byCustomer) {
    c.fixedShare = fixedPerCustomer
    c.operating = c.contribution - fixedPerCustomer
    c.operatingMarginPct = c.revenue > 0 ? (c.operating / c.revenue) * 100 : null
  }
  const avgCustomerContribution = byCustomer.length
    ? byCustomer.reduce((s, c) => s + c.contribution, 0) / byCustomer.length
    : null
  const avgCustomerOperating = byCustomer.length
    ? byCustomer.reduce((s, c) => s + c.operating, 0) / byCustomer.length
    : null

  // ===== הקצאת הכנסה לתכשיטים (לפי יחס נקודות) =====
  const itemRevenue = {}   // serial -> הכנסה שהוקצתה בתקופה
  const itemDays = {}      // serial -> ימי שימוש בתקופה
  for (const m of months) {
    const t = m.end.getTime()
    for (const u of users) {
      if (!isActiveSubscriber(u, m.end)) continue
      const held = userItemsAt(db, u.id, t)
      const totalPts = held.reduce((s, h) => s + h.product.points, 0)
      if (!totalPts) continue
      const price = planPrice(u)
      for (const h of held) {
        // אם אין נקודות — חלוקה שווה (fallback)
        const share = totalPts > 0 ? h.product.points / totalPts : 1 / held.length
        itemRevenue[h.serial] = (itemRevenue[h.serial] || 0) + price * share
      }
    }
  }
  for (const o of db.orders) {
    if (!users.some((u) => u.id === o.userId)) continue
    for (const it of o.items) {
      const d = overlapDays(it.since || o.createdAt, it.returnedAt, start, end)
      if (d > 0) itemDays[it.serial] = (itemDays[it.serial] || 0) + d
    }
  }

  // ===== מלאי =====
  const catProducts = db.products.filter((p) => !filters.category || p.category === filters.category)
  const periodDays = Math.max(1, (Math.min(end.getTime(), Date.now()) - start.getTime()) / DAY)
  let rentableUnitDays = 0, usedUnitDays = 0, rentableValueDays = 0, usedValueDays = 0
  const bySku = catProducts.map((p) => {
    const rentable = p.available ? p.units.length : 0
    const availDays = rentable * periodDays
    let useDays = 0
    for (const o of db.orders) {
      for (const it of o.items) {
        if (it.pid !== p.id) continue
        useDays += overlapDays(it.since || o.createdAt, it.returnedAt, start, end)
      }
    }
    rentableUnitDays += availDays
    usedUnitDays += Math.min(useDays, availDays || useDays)
    rentableValueDays += availDays * (p.cost || 0)
    usedValueDays += useDays * (p.cost || 0)
    const rev = p.units.reduce((s, u) => s + (itemRevenue[u.serial] || 0), 0)
    return {
      id: p.id, sku: p.sku || p.id.toUpperCase(), name: p.name, category: p.category,
      units: p.units.length, availDays, useDays,
      utilization: availDays > 0 ? (useDays / availDays) * 100 : null,
      revenue: rev, contribution: rev * cmPct,
      cost: p.cost || 0,
    }
  })
  const utilizationUnits = rentableUnitDays > 0 ? (usedUnitDays / rentableUnitDays) * 100 : null
  const utilizationValue = rentableValueDays > 0 ? (usedValueDays / rentableValueDays) * 100 : null

  // ===== ביצועי תכשיט בודד (Payback / ROI / הכנסה) =====
  const items = []
  for (const p of catProducts) {
    for (const u of p.units) {
      const rev = itemRevenue[u.serial] || 0
      const monthsActive = Math.max(1, (Date.now() - new Date(u.addedAt).getTime()) / DAY / 30)
      const contribution = rev * cmPct
      const monthlyContribution = contribution / Math.max(1, months.length)
      const cost = p.cost || 0
      // מפתן נתונים: Payback ו-ROI לפריט מוצגים רק אחרי ~3 חודשי פעילות —
      // לפני כן הם נגזרים מהשכרות בודדות ועלולים להטות החלטות רכש
      const matured = monthsActive >= 3
      items.push({
        serial: u.serial, sku: p.sku || p.id.toUpperCase(), name: p.name, status: u.status,
        cost, revenue: rev, contribution,
        monthsActive: Math.round(monthsActive * 10) / 10,
        paybackMonths: matured && monthlyContribution > 0 ? cost / monthlyContribution : null,
        remaining: Math.max(0, cost - contribution),
        roi: matured && cost > 0 ? ((rev - (rev * (1 - cmPct)) - cost) / cost) * 100 : null,
      })
    }
  }
  const itemsWithRev = items.filter((i) => i.revenue > 0)
  const avgRevenuePerItem = itemsWithRev.length
    ? itemsWithRev.reduce((s, i) => s + i.revenue, 0) / itemsWithRev.length
    : null
  const avgPayback = items.filter((i) => i.paybackMonths).length
    ? items.filter((i) => i.paybackMonths).reduce((s, i) => s + i.paybackMonths, 0) / items.filter((i) => i.paybackMonths).length
    : null

  // ===== התיישנות מלאי =====
  const buckets = [
    { label: '0–30 ימים', min: 0, max: 30, items: 0, value: 0 },
    { label: '31–60 ימים', min: 31, max: 60, items: 0, value: 0 },
    { label: '61–90 ימים', min: 61, max: 90, items: 0, value: 0 },
    { label: '90+ ימים', min: 91, max: Infinity, items: 0, value: 0 },
  ]
  for (const p of catProducts) {
    for (const u of p.units) {
      if (u.status !== 'זמין') continue
      const since = u.availableSince || u.addedAt
      const age = Math.floor((Date.now() - new Date(since).getTime()) / DAY)
      const b = buckets.find((x) => age >= x.min && age <= x.max)
      if (b) { b.items += 1; b.value += p.cost || 0 }
    }
  }

  // ===== תפעול =====
  const exchanges = periodOrders.filter((o) => o.type === 'החלפה').length
  const exchangeRate = avgActive > 0 ? exchanges / avgActive : null

  const completedReturns = db.returns.filter((r) => r.status === 'הושלמה' && r.completedAt && inRange(r.completedAt, start, end))
  const cycleTimes = completedReturns.map((r) => {
    const last = r.items.reduce((mx, i) => Math.max(mx, i.receivedAt ? new Date(i.receivedAt).getTime() : 0), 0)
    return (last - new Date(r.createdAt).getTime()) / DAY
  }).filter((x) => x >= 0)
  const avgCycle = cycleTimes.length ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : null
  const sorted = [...cycleTimes].sort((a, b) => a - b)
  const medianCycle = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null
  const within5 = cycleTimes.length ? (cycleTimes.filter((x) => x <= 5).length / cycleTimes.length) * 100 : null

  const outstanding = db.returns.filter((r) => r.status !== 'הושלמה')
  const overdue = outstanding.filter((r) => Date.now() > new Date(r.deadline).getTime())
  const longestOpen = outstanding.length
    ? Math.max(...outstanding.map((r) => (Date.now() - new Date(r.createdAt).getTime()) / DAY))
    : null
  const outstandingBreakdown = [
    { label: 'עד 5 ימים', n: outstanding.length - overdue.length },
    { label: 'מעל 5 ימים', n: overdue.length },
    { label: 'התכשיטים אצל הלקוחה', n: outstanding.filter((r) => r.status === 'התכשיטים אצל הלקוחה').length },
    { label: 'בירור מול שליחויות', n: outstanding.filter((r) => r.status === 'בירור מול חברת המשלוחים').length },
    { label: 'התקבלה חלקית', n: outstanding.filter((r) => r.status === 'התקבלה חלקית').length },
  ]

  // ===== תזרים =====
  // הקרדיטים אינם יציאת מזומן — הם התחייבות עתידית, ולכן אינם נכללים כאן.
  // ברכישות נכנס למזומן רק מה ששולם בפועל (החלק שכוסה בקרדיט אינו כסף חדש).
  const cashIn = revenue + purchaseCashIn + exchangeFeeIncome // גבייה משוערת (אין סליקה בדמו)
  const cashOutExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0)
  const cashOut = cashOutExpenses + shippingCost + packagingCost + shipInsuranceCost + cleaningCost + paymentFees
  const netCash = cashIn - cashOut
  const cashCategories = [
    { label: 'גביית מסלולים (אומדן)', amount: revenue, kind: 'in' },
    { label: 'רכישות תכשיטים (שולם בפועל)', amount: purchaseCashIn, kind: 'in' },
    { label: 'דמי משלוח החלפות נוספות', amount: exchangeFeeIncome, kind: 'in' },
    ...EXPENSE_GROUPS(db, periodExpenses),
    { label: 'משלוחים (מחושב)', amount: -shippingCost, kind: 'out' },
    { label: 'אריזה (מחושב)', amount: -packagingCost, kind: 'out' },
    { label: 'ביטוח משלוחים (מחושב)', amount: -shipInsuranceCost, kind: 'out' },
    { label: 'ניקוי (מחושב)', amount: -cleaningCost, kind: 'out' },
    { label: 'עמלות סליקה (מחושב)', amount: -paymentFees, kind: 'out' },
  ].filter((c) => Math.abs(c.amount) > 0.5)

  return {
    months: months.length,
    // "מנועי העלות" — הכמויות שבהן מוכפלים התעריפים המשתנים
    costDrivers: {
      orders: periodOrders.length,
      returnedItems: returnedItemsCount,
      // הסכום שעליו נגבית עמלת סליקה: מנויים + תשלומי רכישות + דמי החלפות
      revenue: revenue + purchaseCashIn + exchangeFeeIncome,
      avgActive,
      shipments: periodShipments.length,
    },
    subscriptions: { activeEnd, activeStart, newSubs, churned, churnRate, movement, arpu, arpuMonthly, avgActive, monthCount },
    profitability: {
      revenue, purchaseRevenue, exchangeFeeIncome, totalRevenue,
      variableCosts, grossProfit, grossMarginPct,
      fixedCosts, fixedByCategory, fixedMonthly, marketing, otherExpenses, capex,
      breakEvenSubs, grossPerSubMonth,
      operatingProfit, operatingMarginPct, operatingPerSub,
      cac, ltv, cmPct: cmPct * 100, byPlan, byCustomer,
      // הקצאת קבועות פר-לקוחה/מסלול אמינה רק מ-50 מנויות ומעלה;
      // מתחת לזה כל לקוחה "סופגת" חלק ענק מהקבועות ונראית מפסידה בטעות
      fixedAllocationReliable: avgActive >= 50,
      avgCustomerContribution, avgCustomerOperating,
      creditsAccrued, creditLiability: totalCreditLiability(db),
      costBreakdown: {
        shipping: shippingCost, packaging: packagingCost, insurance: shipInsuranceCost,
        cleaning: cleaningCost, fees: paymentFees, credits: creditsAccrued,
      },
    },
    inventory: {
      utilizationUnits, utilizationValue, bySku, items, avgRevenuePerItem, avgPayback, buckets,
      totalUnits: catProducts.reduce((s, p) => s + p.units.length, 0),
      inUse: catProducts.reduce((s, p) => s + unitsOut(p), 0),
      value: catProducts.reduce((s, p) => s + p.units.length * (p.cost || 0), 0),
    },
    operations: {
      exchanges, exchangeRate, avgCycle, medianCycle, within5, longestOpen,
      outstanding: outstanding.length, overdue: overdue.length, outstandingBreakdown,
    },
    cash: { cashIn, cashOut, netCash, categories: cashCategories },
  }
}

function EXPENSE_GROUPS(db, periodExpenses) {
  const map = {}
  for (const e of periodExpenses) map[e.category] = (map[e.category] || 0) + e.amount
  return Object.entries(map).map(([label, amount]) => ({ label, amount: -amount, kind: 'out' }))
}

// עזרי תצוגה
export const fmtMoney = (n) => (n === null || n === undefined || Number.isNaN(n))
  ? null : CURRENCY + Math.round(n).toLocaleString('he-IL')
export const fmtPct = (n, digits = 1) => (n === null || n === undefined || Number.isNaN(n))
  ? null : n.toFixed(digits) + '%'
export const fmtNum = (n, digits = 1) => (n === null || n === undefined || Number.isNaN(n))
  ? null : Number(n).toFixed(digits)

// שינוי באחוזים בין תקופות.
// כשהתקופה הקודמת אפסית או זניחה, אחוז השינוי חסר משמעות — לא מציגים אותו.
export function trend(cur, prev) {
  if (cur === null || prev === null || cur === undefined || prev === undefined) return null
  if (!prev) return null
  const diff = ((cur - prev) / Math.abs(prev)) * 100
  if (!Number.isFinite(diff) || Math.abs(diff) > 500) return null
  return diff
}
