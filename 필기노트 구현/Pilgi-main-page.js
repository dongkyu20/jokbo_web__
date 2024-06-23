document.addEventListener('DOMContentLoaded', function() {
    const notesSection = document.getElementById('taek-notesSection');
    const searchInput = document.getElementById('taek-searchInput');
    const searchButton = document.getElementById('taek-searchButton');
    let notes = [];
    const itemsPerPage = 10;
    let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;

    function loadNotesFromIndexedDB(callback) {
        const request = indexedDB.open('notesDatabase', 1);

        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
        };

        request.onsuccess = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('notes')) {
                console.error('Object store "notes" not found.');
                return;
            }

            const transaction = db.transaction(['notes'], 'readonly');
            const objectStore = transaction.objectStore('notes');
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = function(event) {
                notes = event.target.result;
                callback();
            };
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('notes')) {
                db.createObjectStore('notes', { autoIncrement: true });
            }
        };
    }

    function renderNotes(page) {
        notesSection.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedNotes = notes.slice(start, end);

        paginatedNotes.forEach((note, index) => {
            const noteTable = document.createElement('table');
            noteTable.className = 'taek-note';
            noteTable.innerHTML = `
                <tr>
                    <td class="taek-left-column">
                        <h2 class="taek-note-title" data-index="${start + index}">${note.subject}</h2>
                        <p class="taek-date">업로드일자: ${note.date}</p>
                    </td>
                    <td class="taek-right-column">
                        <p>대학교: ${note.university} | 학과: ${note.department}</p>
                        <p>교수명: ${note.professor} | 작성자: ${note.author}</p>
                        <p style="text-align: right;">
                            <span class="taek-buy-link" data-index="${start + index}">&lt;구매하기&gt;</span> |
                            <span class="taek-delete-link" data-index="${start + index}">&lt;삭제&gt;</span>
                        </p>
                    </td>
                </tr>
            `;
            notesSection.appendChild(noteTable);
        });

        document.querySelectorAll('.taek-buy-link').forEach(link => {
            link.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const selectedNote = notes[index];
                openPurchasePopup(selectedNote);
            });
        });

        document.querySelectorAll('.taek-delete-link').forEach(link => {
            link.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                notes.splice(index, 1);
                saveNotesToIndexedDB(notes);
                window.location.reload();
            });
        });

        document.querySelectorAll('.taek-note-title').forEach(title => {
            title.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                localStorage.setItem('selectedNote', JSON.stringify(notes[index]));
                window.location.href = 'Pilgi-content-page.html';
            });
        });
    }

    function renderPagination() {
        const pagination = document.getElementById('taek-pagination');
        pagination.innerHTML = '';

        if (totalPages() > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.className = 'taek-page-button';
            firstPageButton.innerText = '처음';
            firstPageButton.addEventListener('click', function() {
                localStorage.setItem('currentPage', 1);
                currentPage = 1;
                renderNotes(1);
                renderPagination();
            });
            pagination.appendChild(firstPageButton);
        }

        for (let i = 1; i <= totalPages(); i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'taek-page-button';
            pageButton.innerText = i;
            pageButton.addEventListener('click', function() {
                localStorage.setItem('currentPage', i);
                currentPage = i;
                renderNotes(i);
                renderPagination();
            });
            if (i === currentPage) {
                pageButton.style.fontWeight = 'bold';
            }
            pagination.appendChild(pageButton);
        }
    }

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase();
        const filteredNotes = notes.filter(note => 
            note.subject.toLowerCase().includes(query) ||
            note.university.toLowerCase().includes(query) ||
            note.department.toLowerCase().includes(query) ||
            note.professor.toLowerCase().includes(query) ||
            note.author.toLowerCase().includes(query)
        );
        currentPage = 1;
        localStorage.setItem('currentPage', currentPage);
        renderNotes(currentPage);
        if (totalPages() > 1) {
            renderPagination();
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get('refresh');
    if (refresh) {
        localStorage.setItem('currentPage', currentPage);
    }

    loadNotesFromIndexedDB(function() {
        renderNotes(currentPage);
        if (totalPages() > 1) {
            renderPagination();
        }
    });

    document.getElementById('taek-clearStorageButton').addEventListener('click', function() {
        const request = indexedDB.deleteDatabase('notesDatabase');

        request.onerror = function(event) {
            console.error('Database deletion error:', event.target.errorCode);
        };

        request.onsuccess = function(event) {
            console.log('Database deleted successfully.');
            alert('저장소가 성공적으로 비워졌습니다.');
            window.location.reload();
        };
    });
});

function saveNotesToIndexedDB(notes) {
    const request = indexedDB.open('notesDatabase', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('notes')) {
            console.error('Object store "notes" not found.');
            return;
        }

        const transaction = db.transaction(['notes'], 'readwrite');
        const objectStore = transaction.objectStore('notes');

        const clearRequest = objectStore.clear();
        clearRequest.onsuccess = function(event) {
            notes.forEach(function(note) {
                objectStore.add(note);
            });
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', { autoIncrement: true });
        }
    };
}

function openPurchasePopup(note) {
    const popup = window.open("", "PurchasePopup", "width=400,height=400");
    const firstImage = note.images.length > 0 ? note.images[0].url : '';
    popup.document.write(`
        <html>
        <head>
            <title>구매하기</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { font-size: 1.5em; }
                p { margin: 10px 0; }
                .taek-separator { border-top: 1px solid #ccc; margin: 10px 0; }
                .taek-image-container { text-align: center; }
                img { max-width: 100%; height: auto; }
                .taek-buttons { margin-top: 20px; text-align: center; }
                button { padding: 10px 20px; font-size: 1em; border: none; background-color: #007bff; color: #fff; border-radius: 5px; cursor: pointer; margin: 0 5px; }
                button:hover { background-color: #0056b3; }
                .taek-cancel-button { background-color: #6c757d; }
                .taek-cancel-button:hover { background-color: #5a6268; }
            </style>
        </head>
        <body>
            <h1>${note.subject}</h1>
            <div class="taek-image-container">
                ${firstImage ? `<img src="${firstImage}" alt="Uploaded Image">` : ''}
            </div>
            <div class="taek-separator"></div>
            <p>대학교: ${note.university}</p>
            <p>학과: ${note.department}</p>
            <p>교수명: ${note.professor}</p>
            <p>작성자: ${note.author}</p>
            <p>업로드일자: ${note.date}</p>
            <div class="taek-separator"></div>
            <p>가격: 1000P</p>
            <div class="taek-buttons">
                <button onclick="purchase()">구매하기</button>
                <button class="taek-cancel-button" onclick="window.close()">취소</button>
            </div>
            <script>
                function purchase() {
                    alert('구매가 완료되었습니다.');
                    window.close();
                }
            </script>
        </body>
        </html>
    `);
}
