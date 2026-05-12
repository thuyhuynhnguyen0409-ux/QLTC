export let user = null

export let settings = {}

export let expenses = []

export let currentCycle = null

export let todayBudget = null

export let fixedCosts = []

export let currentSavings = 0

export function setUser(v) {
    user = v
}

export function setSettings(v) {
    settings = v

    currentSavings =
        Number(v.current_savings || 0)
}

export function setExpenses(v) {
    expenses = v
}

export function setCurrentCycle(v) {
    currentCycle = v
}

export function setTodayBudget(v) {
    todayBudget = v
}

export function setFixedCosts(v) {
    fixedCosts = v
}

export function setCurrentSavings(v) {
    currentSavings = v
}