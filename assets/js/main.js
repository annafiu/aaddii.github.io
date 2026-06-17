function showSection(sectionId) {

    document.querySelectorAll('.view-section')
        .forEach(sec => sec.classList.remove('active-view'));

    document.getElementById(sectionId)
        .classList.add('active-view');

    document.getElementById('nav-index')
        .classList.remove('active');

    document.getElementById('nav-about')
        .classList.remove('active');

    if(sectionId === 'index-view'){
        document.getElementById('nav-index')
            .classList.add('active');
    }

    if(sectionId === 'about-view'){
        document.getElementById('nav-about')
            .classList.add('active');
    }

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });
}
    </script>
<script>
const BLOGGER_FEED_URL = 'https://aaddiiweb.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=50&callback=loadPosts';

function stripHtml(html){
  const d=document.createElement('div');
  d.innerHTML=html||'';
  return d.textContent || d.innerText || '';
}

function loadPosts(data){
  const container=document.getElementById('main-journal-list');
    container.innerHTML='';
  if(!container || !data.feed || !data.feed.entry) return;

  const entries=data.feed.entry;
  container.innerHTML='';

  entries.forEach((post,index)=>{
    const title=post.title.$t;
    const content=post.content ? post.content.$t : '';
    const excerpt=stripHtml(content).substring(0,180)+'...';

    let slug='';

if(post.link){

  const alt=
      post.link.find(
        l=>l.rel==='alternate'
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
    const imgMatch=content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if(imgMatch) thumb=imgMatch[1];

    const dateObj=new Date(post.published.$t);
    const dateText=dateObj.toLocaleDateString('id-ID',{month:'short',year:'numeric'});

    const article=document.createElement('article');
    article.className='journal-row visible-row';
    article.innerHTML=`
      <div class="journal-meta">
        <span class="journal-number">#${String(index+1).padStart(2,'0')}</span>
        <span class="journal-date">${dateText}</span>
      </div>
      <div class="journal-content">
        <h2 class="journal-title"><a class="journal-link"
   href="post.html?slug=${slug}">${title}</a></h2>
        <p class="journal-excerpt">${excerpt}</p>
        <span class="journal-author">Farrij Tri Annafi'u</span>
      </div>
      <div class="journal-thumbnail">${thumb ? `<img src="${thumb}">` : ''}</div>
    `;
    container.appendChild(article);
  });

  const nav=document.querySelector('.homepage-pagination');
  if(nav) nav.style.display='none';
}

document.addEventListener('DOMContentLoaded',()=>{
  const s=document.createElement('script');
  s.src=BLOGGER_FEED_URL;
  document.body.appendChild(s);
});

function getSlug(){
    const url = new URLSearchParams(window.location.search);
    return url.get('slug');
}

function stripHtml(html){
    const div=document.createElement('div');
    div.innerHTML=html;
    return div.textContent || div.innerText || '';
}

function renderPost(data){

    const slug=getSlug();

    if(!data.feed || !data.feed.entry) return;

    const entries=data.feed.entry;

    for(const post of entries){

        const alt=post.link.find(
            l => l.rel === 'alternate'
        );

        if(!alt) continue;

        const postSlug=
            alt.href
            .split('/')
            .pop()
            .replace('.html','');

        if(postSlug===slug){

            const title=post.title.$t;
            let content=post.content ? post.content.$t : '';

            const plainText=stripHtml(content);

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

            document.getElementById('title')
                .innerHTML=title;

            document.getElementById('article-date')
                .innerHTML=dateText;

            document.getElementById('excerpt')
                .innerText=excerpt;

            content = content.replace(
                /<h1[^>]*>.*?<\/h1>/gis,
                ''
            );

            document.getElementById('content')
                .innerHTML=content;

            return;
        }
    }

    document.getElementById('title')
        .innerHTML='Artikel tidak ditemukan';

}
