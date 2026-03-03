const firebaseConfig = {
  apiKey: "AIzaSyBvdmxh2M-TyZSjLXDHQhxM_2g-tQ3vsVs",
  authDomain: "lestantumlaundry.firebaseapp.com",
  databaseURL: "https://lestantumlaundry-default-rtdb.firebaseio.com",
  projectId: "lestantumlaundry",
  storageBucket: "lestantumlaundry.firebasestorage.app",
  messagingSenderId: "27525808099",
  appId: "1:27525808099:web:be4f4bf3401ee4d91fead6",
  measurementId: "G-365TEGTM4H"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Fungsi Jitu: Mengambil tanggal hari ini (WIB)
function getTanggalSekarang() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const t = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${t}`;
}

// FUNGSI UTAMA: TAMPILKAN DATA
function displayData() {
    const adminTable = document.getElementById('adminTableBody');
    const incomeDisplay = document.getElementById('todayIncome');
    const monthlyDisplay = document.getElementById('monthlyIncome');
    const historyTable = document.getElementById('monthlyHistoryBody');

    database.ref('laundry').on('value', (snapshot) => {
        const data = snapshot.val();
        let dailyTotal = 0;
        let monthlyTotal = 0;
        let historyData = {}; 

        const todayStr = getTanggalSekarang();
        const currentMonthStr = todayStr.substring(0, 7); 

        if (adminTable) adminTable.innerHTML = "";

        for (let id in data) {
            let item = data[id];

            // Hitung Pendapatan
            if (item.status === "Sudah Diambil" && item.price) {
                const itemDate = item.finishDate || ""; 
                const itemMonth = itemDate.substring(0, 7);
                const priceNum = parseInt(item.price) || 0;
                
                if (itemDate === todayStr) dailyTotal += priceNum;
                if (itemMonth === currentMonthStr) monthlyTotal += priceNum;

                if (itemMonth) {
                    historyData[itemMonth] = (historyData[itemMonth] || 0) + priceNum;
                }
            }

            // Masukkan ke Tabel Daftar Laundry
            if (adminTable) {
                adminTable.innerHTML += `
                    <tr>
                        <td class="cust-name-cell">${item.name}</td>
                        <td>${item.service}</td>
                        <td>Rp ${parseInt(item.price).toLocaleString('id-ID')}</td>
                        <td>
                            <select onchange="updateStatus('${id}', this.value)" class="status-select">
                                <option value="Proses" ${item.status === 'Proses' ? 'selected' : ''}>Proses</option>
                                <option value="Sudah Diambil" ${item.status === 'Sudah Diambil' ? 'selected' : ''}>Sudah Diambil</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-delete" onclick="hapusData('${id}')">Hapus</button>
                        </td>
                    </tr>`;
            }
        }

        // Update Dashboard Angka
        if (incomeDisplay) incomeDisplay.innerText = "Rp " + dailyTotal.toLocaleString('id-ID');
        if (monthlyDisplay) monthlyDisplay.innerText = "Rp " + monthlyTotal.toLocaleString('id-ID');

        // Update Tabel Riwayat Bulanan
        if (historyTable) {
            historyTable.innerHTML = "";
            const sortedMonths = Object.keys(historyData).sort().reverse();
            sortedMonths.forEach(month => {
                historyTable.innerHTML += `
                    <tr>
                        <td style="padding: 10px; color: black !important; font-weight: bold;">${month}</td>
                        <td style="padding: 10px; text-align: right; color: #27ae60 !important; font-weight: bold;">Rp ${historyData[month].toLocaleString('id-ID')}</td>
                    </tr>`;
            });
        }
    });
}

// FUNGSI PENCARIAN (FILTER)
window.filterData = function() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('adminTableBody');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        let tdName = tr[i].getElementsByTagName('td')[0]; // Kolom Nama
        if (tdName) {
            let txtValue = tdName.textContent || tdName.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
};

// TAMBAH DATA
const form = document.getElementById('laundryForm');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newKey = database.ref().child('laundry').push().key;
        database.ref('laundry/' + newKey).set({
            name: document.getElementById('custName').value,
            service: document.getElementById('serviceType').value,
            price: document.getElementById('price').value,
            dropDate: document.getElementById('dropDate').value,
            pickDate: document.getElementById('pickDate').value,
            status: "Proses"
        });
        form.reset();
    });
}

// UPDATE STATUS
window.updateStatus = function(id, newStatus) {
    const tgl = getTanggalSekarang();
    let updateData = { status: newStatus };
    
    if (newStatus === "Sudah Diambil") {
        updateData.finishDate = tgl;
    } else {
        updateData.finishDate = null;
    }
    database.ref('laundry/' + id).update(updateData);
};

// HAPUS DATA
window.hapusData = function(id) {
    if (confirm("Hapus data ini?")) database.ref('laundry/' + id).remove();
};

// Jalankan fungsi saat halaman dimuat
displayData();
