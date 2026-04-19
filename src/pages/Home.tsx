import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BlogCard } from '../components/BlogCard';
import { Blog } from '../types';
import { motion } from 'motion/react';
import { Code2, Hash } from 'lucide-react';

export const Home = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');
  const catParam = searchParams.get('category');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(50));
        
        if (catParam) {
           q = query(collection(db, 'blogs'), where('category', '==', catParam), orderBy('createdAt', 'desc'), limit(50));
        }
        
        const snapshot = await getDocs(q);
        let fetchedBlogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
        
        if (qParam) {
          const lowerQ = qParam.toLowerCase();
          fetchedBlogs = fetchedBlogs.filter(blog => 
            blog.title.toLowerCase().includes(lowerQ) ||
            blog.content.toLowerCase().includes(lowerQ) ||
            blog.tags.some(t => t.toLowerCase().includes(lowerQ))
          );
        }
        
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [qParam, catParam]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {!qParam && !catParam && (
        <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 mb-12 border border-white/5">
           <div className="absolute top-0 right-0 -m-32 pointer-events-none opacity-20 hidden md:block">
             <Code2 className="w-96 h-96 text-accent transform rotate-12 blur-3xl saturate-200" />
           </div>
           <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                Decode the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500 neon-text">Future.</span>
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed">
                Dive deep into computer engineering, master the art of programming, and explore the frontiers of artificial intelligence.
              </p>
           </div>
        </section>
      )}

      {(qParam || catParam) && (
        <div className="flex items-center gap-2 mb-8 text-xl font-medium">
          <Hash className="w-6 h-6 text-accent" />
          <span>Showing results for <span className="text-accent">{qParam || catParam}</span></span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
            <motion.div key={blog.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <BlogCard blog={blog} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 text-text-secondary glass-panel rounded-2xl border border-white/5">
          <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
          <p>We couldn't find any blogs matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
