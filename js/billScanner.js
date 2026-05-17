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

    const processedFile = await preprocessImage(file)

    const { data } = await Tesseract.recognize(processedFile, 'vie+eng')

    const rawText = data.text || ''
    console.log('RAW OCR:', rawText)

    const totalFromText = extractTotal(rawText)

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

      // 👉 match cả số kiểu: 15000 hoặc 15.000
      const hasMoney = /\d{3,}/.test(line)

      const isTrash =
        line.length < 3 ||
        /QR|quét|cảm ơn|www|http|voucher|khuyến mãi|dự thưởng/i.test(line)

      return hasMoney && !isTrash
    })
    .join('\n')
}

// ======================
function extractTotal(text) {
  const match = text.match(/(tổng|thanh toán|phải thanh toán|thành tiền).*?(\d+)/i)

  return match
    ? Number(match[2].replace(/[.,]/g, ''))
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
async function preprocessImage(file) {
  return new Promise(resolve => {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3

        // 👉 tăng tương phản
        const val = avg > 140 ? 255 : 0

        data[i] = val
        data[i+1] = val
        data[i+2] = val
      }

      ctx.putImageData(imageData, 0, 0)

      canvas.toBlob(resolve)
    }
  })
}