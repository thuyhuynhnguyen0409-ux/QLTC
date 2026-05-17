import { formatMoney } from './utils.js'
import { parseBillWithAI } from './ai.js'

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
async function scanBill(file) {

  const resultBox = document.getElementById('billResult')

  try {

    console.log('🚀 USING GOOGLE VISION')

    resultBox.classList.remove('hidden')
    resultBox.innerHTML = '⏳ Đang đọc bill...'

    const base64 = await fileToBase64(file)

    const res = await fetch('/api/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64.split(',')[1]
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Vision error')
    }

    const ocrText = data.text

    console.log('VISION TEXT:', ocrText)

    if (!ocrText) {
      resultBox.innerHTML = '❌ Không đọc được chữ'
      return
    }

    resultBox.innerHTML = '🤖 Đang phân tích...'

    const result = await parseBillWithAI(ocrText)

    if (!result) {
      resultBox.innerHTML = '❌ AI không hiểu bill'
      return
    }

    renderBillResult(result)

  } catch (err) {

    console.error('BILL ERROR:', err)

    resultBox.innerHTML = '❌ Lỗi xử lý bill'
  }
}

// ======================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ======================
function renderBillResult(data) {

  const resultBox = document.getElementById('billResult')

  const items = data.items || []

  const total =
    data.total ||
    items.reduce((s, i) => s + Number(i.price || 0), 0)

  resultBox.innerHTML = `
    <h4 class="font-black mb-2">🧾 Kết quả</h4>

    <div id="billItems" class="space-y-2">
      ${items.map(item => `
        <div class="grid grid-cols-2 gap-2 bill-item">
          <input class="bill-name p-3 border rounded-xl" value="${item.name || ''}" />
          <input class="bill-price p-3 border rounded-xl" value="${item.price || 0}" />
        </div>
      `).join('')}
    </div>

    <div class="flex justify-between font-black pt-3">
      <span>Tổng</span>
      <span>${formatMoney(total)}</span>
    </div>

    <button id="applyBillBtn"
      class="w-full mt-3 bg-indigo-600 text-white p-3 rounded-2xl">
      Dùng kết quả
    </button>
  `

  document.getElementById('applyBillBtn')
    .addEventListener('click', () => {

      const rows =
        document.querySelectorAll('#billItems .bill-item')

      let names = []
      let total = 0

      rows.forEach(row => {

        const name =
          row.querySelector('.bill-name').value

        const price =
          Number(row.querySelector('.bill-price').value) || 0

        if (name) {
          names.push(name)
          total += price
        }
      })
      console.log('VISION RAW:', data)
      fillBillToUI(names, total)
    })
}

// ======================
function fillBillToUI(names, total) {

  document.getElementById('expName').value =
    names.join(', ') || 'Mua hàng'

  document.getElementById('expAmount').value =
    Math.floor(total).toLocaleString('vi-VN')

  document.getElementById('expCategory').value = 'food'
}