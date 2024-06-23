document.getElementById('taek-uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const subject = document.getElementById('taek-subject').value;
    const date = new Date().toLocaleDateString(); // 업로드 날짜를 자동으로 추가
    const university = document.getElementById('taek-university').value;
    const department = document.getElementById('taek-department').value;
    const professor = document.getElementById('taek-professor').value;
    const author = document.getElementById('taek-author').value;
    const imageFiles = document.getElementById('taek-images').files;
    const uploadedFile = document.getElementById('taek-file').files[0];

    if (imageFiles.length === 0 && !uploadedFile) {
        alert("이미지나 파일 중 하나를 업로드해주세요.");
        return;
    }

    const imageUrls = [];
    let imagesLoaded = 0;

    if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageUrls.push({ name: imageFiles[i].name, url: e.target.result });
                imagesLoaded++;

                if (imagesLoaded === imageFiles.length) {
                    finalizeUpload();
                }
            };
            reader.readAsDataURL(imageFiles[i]);
        }
    } else {
        finalizeUpload();
    }

    function finalizeUpload() {
        const fileUrl = uploadedFile ? URL.createObjectURL(uploadedFile) : null;
        const note = {
            subject,
            date, // 업로드 날짜 추가
            university,
            department,
            professor,
            author,
            images: imageUrls,
            fileUrl,
            fileName: uploadedFile ? uploadedFile.name : null
        };

        saveNoteToIndexedDB(note);
    }
});

document.getElementById('taek-images').addEventListener('change', function(event) {
    const imageFiles = event.target.files;
    const uploadedFilesList = document.getElementById('taek-uploadedFilesList');
    uploadedFilesList.innerHTML = '';

    for (let i = 0; i < imageFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            uploadedFilesList.appendChild(img);
        };
        reader.readAsDataURL(imageFiles[i]);
    }
});

function saveNoteToIndexedDB(note) {
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
        const addRequest = objectStore.add(note);

        addRequest.onsuccess = function() {
            console.log('Note has been added to your database.');
            window.location.href = 'Pilgi-main-page.html?refresh=true';
        };

        addRequest.onerror = function(event) {
            console.error('Error adding note:', event.target.errorCode);
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', { autoIncrement: true });
        }
    };
}
