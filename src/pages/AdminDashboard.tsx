import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Navigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Blog } from '../types';
import { generateSlug, autoCategorize, estimateReadTime } from '../lib/blog-utils';
import { Plus, Trash2, Edit2, Check, X, FileText, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'blogs' | 'create'>('blogs');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchBlogs();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const category = autoCategorize(tags);
      const readTime = estimateReadTime(content);
      const slug = generateSlug(title);

      const blogData = {
        title,
        content,
        tags,
        category,
        authorId: user.uid,
        updatedAt: serverTimestamp(),
        readTime,
        featuredImage,
        slug
      };

      if (editingId) {
        await updateDoc(doc(db, 'blogs', editingId), blogData);
      } else {
        await addDoc(collection(db, 'blogs'), {
          ...blogData,
          createdAt: serverTimestamp(),
          views: 0
        });
      }
      
      resetForm();
      setActiveTab('blogs');
      fetchBlogs();
    } catch (e) {
      console.error(e);
      alert('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setTitle(blog.title);
    setContent(blog.content);
    setTagsInput(blog.tags.join(', '));
    setFeaturedImage(blog.featuredImage || '');
    setEditingId(blog.id);
    setActiveTab('create');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
       await deleteDoc(doc(db, 'blogs', id));
       fetchBlogs();
    } catch (e) {
       console.error(e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTagsInput('');
    setFeaturedImage('');
    setEditingId(null);
  };

  const insertDummyData = async () => {
    setLoading(true);
    try {
      const dummyBlogs = [
        {
          title: "The Rise of LLMs and What It Means for Engineering",
          content: "Large Language Models (LLMs) have fundamentally changed the way we approach software engineering. In this blog, we explore how prompt engineering, RAG (Retrieval-Augmented Generation), and autonomous agents are shaping the modern tech stack.\n\n## Why LLMs?\nBecause they enable developers to abstract away natural language understanding.",
          tags: ["AI", "LLM", "Engineering", "Machine Learning"],
          featuredImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
        },
        {
          title: "Mastering React 19: New Hooks and Features",
          content: "React 19 brings a slew of performance improvements and new hooks like `useActionState` and generic forms improvements. Let's build a mental model of how concurrent rendering impacts your day-to-day UI building.\n\n### Form Actions\nForms are now first-class citizens in the React ecosystem.",
          tags: ["React", "Frontend", "JavaScript", "UI"],
          featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000",
        },
        {
          title: "Python for Backend: Django or FastAPI?",
          content: "Choosing between Django and FastAPI is the classic dilemma for Python developers today. Django offers a batteries-included approach, whereas FastAPI gives you insane performance and async support out of the box with Pydantic.\n\nHere are some benchmarks...",
          tags: ["Python", "FastAPI", "Django", "Backend"],
          featuredImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
        }
      ];

      for (const b of dummyBlogs) {
         await addDoc(collection(db, 'blogs'), {
            title: b.title,
            content: b.content,
            tags: b.tags,
            category: autoCategorize(b.tags),
            authorId: user?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            readTime: estimateReadTime(b.content),
            featuredImage: b.featuredImage,
            slug: generateSlug(b.title),
            views: 0
         });
      }
      setActiveTab('blogs');
      fetchBlogs();
      alert('Dummy data inserted successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to insert dummy data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
           <p className="text-text-secondary text-sm flex items-center gap-2">
             <Activity className="w-4 h-4 text-accent" /> Manage your content empire.
           </p>
        </div>
        <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl">
          <button 
            onClick={() => { setActiveTab('blogs'); resetForm(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'blogs' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Manage Blogs
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            {editingId ? 'Edit Blog' : 'Create Blog'}
          </button>
        </div>
      </div>

      <div className="glass-panel border border-white/5 rounded-2xl p-6">
        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-mono text-text-secondary uppercase">Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder:text-text-secondary/50 focus:outline-none focus:border-accent text-lg"
                placeholder="The Future of AI..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-mono text-text-secondary uppercase flex justify-between">
                 Content (Markdown)
                 <span className="text-accent text-xs lowercase">read time approx {estimateReadTime(content)} min</span>
              </label>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder:text-text-secondary/50 focus:outline-none focus:border-accent h-96 font-mono text-sm leading-relaxed"
                placeholder="# Hello World..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-mono text-text-secondary uppercase">Tags (comma separated)</label>
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
                placeholder="Python, AI, React..."
              />
               <p className="text-xs text-text-secondary mt-1">Category will be automatically generated based on these tags.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-mono text-text-secondary uppercase">Featured Image URL</label>
              <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => { setActiveTab('blogs'); resetForm(); }} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button disabled={loading} type="submit" className="px-6 py-2 rounded-xl text-sm font-medium bg-accent text-black hover:bg-accent-hover transition-colors flex items-center gap-2">
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Update Blog' : 'Publish'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
             {loading && <p className="text-text-secondary">Loading...</p>}
             {!loading && blogs.length === 0 && (
               <div className="py-12 text-center text-text-secondary flex flex-col items-center gap-4">
                 <FileText className="w-12 h-12 opacity-20" />
                 <p>No blogs published yet.</p>
                 <button onClick={insertDummyData} className="mt-4 px-4 py-2 bg-accent/10 text-accent font-medium rounded-lg hover:bg-accent/20 transition-colors border border-accent/20">
                   Populate Dummy Data
                 </button>
               </div>
             )}
             {blogs.map(blog => (
               <div key={blog.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors gap-4">
                 <div>
                   <h3 className="font-semibold text-lg line-clamp-1">{blog.title}</h3>
                   <div className="flex gap-3 text-xs text-text-secondary font-mono mt-2">
                      <span className="text-accent">{blog.category}</span>
                      <span>•</span>
                      <span>{blog.views} views</span>
                      <span>•</span>
                      <span>{new Date(blog.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <button onClick={() => handleEdit(blog)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-secondary hover:text-white" title="Edit">
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDelete(blog.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-text-secondary hover:text-red-400" title="Delete">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
