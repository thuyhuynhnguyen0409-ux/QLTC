export async function suggestFood() {
    const note = document.getElementById('chefNote').value.trim();
    const displayArea = document.getElementById('aiChefText');
    const btn = document.getElementById('btnSuggest');

    // Hiển thị trạng thái đang xử lý
    btn.disabled = true;
    displayArea.innerText = "Đang suy nghĩ thực đơn cho bạn...";

    try {
        // Ở đây bạn sẽ gọi tới API của mình (ví dụ kết nối tới Gemini qua Vercel Edge Function)
        // Dưới đây là logic giả lập kết quả trả về
        const prompt = note 
            ? `Gợi ý thực đơn cơm gia đình Việt Nam dựa trên yêu cầu: ${note}`
            : "Gợi ý một mâm cơm gia đình Việt Nam ngẫu nhiên, đủ chất và tiết kiệm.";

        console.log("Đang gửi prompt:", prompt);
        
        // Giả lập kết quả trả về từ AI
        const mockResponse = `Gợi ý cho bạn:\n1. Thịt kho tộ\n2. Canh rau ngót nấu tôm\n3. Đậu cô ve xào tỏi\nChúc bạn ngon miệng!`;
        
        displayArea.innerText = mockResponse;
    } catch (error) {
        console.error("Lỗi AI:", error);
        displayArea.innerText = "Không thể kết nối với AI lúc này. Hãy thử lại sau.";
    } finally {
        btn.disabled = false;
    }
}