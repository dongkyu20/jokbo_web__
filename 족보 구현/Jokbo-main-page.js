document.addEventListener('DOMContentLoaded', function() {
    const notesSection = document.getElementById('taek-notesSection');
    const searchInput = document.getElementById('taek-searchInput');
    const searchButton = document.getElementById('taek-searchButton');
    let notes = [];
    const itemsPerPage = 10;
    let currentPage = parseInt(localStorage.getItem('examPapersCurrentPage')) || 1;

    function loadNotesFromIndexedDB(callback) {
        const request = indexedDB.open('examPapersDatabase', 1);

        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
        };

        request.onsuccess = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('examPapers')) {
                console.error('Object store "examPapers" not found.');
                return;
            }

            const transaction = db.transaction(['examPapers'], 'readonly');
            const objectStore = transaction.objectStore('examPapers');
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = function(event) {
                notes = event.target.result;
                callback();
            };
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('examPapers')) {
                db.createObjectStore('examPapers', { autoIncrement: true });
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
                            <span class="taek-buy-link">&lt;구매하기&gt;</span> |
                            <span class="taek-delete-link" data-index="${start + index}">&lt;삭제&gt;</span>
                        </p>
                    </td>
                </tr>
            `;
            notesSection.appendChild(noteTable);
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
                localStorage.setItem('selectedExamPaper', JSON.stringify(notes[index]));
                window.location.href = 'Jokbo-content-page.html';
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
                localStorage.setItem('examPapersCurrentPage', 1);
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
                localStorage.setItem('examPapersCurrentPage', i);
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
        localStorage.setItem('examPapersCurrentPage', currentPage);
        renderNotes(currentPage);
        if (totalPages() > 1) {
            renderPagination();
        }
    });

    function totalPages() {
        return Math.ceil(notes.length / itemsPerPage);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get('refresh');
    if (refresh) {
        localStorage.setItem('examPapersCurrentPage', currentPage);
    }

    loadNotesFromIndexedDB(function() {
        renderNotes(currentPage);
        if (totalPages() > 1) {
            renderPagination();
        }
    });

    document.getElementById('taek-clearStorageButton').addEventListener('click', function() {
        const request = indexedDB.deleteDatabase('examPapersDatabase');

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
    const request = indexedDB.open('examPapersDatabase', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('examPapers')) {
            console.error('Object store "examPapers" not found.');
            return;
        }

        const transaction = db.transaction(['examPapers'], 'readwrite');
        const objectStore = transaction.objectStore('examPapers');

        const clearRequest = objectStore.clear();
        clearRequest.onsuccess = function(event) {
            notes.forEach(function(note) {
                objectStore.add(note);
            });
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('examPapers')) {
            db.createObjectStore('examPapers', { autoIncrement: true });
        }
    };
}
