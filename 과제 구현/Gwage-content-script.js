document.addEventListener('DOMContentLoaded', function() {
    const selectedNote = JSON.parse(localStorage.getItem('selectedAssignment'));

    if (selectedNote) {
        document.querySelector('.taek-title').innerText = "과제";

        const slidesWrapper = document.getElementById('slidesWrapper');
        selectedNote.images.forEach((image) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'taek-mySlides';
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            slideDiv.appendChild(img);
            slidesWrapper.appendChild(slideDiv);
        });

        let slideIndex = 1;
        showSlides(slideIndex);

        function showSlides(n) {
            const slides = document.getElementsByClassName('taek-mySlides');
            if (n > slides.length) { slideIndex = 1; }
            if (n < 1) { slideIndex = slides.length; }
            for (let i = 0; i < slides.length; i++) {
                slides[i].style.display = 'none';
            }
            slides[slideIndex - 1].style.display = 'block';
        }

        function plusSlides(n) {
            showSlides(slideIndex += n);
        }

        document.querySelector('.taek-prev').addEventListener('click', function() {
            plusSlides(-1);
        });

        document.querySelector('.taek-next').addEventListener('click', function() {
            plusSlides(1);
        });

        const details = document.getElementById('details');
        details.innerHTML = `
            <hr>
            <p>과목명: ${selectedNote.subject}</p>
            <hr>
            <p>대학교: ${selectedNote.university}</p>
            <hr>
            <p>학과: ${selectedNote.department}</p>
            <hr>
            <p>업로드일자: ${selectedNote.date}</p>
            <hr>
            <p>작성자: ${selectedNote.author}</p>
            <hr>
        `;

        const downloadButton = document.getElementById('downloadButton');
        const downloadLinksContainer = document.getElementById('downloadLinks');
        downloadButton.addEventListener('click', function() {
            downloadLinksContainer.innerHTML = '';

            selectedNote.images.forEach((image) => {
                const downloadLink = document.createElement('a');
                downloadLink.href = image.url;
                downloadLink.download = image.name;
                downloadLink.textContent = `다운로드: ${image.name}`;
                downloadLinksContainer.appendChild(downloadLink);
                downloadLinksContainer.appendChild(document.createElement('br'));

                downloadLink.click();
            });

            if (selectedNote.fileUrl) {
                const downloadLink = document.createElement('a');
                downloadLink.href = selectedNote.fileUrl;
                downloadLink.download = selectedNote.fileName;
                downloadLink.textContent = `다운로드: ${selectedNote.fileName}`;
                downloadLinksContainer.appendChild(downloadLink);
                downloadLinksContainer.appendChild(document.createElement('br'));

                downloadLink.click();
            }

            if (selectedNote.images.length === 0 && !selectedNote.fileUrl) {
                downloadLinksContainer.innerHTML = '다운로드할 파일이 없습니다.';
            }
        });

        const backButton = document.getElementById('backButton');
        backButton.addEventListener('click', function() {
            window.location.href = 'Gwage-main-page.html';
        });
    } else {
        window.location.href = 'Gwage-main-page.html';
    }
});
