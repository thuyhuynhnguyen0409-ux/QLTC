export let user = null

export let settings = {}

export let expenses = []

export let goals = []

export let currentCycle = null

export let todayBudget = null

export let fixedCosts = []

export function setUser(v) {
    user = v
}

export function setSettings(v) {
    settings = v
}

export function setExpenses(v) {
    expenses = v
}

export function setGoals(v) {
    goals = v
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