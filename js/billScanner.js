import { formatMoney } from './utils.js'
import { parseBillWithAI } from './ai.js'

export function initBillScanner() {
  const input = document.getElementById('billInput')
  if (!input) return

  input.addEventListener('change', async e => {
    const file = e.target.files[0]
    if (!file) return
    await scanBill(file)
  })
}

// ======================
async function scanBill(file) {
  const resultBox = document.getElementById('billResult')

  try {
    console.log('🧠 USING TESSERACT FREE')

    resultBox.classList.remove('hidden')
    resultBox.innerHTML = '⏳ Đang đọc bill...'

    const { createWorker } = await import(
      'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.esm.min.js'
    )

    const worker = await createWorker('vie+eng')

    const { data } = await worker.recognize(file)

    await worker.terminate()

    const rawText = data.text || ''
    console.log('RAW OCR:', rawText)

    // 👉 lấy TOTAL từ raw (chưa clean)
    const totalFromText = extractTotal(rawText)

    // 👉 clean để gửi AI
    const ocrText = cleanOCRText(rawText)
    console.log('CLEAN OCR:', ocrText)

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

    // 👉 override total nếu detect được
    if (totalFromText) {
      result.total = totalFromText
    }

    renderBillResult(result)

  } catch (err) {
    console.error('BILL ERROR:', err)
    resultBox.innerHTML = '❌ Lỗi xử lý bill'
  }
}

// ======================
function cleanOCRText(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => {

      const hasMoney = /\d{1,3}(?:[.,]\d{3})+/.test(line)

      const isTrash =
        line.length < 3 ||
        /QR|quét|cảm ơn|www|http|voucher|khuyến mãi/i.test(line)

      return hasMoney && !isTrash
    })
    .join('\n')
}

// ======================
function extractTotal(text) {
  const lines = text.split('\n')

  const totalLine = lines.find(line =>
    /(tổng|thanh toán|phải thanh toán|thành tiền)/i.test(line)
  )

  if (!totalLine) return null

  const match = totalLine.match(/\d{1,3}(?:[.,]\d{3})+/)

  return match
    ? Number(match[0].replace(/[.,]/g, ''))
    : null
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

      const rows = document.querySelectorAll('#billItems .bill-item')

      let names = []
      let total = 0

      rows.forEach(row => {
        const name = row.querySelector('.bill-name').value.trim()

        const price =
          Number(
            row.querySelector('.bill-price').value.replace(/[.,]/g, '')
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
function fillBillToUI(names, total) {
  document.getElementById('expName').value =
    names.join(', ') || 'Mua hàng'

  document.getElementById('expAmount').value =
    Math.floor(total).toLocaleString('vi-VN')

  document.getElementById('expCategory').value = 'food'
}