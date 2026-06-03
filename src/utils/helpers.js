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
  return clamp2((m?.tinCount || 0) * (m?.tinCost || 4500) + (m?.courierCharges || 0));
}

export function getMonthExpense(data, key) {
  const m = data.months[key];
  const misc = (m?.miscExpenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  return clamp2(getCourtTotal(data, key) + getShuttleTotal(data, key) + misc);
}

export function getExpenseTotal(data, key) {
  const expenses = data.months[key]?.expenses || [];
  let court = 0, shuttle = 0, misc = 0;
  expenses.forEach(e => {
    if (e.type === 'court') court = clamp2(court + Number(e.amount));
    else if (e.type === 'misc') misc = clamp2(misc + Number(e.amount));
    else shuttle = clamp2(shuttle + Number(e.amount) + (Number(e.courierCharges) || 0));
  });
  return { court, shuttle, misc, total: clamp2(court + shuttle + misc) };
}

export function monthTotals(data, key, members, standbyPlayers, enrolled, left) {
  const month = data.months[key];
  if (!month) return { per: 0, expense: 0, courtTotal: 0, shuttleTotal: 0, standbyTotal: 0, days: 0, rows: [], payments: [] };
  const enr = enrolled || {};
  const lft = left || {};
  const isActive = (m) => (!enr[m] || enr[m] <= key) && (!lft[m] || lft[m] > key);
  const activeMembers = members.filter(isActive);
  const activeStandby = standbyPlayers.filter(isActive);
  const expense = getMonthExpense(data, key);
  const monthlyStandby = month.monthlyStandby || [];
  const creditIn = data.credits[key] || {};
  const allPlayers = [...activeMembers, ...activeStandby];
  const paid = {}, lastDate = {};
  allPlayers.forEach(m => { paid[m] = 0; lastDate[m] = ''; });
  month.payments.forEach(p => {
    paid[p.member] = clamp2(paid[p.member] + Number(p.amount));
    if (!lastDate[p.member] || new Date(p.dateISO) >= new Date(lastDate[p.member])) lastDate[p.member] = p.dateISO;
  });
  const allStandby = [...activeStandby, ...activeMembers.filter(m => monthlyStandby.includes(m))];
  const activeMain = activeMembers.filter(m => !monthlyStandby.includes(m));
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

export function propagateCreditsForward(data, key, members, standbyPlayers, enrolled, left) {
  const enr = enrolled || {};
  const lft = left || {};
  const isActive = (m) => (!enr[m] || enr[m] <= key) && (!lft[m] || lft[m] > key);
  const { rows } = monthTotals(data, key, members, standbyPlayers, enrolled, left);
  const nk = nextMonthKey(key);
  ensureMonth(data, nk, members, standbyPlayers);
  // Reset all credits for next month first
  [...members, ...standbyPlayers].forEach(m => { data.credits[nk][m] = 0; });
  // Only propagate for players active in current month
  rows.forEach(r => {
    if (!isActive(r.member)) return;
    if (r.isStandby) data.credits[nk][r.member] = r.creditOut;
    else data.credits[nk][r.member] = clamp2(r.creditOut - r.outstanding);
  });
}
