document.addEventListener('DOMContentLoaded', function() {
    const notesSection = document.getElementById('notesSection');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    let assignments = [];
    const itemsPerPage = 10;
    let currentPage = parseInt(localStorage.getItem('assignmentCurrentPage')) || 1;

    function loadAssignmentsFromIndexedDB(callback) {
        const request = indexedDB.open('assignmentsDatabase', 1);

        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
        };

        request.onsuccess = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('assignments')) {
                console.error('Object store "assignments" not found.');
                return;
            }

            const transaction = db.transaction(['assignments'], 'readonly');
            const objectStore = transaction.objectStore('assignments');
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = function(event) {
                assignments = event.target.result;
                callback();
            };
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('assignments')) {
                db.createObjectStore('assignments', { autoIncrement: true });
            }
        };
    }

    function renderAssignments(page) {
        notesSection.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedAssignments = assignments.slice(start, end);

        paginatedAssignments.forEach((assignment, index) => {
            const assignmentTable = document.createElement('table');
            assignmentTable.className = 'taek-note';
            assignmentTable.innerHTML = `
                <tr>
                    <td class="taek-left-column">
                        <h2 class="taek-note-title" data-index="${start + index}">${assignment.subject}</h2>
                        <p class="taek-date">업로드일자: ${assignment.date}</p>
                    </td>
                    <td class="taek-right-column">
                        <p>대학교: ${assignment.university} | 학과: ${assignment.department}</p>
                        <p>교수명: ${assignment.professor} | 작성자: ${assignment.author}</p>
                        <p style="text-align: right;">
                            <span class="taek-buy-link">&lt;구매하기&gt;</span> |
                            <span class="taek-delete-link" data-index="${start + index}">&lt;삭제&gt;</span>
                        </p>
                    </td>
                </tr>
            `;
            notesSection.appendChild(assignmentTable);
        });

        document.querySelectorAll('.taek-delete-link').forEach(link => {
            link.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                assignments.splice(index, 1);
                saveAssignmentsToIndexedDB(assignments);
                window.location.reload();
            });
        });

        document.querySelectorAll('.taek-note-title').forEach(title => {
            title.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                localStorage.setItem('selectedAssignment', JSON.stringify(assignments[index]));
                window.location.href = 'Gwage-content-page.html';
            });
        });
    }

    function renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (totalPages() > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.className = 'taek-page-button';
            firstPageButton.innerText = '처음';
            firstPageButton.addEventListener('click', function() {
                localStorage.setItem('assignmentCurrentPage', 1);
                currentPage = 1;
                renderAssignments(1);
                renderPagination();
            });
            pagination.appendChild(firstPageButton);
        }

        for (let i = 1; i <= totalPages(); i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'taek-page-button';
            pageButton.innerText = i;
            pageButton.addEventListener('click', function() {
                localStorage.setItem('assignmentCurrentPage', i);
                currentPage = i;
                renderAssignments(i);
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
        const filteredAssignments = assignments.filter(assignment => 
            assignment.subject.toLowerCase().includes(query) ||
            assignment.university.toLowerCase().includes(query) ||
            assignment.department.toLowerCase().includes(query) ||
            assignment.professor.toLowerCase().includes(query) ||
            assignment.author.toLowerCase().includes(query)
        );
        currentPage = 1;
        localStorage.setItem('assignmentCurrentPage', currentPage);
        renderAssignments(currentPage);
        if (totalPages() > 1) {
            renderPagination();
        }
    });

    function totalPages() {
        return Math.ceil(assignments.length / itemsPerPage);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get('refresh');
    if (refresh) {
        localStorage.setItem('assignmentCurrentPage', currentPage);
    }

    loadAssignmentsFromIndexedDB(function() {
        renderAssignments(currentPage);
        if (totalPages() > 1) {
            renderPagination();
        }
    });

    document.getElementById('clearStorageButton').addEventListener('click', function() {
        const request = indexedDB.deleteDatabase('assignmentsDatabase');

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

function saveAssignmentsToIndexedDB(assignments) {
    const request = indexedDB.open('assignmentsDatabase', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('assignments')) {
            console.error('Object store "assignments" not found.');
            return;
        }

        const transaction = db.transaction(['assignments'], 'readwrite');
        const objectStore = transaction.objectStore('assignments');

        const clearRequest = objectStore.clear();
        clearRequest.onsuccess = function(event) {
            assignments.forEach(function(assignment) {
                objectStore.add(assignment);
            });
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('assignments')) {
            db.createObjectStore('assignments', { autoIncrement: true });
        }
    };
}
