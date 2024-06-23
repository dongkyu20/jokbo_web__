document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const date = new Date().toLocaleDateString(); // 업로드하는 날짜를 자동으로 추가
    const university = document.getElementById('university').value;
    const department = document.getElementById('department').value;
    const professor = document.getElementById('professor').value;
    const author = document.getElementById('author').value;
    const imageFiles = document.getElementById('images').files;
    const uploadedFile = document.getElementById('file').files[0];

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
        const assignment = {
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

        saveAssignmentToIndexedDB(assignment);
    }
});

document.getElementById('images').addEventListener('change', function(event) {
    const imageFiles = event.target.files;
    const uploadedFilesList = document.getElementById('uploadedFilesList');
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

function saveAssignmentToIndexedDB(assignment) {
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
        const addRequest = objectStore.add(assignment);

        addRequest.onsuccess = function() {
            console.log('Assignment has been added to your database.');
            window.location.href = 'Gwage-main-page.html?refresh=true';
        };

        addRequest.onerror = function(event) {
            console.error('Error adding assignment:', event.target.errorCode);
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('assignments')) {
            db.createObjectStore('assignments', { autoIncrement: true });
        }
    };
}
