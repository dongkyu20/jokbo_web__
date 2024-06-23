document.getElementById('taek-uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const subject = document.getElementById('taek-subject').value;
    const date = new Date().toLocaleDateString(); // 업로드하는 날짜를 자동으로 추가
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
        const examPaper = {
            subject,
            date,
            university,
            department,
            professor,
            author,
            images: imageUrls,
            fileUrl,
            fileName: uploadedFile ? uploadedFile.name : null
        };

        saveExamPaperToIndexedDB(examPaper);
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

function saveExamPaperToIndexedDB(examPaper) {
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
        const addRequest = objectStore.add(examPaper);

        addRequest.onsuccess = function() {
            console.log('Exam paper has been added to your database.');
            window.location.href = 'Jokbo-main-page.html?refresh=true';
        };

        addRequest.onerror = function(event) {
            console.error('Error adding exam paper:', event.target.errorCode);
        };
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('examPapers')) {
            db.createObjectStore('examPapers', { autoIncrement: true });
        }
    };
}
