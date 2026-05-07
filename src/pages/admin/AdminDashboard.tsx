import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Users, FileText, PlayCircle, Plus, Loader2, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { useChapters } from '@/lib/content';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Seo from '@/src/components/Seo';
import adminImage from '../../img/pic.jpeg';

const MAX_PDF_SIZE = 50 * 1024 * 1024;

export default function AdminDashboard() {
  const { chapters, loading, addChapter, deleteChapter } = useChapters();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: 'botany',
    id: '',
    title: '',
    writerName: 'বোর্ড বই',
    hasBook: true,
    hasSolve: true,
    hasVideo: true,
    pdfUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      window.alert('Only PDF files are allowed.');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_PDF_SIZE) {
      window.alert('PDF size must be 50MB or less.');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let pdfUrl = formData.pdfUrl;

    if (file) {
      try {
        const storageRef = ref(storage, `pdfs/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        pdfUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(p);
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      } catch (err) {
        console.error("Error uploading file:", err);
        setUploading(false);
        window.alert("Failed to upload file");
        return;
      }
    }

    try {
      await addChapter({
        id: parseInt(formData.id) || 0,
        title: formData.title,
        subject: formData.subject,
        writers: [{
          name: formData.writerName,
          book: formData.hasBook,
          solve: formData.hasSolve,
          video: formData.hasVideo,
          pdfUrl: pdfUrl
        }]
      });
      setIsOpen(false);
      setFormData({ subject: 'botany', id: '', title: '', writerName: 'বোর্ড বই', hasBook: true, hasSolve: true, hasVideo: true, pdfUrl: '' });
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Error saving chapter:', error);
      window.alert('Failed to save content. Please check admin permissions.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string | undefined, title: string) => {
    if (!docId) {
      window.alert('This content cannot be deleted because it does not have a document id.');
      return;
    }

    const confirmed = window.confirm(`Delete "${title}" from BIO LAB? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteChapter(docId);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      window.alert('Failed to delete content. Please check admin permissions.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <Seo
        title="Admin Dashboard"
        description="BIO LAB admin dashboard for managing biology chapters, PDF uploads, mentors, and platform content."
      />
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] mb-10">
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">Control Center</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Overview</h1>
            <p className="mt-2 max-w-2xl text-slate-500">Manage biology content, PDF uploads, students, mentors, and platform settings from one focused dashboard.</p>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-6 shadow-lg shadow-orange-600/20 font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add Content
              </Button>
            } />
            <SheetContent className="overflow-y-auto sm:max-w-md w-full">
              <SheetHeader className="mb-6">
                <SheetTitle>Add New Chapter</SheetTitle>
                <SheetDescription>Fill in the details to add new study material.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="botany">উদ্ভিদবিজ্ঞান (Botany)</option>
                      <option value="zoology">প্রাণীবিজ্ঞান (Zoology)</option>
                      <option value="ssc">SSC Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Chapter Number</label>
                    <input 
                      type="number" required
                      value={formData.id}
                      onChange={e => setFormData({...formData, id: e.target.value})}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Chapter Title</label>
                    <input 
                      type="text" required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Writer Name</label>
                    <input 
                      type="text" required
                      value={formData.writerName}
                      onChange={e => setFormData({...formData, writerName: e.target.value})}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.hasBook} onChange={e => setFormData({...formData, hasBook: e.target.checked})} className="rounded text-orange-600 focus:ring-orange-500" /> Book PDF</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.hasSolve} onChange={e => setFormData({...formData, hasSolve: e.target.checked})} className="rounded text-orange-600 focus:ring-orange-500" /> Solve Sheet</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.hasVideo} onChange={e => setFormData({...formData, hasVideo: e.target.checked})} className="rounded text-orange-600 focus:ring-orange-500" /> Video</label>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Upload PDF (Optional)</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                         <UploadCloud className="w-8 h-8 text-orange-500" />
                         <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                           {file ? file.name : "Click to select or drag and drop"}
                         </span>
                         <span className="text-xs text-slate-500">PDF up to 50MB</span>
                      </label>
                    </div>
                    {progress > 0 && <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <div className="bg-orange-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>}
                  </div>
                </div>
                <Button type="submit" disabled={uploading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
                   {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Content"}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
        <div className="relative h-56 overflow-hidden rounded-2xl border border-orange-100 bg-orange-50 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/30 lg:h-auto">
          <img src={adminImage} alt="BIO LAB mentor and admin profile" className="h-full min-h-44 w-full object-cover object-top" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">BIO LAB Mentor</p>
            <p className="mt-1 text-sm font-semibold">Content quality starts with the right guide.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4 hover:border-orange-500 transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-xl text-blue-600 dark:text-blue-400">
             <Users className="w-8 h-8" />
          </div>
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
             <span className="text-2xl font-bold text-slate-800 dark:text-white">12,480</span>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4 hover:border-orange-500 transition-colors">
          <div className="bg-orange-100 dark:bg-orange-900/40 p-4 rounded-xl text-orange-600 dark:text-orange-400">
             <FileText className="w-8 h-8" />
          </div>
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">PDF Resources</p>
             <span className="text-2xl font-bold text-slate-800 dark:text-white">{chapters.length || 154} Chapters</span>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4 hover:border-orange-500 transition-colors">
          <div className="bg-teal-100 dark:bg-teal-900/40 p-4 rounded-xl text-teal-600 dark:text-teal-400">
             <PlayCircle className="w-8 h-8" />
          </div>
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Solve Classes</p>
             <span className="text-2xl font-bold text-slate-800 dark:text-white">86 Videos</span>
          </div>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Content Operations</h2>
          <Button variant="outline" size="sm" className="hidden sm:flex dark:border-slate-700">View All Content</Button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
          ) : chapters.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No content found. Please refresh or add new content.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Writers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chapters.map((item, i) => (
                  <tr key={item.docId || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">অধ্যায় {item.id}: {item.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-semibold text-xs capitalize">
                        {item.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.writers.map(w => w.name).join(', ')}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50 hover:text-orange-700">Edit</Button>
                      <Button onClick={() => handleDelete(item.docId, item.title)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 ml-2">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Manage Mentors</h2>
            <p className="text-sm text-slate-500 mt-1">Add, edit, or remove mentors.</p>
          </div>
          <Button variant="outline" size="sm" className="flex dark:border-slate-700">
            <Plus className="w-4 h-4 mr-2" /> Add Mentor
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Mentor Name</th>
                <th className="px-6 py-4">Role / expertise</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { name: 'জাহিদুল হাসান', role: 'Bsc, Msc in Botany', subject: 'উদ্ভিদবিজ্ঞান ও প্রাণীবিজ্ঞান' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="px-6 py-4">{item.role}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-semibold text-xs">
                      {item.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50 hover:text-orange-700">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 ml-2">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
