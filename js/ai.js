import * as state from './state.js';

export async function suggestFood() {
  const output = document.getElementById('aiChefText');
  const btn = document.getElementById('btnSuggest');

  if (!output) return false;

  const apiKey = window.ENV?.VITE_GEMINI_API_KEY || '';
  const note = document.getElementById('chefNote')?.value?.trim() || '';
  const budget = Math.max(0, Number(state.todayBudget?.remaining || 0));

  if (!apiKey) {
    output.innerText = 'Thiếu Gemini API key.';
    return false;
  }

const prompt = `
Bạn là AI đọc hóa đơn.

Chỉ lấy:
- tên sản phẩm
- giá tiền

❗ QUAN TRỌNG:
- bỏ dòng rác
- chỉ lấy dòng có số tiền
- tên ngắn gọn

Trả JSON:

{
  "items": [
    { "name": "rau muống", "price": 5000 }
  ],
  "total": 15000
}

TEXT:
${text}
`

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Đang gợi ý...';
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      output.innerText = `Gemini lỗi: ${data.error.message}`;
      return false;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi AI';
    output.innerText = text;
    return true;
  } catch (error) {
    console.error(error);
    output.innerText = 'Không thể kết nối Gemini API';
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '🍚 Gợi ý món ăn';
    }
  }
}

window.suggestFood = suggestFood;

export async function parseBillWithAI(text) {

  const apiKey = window.ENV?.VITE_GEMINI_API_KEY;

const prompt = `
Bạn là AI đọc hóa đơn.

Chỉ lấy:
- tên sản phẩm
- giá tiền

❗ QUAN TRỌNG:
- bỏ dòng lỗi, chữ rác
- bỏ quảng cáo, QR
- chỉ lấy dòng có số tiền rõ ràng
- tên ngắn gọn

Trả JSON:

{
  "items": [
    { "name": "rau muống", "price": 5000 }
  ],
  "total": 15000
}

Nếu không chắc → bỏ qua dòng đó

TEXT:
${text}
`
  try {

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await res.json();

    let raw =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('AI RAW:', raw);

    raw = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(raw);

  } catch (err) {
    console.error('AI ERROR:', err);
    return null;
  }
}