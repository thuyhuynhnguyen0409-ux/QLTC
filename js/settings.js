import { supabase } from './supabase.js'
import {
    user,
    settings,
    setSettings
} from './state.js'

import {
    parseCurrency
} from './utils.js'

export async function saveSettings() {

    const salary =
        parseCurrency(
            document.getElementById('salaryInput').value
        )

    const savings =
        parseCurrency(
            document.getElementById('savingInput').value
        )

    const payday =
        parseInt(
            document.getElementById('paydayInput').value
        )

    const cycleEnd =
        parseInt(
            document.getElementById('cycleEndInput').value
        )

    await supabase
        .from('settings')
        .upsert({
            user_id: user.id,
            salary,
            payday,
            cycle_end_day: cycleEnd,
            base_savings: savings
        })

    await loadSettings()
}

export async function loadSettings() {

    const { data } =
        await supabase
            .from('settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

    if (data) {
        setSettings(data)
    }
}