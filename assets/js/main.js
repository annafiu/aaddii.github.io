/* =====================================
   AADDII.COM MAIN JS
===================================== */

const BLOG_URL = 'https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=50';

/* =====================================
   HELPERS
===================================== */

function stripHtml(html=''){
    const div=document.createElement('div');
    div.innerHTML=html;
    return div.textContent || div.innerText || '';
}

function getSlug(){
    const url=new URLSearchParams(window.location.search);
    return url.get('slug');
}

/* =====================================
   INDEX PAGE UTILITIES
===================================== */

function getCurrentPage() {
    const url = new URLSearchParams(window.location.search);
    const page = parseInt(url.get('page'));
    return (page && page > 0) ? page : 1;
}

/* =====================================
   INDEX PAGE (HITUNGAN MUNDUR + PAGINATION ANGKA)
===================================== */

const POSTS_PER_PAGE = 4; 

function loadPosts(data){

    const container = document.getElementById('main-journal-list');
    if(!container) return;
    if(!data.feed || !data.feed.entry) return;

    container.innerHTML = '';
    const entries = data.feed.entry;

    const totalResults = parseInt(data.feed.openSearch$totalResults.$t);
    const currentPage = getCurrentPage();

    entries.forEach((post, index) => {
        const title = post.title.$t;
        const content = post.content ? post.content.$t : '';
        const excerpt = stripHtml(content).substring(0, 180) + '...';

        let slug = '';
        if(post.link){
            const alt = post.link.find(l => l.rel === 'alternate');
            if(alt){
                slug = alt.href.split('/').pop().replace('.html', '');
            }
        }

        let thumb = '';
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if(imgMatch){ thumb = imgMatch[1]; }

        const dateObj = new Date(post.published.$t);
        const dateText = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }).toLowerCase();

        const article = document.createElement('article');
        article.className = 'journal-row';

        const currentPostNumber = totalResults - ((currentPage - 1) * POSTS_PER_PAGE) - index;

        article.innerHTML = `
            <div class="journal-meta">
                <span class="journal-number">
                    #${String(currentPostNumber).padStart(2, '0')}
                </span>
                <span class="journal-date">
                    ${dateText}
                </span>
            </div>

            <div class="journal-content">
                <h2 class="journal-title">
                    <a class="journal-link" href="post.html?slug=${slug}">
                        ${title}
                    </a>
                </h2>
                <p class="journal-excerpt">
                    ${excerpt}
                </p>
                <span class="journal-author">
                    Adi Iman Wicaksono
                </span>
            </div>

            <div class="journal-thumbnail">
                ${thumb ? `<img src="${thumb}">` : ''}
            </div>
        `;

        container.appendChild(article);
    });

    // =====================================
    // LOGIKA GENERATE ANGKA PAGINATION
    // =====================================
    const paginationContainer = document.getElementById('numeric-pagination');
    
    if (paginationContainer) {
        const aboutView = document.getElementById('about-view');
        if (aboutView && aboutView.classList.contains('active-view')) {
            paginationContainer.innerHTML = '';
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.innerHTML = ''; 
        const totalPages = Math.ceil(totalResults / POSTS_PER_PAGE);
        
        if (totalPages > 1) {
            
            const prevLink = document.createElement('a');
            prevLink.innerText = 'prev';
            if (currentPage > 1) {
                prevLink.href = `?page=${currentPage - 1}`;
                prevLink.className = 'page-nav-trigger';
            } else {
                prevLink.className = 'page-nav-trigger disabled';
            }
            paginationContainer.appendChild(prevLink);

            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.innerText = i;
                pageLink.href = `?page=${i}`;
                
                if (i === currentPage) {
                    pageLink.className = 'page-number active';
                } else {
                    pageLink.className = 'page-number';
                }
                paginationContainer.appendChild(pageLink);
            }

            const nextLink = document.createElement('a');
            nextLink.innerText = 'next';
            if (currentPage < totalPages) {
                nextLink.href = `?page=${currentPage + 1}`;
                nextLink.className = 'page-nav-trigger';
            } else {
                nextLink.className = 'page-nav-trigger disabled';
            }
            paginationContainer.appendChild(nextLink);
        }
    }
}

/* =====================================
   ARTICLE PAGE
===================================== */

function renderPost(data){

    const contentElement = document.getElementById('content');
    if(!contentElement) return;

    const slug = getSlug();
    if(!slug) return;

    if(!data.feed || !data.feed.entry) return;

    const entries = data.feed.entry;
    let currentIndex = -1;

    for(let i = 0; i < entries.length; i++){
        const alt = entries[i].link.find(l => l.rel === 'alternate');
        if(!alt) continue;

        const postSlug = alt.href.split('/').pop().replace('.html','');
        if(postSlug === slug) {
            currentIndex = i;
            break;
        }
    }

    if(currentIndex === -1) {
        const titleElement = document.getElementById('title');
        if(titleElement) titleElement.innerHTML = 'Artikel tidak ditemukan';
        return;
    }

    const post = entries[currentIndex];
    const title = post.title.$t;
    let content = post.content ? post.content.$t : '';
    const plainText = stripHtml(content);
    const excerpt = plainText.substring(0,220) + '...';
    
    const dateObj = new Date(post.published.$t);
    const dateText = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    }).toLowerCase();

    document.title = title;

    const titleElement = document.getElementById('title');
    if(titleElement) titleElement.innerHTML = title;

    const dateElement = document.getElementById('article-date');
    if(dateElement) dateElement.innerHTML = dateText;

    const excerptElement = document.getElementById('excerpt');
    if(excerptElement) excerptElement.innerText = excerpt;

    content = content.replace(/<h1[^>]*>.*?<\/h1>/gis, '');
    contentElement.innerHTML = content;

    // =====================================
    // LOGIKA OTOMATIS NAVIGATION
    // =====================================
    const prevButton = document.getElementById('prev-btn'); 
    const nextButton = document.getElementById('next-btn'); 

    const newerIndex = currentIndex - 1; 
    const olderIndex = currentIndex + 1; 

    if (newerIndex >= 0 && prevButton) {
        const prevAlt = entries[newerIndex].link.find(l => l.rel === 'alternate');
        if (prevAlt) {
            const prevSlug = prevAlt.href.split('/').pop().replace('.html', '');
            prevButton.href = `post.html?slug=${prevSlug}`;
            prevButton.style.visibility = 'visible'; 
        }
    } else if (prevButton) {
        prevButton.style.visibility = 'hidden'; 
    }

    if (olderIndex < entries.length && nextButton) {
        const nextAlt = entries[olderIndex].link.find(l => l.rel === 'alternate');
        if (nextAlt) {
            const nextSlug = nextAlt.href.split('/').pop().replace('.html', '');
            nextButton.href = `post.html?slug=${nextSlug}`;
            nextButton.style.visibility = 'visible';
        }
    } else if (nextButton) {
        nextButton.style.visibility = 'hidden'; 
    }

    // =====================================
    // INTEGRASI DINAMIS KOMENTAR CUSDIS
    // =====================================
    const cusdisThread = document.getElementById('cusdis_thread');
    if (cusdisThread) {
        cusdisThread.setAttribute('data-host', 'https://cusdis.com');
        cusdisThread.setAttribute('data-app-id', '81ea97a7-cb6d-4a6a-97f9-a7afe09ff5dd');
        cusdisThread.setAttribute('data-page-id', slug); 
        cusdisThread.setAttribute('data-page-url', window.location.href);
        cusdisThread.setAttribute('data-page-title', title);
        cusdisThread.setAttribute('data-iframe-auto-height', 'true');

        if (!document.getElementById('cusdis-script')) {
            const script = document.createElement('script');
            script.id = 'cusdis-script';
            script.async = true;
            script.defer = true;
            script.src = 'https://cusdis.com/js/cusdis.es.js';
            document.body.appendChild(script);
        } else {
            if (window.CUSDIS && typeof window.CUSDIS.renderDoc === 'function') {
                window.CUSDIS.renderDoc(cusdisThread);
            }
        }
    }

    // Inisialisasi fitur zoom gambar Medium setelah konten artikel terpasang utuh
    initImageZoom();
} 

/* =====================================
   SINGLE PAGE NAV
===================================== */

function showSection(sectionId){
    
    if (window.location.pathname.includes('post.html')) {
        return; 
    }

    const isHomepage = document.getElementById('main-journal-list');
    if (!isHomepage) {
        return; 
    }

    document
        .querySelectorAll('.view-section')
        .forEach(
            sec => sec.classList.remove('active-view')
        );

    const target = document.getElementById(sectionId);
    if(target){
        target.classList.add('active-view');
    }

    const navIndex = document.getElementById('nav-index');
    const navAbout = document.getElementById('nav-about');
    const pgContainer = document.getElementById('numeric-pagination');

    if(navIndex){ navIndex.classList.remove('active'); }
    if(navAbout){ navAbout.classList.remove('active'); }

    if(sectionId === 'index-view' && navIndex){
        navIndex.classList.add('active');
        if(pgContainer) {
            pgContainer.style.display = 'flex';
        }
    }

    if(sectionId === 'about-view' && navAbout){
        navAbout.classList.add('active');
        if(pgContainer) {
            pgContainer.innerHTML = '';
            pgContainer.style.display = 'none';
        }
    }

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });
}

/* ========================================================
   MEDIUM.COM STYLE IMAGE ZOOM OVERLAY (PERFECT TRANSITION)
======================================================== */
function initImageZoom() {
    const articleImages = document.querySelectorAll('#content img');
    
    articleImages.forEach(img => {
        img.style.cursor = 'zoom-in';
        
        img.addEventListener('click', function(e) {
            e.stopPropagation(); 
            
            // 1. Buat kontainer overlay latar belakang
            const overlay = document.createElement('div');
            overlay.className = 'image-zoom-overlay';
            
            // 2. Buat duplikasi elemen gambar untuk diperbesar
            const zoomedImg = document.createElement('img');
            zoomedImg.src = this.src;
            zoomedImg.className = 'image-zoomed';
            
            overlay.appendChild(zoomedImg);
            document.body.appendChild(overlay);
            
            // Masuk mode zoom (Fade In & Scale Up)
            setTimeout(() => {
                overlay.classList.add('active');
                // LOCK SCROLL: Kunci scroll halaman utama agar tidak bergerak saat di-zoom
                document.body.style.overflow = 'hidden';
            }, 10);
            
            // Fungsi Inti untuk menutup gambar (Zoom Out dulu baru buka scroll)
            let isClosing = false;
            function closeZoom() {
                if (isClosing) return;
                isClosing = true;
                
                // Mulai animasi zoom out (kembali ke normal)
                overlay.classList.remove('active');
                
                // Cabut semua event detektor agar memori kembali bersih
                window.removeEventListener('wheel', handleScrollAttempt);
                window.removeEventListener('touchmove', handleScrollAttempt);
                
                // Tunggu sampai animasi CSS mengecil selesai (300ms)
                setTimeout(() => {
                    // UNLOCK SCROLL: Kembalikan fungsi scroll halaman utama
                    document.body.style.overflow = '';
                    overlay.remove();
                }, 300); // Harus sinkron dengan durasi transisi di CSS (0.3s)
            }
            
            // Fungsi interseptor untuk mendeteksi jika user mencoba scroll
            function handleScrollAttempt(event) {
                // Tahan/blokir gerakan scroll bawaan browser saat gambar masih membesar
                event.preventDefault(); 
                // Jalankan proses zoom out terlebih dahulu
                closeZoom();
            }
            
            // A. Klik pada gambar atau area kosong untuk menutup normal
            overlay.addEventListener('click', closeZoom);
            
            // B. Deteksi usaha scroll (Roda mouse / Trackpad / Swipe Layar HP)
            // Kita gunakan { passive: false } agar browser mengizinkan perintah event.preventDefault()
            window.addEventListener('wheel', handleScrollAttempt, { passive: false });
            window.addEventListener('touchmove', handleScrollAttempt, { passive: false });
        });
    });
}

/* ========================================================
   CUSDIS LIVE AUTO-HEIGHT MESSENGER RECEPTOR (ENHANCED)
======================================================== */
window.addEventListener('message', (event) => {
    if (event.data) {
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            if (data.type === 'resize' && data.height) {
                const cusdisIframe = document.querySelector('#cusdis_thread iframe');
                if (cusdisIframe) {
                    cusdisIframe.style.setProperty('height', `${data.height + 40}px`, 'important');
                }
            }
        } catch (e) {
            // Passthrough safely
        }
    }
});

/* FALLBACK INTERVENSAL: Mengecek tinggi DOM riil internal iframe setiap 1.5 detik */
setInterval(() => {
    const cusdisIframe = document.querySelector('#cusdis_thread iframe');
    if (cusdisIframe && cusdisIframe.contentWindow) {
        try {
            const internalHeight = cusdisIframe.contentWindow.document.body.scrollHeight;
            if (internalHeight && internalHeight > 150) {
                cusdisIframe.style.setProperty('height', `${internalHeight + 20}px`, 'important');
            }
        } catch (e) {
            // Tertahan CORS cross-origin, dihandle otomatis oleh event listener message di atas
        }
    }
}, 1500);

/* =====================================
   PAGE INIT
===================================== */

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('main-journal-list')) {
        const currentPage = getCurrentPage();
        const startIndex = ((currentPage - 1) * POSTS_PER_PAGE) + 1;

        const script = document.createElement('script');
        script.src = `https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=${POSTS_PER_PAGE}&start-index=${startIndex}&callback=loadPosts`;
        document.body.appendChild(script);
    }

    if (document.getElementById('content')) {
        const script = document.createElement('script');
        script.src = `https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=100&callback=renderPost`;
        document.body.appendChild(script);
    }
});
