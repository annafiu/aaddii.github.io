/* =====================================
   AADDII.COM MAIN JS
===================================== */

const BLOG_URL =
'https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=50';

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
   INDEX PAGE
===================================== */

function loadPosts(data){

    const container=
        document.getElementById('main-journal-list');

    if(!container) return;

    if(!data.feed || !data.feed.entry) return;

    container.innerHTML='';

    const entries=data.feed.entry;

    entries.forEach((post,index)=>{

        const title=post.title.$t;

        const content=
            post.content
            ? post.content.$t
            : '';

        const excerpt=
            stripHtml(content)
            .substring(0,180) + '...';

        let slug='';

        if(post.link){

            const alt=
                post.link.find(
                    l => l.rel==='alternate'
                );

            if(alt){

                slug=
                    alt.href
                    .split('/')
                    .pop()
                    .replace('.html','');

            }
        }

        let thumb='';

        const imgMatch=
            content.match(
                /<img[^>]+src=["']([^"']+)["']/i
            );

        if(imgMatch){
            thumb=imgMatch[1];
        }

        const dateObj=
            new Date(post.published.$t);

        const dateText=
            dateObj.toLocaleDateString(
                'id-ID',
                {
                    month:'short',
                    year:'numeric'
                }
            );

        const article=
            document.createElement('article');

        article.className='journal-row';

        article.innerHTML=`
            <div class="journal-meta">
                <span class="journal-number">
                    #${String(index+1).padStart(2,'0')}
                </span>

                <span class="journal-date">
                    ${dateText}
                </span>
            </div>

            <div class="journal-content">

                <h2 class="journal-title">
                    <a class="journal-link"
                       href="post.html?slug=${slug}">
                       ${title}
                    </a>
                </h2>

                <p class="journal-excerpt">
                    ${excerpt}
                </p>

                <span class="journal-author">
                    Farrij Tri Annafi'u
                </span>

            </div>

            <div class="journal-thumbnail">
                ${thumb ? `<img src="${thumb}">` : ''}
            </div>
        `;

        container.appendChild(article);

    });

    const nav=
        document.querySelector('.homepage-pagination');

    if(nav){
        nav.style.display='none';
    }
}

/* =====================================
   ARTICLE PAGE
===================================== */

function renderPost(data){

    const contentElement=
        document.getElementById('content');

    if(!contentElement) return;

    const slug=getSlug();

    if(!slug) return;

    if(!data.feed || !data.feed.entry) return;

    const entries=data.feed.entry;

    for(const post of entries){

        const alt=
            post.link.find(
                l => l.rel==='alternate'
            );

        if(!alt) continue;

        const postSlug=
            alt.href
            .split('/')
            .pop()
            .replace('.html','');

        if(postSlug!==slug) continue;

        const title=post.title.$t;

        let content=
            post.content
            ? post.content.$t
            : '';

        const plainText=
            stripHtml(content);

        const excerpt=
            plainText.substring(0,220) + '...';

        const dateObj=
            new Date(post.published.$t);

        const dateText=
            dateObj.toLocaleDateString(
                'id-ID',
                {
                    day:'numeric',
                    month:'long',
                    year:'numeric'
                }
            );

        document.title=title;

        const titleElement=
            document.getElementById('title');

        if(titleElement){
            titleElement.innerHTML=title;
        }

        const dateElement=
            document.getElementById('article-date');

        if(dateElement){
            dateElement.innerHTML=dateText;
        }

        const excerptElement=
            document.getElementById('excerpt');

        if(excerptElement){
            excerptElement.innerText=excerpt;
        }

        content = content.replace(
            /<h1[^>]*>.*?<\/h1>/gis,
            ''
        );

        contentElement.innerHTML=content;

        return;
    }

    const titleElement=
        document.getElementById('title');

    if(titleElement){
        titleElement.innerHTML=
            'Artikel tidak ditemukan';
    }
}

/* =====================================
   SINGLE PAGE NAV
===================================== */

function showSection(sectionId){

    document
        .querySelectorAll('.view-section')
        .forEach(
            sec =>
            sec.classList.remove('active-view')
        );

    const target=
        document.getElementById(sectionId);

    if(target){
        target.classList.add('active-view');
    }

    const navIndex=
        document.getElementById('nav-index');

    const navAbout=
        document.getElementById('nav-about');

    if(navIndex){
        navIndex.classList.remove('active');
    }

    if(navAbout){
        navAbout.classList.remove('active');
    }

    if(sectionId==='index-view' && navIndex){
        navIndex.classList.add('active');
    }

    if(sectionId==='about-view' && navAbout){
        navAbout.classList.add('active');
    }

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });
}

/* =====================================
   PAGE INIT
===================================== */

document.addEventListener(
    'DOMContentLoaded',
    ()=>{

        /*
        INDEX PAGE
        */

        if(
            document.getElementById(
                'main-journal-list'
            )
        ){

            const script=
                document.createElement('script');

            script.src=
                BLOG_URL +
                '&callback=loadPosts';

            document.body.appendChild(script);
        }

        /*
        POST PAGE
        */

        if(
            document.getElementById(
                'content'
            )
        ){

            const script=
                document.createElement('script');

            script.src=
                BLOG_URL +
                '&callback=renderPost';

            document.body.appendChild(script);
        }

    }
);
