import { formatMoney } from './utils.js'
import { parseBillWithAI } from './ai.js'

// ======================
// INIT
// ======================
export function initBillScanner() {

  const input = document.getElementById('billInput')
  if (!input) return

  input.addEventListener('change', async (e) => {

    const file = e.target.files[0]
    if (!file) return

    await scanBill(file)
  })
}

// ======================
// MAIN FLOW
// ======================
async function scanBill(file) {

  const resultBox = document.getElementById('billResult')
  if (!resultBox) return

  try {

    resultBox.classList.remove('hidden')
    resultBox.innerHTML = '⏳ Đang đọc bill...'

    // ❗ DÙNG GLOBAL TESSERACT
    const { data } = await window.Tesseract.recognize(
      file,
      'vie+eng'
    )

    const ocrText = data.text

    console.log('OCR TEXT:', ocrText)

    resultBox.innerHTML = '🤖 Đang phân tích...'

    const result = await parseBillWithAI(ocrText)

    if (!result) {
      resultBox.innerHTML = '❌ AI không hiểu bill'
      return
    }

    renderBillResult(result)

  } catch (err) {

    console.error('SCAN ERROR:', err)

    resultBox.innerHTML =
      '❌ Lỗi xử lý bill<br><small>Xem console</small>'
  }
}

// ======================
// RENDER UI
// ======================
function renderBillResult(data) {

  const resultBox = document.getElementById('billResult')

  const items = data.items || []

  const total =
    data.total ||
    items.reduce((s, i) => s + Number(i.price || 0), 0)

  resultBox.innerHTML = `
    <h4 class="font-black mb-2">
      🧾 Kết quả đọc bill
    </h4>

    <div id="billItems" class="space-y-2">
      ${items.map(item => `
        <div class="grid grid-cols-2 gap-2 bill-item">
          <input
            class="bill-name p-3 rounded-xl border"
            value="${item.name || ''}"
          />

          <input
            class="bill-price p-3 rounded-xl border"
            value="${item.price || 0}"
          />
        </div>
      `).join('')}
    </div>

    <div class="flex justify-between font-black pt-3">
      <span>Tổng tiền</span>
      <span id="billTotal">${formatMoney(total)}</span>
    </div>

    <button
      id="applyBillBtn"
      class="w-full mt-3 bg-indigo-600 text-white p-3 rounded-2xl font-black"
    >
      Dùng kết quả này
    </button>
  `

  // ======================
  // APPLY TO FORM
  // ======================
  document
    .getElementById('applyBillBtn')
    .addEventListener('click', () => {

      const rows =
        document.querySelectorAll('#billItems .bill-item')

      let names = []
      let total = 0

      rows.forEach(row => {

        const name =
          row.querySelector('.bill-name').value

        const price =
          Number(
            row.querySelector('.bill-price').value
          ) || 0

        if (name) {
          names.push(name)
          total += price
        }
      })

      fillBillToUI(names, total)
    })
}

// ======================
// FILL FORM CHÍNH
// ======================
function fillBillToUI(names, total) {

  const nameInput = document.getElementById('expName')
  const amountInput = document.getElementById('expAmount')
  const categoryInput = document.getElementById('expCategory')

  if (!nameInput || !amountInput) return

  nameInput.value =
    names.join(', ') || 'Mua hàng'

  amountInput.value =
    Math.floor(total).toLocaleString('vi-VN')

  if (categoryInput) {
    categoryInput.value = 'food'
  }
}