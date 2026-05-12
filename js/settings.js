let fixedIndex = 0

window.addFixedCostRow =
function () {

    fixedIndex++

    const div =
        document.createElement('div')

    div.className =
        'flex gap-2 mb-2 fixed-row'

    div.innerHTML = `

    <input
        class="fixed-name flex-1 p-3 border rounded-xl"
        placeholder="Tên"
    >

    <input
        class="fixed-amount w-32 p-3 border rounded-xl"
        placeholder="Tiền"
    >

    <button
        class="bg-red-500 text-white px-4 rounded-xl"
    >
        X
    </button>
    `

    div
    .querySelector('button')
    .onclick = () =>
        div.remove()

    document
    .getElementById(
        'fixedCostsList'
    )
    .appendChild(div)
}