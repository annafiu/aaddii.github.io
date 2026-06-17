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

// Fungsi untuk mengambil nomor halaman aktif dari URL browser
function getCurrentPage() {
    const url = new URLSearchParams(window.location.search);
    const page = parseInt(url.get('page'));
    return (page && page > 0) ? page : 1;
}

/* =====================================
   INDEX PAGE (HITUNGAN MUNDUR + PAGINATION ANGKA)
===================================== */

const POSTS_PER_PAGE = 4; // Tentukan di sini mau memunculkan berapa artikel per halaman

function loadPosts(data){

    const container = document.getElementById('main-journal-list');
    if(!container) return;
    if(!data.feed || !data.feed.entry) return;

    container.innerHTML = '';
    const entries = data.feed.entry;

    // 1. Ambil total seluruh postingan global dari Blogspot
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
        const dateText = dateObj.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

        const article = document.createElement('article');
        article.className = 'journal-row';

        // Menjamin nomor urut tetap mundur dengan benar meskipun artikel sudah berpindah halaman
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
        // PENGAMAN: Jika halaman "Tentang" sedang aktif, langsung kosongkan pagination & stop script!
        const aboutView = document.getElementById('about-view');
        if (aboutView && aboutView.classList.contains('active-view')) {
            paginationContainer.innerHTML = '';
            return;
        }

        paginationContainer.innerHTML = ''; 
        
        // Hitung total halaman yang ada
        const totalPages = Math.ceil(totalResults / POSTS_PER_PAGE);
        
        if (totalPages > 1) {
            
            // Tombol 'prev'
            const prevLink = document.createElement('a');
            prevLink.innerText = 'prev';
            if (currentPage > 1) {
                prevLink.href = `?page=${currentPage - 1}`;
                prevLink.className = 'page-nav-trigger';
            } else {
                prevLink.className = 'page-nav-trigger disabled';
            }
            paginationContainer.appendChild(prevLink);

            // Daftar Angka Halaman (1, 2, 3, dst.)
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

            // Tombol 'next'
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

    // 1. Cari tahu artikel aktif berada di index ke-berapa
    for(let i = 0; i < entries.length; i++){
        const alt = entries[i].link.find(l => l.rel === 'alternate');
        if(!alt) continue;

        const postSlug = alt.href.split('/').pop().replace('.html','');
        if(postSlug === slug) {
            currentIndex = i;
            break;
        }
    }

    // Jika artikel tidak ketemu di data JSON
    if(currentIndex === -1) {
        const titleElement = document.getElementById('title');
        if(titleElement) titleElement.innerHTML = 'Artikel tidak ditemukan';
        return;
    }

    // 2. Ambil data artikel aktif berdasarkan index yang didapat
    const post = entries[currentIndex];
    const title = post.title.$t;
    let content = post.content ? post.content.$t : '';
    const plainText = stripHtml(content);
    const excerpt = plainText.substring(0,220) + '...';
    const dateObj = new Date(post.published.$t);
    const dateText = dateObj.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });

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
    // LOGIKA OTOMATIS NAVIGATION (DENGAN VISIBILITY HIDDEN)
    // =====================================
    const prevButton = document.getElementById('prev-btn'); // Link Sebelah Kiri (Lebih Baru)
    const nextButton = document.getElementById('next-btn'); // Link Sebelah Kanan (Lebih Lama)

    // Urutan data Blogger: 0 = Paling Baru, entries.length - 1 = Paling Lama
    const newerIndex = currentIndex - 1; // Artikel lebih baru (indeks mengecil)
    const olderIndex = currentIndex + 1; // Artikel lebih lama (indeks membesar)

    // 1. ATUR TOMBOL KIRI (PREV - Artikel Lebih Baru)
    if (newerIndex >= 0 && prevButton) {
        const prevAlt = entries[newerIndex].link.find(l => l.rel === 'alternate');
        if (prevAlt) {
            const prevSlug = prevAlt.href.split('/').pop().replace('.html', '');
            prevButton.href = `post.html?slug=${prevSlug}`;
            prevButton.style.visibility = 'visible'; 
        }
    } else if (prevButton) {
        prevButton.style.visibility = 'hidden'; // Mengosongkan ruang tanpa merusak posisi tombol kanan
    }

    // 2. ATUR TOMBOL KANAN (NEXT - Artikel Lebih Lama)
    if (olderIndex < entries.length && nextButton) {
        const nextAlt = entries[olderIndex].link.find(l => l.rel === 'alternate');
        if (nextAlt) {
            const nextSlug = nextAlt.href.split('/').pop().replace('.html', '');
            nextButton.href = `post.html?slug=${nextSlug}`;
            nextButton.style.visibility = 'visible';
        }
    } else if (nextButton) {
        nextButton.style.visibility = 'hidden'; // Mengosongkan ruang tanpa merusak posisi tombol kiri
    }
} 

/* =====================================
   SINGLE PAGE NAV (DENGAN PENGAMAN BERLAPIS)
===================================== */

function showSection(sectionId){
    
    // PENGAMAN 1: Jika berada di halaman post.html, stop fungsi SPA!
    if (window.location.pathname.includes('post.html')) {
        return; 
    }

    // PENGAMAN 2: Cek apakah kontainer list jurnal utama ada di halaman ini.
    const isHomepage = document.getElementById('main-journal-list');
    if (!isHomepage) {
        return; 
    }

    // --- KODE SPA JIKA SEDANG DI BERANDA ---
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

    if(navIndex){ navIndex.classList.remove('active'); }
    if(navAbout){ navAbout.classList.remove('active'); }

    if(sectionId==='index-view' && navIndex){
        navIndex.classList.add('active');
    }

    // MEMBERSIHKAN PAGINATION SAAT MENU "TENTANG" DIKLIK
    if(sectionId==='about-view' && navAbout){
        navAbout.classList.add('active');
        
        // Cari kontainer pagination dan hapus isinya seketika
        const pgContainer = document.getElementById('numeric-pagination');
        if(pgContainer) {
            pgContainer.innerHTML = '';
        }
    }

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });
}

/* =====================================
   PAGE INIT (Hanya Ada Satu Listener DOM)
===================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* 1. KONDISI UNTUK HALAMAN UTAMA (INDEX) */
    if (document.getElementById('main-journal-list')) {
        const currentPage = getCurrentPage();
        const startIndex = ((currentPage - 1) * POSTS_PER_PAGE) + 1;

        const script = document.createElement('script');
        script.src = `https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=${POSTS_PER_PAGE}&start-index=${startIndex}&callback=loadPosts`;
        document.body.appendChild(script);
    }

    /* 2. KONDISI UNTUK HALAMAN BACA ARTIKEL (POST) */
    if (document.getElementById('content')) {
        const script = document.createElement('script');
        script.src = `https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=100&callback=renderPost`;
        document.body.appendChild(script);
    }
});
