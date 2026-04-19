import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Blog } from '../types';
import { formatDistanceToNow } from 'date-fns';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clock, Eye, Calendar, Tag as TagIcon, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { cn } from '../lib/utils';

export const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const q = query(collection(db, 'blogs'), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetchedBlog = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Blog;
          setBlog(fetchedBlog);

          // Increment view
          const viewSessionKey = `viewed_${fetchedBlog.id}`;
          if (!sessionStorage.getItem(viewSessionKey)) {
             await updateDoc(doc(db, 'blogs', fetchedBlog.id), { views: increment(1) });
             sessionStorage.setItem(viewSessionKey, 'true');
             setBlog(prev => prev ? { ...prev, views: prev.views + 1 } : null);
          }

          // Check bookmark
          if (user) {
            const bq = query(collection(db, `users/${user.uid}/bookmarks`), where('blogId', '==', fetchedBlog.id));
            const bSnap = await getDocs(bq);
            setIsBookmarked(!bSnap.empty);
          }
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug, user]);

  const toggleBookmark = async () => {
    if (!user || !blog) return;
    try {
      if (isBookmarked) {
        const bq = query(collection(db, `users/${user.uid}/bookmarks`), where('blogId', '==', blog.id));
        const bSnap = await getDocs(bq);
        if (!bSnap.empty) {
          await deleteDoc(bSnap.docs[0].ref);
          setIsBookmarked(false);
        }
      } else {
        const docRef = doc(collection(db, `users/${user.uid}/bookmarks`));
        await setDoc(docRef, {
          blogId: blog.id,
          createdAt: new Date()
        });
        setIsBookmarked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-8 max-w-3xl mx-auto py-12">
       <div className="h-12 bg-white/5 rounded-xl w-3/4"></div>
       <div className="h-6 bg-white/5 rounded-xl w-1/2"></div>
       <div className="h-64 bg-white/5 rounded-xl w-full"></div>
     </div>;
  }

  if (!blog) return <div className="text-center py-20 text-text-secondary">Blog not found.</div>;

  return (
    <article className="max-w-3xl mx-auto py-8 lg:py-12 animate-in slide-in-from-bottom-8 fade-in duration-700">
      <header className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-accent">
          <span className="border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {blog.category}
          </span>
          <span className="text-text-secondary pl-2 border-l border-white/10 flex items-center gap-1.5">
             <Calendar className="w-3.5 h-3.5" />
             {blog.createdAt?.seconds ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString() : ''}
          </span>
          <span className="text-text-secondary pl-2 border-l border-white/10 flex items-center gap-1.5">
             <Clock className="w-3.5 h-3.5" /> {blog.readTime} min read
          </span>
          <span className="text-text-secondary pl-2 border-l border-white/10 flex items-center gap-1.5">
             <Eye className="w-3.5 h-3.5" /> {blog.views} views
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight lg:leading-none text-white">
          {blog.title}
        </h1>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
             {blog.tags.map(tag => (
               <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`} className="text-sm px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-text-secondary hover:text-white transition-colors flex items-center gap-1">
                 <TagIcon className="w-3 h-3" /> {tag}
               </Link>
             ))}
          </div>
          {user && (
            <button onClick={toggleBookmark} className={cn("p-2 rounded-full transition-all border", isBookmarked ? "bg-accent/10 border-accent/20 text-accent" : "bg-white/5 border-white/10 text-text-secondary hover:text-white")}>
               {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {blog.featuredImage && (
        <div className="w-full h-auto aspect-video rounded-2xl overflow-hidden mb-12 border border-white/10">
          <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-accent hover:prose-a:text-accent-hover prose-pre:p-0 prose-pre:bg-transparent">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props) {
              const {children, className, node, ...rest} = props
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <div className="rounded-xl overflow-hidden border border-white/10 my-6 shadow-2xl">
                   <div className="bg-[#1e1e1e] border-b border-white/10 px-4 py-2 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                      </div>
                      <span className="text-xs font-mono text-white/40 ml-2 uppercase">{match[1]}</span>
                   </div>
                   <SyntaxHighlighter
                     {...rest}
                     PreTag="div"
                     children={String(children).replace(/\n$/, '')}
                     language={match[1]}
                     style={vscDarkPlus}
                     customStyle={{ margin: 0, background: '#1e1e1e', padding: '1.5rem', fontSize: '0.9rem' }}
                     wrapLines={true}
                   />
                </div>
              ) : (
                <code {...rest} className={cn("bg-white/10 rounded-md px-1.5 py-0.5 font-mono text-[0.9em]", className)}>
                  {children}
                </code>
              )
            }
          }}
        >
          {blog.content}
        </Markdown>
      </div>
    </article>
  );
};
