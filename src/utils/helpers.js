export const SHUTTLES_PER_TIN = 6;
export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function monthKey(y, mIndex) {
  return `${y}-${String(mIndex + 1).padStart(2, '0')}`;
}

export function parseKey(key) {
  const [y, mm] = key.split('-').map(Number);
  return { y, mIndex: mm - 1 };
}

export function prevMonthKey(key) {
  const { y, mIndex } = parseKey(key);
  const d = new Date(y, mIndex - 1, 1);
  return monthKey(d.getFullYear(), d.getMonth());
}

export function nextMonthKey(key) {
  const { y, mIndex } = parseKey(key);
  const d = new Date(y, mIndex + 1, 1);
  return monthKey(d.getFullYear(), d.getMonth());
}

export function fmtMoney(n) {
  return (Number(n) || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function clamp2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function ensureMonth(data, key, members, standby) {
  if (!data.months[key]) {
    const prev = prevMonthKey(key);
    const pm = data.months[prev];
    const hr = pm?.hourlyRate ?? 800;
    const tc = pm?.tinCost ?? 4500;
    data.months[key] = { selectedDays: [], tinCount: 0, hourlyRate: hr, tinCost: tc, payments: [], expenses: [], shuttleDays: [], extraShuttles: 0, monthlyStandby: [] };
  }
  const m = data.months[key];
  if (!m.selectedDays) m.selectedDays = [];
  if (!m.payments) m.payments = [];
  if (!m.expenses) m.expenses = [];
  if (!m.shuttleDays) m.shuttleDays = [];
  if (typeof m.tinCount !== 'number') m.tinCount = 0;
  if (typeof m.hourlyRate !== 'number') m.hourlyRate = 800;
  if (typeof m.tinCost !== 'number') m.tinCost = 4500;
  if (typeof m.extraShuttles !== 'number') m.extraShuttles = 0;
  if (!m.monthlyStandby) m.monthlyStandby = [];
  if (!data.credits[key]) data.credits[key] = {};
  [...members, ...standby].forEach(name => {
    if (typeof data.credits[key][name] !== 'number') data.credits[key][name] = 0;
  });
}

export function getCourtTotal(data, key) {
  const m = data.months[key];
  return clamp2((m?.selectedDays?.length || 0) * (m?.hourlyRate || 800));
}

export function getShuttleTotal(data, key) {
  const m = data.months[key];
  return clamp2((m?.tinCount || 0) * (m?.tinCost || 4500));
}

export function getMonthExpense(data, key) {
  return clamp2(getCourtTotal(data, key) + getShuttleTotal(data, key));
}

export function getExpenseTotal(data, key) {
  const expenses = data.months[key]?.expenses || [];
  let court = 0, shuttle = 0;
  expenses.forEach(e => {
    if (e.type === 'court') court = clamp2(court + Number(e.amount));
    else shuttle = clamp2(shuttle + Number(e.amount));
  });
  return { court, shuttle, total: clamp2(court + shuttle) };
}

export function monthTotals(data, key, members, standbyPlayers) {
  const month = data.months[key];
  if (!month) return { per: 0, expense: 0, courtTotal: 0, shuttleTotal: 0, standbyTotal: 0, days: 0, rows: [], payments: [] };
  const expense = getMonthExpense(data, key);
  const monthlyStandby = month.monthlyStandby || [];
  const creditIn = data.credits[key] || {};
  const allPlayers = [...members, ...standbyPlayers];
  const paid = {}, lastDate = {};
  allPlayers.forEach(m => { paid[m] = 0; lastDate[m] = ''; });
  month.payments.forEach(p => {
    paid[p.member] = clamp2(paid[p.member] + Number(p.amount));
    if (!lastDate[p.member] || new Date(p.dateISO) >= new Date(lastDate[p.member])) lastDate[p.member] = p.dateISO;
  });
  const allStandby = [...standbyPlayers, ...members.filter(m => monthlyStandby.includes(m))];
  const activeMain = members.filter(m => !monthlyStandby.includes(m));
  let standbyTotal = 0;
  const standbyRows = allStandby.map(m => {
    const cin = clamp2(creditIn[m] || 0), p = clamp2(paid[m] || 0);
    standbyTotal = clamp2(standbyTotal + cin + p);
    return { member: m, due: 0, paid: p, last: lastDate[m], creditIn: cin, outstanding: 0, creditOut: 0, isStandby: true, isMonthlyStandby: monthlyStandby.includes(m) };
  });
  const adjusted = clamp2(Math.max(0, expense - standbyTotal));
  const per = activeMain.length ? clamp2(adjusted / activeMain.length) : 0;
  const standbyExcess = clamp2(Math.max(0, standbyTotal - expense));
  if (standbyExcess > 0 && allStandby.length > 0) {
    const each = clamp2(standbyExcess / allStandby.length);
    standbyRows.forEach(r => { r.creditOut = each; });
  }
  const rows = activeMain.map(m => {
    const cin = clamp2(creditIn[m] || 0), p = clamp2(paid[m] || 0);
    const applied = clamp2(cin + p);
    return { member: m, due: per, paid: p, last: lastDate[m], creditIn: cin, outstanding: clamp2(Math.max(0, per - applied)), creditOut: clamp2(Math.max(0, applied - per)), isStandby: false };
  });
  return { per, expense, courtTotal: getCourtTotal(data, key), shuttleTotal: getShuttleTotal(data, key), standbyTotal, days: month.selectedDays.length, rows: [...rows, ...standbyRows], payments: month.payments };
}

export function propagateCreditsForward(data, key, members, standbyPlayers) {
  const { rows, standbyTotal } = monthTotals(data, key, members, standbyPlayers);
  const nk = nextMonthKey(key);
  ensureMonth(data, nk, members, standbyPlayers);
  const fullExpense = getExpenseTotal(data, key).total;
  let totalDue = standbyTotal;
  rows.forEach(r => { if (!r.isStandby) totalDue = clamp2(totalDue + r.due); });
  const extraSpend = clamp2(Math.max(0, fullExpense - totalDue));
  const mainRows = rows.filter(r => !r.isStandby);
  const mainCount = mainRows.length || 1;
  const extraPerMain = clamp2(extraSpend / mainCount);
  rows.forEach(r => {
    if (r.isStandby) data.credits[nk][r.member] = r.creditOut;
    else data.credits[nk][r.member] = clamp2(clamp2(r.creditOut - r.outstanding) - extraPerMain);
  });
}
