export async function suggestFood() {

    const note =
        document
        .getElementById(
            'chefNote'
        )
        .value

    const budget =

        Math.max(
            state.todayBudget
            .remaining,
            0
        )

    const prompt = `

    Gợi ý món ăn cơm Việt Nam.

    Ngân sách:
    ${budget}

    Yêu cầu:
    ${note || 'Không'}
    hướng dẫn cơ bản làm món ăn
    Trả lời ngắn gọn.
    `

    // gọi Gemini
}