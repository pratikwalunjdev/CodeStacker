import React, { useEffect, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Navigate } from 'react-router-dom';
import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Blog } from '../types';
import { BlogCard } from '../components/BlogCard';
import { Bookmark } from 'lucide-react';
import { motion } from 'motion/react';

export const BookmarkList = () => {
  const { user, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        const bq = query(collection(db, `users/${user.uid}/bookmarks`), orderBy('createdAt', 'desc'));
        const snap = await getDocs(bq);
        
        const blogPromises = snap.docs.map(async (bdoc) => {
          const blogRef = doc(db, 'blogs', bdoc.data().blogId);
          const blogSnap = await getDoc(blogRef);
          if (blogSnap.exists()) {
             return { id: blogSnap.id, ...blogSnap.data() } as Blog;
          }
          return null;
        });

        const resolvedBlogs = (await Promise.all(blogPromises)).filter(Boolean) as Blog[];
        setBlogs(resolvedBlogs);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookmarks();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex items-center gap-3 mb-8">
          <div className="bg-accent/10 p-2.5 rounded-xl">
             <Bookmark className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
            <p className="text-text-secondary">Saved for later reading.</p>
          </div>
       </div>

       {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
       ) : blogs.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {blogs.map(blog => (
              <motion.div key={blog.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </motion.div>
       ) : (
         <div className="text-center py-20 text-text-secondary glass-panel rounded-2xl border border-white/5">
           <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
           <p className="text-lg text-white mb-2">No bookmarks yet</p>
           <p>When you bookmark an article, it will appear here.</p>
         </div>
       )}
    </div>
  );
};
