// Konfigurasi Firebase Anda
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

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- FUNGSI MENAMPILKAN DATA SECARA REAL-TIME ---
function displayData() {
    const adminTable = document.getElementById('adminTableBody');
    const customerTable = document.getElementById('customerTableBody');
    const incomeDisplay = document.getElementById('todayIncome');

    // Mendengarkan perubahan data di Firebase
    database.ref('laundry').on('value', (snapshot) => {
        const data = snapshot.val();
        let totalIncome = 0;
        
        // Bersihkan tabel sebelum update
        if (customerTable) customerTable.innerHTML = "";
        if (adminTable) adminTable.innerHTML = "";

        for (let id in data) {
            let item = data[id];

            // 1. Tampilan untuk Halaman Pelanggan (index.html)
            if (customerTable) {
                customerTable.innerHTML += `
                    <tr>
                        <td>${item.name}</td>
                        <td style="${item.service === 'Ironing' ? 'color:red; font-weight:bold' : ''}">${item.service}</td>
                        <td>Rp ${parseInt(item.price).toLocaleString('id-ID')}</td>
                        <td>${item.drop || '-'}</td>
                        <td>${item.pick || '-'}</td>
                    </tr>`;
            }

            // 2. Tampilan untuk Halaman Admin (admin.html)
            if (adminTable) {
                // Kalkulator: Hanya hitung jika status "Sudah Diambil"
                if (item.status === "Sudah Diambil") {
                    totalIncome += parseInt(item.price);
                }

                adminTable.innerHTML += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.service}</td>
                        <td>Rp ${parseInt(item.price).toLocaleString('id-ID')}</td>
                        <td>
                            <select onchange="updateStatus('${id}', this.value)" class="status-select">
                                <option value="Proses" ${item.status === 'Proses' ? 'selected' : ''}>Proses</option>
                                <option value="Sudah Diambil" ${item.status === 'Sudah Diambil' ? 'selected' : ''}>Sudah Diambil</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-delete" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;" onclick="hapusData('${id}')">Hapus</button>
                        </td>
                    </tr>`;
            }
        }
        
        // Update total pendapatan di kotak hijau
        if (incomeDisplay) {
            incomeDisplay.innerText = "Rp " + totalIncome.toLocaleString('id-ID');
        }
    });
}

// --- FUNGSI TAMBAH DATA ---
const form = document.getElementById('laundryForm');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPostKey = database.ref().child('laundry').push().key;
        database.ref('laundry/' + newPostKey).set({
            name: document.getElementById('custName').value,
            service: document.getElementById('serviceType').value,
            price: document.getElementById('price').value,
            drop: document.getElementById('dropDate').value,
            pick: document.getElementById('pickDate').value,
            status: "Proses"
        });
        form.reset();
        alert("Data Berhasil Tersimpan!");
    });
}

// --- FUNGSI UPDATE STATUS ---
window.updateStatus = function(id, newStatus) {
    database.ref('laundry/' + id).update({ status: newStatus });
};

// --- FUNGSI HAPUS DATA ---
window.hapusData = function(id) {
    if (confirm("Hapus data pelanggan ini?")) {
        database.ref('laundry/' + id).remove();
    }
};

// Jalankan sistem
displayData();