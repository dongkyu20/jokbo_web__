document.addEventListener('DOMContentLoaded', function() {
    // 선택된 노트 정보 로드
    const selectedNote = JSON.parse(localStorage.getItem('selectedNote'));

    if (selectedNote) {
        // 필기노트 제목 설정 (필기노트로 고정)
        document.querySelector('.taek-title').innerText = "필기노트";

        // 이미지 슬라이드 설정
        const slidesWrapper = document.getElementById('taek-slidesWrapper');
        selectedNote.images.forEach((image) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'taek-mySlides';
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            slideDiv.appendChild(img);
            slidesWrapper.appendChild(slideDiv);
        });

        // 슬라이드 쇼 기능
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

        // 테이블 내용 설정
        const details = document.getElementById('taek-details');
        details.innerHTML = `
            <p>과목명: ${selectedNote.subject}</p>
            <hr>
            <p>대학교: ${selectedNote.university}</p>
            <hr>
            <p>학과: ${selectedNote.department}</p>
            <hr>
            <p>업로드일자: ${selectedNote.date}</p>
            <hr>
            <p>작성자: ${selectedNote.author}</p>
        `;

        // 다운로드 버튼 클릭 시 다운로드 링크 표시
        const downloadButton = document.getElementById('taek-downloadButton');
        const downloadLinksContainer = document.getElementById('taek-downloadLinks');
        downloadButton.addEventListener('click', function() {
            downloadLinksContainer.innerHTML = '';  // 기존 링크 제거

            selectedNote.images.forEach((image) => {
                const downloadLink = document.createElement('a');
                downloadLink.href = image.url;
                downloadLink.download = image.name;
                downloadLink.textContent = `다운로드: ${image.name}`;
                downloadLinksContainer.appendChild(downloadLink);
                downloadLinksContainer.appendChild(document.createElement('br'));

                // 클릭 이벤트를 통해 다운로드 트리거
                downloadLink.click();
            });

            if (selectedNote.fileUrl) {
                const downloadLink = document.createElement('a');
                downloadLink.href = selectedNote.fileUrl;
                downloadLink.download = selectedNote.fileName;
                downloadLink.textContent = `다운로드: ${selectedNote.fileName}`;
                downloadLinksContainer.appendChild(downloadLink);
                downloadLinksContainer.appendChild(document.createElement('br'));

                // 클릭 이벤트를 통해 다운로드 트리거
                downloadLink.click();
            }

            if (selectedNote.images.length === 0 && !selectedNote.fileUrl) {
                downloadLinksContainer.innerHTML = '다운로드할 파일이 없습니다.';
            }
        });

        // 돌아가기 버튼 설정
        const backButton = document.getElementById('taek-backButton');
        backButton.addEventListener('click', function() {
            window.location.href = 'Pilgi-main-page.html';
        });
    } else {
        // 선택된 노트 정보가 없을 경우, 메인 페이지로 이동
        window.location.href = 'Pilgi-main-page.html';
    }
});
