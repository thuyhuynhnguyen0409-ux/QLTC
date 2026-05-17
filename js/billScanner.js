import { formatMoney } from './utils.js'
import { parseBillWithAI } from './ai.js'

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
async function preprocessImage(file) {

  return new Promise((resolve) => {

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData =
        ctx.getImageData(0, 0, canvas.width, canvas.height);

      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg =
          (data[i] + data[i + 1] + data[i + 2]) / 3;

        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(resolve);
    };
  });
}

// ======================
async function scanBill(file) {

  const resultBox = document.getElementById('billResult')

  try {

    resultBox.classList.remove('hidden')
    resultBox.innerHTML = '⏳ Đang đọc bill...'

    const processed = await preprocessImage(file)

    const { data } = await window.Tesseract.recognize(
      processed,
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

    resultBox.innerHTML = '❌ Lỗi xử lý bill'
  }
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