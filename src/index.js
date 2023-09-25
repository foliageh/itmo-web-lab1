import './styles.css'

populateTable()

const form = document.querySelector('.shot-form')
configureFields(form)

form.addEventListener('submit', async function (event) {
  event.preventDefault()

  const formData = new FormData(form)
  let [x, y, r] = [formData.get('x'), formData.get('y'), formData.getAll('r')]
  ;[x, y, r] = [
    parseFloat(x.replace(',', '.')),
    parseFloat(y.replace(',', '.')),
    r.map((r) => parseFloat(r.replace(',', '.'))),
  ]

  r.forEach((r) => {
    fetch('server/check_shot.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({x, y, r}),
    }).then((response) => {
      if (response.ok) response.json().then((data) => addToTable(data))
      else if (response.status == 400) response.json().then((data) => alert(data.error))
      else alert('Server error.')
    })
  })
})

function addToTable(data) {
  const table = document.querySelector('#shot-table tbody')
  const row = table.insertRow(0)
  row.insertCell(0).innerHTML = table.rows.length
  row.insertCell(1).innerHTML = `(${data.x}; ${data.y}; ${data.r})`
  row.insertCell(2).innerHTML = `${data.timestamp} (${data.execution_time})`
  row.insertCell(3).innerHTML = data.result
  sessionStorage.table = table.innerHTML
}

function populateTable() {
  document.querySelector('#shot-table tbody').innerHTML = sessionStorage.table ?? ''
}

function configureFields(form) {
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      sessionStorage.x = radio.value
    })
  })
  if (sessionStorage.x) document.querySelector(`input[type="radio"][value="${sessionStorage.x}"]`).checked = true

  const yField = form.querySelector('input[name="y"]')
  if (sessionStorage.y) yField.value = sessionStorage.y
  yField.addEventListener('change', () => {
    sessionStorage.y = yField.value
  })

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      let rList = JSON.parse(sessionStorage.r ?? '[]')
      if (!checkbox.checked) {
        rList = rList.filter((val) => val !== checkbox.value)
      } else {
        if (!rList.includes(checkbox.value)) rList.push(checkbox.value)
      }
      sessionStorage.r = JSON.stringify(rList)
    })
  })
  const rList = JSON.parse(sessionStorage.r ?? '[]')
  rList.forEach((val) => {
    document.querySelector(`input[type="checkbox"][value="${val}"]`).checked = true
  })
}
